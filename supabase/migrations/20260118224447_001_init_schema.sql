-- 001_init_schema.sql
-- Core schema for: categories, items, daily sets, submissions, rankings

begin; 

-- Extensions (for gen_random_uuid)
create extension if not exists "pgcrypto";

-- 1) Categories Table (support future expansion beyond Taylor Swift)
create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique, -- e.g., "taylor-swift"      
    name text not null,     -- e.g., "Taylor Swift songs"
    created_at timestamptz not null default now()
);

--2) Items Table (e.g., songs, other item types later)
create table if not exists public.items (
    id uuid primary key default gen_random_uuid(),
    category_id uuid not null references public.categories(id) on delete cascade,
    name text not null, -- e.g., song title (or item title)
    artist text,        -- e.g., song artist (if applicable)
    metadata jsonb not null default '{}'::jsonb, -- additional item info
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

create index if not exists idx_items_category_id on public.items(category_id);
create index if not exists idx_items_is_active on public.items(is_active);

--3 ) Daily Sets Table ( the 6 items for a given day + category)
-- "Worlde-style" day handling will be implemented in backend logic (RPC/EDGE)
-- but the stored key is always a DATE
create table if not exists public.daily_sets (
    id uuid primary key default gen_random_uuid(),
    category_id uuid not null references public.categories(id) on delete cascade,
    set_date date not null,
    created_at timestamptz not null default now(),
    unique(category_id, set_date)
);

create index if not exists idx_daily_sets_category_date on public.daily_sets(category_id, set_date);

--4) Daily Set items (the actual 6 picked items)
create table if not exists public.daily_set_items (
    daily_set_id uuid not null references public.daily_sets(id) on delete cascade,
    item_id uuid not null references public.items(id) on delete restrict,
    display_order int not null check (display_order between 1 and 6),
    primary key (daily_set_id, item_id),
    unique(daily_set_id, display_order)
);

create index if not exists idx_daily_set_items_daily_set_id on public.daily_set_items(daily_set_id);

--5) Submissions (one per user per daily set)
-- for anonymous play, user_id comes from Supabase Auth anonymous session (auth.uid()).
create table if not exists public.submissions (
    id uuid primary key default gen_random_uuid(),
    daily_set_id uuid not null references public.daily_sets(id) on delete cascade,
    user_id uuid not null,
    submitted_at timestamptz not null default now(),
    unique (daily_set_id, user_id)
);

create index if not exists idx_submissions_daily_set_id on public.submissions(daily_set_id);
create index if not exists idx_submissions_user_id on public.submissions(user_id);

--6) Submission rankings (6 rows per submission) 
create table if not exists public.submission_rankings (
    submission_id uuid not null references public.submissions(id) on delete cascade,
    item_id uuid not null references public.items(id) on delete restrict,
    rank int not null check (rank between 1 and 6),
    primary key (submission_id, item_id),
    unique(submission_id, rank)
);

create index if not exists idx_submission_rankings_submission_id on public.submission_rankings(submission_id);

commit;