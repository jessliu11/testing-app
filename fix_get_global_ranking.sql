-- Fix get_global_ranking to include first_place_votes
-- Run this in your production Supabase SQL Editor

drop function if exists public.get_global_ranking(uuid);

create or replace function public.get_global_ranking(
  p_daily_set_id uuid
)
returns table (
  item_id uuid,
  item_name text,
  item_artist text,
  score bigint,
  first_place_votes bigint
)
language sql
security definer
set search_path = public
as $$
  select
    i.id as item_id,
    i.name as item_name,
    i.artist as item_artist,
    coalesce(sum(7 - r.rank), 0)::bigint as score,
    coalesce(sum(case when r.rank = 1 then 1 else 0 end), 0)::bigint as first_place_votes
  from public.daily_set_items dsi
  join public.items i on i.id = dsi.item_id
  left join public.submissions s on s.daily_set_id = dsi.daily_set_id
  left join public.submission_rankings r on r.submission_id = s.id and r.item_id = i.id
  where dsi.daily_set_id = p_daily_set_id
  group by i.id, i.name, i.artist
  order by score desc, i.name asc;
$$;

grant execute on function public.get_global_ranking(uuid) to public;
