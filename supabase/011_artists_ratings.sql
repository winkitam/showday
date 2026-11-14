-- 011: artist names and colours, merging shows, seller ratings.
-- Run once in Supabase > SQL Editor. Safe to run again.

-- 1. Artists: names in each language, other names, fandom colours -------------
create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name_en text not null check (char_length(trim(name_en)) between 1 and 80),
  name_zh text check (name_zh is null or char_length(name_zh) <= 80),
  name_ko text check (name_ko is null or char_length(name_ko) <= 80),
  aliases text[] not null default '{}' check (cardinality(aliases) <= 12),
  color1 text check (color1 is null or color1 ~ '^#[0-9A-Fa-f]{6}$'),
  color2 text check (color2 is null or color2 ~ '^#[0-9A-Fa-f]{6}$'),
  updated_at timestamptz not null default now()
);
create unique index if not exists artists_name_en_unique on public.artists (lower(trim(name_en)));

alter table public.artists enable row level security;
drop policy if exists "artists readable" on public.artists;
create policy "artists readable" on public.artists for select using (true);
drop policy if exists "admins write artists" on public.artists;
create policy "admins write artists" on public.artists for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
grant select on public.artists to anon, authenticated;
grant insert, update, delete on public.artists to authenticated;

insert into public.artists (name_en, name_zh, name_ko, aliases, color1, color2) values
  ('BTS',            '防彈少年團', '방탄소년단', '{"bangtan","防弹少年团","bangtan boys"}', '#A06CD5', '#5B2A86'),
  ('BIGBANG',        NULL,        '빅뱅',       '{"big bang"}',                          '#FFD400', '#1A1A1A'),
  ('BLACKPINK',      NULL,        '블랙핑크',   '{"black pink"}',                        '#F7A7C1', '#1A1A1A'),
  ('TWICE',          NULL,        '트와이스',   '{}',                                    '#FBC8A0', '#FF3EA5'),
  ('Stray Kids',     NULL,        '스트레이 키즈', '{"skz"}',                            '#9DE5D2', '#FFE36E'),
  ('BABYMONSTER',    NULL,        '베이비몬스터', '{"baemon"}',                          '#E63946', '#1A1A1A'),
  ('TXT',            NULL,        '투모로우바이투게더', '{"tomorrow x together","tomorrow by together"}', '#7FB2FF', '#3D5AFE'),
  ('SEVENTEEN',      NULL,        '세븐틴',     '{"svt"}',                               '#F7CAC9', '#92A8D1'),
  ('EXO',            NULL,        '엑소',       '{}',                                    '#F3E9D2', '#C9B37E'),
  ('IU',             NULL,        '아이유',     '{"李知恩","이지은"}',                   '#E8F55A', '#9C6ADE'),
  ('NewJeans',       NULL,        '뉴진스',     '{}',                                    '#9CCBF7', '#F7A8C8'),
  ('DAY6',           NULL,        '데이식스',   '{"day 6"}',                             NULL, NULL),
  ('THE BOYZ',       NULL,        '더보이즈',   '{"tbz"}',                               NULL, NULL),
  ('CNBLUE',         NULL,        '씨엔블루',   '{"cn blue"}',                           NULL, NULL),
  ('AKMU',           '樂童音樂家', '악뮤',      '{"akdong musician","乐童音乐家"}',      NULL, NULL),
  ('EPIK HIGH',      NULL,        '에픽하이',   '{}',                                    NULL, NULL),
  ('BOYNEXTDOOR',    NULL,        '보이넥스트도어', '{"bnd"}',                           NULL, NULL),
  ('D.O.',           '都敬秀',    '디오',       '{"doh kyungsoo","도경수","do kyungsoo"}', NULL, NULL),
  ('Young K',        NULL,        '영케이',     '{}',                                    NULL, NULL),
  ('i-dle',          NULL,        '아이들',     '{"(g)i-dle","gidle","g-idle"}',         NULL, NULL),
  ('Sung Si-kyung',  '成始璄',    '성시경',     '{}',                                    NULL, NULL),
  ('Cho Yong-pil',   '趙容弼',    '조용필',     '{}',                                    NULL, NULL),
  ('Dynamic Duo',    NULL,        '다이나믹 듀오', '{}',                                 NULL, NULL),
  ('Kwon Jin-ah',    '權珍雅',    '권진아',     '{}',                                    NULL, NULL),
  ('Jaurim',         '紫雨林',    '자우림',     '{}',                                    NULL, NULL),
  ('Aaron Kwok',     '郭富城',    '곽부성',     '{}',                                    NULL, NULL),
  ('Joey Yung',      '容祖兒',    NULL,         '{"容祖儿"}',                            NULL, NULL),
  ('Andy Lau',       '劉德華',    '유덕화',     '{"刘德华"}',                            NULL, NULL),
  ('MIRROR',         NULL,        NULL,         '{}',                                    NULL, NULL),
  ('YOASOBI',        NULL,        '요아소비',   '{}',                                    NULL, NULL),
  ('YUURI',          '優里',      '유우리',     '{"優里"}',                              NULL, NULL),
  ('KARD',           NULL,        '카드',       '{}',                                    NULL, NULL),
  ('QWER',           NULL,        NULL,         '{}',                                    NULL, NULL)
