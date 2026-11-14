-- 019: lets a poster see who tapped Interested or liked their posts (nickname and avatar only).
-- Run once in Supabase > SQL Editor, after 012 and 013. Safe to run again.
create or replace function public.my_post_reactors()
returns table (item_type text, item_id uuid, kind text, user_id uuid, nickname text,
               avatar text, avatar_bg text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  with mine as (
    select 'listing'::text as t, id from listings where user_id = auth.uid()
    union all select 'swap', id from swaps where user_id = auth.uid()
    union all select 'buddy', id from buddies where user_id = auth.uid()
    union all select 'merch', id from merch where user_id = auth.uid()
    union all select 'free', id from freebies where user_id = auth.uid()
  )
  select r.item_type, r.item_id, r.kind, r.user_id, p.nickname, p.avatar, p.avatar_bg, r.created_at
    from post_reactions r
    join mine m on m.t = r.item_type and m.id = r.item_id
    left join profiles p on p.id = r.user_id
   order by r.created_at desc
   limit 300
$$;
revoke all on function public.my_post_reactors() from public, anon;
grant execute on function public.my_post_reactors() to authenticated;
