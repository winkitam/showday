-- 017: only people who tapped "Interested" on a post can rate it, and a poster can undo a
-- wrongly pressed "meeting" / "done" (not once someone has rated that post).
-- Run after 011 and 012. Safe to run twice.

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
  if not exists (select 1 from post_reactions where user_id = new.rater and kind = 'ask'
                  and item_type = new.item_type and item_id = new.item_id) then
    raise exception 'Tap Interested on the post first, then you can rate after the trade';
  end if;
  if (select created_at from auth.users where id = new.rater) > now() - interval '1 day' then
    raise exception 'New accounts can rate after 1 day';
  end if;
  if (select count(*) from ratings where rater = new.rater and created_at > now() - interval '1 day') >= 10 then
    raise exception 'Too many ratings today';
  end if;
  new.ratee := owner;
  return new;
end $$;

-- A post that already has a rating cannot be stepped back (stops mark-done, rate, undo tricks).
create or replace function public.guard_status_back() returns trigger
language plpgsql security definer set search_path = public as $$
declare rank_old int; rank_new int; it text;
begin
  rank_old := case old.status when 'open' then 0 when 'meeting' then 1 when 'done' then 2 else 0 end;
  rank_new := case new.status when 'open' then 0 when 'meeting' then 1 when 'done' then 2 else 0 end;
  if rank_new < rank_old then
    it := case tg_table_name when 'listings' then 'listing' when 'merch' then 'merch' else 'swap' end;
    if exists (select 1 from ratings where item_type = it and item_id = old.id) then
      raise exception 'This trade already has a rating and cannot be undone';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists guard_status_back on public.listings;
create trigger guard_status_back before update of status on public.listings
  for each row execute function public.guard_status_back();
drop trigger if exists guard_status_back on public.merch;
create trigger guard_status_back before update of status on public.merch
  for each row execute function public.guard_status_back();
drop trigger if exists guard_status_back on public.swaps;
create trigger guard_status_back before update of status on public.swaps
  for each row execute function public.guard_status_back();
