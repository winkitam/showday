-- Photos on ticket listings, seat swaps and buddy posts.
-- Run ONCE in Supabase > SQL Editor > New query > Run. Needs 007 first (it creates the photos bucket).

alter table public.listings add column photo_url text
  check (photo_url is null or photo_url like 'https://%/storage/v1/object/public/photos/%');
alter table public.swaps add column photo_url text
  check (photo_url is null or photo_url like 'https://%/storage/v1/object/public/photos/%');
alter table public.buddies add column photo_url text
  check (photo_url is null or photo_url like 'https://%/storage/v1/object/public/photos/%');
grant select (photo_url) on public.listings, public.swaps, public.buddies to anon, authenticated;

-- create_listing now also takes an optional photo
drop function public.create_listing(uuid, text, text, int, numeric, numeric, text, text, text);
create function public.create_listing(
  p_event uuid, p_kind text, p_section text, p_qty int,
  p_original numeric, p_price numeric, p_meet text, p_contact text,
  p_note text default null, p_photo text default null)
returns uuid language plpgsql security invoker set search_path = public as $$
declare new_id uuid;
begin
  insert into listings (event_id, kind, section, qty, original_price, price, meet_point, note, photo_url)
  values (p_event, p_kind, p_section, p_qty, p_original, p_price, p_meet, nullif(trim(p_note), ''), nullif(trim(p_photo), ''))
  returning id into new_id;
  insert into listing_contacts (listing_id, contact) values (new_id, p_contact);
  return new_id;
end $$;
revoke execute on function public.create_listing(uuid, text, text, int, numeric, numeric, text, text, text, text) from public, anon;
grant execute on function public.create_listing(uuid, text, text, int, numeric, numeric, text, text, text, text) to authenticated;
