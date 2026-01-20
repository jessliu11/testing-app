import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}. Set it before running.`);
  return v;
}

function isBlank(s) {
  return s == null || String(s).trim() === "";
}

function normalizeHex(hex) {
  if (isBlank(hex)) return null;
  const v = String(hex).trim();
  return v.startsWith("#") ? v : `#${v}`;
}

// Supports YYYY or YYYY-MM-DD; stores YYYY as YYYY-01-01
function parseDateOrNull(s) {
  if (isBlank(s)) return null;
  const v = String(s).trim();

  if (/^\d{4}$/.test(v)) return `${v}-01-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

  throw new Error(`Invalid published_date "${v}". Expected YYYY or YYYY-MM-DD`);
}

function parseJsonOrEmpty(s) {
  if (isBlank(s)) return {};
  try {
    return JSON.parse(String(s));
  } catch {
    throw new Error(`Invalid metadata JSON: ${s}`);
  }
}

async function getOrCreateCategoryId(supabase, slug) {
  const { data: existing, error: selErr } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (selErr) throw selErr;
  if (existing?.id) return existing.id;

  const { data: inserted, error: insErr } = await supabase
    .from("categories")
    .insert([{ slug, name: slug }])
    .select("id")
    .single();

  if (insErr) throw insErr;
  return inserted.id;
}

async function upsertGroup(supabase, { category_id, type, name, color_hex }) {
  if (isBlank(name)) return null;

  const row = {
    category_id,
    type: isBlank(type) ? null : String(type).trim(),
    name: String(name).trim(),
    color_hex: normalizeHex(color_hex),
  };

  const { data, error } = await supabase
    .from("groups")
    .upsert(row, { onConflict: "category_id,type,name" })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

async function upsertItem(supabase, { category_id, name, group_id, published_date, metadata }) {
  const cleanName = String(name).trim();
  if (isBlank(cleanName)) throw new Error("item_name is required");

  let query = supabase
    .from("items")
    .select("id")
    .eq("category_id", category_id)
    .eq("name", cleanName);

  if (group_id === null) query = query.is("group_id", null);
  else query = query.eq("group_id", group_id);

  const { data: existing, error: selErr } = await query.maybeSingle();
  if (selErr) throw selErr;

  if (existing?.id) {
    const { error: updErr } = await supabase
      .from("items")
      .update({
        group_id,
        published_date,
        metadata,
        is_active: true,
      })
      .eq("id", existing.id);

    if (updErr) throw updErr;
    return "updated";
  }

  const { error: insErr } = await supabase.from("items").insert([
    {
      category_id,
      name: cleanName,
      group_id,
      published_date,
      metadata,
      is_active: true,
    },
  ]);

  if (insErr) throw insErr;
  return "inserted";
}

async function main() {
  const file = getArg("--file");
  if (!file) {
    throw new Error(`Missing --file argument. Example:
node scripts/import-items.mjs --file supabase/seed-data/taylor_swift_items.csv`);
  }

  const supabaseUrl = process.env.SUPABASE_URL || "http://localhost:54321";
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const absPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(absPath)) throw new Error(`CSV file not found: ${absPath}`);

  const csvText = fs.readFileSync(absPath, "utf8");
  const records = parse(csvText, { columns: true, skip_empty_lines: true, trim: true });

  const requiredHeaders = [
    "category_slug",
    "item_name",
    "group_type",
    "group_name",
    "group_color_hex",
    "published_date",
    "metadata",
  ];
  const first = records[0] || {};
  for (const h of requiredHeaders) {
    if (!(h in first)) throw new Error(`CSV missing required header "${h}".`);
  }

  let inserted = 0;
  let updated = 0;

  const categoryIdCache = new Map();
  const groupIdCache = new Map();

  for (let i = 0; i < records.length; i++) {
    const r = records[i];

    const category_slug = String(r.category_slug).trim();
    const item_name = String(r.item_name).trim();
    const group_type = isBlank(r.group_type) ? null : String(r.group_type).trim();
    const group_name = isBlank(r.group_name) ? null : String(r.group_name).trim();
    const group_color_hex = normalizeHex(r.group_color_hex);
    const published_date = parseDateOrNull(r.published_date);
    const metadata = parseJsonOrEmpty(r.metadata);

    let category_id = categoryIdCache.get(category_slug);
    if (!category_id) {
      category_id = await getOrCreateCategoryId(supabase, category_slug);
      categoryIdCache.set(category_slug, category_id);
    }

    let group_id = null;
    if (!isBlank(group_name)) {
      const key = `${category_id}|${group_type ?? ""}|${group_name}`;
      group_id = groupIdCache.get(key) ?? null;
      if (!group_id) {
        group_id = await upsertGroup(supabase, {
          category_id,
          type: group_type,
          name: group_name,
          color_hex: group_color_hex,
        });
        groupIdCache.set(key, group_id);
      }
    }

    const action = await upsertItem(supabase, {
      category_id,
      name: item_name,
      group_id,
      published_date,
      metadata,
    });

    if (action === "inserted") inserted++;
    else updated++;

    if ((i + 1) % 200 === 0) console.log(`Processed ${i + 1}/${records.length}...`);
  }

  console.log(`Done. Inserted: ${inserted}, Updated: ${updated}, Total: ${records.length}`);
}

main().catch((err) => {
  console.error("Import failed:", err?.message || err);
  process.exit(1);
});
