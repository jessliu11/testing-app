import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://kpbizmazonrsuvnzxdcq.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

console.log('Step 1: Deleting ALL daily sets...');
const { error: deleteError } = await supabase
  .from('daily_sets')
  .delete()
  .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

if (deleteError) {
  console.error('Error deleting daily sets:', deleteError);
  process.exit(1);
}

console.log('Step 2: Checking items with groups...');
const { data: itemsWithGroups, error: itemsError } = await supabase
  .from('items')
  .select('id, name, group_id, published_date')
  .eq('category_id', (await supabase.from('categories').select('id').eq('slug', 'taylor-swift').single()).data.id)
  .not('group_id', 'is', null)
  .limit(10);

if (itemsError) {
  console.error('Error fetching items:', itemsError);
} else {
  console.log(`Found ${itemsWithGroups.length} items with group_id set (showing first 10)`);
  itemsWithGroups.forEach(item => {
    console.log(`  - ${item.name}: group_id=${item.group_id}, published_date=${item.published_date}`);
  });
}

console.log('\nStep 3: Deactivating old items without groups...');
const { error: deactivateError } = await supabase
  .from('items')
  .update({ is_active: false })
  .is('group_id', null);

if (deactivateError) {
  console.error('Error deactivating items:', deactivateError);
} else {
  console.log('Deactivated items without group data');
}

console.log('\nDone! Clear localStorage and refresh your app.');
