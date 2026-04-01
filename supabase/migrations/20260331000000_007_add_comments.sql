-- 007_add_comments.sql
-- Adds a comments table so users can leave comments after submitting their daily ranking.

begin;

create table if not exists public.comments (
    id            uuid        primary key default gen_random_uuid(),
    daily_set_id  uuid        not null references public.daily_sets(id) on delete cascade,
    user_id       uuid        not null,
    display_name  text        not null,
    top_pick      text,
    body          text        not null,
    created_at    timestamptz not null default now()
);

create index if not exists idx_comments_daily_set_id on public.comments(daily_set_id);
create index if not exists idx_comments_user_id      on public.comments(user_id);

-- RLS
alter table public.comments enable row level security;

-- Anyone (including anonymous sessions) can read comments
create policy "Anyone can read comments"
    on public.comments for select
    using (true);

-- Authenticated users (incl. Supabase anonymous sessions) can insert their own comments
create policy "Users can insert own comments"
    on public.comments for insert
    with check (auth.uid() = user_id);

-- Users can delete only their own comments
create policy "Users can delete own comments"
    on public.comments for delete
    using (auth.uid() = user_id);

commit;
