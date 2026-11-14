-- 018: fixes "FOREACH expression must not be null" when tapping Interested or a like.
-- The rules check (015) failed on tables with no text columns to check. Run once in
-- Supabase > SQL Editor. Safe to run again.
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
