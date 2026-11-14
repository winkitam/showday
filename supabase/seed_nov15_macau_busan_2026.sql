-- Shows on 14 and 15 Nov 2026 in Macau and Busan.
-- Run in Supabase > SQL Editor. Shows already on the board are skipped.
insert into public.events (artist, city, venue, event_date, currency, status) values
  ('YESUNG',                   'Macau', 'Broadway Macau Theatre', '2026-11-15', 'HKD', 'approved'),
  ('CNBLUE',                   'Macau', 'Studio City Event Center', '2026-11-15', 'HKD', 'approved'),
  ('N.Flying x Hi-Fi Un!corn', 'Busan', 'BEXCO',                  '2026-11-14', 'KRW', 'approved'),
  ('N.Flying x Hi-Fi Un!corn', 'Busan', 'BEXCO',                  '2026-11-15', 'KRW', 'approved')
on conflict do nothing;

-- Names so they can be found in Chinese and Korean. Needs 011_artists_ratings.sql first.
insert into public.artists (name_en, name_zh, name_ko, aliases) values
  ('YESUNG',                   '藝聲', '예성',           '{"yesung","super junior yesung","sj yesung"}'),
  ('N.Flying x Hi-Fi Un!corn', null,   '엔플라잉 x 하이파이유니콘', '{"n.flying","nflying","hi-fi unicorn","hifi unicorn","엔플라잉","하이파이유니콘"}')
on conflict do nothing;
