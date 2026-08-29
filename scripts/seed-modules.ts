// Run with:  npx tsx scripts/seed-modules.ts
// Upserts the seed modules into the `email_modules` table.

import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { createClient } from "@supabase/supabase-js";
import { ALL_SEED_MODULES } from "../src/lib/seed-modules";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { persistSession: false } });

  const rows = ALL_SEED_MODULES.map((m) => ({
    category: m.category,
    variant_key: m.variant_key,
    weight: m.weight,
    body: m.body,
    is_active: true,
  }));

  // Upsert in chunks to avoid request-size limits
  const CHUNK = 50;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const { error } = await sb
      .from("email_modules")
      .upsert(slice, { onConflict: "category,variant_key" });
    if (error) {
      console.error("Failed at chunk", i, error);
      process.exit(1);
    }
    console.log(`Upserted ${slice.length} modules (${i + slice.length}/${rows.length})`);
  }
  console.log(`Done. ${rows.length} seed modules loaded.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
