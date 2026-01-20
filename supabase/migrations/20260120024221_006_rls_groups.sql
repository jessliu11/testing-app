begin;

alter table public.groups enable row level security;

drop policy if exists "Public can read groups" on public.groups;
create policy "Public can read groups"
on public.groups
for select
to public
using (true);

commit;
