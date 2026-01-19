-- 003_rpc_functions.sql
-- RPC functions: Wordle-style daily set generation and secure submission.

begin;

-- -------------------------------------------------------------------
-- Helper: validate timezone string and compute local date.
-- We compute: (now() at time zone tz)::date
-- This yields the user's local date based on tz.
-- -------------------------------------------------------------------

create or replace function public.get_daily_set(
  category_slug text,
  tz text
)
returns table (
  daily_set_id uuid,
  set_date date,
  daily_set_category_id uuid,
  item_id uuid,
  item_name text,
  item_artist text,
  display_order int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_category_id uuid;
  v_set_id uuid;
  v_set_date date;
begin
  -- Basic auth requirement: must have a user (anonymous auth is fine)
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Ensure category exists
  select c.id into v_category_id
  from public.categories c
  where c.slug = category_slug;

  if v_category_id is null then
    raise exception 'Unknown category: %', category_slug;
  end if;

  -- Validate timezone by attempting to use it.
  -- If tz is invalid, Postgres will error on AT TIME ZONE.
  begin
    v_set_date := (now() at time zone tz)::date;
  exception when others then
    raise exception 'Invalid timezone: %', tz;
  end;

  -- Create or fetch the daily set
  insert into public.daily_sets (category_id, set_date)
  values (v_category_id, v_set_date)
  on conflict (category_id, set_date)
  do update set set_date = excluded.set_date
  returning id into v_set_id;

  -- If daily_set_items not yet populated, populate with 6 random active items
  if not exists (
    select 1 from public.daily_set_items dsi where dsi.daily_set_id = v_set_id
  ) then
    with picked as (
      select i.id as item_id
      from public.items i
      where i.category_id = v_category_id
        and i.is_active = true
      order by random()
      limit 6
    )
    insert into public.daily_set_items (daily_set_id, item_id, display_order)
    select v_set_id, p.item_id, row_number() over ()
    from picked p;
  end if;

  -- Return the daily set and its items
  return query
  select
    ds.id,
    ds.set_date,
    ds.category_id,
    i.id,
    i.name,
    i.artist,
    dsi.display_order
  from public.daily_sets ds
  join public.daily_set_items dsi on dsi.daily_set_id = ds.id
  join public.items i on i.id = dsi.item_id
  where ds.id = v_set_id
  order by dsi.display_order;

end;
$$;

-- Allow callers to execute (RLS still applies to underlying tables, but
-- SECURITY DEFINER runs with function owner privileges; we rely on the
-- function to enforce auth + invariants.)
grant execute on function public.get_daily_set(text, text) to public;

-- -------------------------------------------------------------------
-- Submit ranking: ranked_item_ids is an array of 6 item UUIDs, ordered best->worst
-- Validates membership and uniqueness, enforces one submission per user per set.
-- -------------------------------------------------------------------
create or replace function public.submit_ranking(
  p_daily_set_id uuid,
  p_ranked_item_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_submission_id uuid;
  v_count int;
  v_distinct_count int;
  v_expected_count int;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Validate array length
  v_count := coalesce(array_length(p_ranked_item_ids, 1), 0);
  if v_count <> 6 then
    raise exception 'Ranking must include exactly 6 items (got %)', v_count;
  end if;

  -- Validate uniqueness within the array
  select count(distinct x) into v_distinct_count
  from unnest(p_ranked_item_ids) as x;

  if v_distinct_count <> 6 then
    raise exception 'Ranking items must be unique';
  end if;

  -- Validate that the daily set exists and has exactly 6 items
  select count(*) into v_expected_count
  from public.daily_set_items dsi
  where dsi.daily_set_id = p_daily_set_id;

  if v_expected_count <> 6 then
    raise exception 'Daily set is invalid or not populated';
  end if;

  -- Validate that the submitted items match the daily set items exactly
  -- Check: every submitted item exists in daily_set_items for that set
  if exists (
    select 1
    from unnest(p_ranked_item_ids) as x(item_id)
    left join public.daily_set_items dsi
      on dsi.daily_set_id = p_daily_set_id and dsi.item_id = x.item_id
    where dsi.item_id is null
  ) then
    raise exception 'One or more items are not in this daily set';
  end if;

  -- Create submission (unique constraint enforces 1 per user per daily set)
  insert into public.submissions (daily_set_id, user_id)
  values (p_daily_set_id, v_user_id)
  returning id into v_submission_id;

  -- Insert ranking rows (rank 1..6)
  insert into public.submission_rankings (submission_id, item_id, rank)
  select
    v_submission_id,
    x.item_id,
    x.ord
  from unnest(p_ranked_item_ids) with ordinality as x(item_id, ord);

  return v_submission_id;

exception
  when unique_violation then
    raise exception 'You have already submitted for this daily set';
end;
$$;

grant execute on function public.submit_ranking(uuid, uuid[]) to public;

-- -------------------------------------------------------------------
-- Global ranking (Borda count): rank 1 gets 6 points, rank 6 gets 1 point
-- Returns all 6 items with scores and ordering.
-- -------------------------------------------------------------------
create or replace function public.get_global_ranking(
  p_daily_set_id uuid
)
returns table (
  item_id uuid,
  item_name text,
  item_artist text,
  score bigint
)
language sql
security definer
set search_path = public
as $$
  select
    i.id as item_id,
    i.name as item_name,
    i.artist as item_artist,
    coalesce(sum(7 - r.rank), 0)::bigint as score
  from public.daily_set_items dsi
  join public.items i on i.id = dsi.item_id
  left join public.submissions s on s.daily_set_id = dsi.daily_set_id
  left join public.submission_rankings r on r.submission_id = s.id and r.item_id = i.id
  where dsi.daily_set_id = p_daily_set_id
  group by i.id, i.name, i.artist
  order by score desc, i.name asc;
$$;

grant execute on function public.get_global_ranking(uuid) to public;

commit;
