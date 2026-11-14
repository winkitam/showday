-- SEVENTEEN Jeonghan X Joshua (JxJ) "JOURNEY INTO [DREAMING]" tour, upcoming dates.
-- Run in Supabase > SQL Editor. Shows already on the board are skipped.
insert into public.events (artist, city, venue, event_date, currency, status) values
  ('Jeonghan X Joshua', 'Saitama',   'Belluna Dome',     '2026-11-21', 'JPY', 'approved'),
  ('Jeonghan X Joshua', 'Saitama',   'Belluna Dome',     '2026-11-22', 'JPY', 'approved'),
  ('Jeonghan X Joshua', 'Macau',     'Galaxy Arena',     '2026-12-11', 'HKD', 'approved'),
  ('Jeonghan X Joshua', 'Macau',     'Galaxy Arena',     '2026-12-12', 'HKD', 'approved'),
  ('Jeonghan X Joshua', 'Taipei',    'Taipei Arena',     '2027-01-09', 'TWD', 'approved'),
  ('Jeonghan X Joshua', 'Taipei',    'Taipei Arena',     '2027-01-10', 'TWD', 'approved'),
  ('Jeonghan X Joshua', 'Busan',     'BEXCO',            '2027-01-30', 'KRW', 'approved'),
  ('Jeonghan X Joshua', 'Busan',     'BEXCO',            '2027-01-31', 'KRW', 'approved'),
  ('Jeonghan X Joshua', 'Hong Kong', 'AsiaWorld-Arena',  '2027-02-20', 'HKD', 'approved'),
  ('Jeonghan X Joshua', 'Hong Kong', 'AsiaWorld-Arena',  '2027-02-21', 'HKD', 'approved')
on conflict do nothing;

-- Names and SEVENTEEN colours (rose quartz and serenity). Needs 011_artists_ratings.sql first.
insert into public.artists (name_en, name_zh, name_ko, aliases, color1, color2) values
  ('Jeonghan X Joshua', '淨漢X知秀', '정한X조슈아', '{"jxj","jeonghan x joshua","淨漢 知秀","seventeen jxj"}', '#F7CAC9', '#92A8D1')
on conflict do nothing;
