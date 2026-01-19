--supabase/seed.sql
-- seed data for local development / testing
-- safe to re-run


begin; 

--1) Insert Taylor Swift category

insert into public.categories (slug, name)
values ('taylor-swift', 'Taylor Swift songs')
on conflict (slug) do nothing;

--2) Insert items (songs) for Taylor Swift category

with category as (
    select id 
    from public.categories
    where slug = 'taylor-swift'
)
insert into public.items (category_id, name, artist)
select 
    category.id,
    songs.name,
    'Taylor Swift'
from category
cross join (
    values
        ('All Too Well'),
        ('Cruel Summer'),
        ('Style'),
        ('Blank Space'),
        ('cardigan'),
        ('Anti-Hero'),
        ('Delicate'),
        ('Enchanted'),
        ('Love Story'),
        ('You Belong With Me'),
        ('August'),
        ('Getaway Car'),
        ('Lavender Haze'),
        ('Maroon'),
        ('Bejeweled'),
        ('Exile'),
        ('Betty'),
        ('Wildest Dreams'),
        ('The Archer'),
        ('Cornelia Street')
) as songs(name)
on conflict do nothing;

commit;