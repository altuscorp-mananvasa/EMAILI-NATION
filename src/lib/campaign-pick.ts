import { getServiceSupabase } from "@/lib/supabase/client";
import type { Contact, EmailModule } from "@/lib/supabase/types";

/** Pull the N active contacts that haven't been queued for today yet. */
export async function pickTodaysQueue(
  campaignId: string,
  dayIndex: number,
  batchSize: number,
): Promise<Contact[]> {
  const sb = getServiceSupabase();

  const { data: already } = await sb
    .from("send_log")
    .select("contact_id")
    .eq("campaign_id", campaignId)
    .eq("day_index", dayIndex);
  const skip = new Set((already ?? []).map((r: { contact_id: string }) => r.contact_id));

  const { data: pool, error } = await sb
    .from("contacts")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(batchSize * 5);
  if (error) throw new Error(error.message);

  const fresh: Contact[] = [];
  for (const c of pool ?? []) {
    if (skip.has(c.id)) continue;
    // Avoid re-mailing the same person on back-to-back days for the
    // same campaign — keeps the cadence feeling natural.
    if (dayIndex > 0) {
      const { count } = await sb
        .from("send_log")
        .select("id", { count: "exact", head: true })
        .eq("campaign_id", campaignId)
        .eq("contact_id", c.id)
        .eq("day_index", dayIndex - 1);
      if ((count ?? 0) > 0) continue;
    }
    fresh.push(c as Contact);
    if (fresh.length >= batchSize) break;
  }
  return fresh;
}

export async function loadActiveModules(): Promise<EmailModule[]> {
  const sb = getServiceSupabase();
  const { data, error } = await sb
    .from("email_modules")
    .select("*")
    .eq("is_active", true);
  if (error) throw new Error(error.message);
  return (data ?? []) as EmailModule[];
}
