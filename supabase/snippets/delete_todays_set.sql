-- Delete today's daily set so it can be regenerated with updated group info
DELETE FROM daily_set_items WHERE daily_set_id IN (
  SELECT id FROM daily_sets WHERE set_date = '2026-01-20'
);
DELETE FROM daily_sets WHERE set_date = '2026-01-20';
