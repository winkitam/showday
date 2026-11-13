-- Seat swap, Buddies and Merch. Run ONCE in Supabase > SQL Editor > New query > Run.
-- Needs 001_admin.sql to have been run first.

-- 1. Tables --------------------------------------------------------------------
create table public.swaps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  have text not null check (char_length(have) between 1 and 80),
  want text not null check (char_length(want) between 1 and 80),
  contact text not null check (char_length(contact) between 1 and 60),
  status text not null default 'open' check (status in ('open', 'done')),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.buddies (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  note text not null check (char_length(note) between 1 and 140),
  contact text not null check (char_length(contact) between 1 and 60),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.merch (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  kind text not null check (kind in ('swap', 'sale')),
  title text not null check (char_length(title) between 1 and 80),
  details text check (char_length(details) <= 200),
  price numeric(8,2) check (price is null or price >= 0),
  contact text not null check (char_length(contact) between 1 and 60),
  status text not null default 'open' check (status in ('open', 'done')),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index swaps_created_idx on public.swaps (created_at desc);
create index buddies_created_idx on public.buddies (created_at desc);
create index merch_created_idx on public.merch (created_at desc);

-- 2. Contact details: visible to logged-in users only ---------------------------
revoke select on public.swaps from anon;
grant select (id, event_id, user_id, have, want, status, hidden, created_at) on public.swaps to anon;
revoke select on public.buddies from anon;
grant select (id, event_id, user_id, note, hidden, created_at) on public.buddies to anon;
revoke select on public.merch from anon;
grant select (id, user_id, kind, title, details, price, status, hidden, created_at) on public.merch to anon;

-- Owners may only change status
revoke update on public.swaps, public.buddies, public.merch from anon, authenticated;
grant update (status) on public.swaps, public.merch to authenticated;

-- 3. Row level security ---------------------------------------------------------
alter table public.swaps enable row level security;
alter table public.buddies enable row level security;
alter table public.merch enable row level security;

create policy "swaps readable" on public.swaps for select
  using (not hidden or user_id = auth.uid() or public.is_admin());
create policy "swaps insert" on public.swaps for insert to authenticated
  with check (user_id = auth.uid() and hidden = false and status = 'open'
    and exists (select 1 from public.events e where e.id = event_id and (e.status = 'approved' or e.created_by = auth.uid())));
create policy "swaps update own" on public.swaps for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "swaps delete" on public.swaps for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "buddies readable" on public.buddies for select
  using (not hidden or user_id = auth.uid() or public.is_admin());
create policy "buddies insert" on public.buddies for insert to authenticated
  with check (user_id = auth.uid() and hidden = false
    and exists (select 1 from public.events e where e.id = event_id and (e.status = 'approved' or e.created_by = auth.uid())));
create policy "buddies delete" on public.buddies for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "merch readable" on public.merch for select
  using (not hidden or user_id = auth.uid() or public.is_admin());
create policy "merch insert" on public.merch for insert to authenticated
  with check (user_id = auth.uid() and hidden = false and status = 'open');
create policy "merch update own" on public.merch for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "merch delete" on public.merch for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- 4. Anti-spam: max 10 posts per hour per table per user ------------------------
create function public.limit_posts() returns trigger
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  execute format('select count(*) from %I where user_id = $1 and created_at > now() - interval ''1 hour''', tg_table_name)
    into n using new.user_id;
  if n >= 10 then
    raise exception 'Too many posts in the last hour';
  end if;
  return new;
end $$;
create trigger trg_limit_swaps before insert on public.swaps for each row execute function public.limit_posts();
create trigger trg_limit_buddies before insert on public.buddies for each row execute function public.limit_posts();
create trigger trg_limit_merch before insert on public.merch for each row execute function public.limit_posts();

-- 5. Reports for swaps, buddies and merch ---------------------------------------
create table public.item_reports (
  id uuid primary key default gen_random_uuid(),
  item_type text not null check (item_type in ('swap', 'buddy', 'merch')),
  item_id uuid not null,
  reporter uuid not null references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  unique (item_type, item_id, reporter)
);
alter table public.item_reports enable row level security;
create policy "item reports insert" on public.item_reports for insert to authenticated
  with check (reporter = auth.uid());
create policy "item reports admin read" on public.item_reports for select to authenticated
  using (public.is_admin());

create function public.item_table(p_type text) returns text
language sql immutable as $$
  select case p_type when 'swap' then 'swaps' when 'buddy' then 'buddies' when 'merch' then 'merch' end;
$$;

create function public.auto_hide_item() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from item_reports where item_type = new.item_type and item_id = new.item_id) >= 3 then
    execute format('update %I set hidden = true where id = $1', public.item_table(new.item_type)) using new.item_id;
  end if;
  return new;
end $$;
create trigger trg_auto_hide_item after insert on public.item_reports
  for each row execute function public.auto_hide_item();

create function public.admin_set_item_hidden(p_type text, p_id uuid, p_hidden boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Not allowed'; end if;
  if public.item_table(p_type) is null then raise exception 'Unknown type'; end if;
  execute format('update %I set hidden = $1 where id = $2', public.item_table(p_type)) using p_hidden, p_id;
  if not p_hidden then
    delete from item_reports where item_type = p_type and item_id = p_id;
  end if;
end $$;
revoke execute on function public.admin_set_item_hidden(text, uuid, boolean) from public, anon;
grant execute on function public.admin_set_item_hidden(text, uuid, boolean) to authenticated;
