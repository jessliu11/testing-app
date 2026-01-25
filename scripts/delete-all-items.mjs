import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function deleteAll() {
  const { data: cat, error: catError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'taylor-swift')
    .single();

  if (catError || !cat) {
    console.error('Category not found:', catError);
    return;
  }

  console.log('Category ID:', cat.id);

  // Get all item IDs
  const { data: items } = await supabase
    .from('items')
    .select('id')
    .eq('category_id', cat.id);

  if (items && items.length > 0) {
    const itemIds = items.map(i => i.id);
    console.log(`Found ${itemIds.length} items to delete`);

    // Delete submission_rankings first
    const { error: rankingsErr, count: rankingsCount } = await supabase
      .from('submission_rankings')
      .delete({ count: 'exact' })
      .in('item_id', itemIds);
    
    console.log('Submission rankings deleted:', rankingsCount, rankingsErr || 'Success');

    // Delete daily_set_items
    const { error: dailyItemsErr, count: dailyItemsCount } = await supabase
      .from('daily_set_items')
      .delete({ count: 'exact' })
      .in('item_id', itemIds);
    
    console.log('Daily set items deleted:', dailyItemsCount, dailyItemsErr || 'Success');
  }

  // Delete all items
  const { error: itemsErr, count: itemsCount } = await supabase
    .from('items')
    .delete({ count: 'exact' })
    .eq('category_id', cat.id);

  console.log('Items deleted:', itemsCount, itemsErr || 'Success');

  // Delete all groups
  const { error: groupsErr, count: groupsCount } = await supabase
    .from('groups')
    .delete({ count: 'exact' })
    .eq('category_id', cat.id);

  console.log('Groups deleted:', groupsCount, groupsErr || 'Success');

  // Verify deletion
  const { count: remainingItems } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', cat.id);

  console.log('✅ Complete! Remaining items:', remainingItems);
}

deleteAll().catch(console.error);
