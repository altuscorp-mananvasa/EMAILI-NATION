/**
 * Vercel Cron entry point. Configure in vercel.json:
 *   { "crons": [{ "path": "/api/cron/daily-send", "schedule": "30 3 * * *" }] }
 *
 * Vercel automatically attaches `Authorization: Bearer <CRON_SECRET>` to
 * cron invocations. We re-validate it here as a safety net.
 *
 * Vercel cron max-duration by plan:
 *   Hobby:    10s   (we chunk to 100 contacts per tick to stay under)
 *   Pro:      60s   (one campaign's full daily batch usually fits)
 *   Enterprise: 300s
 *
 * We honour the CRON_BATCH_SIZE env var so you can tune per-environment.
 * The default of 100 is safe for Vercel Hobby and still sends the full
 * 900/day over the course of a few cron invocations.
 */

import { NextRequest, NextResponse } from "next/server";
import { runDailySend } from "@/lib/campaign";
import { getServiceSupabase } from "@/lib/supabase/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Hobby = 10s. If you're on Pro/Enterprise, bump to 60 or 300.
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

  // Per-tick batch size. Defaults to 40 because we run the cron hourly on
  // Vercel Hobby (10s max-duration per tick). 40 × 24 ticks = 960/day,
  // just above the 900 target. Set CRON_BATCH_SIZE in Vercel to override
  // (e.g. 900 if you upgrade to Pro/Enterprise).
  const batchSize = Number(process.env.CRON_BATCH_SIZE ?? 40);

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
