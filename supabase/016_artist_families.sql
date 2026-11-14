-- 016: sub-units and solos belong to a group ("Part of"), e.g. JxJ -> SEVENTEEN.
-- Run once in Supabase > SQL Editor (after 011). Safe to run again.
alter table public.artists add column if not exists parent_id uuid references public.artists(id) on delete set null;
alter table public.artists drop constraint if exists artists_parent_not_self;
alter table public.artists add constraint artists_parent_not_self check (parent_id is null or parent_id <> id);

insert into public.artists (name_en, name_zh, name_ko, aliases) values
  ('BSS', NULL, '부석순', '{"booseoksoon","seventeen bss","夫碩順"}'),
  ('DINO', NULL, '디노', '{"seventeen dino"}'),
  ('Jeonghan X Joshua', '淨漢X知秀', '정한X조슈아', '{"jxj","seventeen jxj"}')
on conflict do nothing;

-- Link known units and solos to their group
update public.artists c set parent_id = p.id
  from public.artists p
 where (lower(c.name_en), lower(p.name_en)) in (
   ('jeonghan x joshua', 'seventeen'), ('bss', 'seventeen'), ('dino', 'seventeen'),
   ('d.o.', 'exo'), ('young k', 'day6'))
   and c.parent_id is null;
