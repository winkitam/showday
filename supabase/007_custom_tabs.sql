-- Buddy tags, meet time and place; merch WTS / WTB / WTT, category, member, photo;
-- new Freebies board; photo uploads.
-- Run ONCE in Supabase > SQL Editor > New query > Run. Needs 001 to 006 first.

-- 1. Buddies: tags, meet time, meet place ---------------------------------------
alter table public.buddies
  add column tags text[] not null default '{}'
    check (cardinality(tags) <= 9 and tags <@ array['first','solo','cantonese','english','korean','mandarin','queue','eat','photo']),
  add column meet_time text check (meet_time is null or char_length(meet_time) <= 40),
  add column meet_place text check (meet_place is null or char_length(meet_place) <= 80);
grant select (tags, meet_time, meet_place) on public.buddies to anon;

-- 2. Merch: WTB (buy), category, member, photo ------------------------------------
alter table public.merch drop constraint if exists merch_kind_check;
alter table public.merch add constraint merch_kind_check check (kind in ('swap', 'sale', 'buy'));
alter table public.merch
  add column category text check (category is null or category in ('photocard','lightstick','slogan','album','clothing','other')),
  add column member text check (member is null or char_length(member) <= 40),
  add column photo_url text check (photo_url is null or photo_url like 'https://%/storage/v1/object/public/photos/%');
grant select (category, member, photo_url) on public.merch to anon;

-- 3. Freebies: fans giving out free goodies at a concert ---------------------------
create table public.freebies (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  what text not null check (char_length(what) between 1 and 80),
  details text check (details is null or char_length(details) <= 200),
  give_time text check (give_time is null or char_length(give_time) <= 40),
  place text check (place is null or char_length(place) <= 80),
  photo_url text check (photo_url is null or photo_url like 'https://%/storage/v1/object/public/photos/%'),
  status text not null default 'open' check (status in ('open', 'done')),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index freebies_created_idx on public.freebies (created_at desc);

revoke update on public.freebies from anon, authenticated;
grant update (status) on public.freebies to authenticated;

alter table public.freebies enable row level security;
create policy "freebies readable" on public.freebies for select
  using (not hidden or user_id = auth.uid() or public.is_admin());
create policy "freebies insert" on public.freebies for insert to authenticated
  with check (user_id = auth.uid() and hidden = false and status = 'open'
    and exists (select 1 from public.events e where e.id = event_id and (e.status = 'approved' or e.created_by = auth.uid())));
create policy "freebies update own" on public.freebies for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "freebies delete" on public.freebies for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

create trigger trg_limit_freebies before insert on public.freebies
  for each row execute function public.limit_posts();

-- 4. Reports and admin tools also cover freebies ----------------------------------
alter table public.item_reports drop constraint if exists item_reports_item_type_check;
alter table public.item_reports add constraint item_reports_item_type_check
  check (item_type in ('swap', 'buddy', 'merch', 'free'));

create or replace function public.item_table(p_type text) returns text
language sql immutable as $$
  select case p_type when 'swap' then 'swaps' when 'buddy' then 'buddies'
    when 'merch' then 'merch' when 'free' then 'freebies' end;
$$;

-- 5. Photo uploads (public bucket, max 2 MB, images only) -------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "photos upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "photos delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
