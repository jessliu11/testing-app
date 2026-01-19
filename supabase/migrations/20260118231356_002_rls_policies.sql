-- Row Level Security policies for anonymous auth + future login
-- assumes anonymous users sign in via supabase.auth,signInAnonymously()
-- so auth.uid() is available.

begin; 

-- Enable RLS on tables that clients will access 
alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.daily_sets enable row level security;
alter table public.daily_set_items enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_rankings enable row level security;

-- READ policies (public): allow anyone (including anon) to read game data

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories" 
on public.categories
for select
to public
using (true);

drop policy if exists "Public can read items" on public.items;
create policy "Public can read items" 
on public.items
for select
to public
using (is_active = true);

drop policy if exists "Public can read daily sets" on public.daily_sets;
create policy "Public can read daily sets"
on public.daily_sets
for select
to public
using (true);

drop policy if exists "Public can read daily set items" on public.daily_set_items;
create policy "Public can read daily set items"
on public.daily_set_items
for select
to public
using (true);

-- Submissions: users can read only their own submissions
drop policy if exists "Users can read their own submissions" on public.submissions;
create policy "Users can read their own submissions"
on public.submissions
for select
to public
using (user_id = auth.uid());

-- Users can insert their own submission rows only 
drop policy if exists "Users can create their own submissions" on public.submissions;
create policy "Users can create their own submissions"
on public.submissions
for insert
to public
with check (user_id = auth.uid());

-- Disallow updates/deletes by clients (keep submissions immutable) 
drop policy if exists "No updates to submissions" on public.submissions;
create policy "No updates to submissions"
on public.submissions
for update
to public
using (false);

drop policy if exists "No deletes to submissions" on public.submissions;
create policy "No deletes to submissions"
on public.submissions
for delete
to public
using (false);

-- Submission rankings: users can read only rankings tied to their submissions
-- and can insert only rankings tied to their submissions
drop policy if exists "Users can read their own submission rankings" on public.submission_rankings;
create policy "Users can read their own submission rankings"
on public.submission_rankings
for select
to public
using (
    exists (
        select 1
        from public.submissions s
        where s.id = submission_rankings.submission_id
        and s.user_id = auth.uid()
    )
);

drop policy if exists "Users can insert their own submission rankings" on public.submission_rankings;
create policy "Users can insert their own submission rankings"
on public.submission_rankings
for insert
to public
with check (
  exists (
    select 1
    from public.submissions s
    where s.id = submission_rankings.submission_id
      and s.user_id = auth.uid()
  )
);

-- Disallow updates/deletes by clients (immutable once written)
drop policy if exists "No updates to submission rankings" on public.submission_rankings;
create policy "No updates to submission rankings"
on public.submission_rankings
for update
to public
using (false);

drop policy if exists "No deletes to submission rankings" on public.submission_rankings;
create policy "No deletes to submission rankings"
on public.submission_rankings
for delete
to public
using (false);

commit;
