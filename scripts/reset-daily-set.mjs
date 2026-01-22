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

const today = new Date().toISOString().split('T')[0];

console.log(`Deleting daily sets for ${today}...`);

const { data, error } = await supabase
  .from('daily_sets')
  .delete()
  .eq('set_date', today);

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log('Done! Daily set deleted. Refresh your app to get a new set with updated data.');
