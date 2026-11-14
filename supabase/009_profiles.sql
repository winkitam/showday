-- Public profiles: nickname and an animal avatar (drawn by the site, no uploads).
-- Run ONCE in Supabase > SQL Editor > New query > Run.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  nickname text check (nickname is null or char_length(trim(nickname)) between 1 and 24),
  avatar text not null default 'rabbit' check (avatar ~ '^[a-z]{2,12}$'),
  avatar_bg text not null default 'pink' check (avatar_bg ~ '^[a-z]{2,12}$'),
  created_at timestamptz not null default now()
);
-- Nicknames are unique (ignoring case) so nobody can copy someone else's name
create unique index profiles_nickname_unique on public.profiles (lower(trim(nickname))) where nickname is not null;

alter table public.profiles enable row level security;
create policy "profiles readable" on public.profiles for select using (true);
create policy "profiles insert own" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles update own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
grant select on public.profiles to anon, authenticated;
grant insert (id, nickname, avatar, avatar_bg) on public.profiles to authenticated;
grant update (nickname, avatar, avatar_bg) on public.profiles to authenticated;

-- Every account gets a profile; "member since" uses the sign-up date
insert into public.profiles (id, created_at) select id, created_at from auth.users on conflict (id) do nothing;
create function public.new_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, created_at) values (new.id, new.created_at) on conflict (id) do nothing;
  return new;
end $$;
create trigger trg_new_profile after insert on auth.users for each row execute function public.new_profile();
