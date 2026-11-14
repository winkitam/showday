-- Seoul shows on 14 and 15 Nov 2026 (Zion.T at GS Art Center, Kim Feel at Blue Square).
-- TXT (KSPO Dome) and BIGBANG (Kai Tak) are already in the other seed files.
-- Run in Supabase > SQL Editor. Shows already on the board are skipped.
insert into public.events (artist, city, venue, event_date, currency, status) values
  ('Zion.T',   'Seoul', 'GS Art Center',                     '2026-11-14', 'KRW', 'approved'),
  ('Zion.T',   'Seoul', 'GS Art Center',                     '2026-11-15', 'KRW', 'approved'),
  ('Kim Feel', 'Seoul', 'Blue Square Woori WON Banking Hall', '2026-11-14', 'KRW', 'approved'),
  ('Kim Feel', 'Seoul', 'Blue Square Woori WON Banking Hall', '2026-11-15', 'KRW', 'approved')
on conflict do nothing;

-- Korean names so they can be found by searching in Korean. Needs 011_artists_ratings.sql first.
insert into public.artists (name_en, name_zh, name_ko, aliases) values
  ('Zion.T',   null, '자이언티', '{"zion t","ziont"}'),
  ('Kim Feel', null, '김필',     '{"kimfeel","kim pil"}')
on conflict do nothing;
