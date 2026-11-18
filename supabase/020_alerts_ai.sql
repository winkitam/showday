-- 020: plain-language ticket alerts + a daily cap on AI calls.
-- Run once in Supabase > SQL Editor, after 011 and 013. Safe to run again.
--
-- Alerts: a fan says what they want ("2 tickets for MIRROR 12/15, floor, under $1,000").
-- The AI only turns that into a few fields on screen; the fan checks them and saves.
-- Matching is plain SQL below, so the AI never decides who gets notified.

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  event_id uuid not null references public.events(id) on delete cascade,
  qty int not null default 1 check (qty between 1 and 4),
  max_price numeric(8,2) check (max_price is null or max_price > 0),
  keywords text[] not null default '{}',
  note text check (note is null or char_length(note) <= 200),
  created_at timestamptz not null default now()
);
create index if not exists alerts_event_idx on public.alerts (event_id);
create index if not exists alerts_user_idx on public.alerts (user_id);

alter table public.alerts enable row level security;
drop policy if exists "alerts own select" on public.alerts;
create policy "alerts own select" on public.alerts for select to authenticated using (user_id = auth.uid());
drop policy if exists "alerts own insert" on public.alerts;
create policy "alerts own insert" on public.alerts for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "alerts own delete" on public.alerts;
create policy "alerts own delete" on public.alerts for delete to authenticated using (user_id = auth.uid());
revoke all on public.alerts from anon;
grant select, delete on public.alerts to authenticated;
grant insert (event_id, qty, max_price, keywords, note) on public.alerts to authenticated;

-- Tidy the input, keep one alert per show, and cap the number per person
create or replace function public.check_alert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.user_id := auth.uid();
  if new.user_id is null then raise exception 'Log in to set an alert'; end if;
  if not exists (select 1 from events where id = new.event_id and event_date >= current_date) then
    raise exception 'That show has already happened';
  end if;
  new.keywords := coalesce((
    select array_agg(k) from (
      select distinct left(lower(trim(x)), 20) as k from unnest(new.keywords) x
       where length(trim(x)) > 1 limit 5) s), '{}');
  delete from alerts where user_id = new.user_id and event_id = new.event_id;
  if (select count(*) from alerts where user_id = new.user_id) >= 10 then
    raise exception 'You can keep up to 10 alerts. Remove one first.';
  end if;
  return new;
end $$;
drop trigger if exists check_alert on public.alerts;
create trigger check_alert before insert on public.alerts
  for each row execute function public.check_alert();

-- The bell can now show a "match" notification
alter table public.notifications drop constraint if exists notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check
  check (kind in ('interest', 'like', 'rating', 'match'));

-- A new open ticket for sale tells everyone whose alert fits it (never the poster)
create or replace function public.match_alerts() returns trigger
language plpgsql security definer set search_path = public as $$
declare txt text;
begin
  if new.kind <> 'sell' or coalesce(new.hidden, false) or new.status <> 'open' then return new; end if;
  txt := lower(coalesce(new.section, '') || ' ' || coalesce(to_jsonb(new) ->> 'note', ''));
  insert into notifications (user_id, kind, item_type, item_id, event_id, label)
  select a.user_id, 'match', 'listing', new.id, new.event_id, left(coalesce(new.section, ''), 80)
    from alerts a
    join events e on e.id = a.event_id
   where a.event_id = new.event_id
     and a.user_id <> new.user_id
     and e.event_date >= current_date
     and new.qty >= a.qty
     and (a.max_price is null or new.price <= a.max_price)
     and (cardinality(a.keywords) = 0
          or exists (select 1 from unnest(a.keywords) k where position(k in txt) > 0))
  on conflict do nothing;
  return new;
end $$;
drop trigger if exists match_alerts on public.listings;
create trigger match_alerts after insert on public.listings
  for each row execute function public.match_alerts();

-- Daily cap on AI calls: per person and for the whole site (protects your bill)
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  n int not null default 0,
  primary key (user_id, day)
);
create table if not exists public.ai_usage_site (
  day date primary key default current_date,
  n int not null default 0
);
alter table public.ai_usage enable row level security;
alter table public.ai_usage_site enable row level security;

create or replace function public.ai_quota_take(p_user_limit int default 20, p_site_limit int default 500)
returns boolean language plpgsql security definer set search_path = public as $$
declare mine int; site int;
begin
  if auth.uid() is null then return false; end if;
  insert into ai_usage as u (user_id, day, n) values (auth.uid(), current_date, 1)
    on conflict (user_id, day) do update set n = u.n + 1 where u.n < p_user_limit
    returning n into mine;
  if mine is null then return false; end if;
  insert into ai_usage_site as s (day, n) values (current_date, 1)
    on conflict (day) do update set n = s.n + 1 where s.n < p_site_limit
    returning n into site;
  return site is not null;
end $$;
revoke all on function public.ai_quota_take(int, int) from public, anon;
grant execute on function public.ai_quota_take(int, int) to authenticated;

-- Nightly tidy: finished shows' alerts and old usage counters
select cron.schedule('showday-alerts-cleanup', '47 3 * * *',
  $$delete from public.alerts where event_id in (select id from public.events where event_date < current_date);
    delete from public.ai_usage where day < current_date - 7;
    delete from public.ai_usage_site where day < current_date - 7$$);
