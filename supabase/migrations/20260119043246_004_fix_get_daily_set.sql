begin;

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
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select c.id into v_category_id
  from public.categories c
  where c.slug = category_slug;

  if v_category_id is null then
    raise exception 'Unknown category: %', category_slug;
  end if;

  begin
    v_set_date := (now() at time zone tz)::date;
  exception when others then
    raise exception 'Invalid timezone: %', tz;
  end;

  insert into public.daily_sets (category_id, set_date)
  values (v_category_id, v_set_date)
  on conflict on constraint daily_sets_category_id_set_date_key
  do update set set_date = excluded.set_date
  returning id into v_set_id;

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

  return query
  select
    ds.id as daily_set_id,
    ds.set_date,
    ds.category_id as daily_set_category_id,
    i.id as item_id,
    i.name as item_name,
    i.artist as item_artist,
    dsi.display_order
  from public.daily_sets ds
  join public.daily_set_items dsi on dsi.daily_set_id = ds.id
  join public.items i on i.id = dsi.item_id
  where ds.id = v_set_id
  order by dsi.display_order;

end;
$$;

grant execute on function public.get_daily_set(text, text) to public;

commit;
