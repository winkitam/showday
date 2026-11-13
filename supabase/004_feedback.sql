-- User feedback, readable only by admins. Run ONCE in Supabase > SQL Editor > New query > Run.
-- Needs 001_admin.sql to have been run first.

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  reply_email text check (reply_email is null or char_length(reply_email) <= 120),
  message text not null check (char_length(message) between 3 and 1000),
  page text check (page is null or char_length(page) <= 200),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;

-- Anyone (logged in or not) can send feedback, but nobody except admins can read it
create policy "anyone can send feedback" on public.feedback
  for insert to anon, authenticated
  with check (is_read = false and (user_id is null or user_id = auth.uid()));
create policy "admins read feedback" on public.feedback
  for select to authenticated using (public.is_admin());
create policy "admins update feedback" on public.feedback
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete feedback" on public.feedback
  for delete to authenticated using (public.is_admin());

-- Anti-spam: at most 20 messages in 10 minutes across the whole site
create function public.limit_feedback() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from feedback where created_at > now() - interval '10 minutes') >= 20 then
    raise exception 'Too many feedback messages, try again later';
  end if;
  return new;
end $$;
create trigger trg_limit_feedback before insert on public.feedback
  for each row execute function public.limit_feedback();
