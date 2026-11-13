-- Descriptions on listings and seat swaps, and an optional concert for merch.
-- Run ONCE in Supabase > SQL Editor > New query > Run.

-- 1. Descriptions
alter table public.listings add column note text check (note is null or char_length(note) <= 200);
alter table public.swaps add column note text check (note is null or char_length(note) <= 200);
grant select (note) on public.swaps to anon;

-- 2. Merch can be linked to a concert (to meet at the show)
alter table public.merch add column event_id uuid references public.events(id) on delete set null;
grant select (event_id) on public.merch to anon;
drop policy "merch insert" on public.merch;
create policy "merch insert" on public.merch for insert to authenticated
  with check (user_id = auth.uid() and hidden = false and status = 'open'
    and (event_id is null or exists (select 1 from public.events e
      where e.id = event_id and (e.status = 'approved' or e.created_by = auth.uid()))));

-- 3. create_listing now takes an optional description
drop function public.create_listing(uuid, text, text, int, numeric, numeric, text, text);
create function public.create_listing(
  p_event uuid, p_kind text, p_section text, p_qty int,
  p_original numeric, p_price numeric, p_meet text, p_contact text, p_note text default null)
returns uuid language plpgsql security invoker set search_path = public as $$
declare new_id uuid;
begin
  insert into listings (event_id, kind, section, qty, original_price, price, meet_point, note)
  values (p_event, p_kind, p_section, p_qty, p_original, p_price, p_meet, nullif(trim(p_note), ''))
  returning id into new_id;
  insert into listing_contacts (listing_id, contact) values (new_id, p_contact);
  return new_id;
end $$;
revoke execute on function public.create_listing(uuid, text, text, int, numeric, numeric, text, text, text) from public, anon;
grant execute on function public.create_listing(uuid, text, text, int, numeric, numeric, text, text, text) to authenticated;
