# Supabase setup

The schema is split into 4 files for readability. Run them in this order
against your Supabase project's SQL editor (or `supabase db push`):

1. `schema.sql`        — extensions, enums, contacts
2. `schema.part2.sql`  — campaigns, email_modules
3. `schema.part3.sql`  — send_log, variation_assignments, updated_at trigger
4. `schema.part4.sql`  — RLS policies, mark_unsubscribed RPC

Alternatively, you can concatenate them and run as a single file.
