select conname
from pg_constraint
where conrelid = 'public.daily_sets'::regclass
  and contype = 'u';
