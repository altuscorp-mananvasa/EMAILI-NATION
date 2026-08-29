/**
 * Vercel Cron entry point. Configure in vercel.json:
 *   { "crons": [{ "path": "/api/cron/daily-send", "schedule": "30 3 * * *" }] }
 *
 * Vercel automatically attaches `Authorization: Bearer <CRON_SECRET>` to
 * cron invocations. We re-validate it here as a safety net.
 */

import { NextRequest, NextResponse } from "next/server";
import { runDailySend } from "@/lib/campaign";
import { getServiceSupabase } from "@/lib/supabase/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min — the Vercel hobby ceiling

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const auth = req.headers.get("authorization") || "";
  if (auth === `Bearer ${expected}`) return true;
  // Allow a manual ?key=… trigger from the dashboard for testing
  const url = new URL(req.url);
  return url.searchParams.get("key") === expected;
}

export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const sb = getServiceSupabase();
  const { data: campaigns } = await sb
    .from("campaigns")
    .select("id")
    .eq("status", "running")
    .order("created_at", { ascending: true });

  const results = [];
  for (const c of campaigns ?? []) {
    try {
      const r = await runDailySend({ campaignId: c.id });
      results.push(r);
    } catch (e) {
      results.push({ campaignId: c.id, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return NextResponse.json({ ok: true, results });
}

export const POST = GET;
