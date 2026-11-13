-- Admin page setup. Run ONCE in Supabase > SQL Editor > New query > Run.
-- Before running: log in to the website at least once with the email below.

-- 1. Who is an admin
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;
create policy "admins see themselves" on public.admins
  for select to authenticated using (user_id = auth.uid());

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- 2. Admins can see, edit, approve and delete every concert
create policy "admins read all events" on public.events
  for select to authenticated using (public.is_admin());
create policy "admins update events" on public.events
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete events" on public.events
  for delete to authenticated using (public.is_admin());

-- 3. Admins can see every listing (including hidden ones) and all reports
create policy "admins read all listings" on public.listings
  for select to authenticated using (public.is_admin());
create policy "admins delete listings" on public.listings
  for delete to authenticated using (public.is_admin());
create policy "admins read reports" on public.reports
  for select to authenticated using (public.is_admin());

-- 4. Hide or restore a listing (admins only)
create function public.admin_set_hidden(p_listing uuid, p_hidden boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Not allowed';
  end if;
  update listings set hidden = p_hidden where id = p_listing;
  if not p_hidden then
    delete from reports where listing_id = p_listing;
  end if;
end $$;
revoke execute on function public.admin_set_hidden(uuid, boolean) from public, anon;
grant execute on function public.admin_set_hidden(uuid, boolean) to authenticated;

-- 5. Make yourself an admin (change the email if needed)
insert into public.admins (user_id)
select id from auth.users where email = 'tamwinki0411@gmail.com';
