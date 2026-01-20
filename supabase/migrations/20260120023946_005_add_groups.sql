-- 005_add_groups.sql
-- Adds a generic grouping dimension to support:
-- - Taylor Swift "eras"
-- - TV "seasons"
-- - Book "series"
-- - Movie "franchises"/"phases"
-- etc.

begin;

-- 1) Groups table (generic)
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,

  -- Display name of the group (e.g., "1989", "Season 3", "Phase 1")
  name text not null,

  -- Optional: classify the kind of group for a category (e.g., "era", "season", "series")
  type text,

  -- Optional: UI color (useful for Taylor Swift eras)
  color_hex text check (color_hex ~ '^#[0-9A-Fa-f]{6}$'),

  -- Optional: control ordering in UI
  sort_order int not null default 0,

  created_at timestamptz not null default now(),

  -- Prevent duplicates within a category for the same type+name
  unique (category_id, type, name)
);

create index if not exists idx_groups_category_id on public.groups(category_id);
create index if not exists idx_groups_type on public.groups(type);

-- 2) Add group reference + a generic date field to items
alter table public.items
  add column if not exists group_id uuid references public.groups(id) on delete set null;

-- Use a generic name so this works across categories (songs, movies, etc.)
alter table public.items
  add column if not exists published_date date;

create index if not exists idx_items_group_id on public.items(group_id);
create index if not exists idx_items_published_date on public.items(published_date);

commit;
