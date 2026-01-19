select c.name, count(i.id) as song_count
from public.categories c
join public.items i on i.category_id = c.id
group by c.name;