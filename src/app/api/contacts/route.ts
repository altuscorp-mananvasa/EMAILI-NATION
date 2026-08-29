import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceSupabase } from "@/lib/supabase/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ContactSchema = z.object({
  email: z.string().email(),
  first_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  referrer_name: z.string().optional().nullable(),
  status: z.enum(["active", "unsubscribed", "bounced", "replied"]).default("active"),
});

const BulkSchema = z.object({
  contacts: z.array(ContactSchema).min(1).max(10_000),
});

/** GET /api/contacts?limit=200&offset=0&q=… */
export async function GET(req: NextRequest) {
  const sb = getServiceSupabase();
  const url = new URL(req.url);
  const limit  = Math.min(Number(url.searchParams.get("limit")  ?? 200), 1000);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
  const q      = (url.searchParams.get("q") ?? "").trim();
  const status = url.searchParams.get("status") as string | null;

  let query = sb.from("contacts").select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (status) query = query.eq("status", status);
  if (q) {
    query = query.or(
      `email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%,company.ilike.%${q}%,city.ilike.%${q}%`,
    );
  }
  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ rows: data ?? [], total: count ?? 0 });
}

/** POST /api/contacts   body: { contacts: [...] }  for bulk import */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = BulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const sb = getServiceSupabase();
  const { data, error } = await sb
    .from("contacts")
    .upsert(parsed.data.contacts, { onConflict: "email", ignoreDuplicates: false })
    .select("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ inserted: data?.length ?? 0 });
}
