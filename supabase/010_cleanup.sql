-- 010: automatic cleanup, matching the Privacy Policy.
--   Posts: deleted 6 months after the show (events cascade to listings,
--          contacts, listing reports, swaps, buddies, freebies).
--   Merch with no show: deleted 6 months after posting.
--   Item reports and feedback: deleted after 12 months.
--   Photos: rows are deleted here; the image files are removed from the
--          admin page ("Clean up old photos"), because Supabase only lets
--          the Storage API delete files.
-- Run once in Supabase > SQL Editor. Safe to run again.

create extension if not exists pg_cron;

create or replace function public.cleanup_old_posts()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  n_events int; n_merch int; n_reports int; n_feedback int;
begin
  delete from merch m
   using events e
   where m.event_id = e.id and e.event_date < current_date - interval '6 months';
  delete from events where event_date < current_date - interval '6 months';
  get diagnostics n_events = row_count;

  delete from merch where event_id is null and created_at < now() - interval '6 months';
  get diagnostics n_merch = row_count;

  delete from item_reports where created_at < now() - interval '12 months';
  get diagnostics n_reports = row_count;

  delete from feedback where created_at < now() - interval '12 months';
  get diagnostics n_feedback = row_count;

  return jsonb_build_object('events', n_events, 'merch', n_merch,
                            'item_reports', n_reports, 'feedback', n_feedback);
end $$;

revoke all on function public.cleanup_old_posts() from public, anon, authenticated;

-- Every night at 03:17 UTC.
select cron.schedule('showday-cleanup', '17 3 * * *', $$select public.cleanup_old_posts()$$);

-- Photo files no longer used by any post (older than 1 day, so uploads in
-- progress are never touched). Admins only.
create or replace function public.orphan_photos()
returns setof text
language plpgsql
security definer
stable
set search_path = public, storage
as $$
declare
  used text := '';
  t text;
begin
  if not public.is_admin() then
    raise exception 'admins only';
  end if;
  for t in
    select table_name from information_schema.columns
     where table_schema = 'public' and column_name = 'photo_url'
  loop
    used := used || format(' union all select photo_url from public.%I where photo_url is not null', t);
  end loop;
  if used = '' then
    used := ' select null::text where false';
  else
    used := substr(used, 12);
  end if;
  return query execute
    'select o.name from storage.objects o
      where o.bucket_id = ''photos''
        and o.created_at < now() - interval ''1 day''
        and not exists (select 1 from (' || used || ') u(url)
                         where u.url like ''%/photos/'' || o.name)
      order by o.created_at
      limit 1000';
end $$;

revoke all on function public.orphan_photos() from public, anon;
grant execute on function public.orphan_photos() to authenticated;
