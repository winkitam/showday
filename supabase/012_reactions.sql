-- 012: "Interested" and likes on posts. No text, so nothing to moderate.
-- Run once in Supabase > SQL Editor (after 011). Safe to run again.

create table if not exists public.post_reactions (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('listing', 'swap', 'buddy', 'merch', 'free')),
  item_id uuid not null,
  kind text not null check (kind in ('ask', 'like')),
  created_at timestamptz not null default now(),
  primary key (user_id, item_type, item_id, kind)
);
create index if not exists post_reactions_item_idx on public.post_reactions (item_type, item_id);

-- Not on your own post; "Interested" only on open posts (not buddies); 300 a day.
create or replace function public.check_reaction() returns trigger
language plpgsql security definer set search_path = public as $$
declare owner uuid; st text;
begin
  new.user_id := auth.uid();
  new.created_at := now();
  if new.user_id is null then raise exception 'Log in first'; end if;
  if new.item_type = 'listing' then select user_id, status into owner, st from listings where id = new.item_id;
  elsif new.item_type = 'swap' then select user_id, status into owner, st from swaps where id = new.item_id;
  elsif new.item_type = 'buddy' then select user_id, 'open' into owner, st from buddies where id = new.item_id;
  elsif new.item_type = 'merch' then select user_id, status into owner, st from merch where id = new.item_id;
  else select user_id, status into owner, st from freebies where id = new.item_id;
  end if;
  if owner is null then raise exception 'Post not found'; end if;
  if owner = new.user_id then raise exception 'Not on your own post'; end if;
  if new.kind = 'ask' and (new.item_type = 'buddy' or st <> 'open') then raise exception 'Post is not open'; end if;
  if (select count(*) from post_reactions where user_id = new.user_id and created_at > now() - interval '1 day') >= 300 then
    raise exception 'Too many today';
  end if;
  return new;
end $$;
drop trigger if exists check_reaction on public.post_reactions;
create trigger check_reaction before insert on public.post_reactions
  for each row execute function public.check_reaction();

alter table public.post_reactions enable row level security;
-- You only see your own rows; everyone sees the totals through the view below.
drop policy if exists "reactions own" on public.post_reactions;
create policy "reactions own" on public.post_reactions for select to authenticated using (user_id = auth.uid());
drop policy if exists "reactions insert own" on public.post_reactions;
create policy "reactions insert own" on public.post_reactions for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "reactions delete own" on public.post_reactions;
create policy "reactions delete own" on public.post_reactions for delete to authenticated using (user_id = auth.uid());
grant select, insert, delete on public.post_reactions to authenticated;

create or replace view public.reaction_counts as
  select item_type, item_id,
         count(*) filter (where kind = 'ask')::int as asks,
         count(*) filter (where kind = 'like')::int as likes
    from public.post_reactions group by item_type, item_id;
grant select on public.reaction_counts to anon, authenticated;
