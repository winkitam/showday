-- Seoul and Busan shows, Nov 2026 to Feb 2027. Run in Supabase > SQL Editor.
-- Shows already on the board (same artist, city, venue and date) are skipped.
insert into public.events (artist, city, venue, event_date, currency, status) values
  -- Seoul
  ('TXT',            'Seoul', 'KSPO Dome',           '2026-11-14', 'KRW', 'approved'),
  ('TXT',            'Seoul', 'KSPO Dome',           '2026-11-15', 'KRW', 'approved'),
  ('DAY6',           'Seoul', 'KSPO Dome',           '2026-12-18', 'KRW', 'approved'),
  ('DAY6',           'Seoul', 'KSPO Dome',           '2026-12-19', 'KRW', 'approved'),
  ('DAY6',           'Seoul', 'KSPO Dome',           '2026-12-20', 'KRW', 'approved'),
  ('THE BOYZ',       'Seoul', 'KSPO Dome',           '2026-12-24', 'KRW', 'approved'),
  ('THE BOYZ',       'Seoul', 'KSPO Dome',           '2026-12-25', 'KRW', 'approved'),
  ('THE BOYZ',       'Seoul', 'KSPO Dome',           '2026-12-26', 'KRW', 'approved'),
  ('THE BOYZ',       'Seoul', 'KSPO Dome',           '2026-12-27', 'KRW', 'approved'),
  ('Sung Si-kyung',  'Seoul', 'KSPO Dome',           '2026-12-31', 'KRW', 'approved'),
  ('Sung Si-kyung',  'Seoul', 'KSPO Dome',           '2027-01-01', 'KRW', 'approved'),
  ('Sung Si-kyung',  'Seoul', 'KSPO Dome',           '2027-01-02', 'KRW', 'approved'),
  ('Sung Si-kyung',  'Seoul', 'KSPO Dome',           '2027-01-03', 'KRW', 'approved'),
  ('EPIK HIGH',      'Seoul', 'INSPIRE Arena',       '2027-01-14', 'KRW', 'approved'),
  ('CNBLUE',         'Seoul', 'KSPO Dome',           '2027-02-20', 'KRW', 'approved'),
  ('CNBLUE',         'Seoul', 'KSPO Dome',           '2027-02-21', 'KRW', 'approved'),
  -- Busan
  ('Dynamic Duo',    'Busan', 'KBS Busan Hall',      '2026-12-12', 'KRW', 'approved'),
  ('Cho Yong-pil',   'Busan', 'BEXCO',               '2026-12-12', 'KRW', 'approved'),
  ('Cho Yong-pil',   'Busan', 'BEXCO',               '2026-12-13', 'KRW', 'approved'),
  ('AKMU',           'Busan', 'BEXCO',               '2026-12-19', 'KRW', 'approved'),
  ('AKMU',           'Busan', 'BEXCO',               '2026-12-20', 'KRW', 'approved'),
  ('Jaurim',         'Busan', 'BEXCO Auditorium',    '2026-12-25', 'KRW', 'approved'),
  ('Kwon Jin-ah',    'Busan', 'KBS Busan Hall',      '2026-12-25', 'KRW', 'approved'),
  ('Kwon Jin-ah',    'Busan', 'KBS Busan Hall',      '2026-12-26', 'KRW', 'approved')
on conflict do nothing;
