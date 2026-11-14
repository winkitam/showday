-- 013: in-app notifications (the bell). Run once in Supabase > SQL Editor,
-- after 011 and 012. Safe to run again.
-- One row per post and kind; new interest or likes add to the unread row,
-- so 30 likes become "30 likes", not 30 notifications. Never says who.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('interest', 'like', 'rating')),
  item_type text not null check (item_type in ('listing', 'swap', 'buddy', 'merch', 'free')),
  item_id uuid not null,
  event_id uuid,
  label text,
  n int not null default 1,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists notifications_unread_unique
  on public.notifications (user_id, kind, item_type, item_id) where read = false;
create index if not exists notifications_user_idx on public.notifications (user_id, updated_at desc);

alter table public.notifications enable row level security;
drop policy if exists "notifications own" on public.notifications;
create policy "notifications own" on public.notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists "notifications mark read" on public.notifications;
create policy "notifications mark read" on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "notifications delete own" on public.notifications;
create policy "notifications delete own" on public.notifications for delete to authenticated using (user_id = auth.uid());
grant select, delete on public.notifications to authenticated;
grant update (read) on public.notifications to authenticated;

-- Owner, show and a short label for a post
create or replace function public.notify_post(p_kind text, p_type text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare owner uuid; ev uuid; lbl text;
begin
  if p_type = 'listing' then select user_id, event_id, section into owner, ev, lbl from listings where id = p_id;
  elsif p_type = 'swap' then select user_id, event_id, have || ' → ' || want into owner, ev, lbl from swaps where id = p_id;
  elsif p_type = 'buddy' then select user_id, event_id, note into owner, ev, lbl from buddies where id = p_id;
  elsif p_type = 'merch' then select user_id, event_id, title into owner, ev, lbl from merch where id = p_id;
  else select user_id, event_id, what into owner, ev, lbl from freebies where id = p_id;
  end if;
  if owner is null then return; end if;
  insert into notifications (user_id, kind, item_type, item_id, event_id, label)
  values (owner, p_kind, p_type, p_id, ev, left(lbl, 60))
  on conflict (user_id, kind, item_type, item_id) where read = false
  do update set n = notifications.n + 1, updated_at = now(), label = excluded.label;
end $$;
revoke all on function public.notify_post(text, text, uuid) from public, anon, authenticated;

create or replace function public.on_reaction() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_post(case when new.kind = 'ask' then 'interest' else 'like' end, new.item_type, new.item_id);
  return null;
end $$;
drop trigger if exists notify_reaction on public.post_reactions;
create trigger notify_reaction after insert on public.post_reactions
  for each row execute function public.on_reaction();

create or replace function public.on_rating() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_post('rating', new.item_type, new.item_id);
  return null;
end $$;
drop trigger if exists notify_rating on public.ratings;
create trigger notify_rating after insert on public.ratings
  for each row execute function public.on_rating();

-- Tidy up: read notifications after 30 days, everything after 90 days.
select cron.schedule('showday-notifications-cleanup', '37 3 * * *',
  $$delete from public.notifications where (read and updated_at < now() - interval '30 days') or updated_at < now() - interval '90 days'$$);
