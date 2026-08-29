import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceSupabase } from "@/lib/supabase/client";
import { runDailySend } from "@/lib/campaign";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CreateSchema = z.object({
  name: z.string().min(2),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  daily_batch_size: z.number().int().min(1).max(5000).default(900),
  send_hour_ist: z.number().int().min(0).max(23).default(9),
  timezone: z.string().default("Asia/Kolkata"),
  from_name: z.string().min(1),
  from_email: z.string().email(),
  reply_to: z.string().email().optional().nullable(),
  track_unsubscribe: z.boolean().default(true),
});

export async function GET() {
  const sb = getServiceSupabase();
  const { data, error } = await sb.from("campaigns").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ rows: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const sb = getServiceSupabase();
  const { data, error } = await sb.from("campaigns").insert({ ...parsed.data, status: "scheduled" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ row: data });
}

const ActionSchema = z.object({
  action: z.enum(["start", "pause", "complete", "run-now"]),
  force_day_index: z.number().int().min(0).optional(),
  batch_size: z.number().int().min(1).max(5000).optional(),
});

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = ActionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const sb = getServiceSupabase();
  const { id, action, force_day_index, batch_size } = z
    .object({ id: z.string().uuid(), ...ActionSchema.shape })
    .parse({ id: (body as any)?.id, ...(body as any) });

  if (action === "run-now") {
    const r = await runDailySend({ campaignId: id, forceDayIndex: force_day_index, batchSizeOverride: batch_size });
    return NextResponse.json({ run: r });
  }
  const status = action === "start" ? "running" : action === "pause" ? "paused" : "completed";
  const { data, error } = await sb.from("campaigns").update({ status }).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ row: data });
}
