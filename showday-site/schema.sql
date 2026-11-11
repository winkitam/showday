-- Show Day Board: database setup
-- Paste this whole file into Supabase > SQL Editor > New query, then press Run.

create extension if not exists pgcrypto;

-- 1. Concerts ---------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  artist text not null check (char_length(artist) between 1 and 80),
  venue text not null check (char_length(venue) between 1 and 80),
  event_date date not null,
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create unique index events_unique on public.events (lower(artist), lower(venue), event_date);

-- 2. Listings (no contact details here, so they can be shown publicly) -----
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  kind text not null check (kind in ('sell', 'buy')),
  section text not null check (char_length(section) between 1 and 80),
  qty int not null check (qty between 1 and 4),
  original_price numeric(8,2),
  price numeric(8,2) not null check (price > 0),
  meet_point text not null check (char_length(meet_point) between 1 and 80),
  status text not null default 'open' check (status in ('open', 'meeting', 'done')),
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  -- The face-value rule, enforced by the database itself
  constraint face_value check (kind = 'buy' or (original_price is not null and price <= original_price))
);
create index listings_event_idx on public.listings (event_id, created_at desc);

-- 3. Contact details, only visible to logged-in users ----------------------
create table public.listing_contacts (
  listing_id uuid primary key references public.listings(id) on delete cascade,
  contact text not null check (char_length(contact) between 1 and 60)
);

-- 4. Reports ----------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reporter uuid not null references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  unique (listing_id, reporter)
);

-- 5. Row level security -----------------------------------------------------
alter table public.events enable row level security;
alter table public.listings enable row level security;
alter table public.listing_contacts enable row level security;
alter table public.reports enable row level security;

create policy "events readable" on public.events
  for select using (status = 'approved' or created_by = auth.uid());
create policy "events insert" on public.events
  for insert to authenticated with check (created_by = auth.uid() and status = 'pending');

create policy "listings readable" on public.listings
  for select using (
    user_id = auth.uid()
    or (
      not hidden
      and exists (select 1 from public.events e
                  where e.id = event_id and (e.status = 'approved' or e.created_by = auth.uid()))
    )
  );
create policy "listings insert" on public.listings
  for insert to authenticated with check (
    user_id = auth.uid() and hidden = false and status = 'open'
    and exists (select 1 from public.events e
                where e.id = event_id and (e.status = 'approved' or e.created_by = auth.uid()))
  );
create policy "listings update own" on public.listings
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "listings delete own" on public.listings
  for delete to authenticated using (user_id = auth.uid());

-- Owners may only change the status column
revoke update on public.listings from anon, authenticated;
grant update (status) on public.listings to authenticated;

create policy "contacts for logged in users" on public.listing_contacts
  for select to authenticated using (true);
create policy "contacts insert by owner" on public.listing_contacts
  for insert to authenticated with check (
    exists (select 1 from public.listings l where l.id = listing_id and l.user_id = auth.uid())
  );

create policy "reports insert" on public.reports
  for insert to authenticated with check (reporter = auth.uid());

-- 6. Anti-spam limits -------------------------------------------------------
create function public.limit_listings() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from listings
      where user_id = new.user_id and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'Too many listings in the last hour';
  end if;
  return new;
end $$;
create trigger trg_limit_listings before insert on public.listings
  for each row execute function public.limit_listings();

create function public.limit_events() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from events
      where created_by = new.created_by and created_at > now() - interval '1 day') >= 5 then
    raise exception 'Too many concerts added today';
  end if;
  return new;
end $$;
create trigger trg_limit_events before insert on public.events
  for each row execute function public.limit_events();

-- 7. Auto-hide a listing after 3 reports ------------------------------------
create function public.auto_hide() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from reports where listing_id = new.listing_id) >= 3 then
    update listings set hidden = true where id = new.listing_id;
  end if;
  return new;
end $$;
create trigger trg_auto_hide after insert on public.reports
  for each row execute function public.auto_hide();

-- 8. Create a listing and its contact in one step ---------------------------
create function public.create_listing(
  p_event uuid, p_kind text, p_section text, p_qty int,
  p_original numeric, p_price numeric, p_meet text, p_contact text)
returns uuid language plpgsql security invoker set search_path = public as $$
declare new_id uuid;
begin
  insert into listings (event_id, kind, section, qty, original_price, price, meet_point)
  values (p_event, p_kind, p_section, p_qty, p_original, p_price, p_meet)
  returning id into new_id;
  insert into listing_contacts (listing_id, contact) values (new_id, p_contact);
  return new_id;
end $$;
revoke execute on function public.create_listing from public, anon;
grant execute on function public.create_listing to authenticated;

-- 9. Live updates on the board ----------------------------------------------
alter publication supabase_realtime add table public.listings;
