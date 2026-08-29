/**
 * Vercel Cron entry point. Configure in vercel.json:
 *   { "crons": [{ "path": "/api/cron/daily-send", "schedule": "30 3 * * *" }] }
 *
 * Vercel automatically attaches `Authorization: Bearer <CRON_SECRET>` to
 * cron invocations. We re-validate it here as a safety net.
 *
 * Vercel cron max-duration by plan:
 *   Hobby:    10s   (≈ 20-30 emails per tick via SMTP)
 *   Pro:      60s   (≈ 120-180 emails per tick)
 *   Enterprise: 300s (≈ 600-900+ emails per tick)
 *
 * Hobby plan also restricts cron to ONCE per day, so 30/day is the
 * practical max unless you upgrade. The engine's (campaign, contact,
 * day_index) unique key keeps things idempotent — if a tick is missed,
 * contacts queued for that day will simply be picked up the next day.
 */

import { NextRequest, NextResponse } from "next/server";
import { runDailySend } from "@/lib/campaign";
import { getServiceSupabase } from "@/lib/supabase/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Hobby = 10s. Pro = 60. Enterprise = 300. Override with VERCEL_MAX_DURATION if needed.
export const maxDuration = 10;

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

  // Per-tick batch size. Defaults to 25 to stay safely under Hobby's 10s
  // SMTP limit. Pro/Enterprise can override via env (e.g. 200 / 900).
  const batchSize = Number(process.env.CRON_BATCH_SIZE ?? 25);

  const results = [];
  for (const c of campaigns ?? []) {
    try {
      const r = await runDailySend({ campaignId: c.id, batchSizeOverride: batchSize });
      results.push(r);
    } catch (e) {
      results.push({ campaignId: c.id, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return NextResponse.json({ ok: true, results });
}

export const POST = GET;
