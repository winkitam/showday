-- Admins: no daily limit, and concerts they add are approved automatically.
-- Everyone else: up to 10 concert dates per day (multi-day shows count each date).
-- Run ONCE in Supabase > SQL Editor > New query > Run.
create or replace function public.limit_events() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then
    new.status := 'approved';
    return new;
  end if;
  if (select count(*) from events
      where created_by = new.created_by and created_at > now() - interval '1 day') >= 10 then
    raise exception 'Too many concerts added today';
  end if;
  return new;
end $$;

create policy "admins insert events" on public.events
  for insert to authenticated with check (public.is_admin());
