-- 015: keep posts on topic. Run once in Supabase > SQL Editor. Safe to run again.
--   1. Blocked words: posts containing them are refused (edit the list on the admin page).
--   2. No links in posts (contact handles are fine).
--   3. Banned users cannot post, add shows, rate or react.
-- Admins skip these checks.

create table if not exists public.blocked_words (
  word text primary key check (char_length(word) between 2 and 40 and word = lower(word)),
  created_at timestamptz not null default now()
);
create table if not exists public.banned_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reason text check (reason is null or char_length(reason) <= 200),
  created_at timestamptz not null default now()
);
alter table public.blocked_words enable row level security;
alter table public.banned_users enable row level security;
drop policy if exists "admins manage words" on public.blocked_words;
create policy "admins manage words" on public.blocked_words for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage bans" on public.banned_users;
create policy "admins manage bans" on public.banned_users for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select, insert, delete on public.blocked_words, public.banned_users to authenticated;

-- Starter list: selling above face value, risky payments, spam. Add or remove on the admin page.
insert into public.blocked_words (word) values
  ('加價'), ('炒飛'), ('炒價'), ('高價收'), ('高價放'), ('markup'), ('mark up'), ('above face'), ('over face value'),
  ('f&f'), ('friends and family'), ('western union'), ('usdt'), ('bitcoin'), ('crypto'), ('gift card'),
  ('訂金'), ('先付款'), ('預付'), ('deposit first'), ('pay first'), ('telegram group'), ('whatsapp group'),
  ('viagogo'), ('stubhub'), ('scalper'), ('黃牛')
on conflict do nothing;

create or replace function public.check_post_rules() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  doc jsonb := to_jsonb(new);
  txt text := '';
  col text;
  hit text;
begin
  if public.is_admin() then return new; end if;
  if auth.uid() is not null and exists (select 1 from banned_users where user_id = auth.uid()) then
    raise exception 'Account suspended: this account cannot post' using errcode = 'P0001';
  end if;
  foreach col in array coalesce(tg_argv, '{}'::text[]) loop
    txt := txt || ' ' || coalesce(doc ->> col, '');
  end loop;
  txt := lower(txt);
  if txt ~ '(https?://|www\.|\m[a-z0-9-]+\.(com|net|org|io|hk|co|me|ly|xyz|shop|link)(/|\M))' then
    raise exception 'Breaks the board rules: no links in posts' using errcode = 'P0001';
  end if;
  select word into hit from blocked_words where position(word in txt) > 0 limit 1;
  if hit is not null then
    raise exception 'Breaks the board rules: blocked word' using errcode = 'P0001';
  end if;
  return new;
end $$;

-- Text columns checked on each table (missing columns are simply skipped)
do $$
declare t text; cols text;
begin
  for t, cols in select * from (values
    ('listings', '''section'', ''meet_point'', ''note'''),
    ('swaps', '''have'', ''want'', ''note'''),
    ('buddies', '''note'', ''meet_place'', ''meet_time'''),
    ('merch', '''title'', ''details'', ''member'''),
    ('freebies', '''what'', ''details'', ''place'', ''give_time'''),
    ('events', '''artist'', ''venue'', ''city'''),
    ('ratings', '''comment''')) v(t, cols)
  loop
    if to_regclass('public.' || t) is not null then
      execute format('drop trigger if exists check_post_rules on public.%I', t);
      execute format('create trigger check_post_rules before insert or update of %s on public.%I for each row execute function public.check_post_rules(%s)',
        replace(cols, '''', ''), t, cols);
    end if;
  end loop;
  if to_regclass('public.post_reactions') is not null then
    drop trigger if exists check_post_rules on public.post_reactions;
    create trigger check_post_rules before insert on public.post_reactions for each row execute function public.check_post_rules();
  end if;
end $$;

-- Admin: delete every post by one user (for spammers)
create or replace function public.admin_delete_user_posts(p_user uuid) returns int
language plpgsql security definer set search_path = public as $$
declare n int := 0; c int;
begin
  if not public.is_admin() then raise exception 'admins only'; end if;
  delete from listings where user_id = p_user; get diagnostics c = row_count; n := n + c;
  delete from swaps where user_id = p_user; get diagnostics c = row_count; n := n + c;
  delete from buddies where user_id = p_user; get diagnostics c = row_count; n := n + c;
  delete from merch where user_id = p_user; get diagnostics c = row_count; n := n + c;
  if to_regclass('public.freebies') is not null then
    execute 'delete from public.freebies where user_id = $1' using p_user; get diagnostics c = row_count; n := n + c;
  end if;
  return n;
end $$;
revoke all on function public.admin_delete_user_posts(uuid) from public, anon;
grant execute on function public.admin_delete_user_posts(uuid) to authenticated;
