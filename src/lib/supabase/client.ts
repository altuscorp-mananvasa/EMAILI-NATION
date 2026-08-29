import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Public / browser Supabase client. The dashboard never talks to the DB
 * directly with the anon key — it always goes through our API routes which
 * use the service-role client. This client is here for future expansion
 * (e.g. per-user login) and stays safe because RLS is locked down.
 */
export function getBrowserSupabase(): SupabaseClient<Database> {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: true } },
  );
}

/**
 * Service-role client. BYPASSES RLS. Use only inside API routes, cron
 * handlers, and server actions. Never expose the service key to the browser.
 */
export function getServiceSupabase(): SupabaseClient<Database> {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/**
 * Cookie-aware server client (for logged-in users, future).
 */
export async function getServerSupabase() {
  const store = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (toSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => {
          try {
            toSet.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            // Called from a Server Component — fine to ignore.
          }
        },
      },
    },
  );
}
