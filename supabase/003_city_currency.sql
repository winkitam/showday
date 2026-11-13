-- City, optional venue and currency for concerts. Run ONCE in Supabase > SQL Editor > New query > Run.

-- 1. City (existing concerts copy their venue into city; fix them on the admin page if needed)
alter table public.events add column city text;
update public.events set city = venue where city is null;
alter table public.events alter column city set not null;
alter table public.events add constraint events_city_len check (char_length(city) between 1 and 60);

-- 2. Venue becomes optional
alter table public.events alter column venue drop not null;

-- 3. Currency of the face value
alter table public.events add column currency text not null default 'GBP'
  check (currency in ('GBP', 'HKD', 'KRW', 'JPY', 'TWD', 'SGD', 'MYR', 'THB', 'USD', 'EUR', 'AUD'));

-- 4. Same artist + city + venue + date counts as a duplicate
drop index if exists public.events_unique;
create unique index events_unique on public.events (lower(artist), lower(city), lower(coalesce(venue, '')), event_date);

-- 5. Admins may edit the new columns too (default grants already allow it; RLS limits it to admins)
