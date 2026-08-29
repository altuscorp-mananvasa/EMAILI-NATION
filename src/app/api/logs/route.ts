import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limit  = Math.min(Number(url.searchParams.get("limit")  ?? 100), 500);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
  const campaign = url.searchParams.get("campaign_id");
  const status = url.searchParams.get("status");

  const sb = getServiceSupabase();
  let q = sb.from("send_log")
    .select("id,campaign_id,contact_id,day_index,status,subject_used,sent_at,error_message,provider_id", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (campaign) q = q.eq("campaign_id", campaign);
  if (status)   q = q.eq("status", status);

  const { data, count, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ rows: data ?? [], total: count ?? 0 });
}