on conflict do nothing;

-- 2. Merge two shows: move every post to the show you keep, delete the other ---
create or replace function public.merge_events(keep_id uuid, dup_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  moved int := 0; n int;
begin
  if not public.is_admin() then raise exception 'admins only'; end if;
  if keep_id = dup_id then raise exception 'pick two different shows'; end if;
  if not exists (select 1 from events where id = keep_id)
     or not exists (select 1 from events where id = dup_id) then
    raise exception 'show not found';
  end if;
  update listings set event_id = keep_id where event_id = dup_id; get diagnostics n = row_count; moved := moved + n;
  update swaps    set event_id = keep_id where event_id = dup_id; get diagnostics n = row_count; moved := moved + n;
  update buddies  set event_id = keep_id where event_id = dup_id; get diagnostics n = row_count; moved := moved + n;
  update freebies set event_id = keep_id where event_id = dup_id; get diagnostics n = row_count; moved := moved + n;
  update merch    set event_id = keep_id where event_id = dup_id; get diagnostics n = row_count; moved := moved + n;
  update events set status = 'approved' where id = keep_id;
  delete from events where id = dup_id;
  return jsonb_build_object('moved', moved);
end $$;
revoke all on function public.merge_events(uuid, uuid) from public, anon;
grant execute on function public.merge_events(uuid, uuid) to authenticated;

-- 3. Seller ratings ----------------------------------------------------------
-- A logged-in fan can rate the person who posted a ticket (selling), a merch
-- post (selling or trading) or a seat swap, once per post, after the post is
-- marked as meeting or done. Not your own post, posts up to 60 days old,
-- accounts at least 1 day old, at most 10 ratings a day.
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  rater uuid not null default auth.uid() references auth.users(id) on delete cascade,
  ratee uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('listing', 'merch', 'swap')),
  item_id uuid not null,
  score smallint not null check (score between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 200),
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  unique (rater, item_type, item_id)
);
create index if not exists ratings_ratee_idx on public.ratings (ratee, created_at desc);

create or replace function public.check_rating() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  owner uuid; st text; made timestamptz; ok boolean := false;
begin
  new.rater := auth.uid();
  new.hidden := false;
  new.created_at := now();
  if new.rater is null then raise exception 'Log in to rate'; end if;
  if new.item_type = 'listing' then
    select user_id, status, created_at, kind = 'sell' into owner, st, made, ok from listings where id = new.item_id;
  elsif new.item_type = 'merch' then
    select user_id, status, created_at, kind in ('sale', 'swap') into owner, st, made, ok from merch where id = new.item_id;
  else
    select user_id, status, created_at, true into owner, st, made, ok from swaps where id = new.item_id;
  end if;
  if owner is null or not ok then raise exception 'This post cannot be rated'; end if;
  if owner = new.rater then raise exception 'You cannot rate yourself'; end if;
  if st not in ('meeting', 'done') then raise exception 'You can rate once the trade is marked done'; end if;
  if made < now() - interval '60 days' then raise exception 'This post is too old to rate'; end if;
  if (select created_at from auth.users where id = new.rater) > now() - interval '1 day' then
    raise exception 'New accounts can rate after 1 day';
  end if;
  if (select count(*) from ratings where rater = new.rater and created_at > now() - interval '1 day') >= 10 then
    raise exception 'Too many ratings today';
  end if;
  new.ratee := owner;
  return new;
end $$;
drop trigger if exists check_rating on public.ratings;
create trigger check_rating before insert on public.ratings
  for each row execute function public.check_rating();

alter table public.ratings enable row level security;
drop policy if exists "ratings readable" on public.ratings;
create policy "ratings readable" on public.ratings for select using (hidden = false or public.is_admin());
drop policy if exists "ratings insert own" on public.ratings;
create policy "ratings insert own" on public.ratings for insert to authenticated with check (rater = auth.uid());
drop policy if exists "ratings delete own or admin" on public.ratings;
create policy "ratings delete own or admin" on public.ratings for delete to authenticated
  using (rater = auth.uid() or public.is_admin());
drop policy if exists "admins hide ratings" on public.ratings;
create policy "admins hide ratings" on public.ratings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
grant select (id, rater, ratee, item_type, item_id, score, comment, created_at) on public.ratings to anon;
grant select, insert, delete on public.ratings to authenticated;
grant update (hidden) on public.ratings to authenticated;

-- Average score per person, for the small star next to names.
create or replace view public.seller_scores as
  select ratee as user_id, count(*)::int as n, round(avg(score)::numeric, 1) as avg
    from public.ratings where hidden = false group by ratee;
grant select on public.seller_scores to anon, authenticated;
