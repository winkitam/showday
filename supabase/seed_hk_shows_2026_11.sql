-- Hong Kong shows, Nov 2026 to Mar 2027. Run in Supabase > SQL Editor.
-- Shows already on the board (same artist, city, venue and date) are skipped.
insert into public.events (artist, city, venue, event_date, currency, status) values
  ('BIGBANG',     'Hong Kong', 'Kai Tak Stadium',            '2026-11-15', 'HKD', 'approved'),
  ('BIGBANG',     'Hong Kong', 'Kai Tak Stadium',            '2026-11-17', 'HKD', 'approved'),
  ('YUURI',       'Hong Kong', 'AsiaWorld-Expo',             '2026-11-27', 'HKD', 'approved'),
  ('Stray Kids',  'Hong Kong', 'Kai Tak Stadium',            '2026-12-05', 'HKD', 'approved'),
  ('KARD',        'Hong Kong', 'MacPherson Stadium',         '2026-12-19', 'HKD', 'approved'),
  ('Aaron Kwok',  'Hong Kong', 'Kai Tak Stadium',            '2026-12-31', 'HKD', 'approved'),
  ('Aaron Kwok',  'Hong Kong', 'Kai Tak Stadium',            '2027-01-01', 'HKD', 'approved'),
  ('QWER',        'Hong Kong', 'AsiaWorld-Expo',             '2027-01-02', 'HKD', 'approved'),
  ('BABYMONSTER', 'Hong Kong', 'AsiaWorld-Arena',            '2027-01-09', 'HKD', 'approved'),
  ('Young K',     'Hong Kong', 'AsiaWorld-Expo Hall 3',      '2027-01-15', 'HKD', 'approved'),
  ('D.O.',        'Hong Kong', 'AsiaWorld-Expo Hall 10',     '2027-01-16', 'HKD', 'approved'),
  ('BOYNEXTDOOR', 'Hong Kong', 'AsiaWorld-Expo',             '2027-01-16', 'HKD', 'approved'),
  ('BOYNEXTDOOR', 'Hong Kong', 'AsiaWorld-Expo',             '2027-01-17', 'HKD', 'approved'),
  ('YOASOBI',     'Hong Kong', 'AsiaWorld-Arena',            '2027-01-21', 'HKD', 'approved'),
  ('YOASOBI',     'Hong Kong', 'AsiaWorld-Arena',            '2027-01-22', 'HKD', 'approved'),
  ('Joey Yung',   'Hong Kong', 'Kai Tak Stadium',            '2027-01-22', 'HKD', 'approved'),
  ('Joey Yung',   'Hong Kong', 'Kai Tak Stadium',            '2027-01-23', 'HKD', 'approved'),
  ('BTS',         'Hong Kong', 'Kai Tak Stadium',            '2027-03-04', 'HKD', 'approved'),
  ('BTS',         'Hong Kong', 'Kai Tak Stadium',            '2027-03-06', 'HKD', 'approved'),
  ('BTS',         'Hong Kong', 'Kai Tak Stadium',            '2027-03-07', 'HKD', 'approved')
on conflict do nothing;
