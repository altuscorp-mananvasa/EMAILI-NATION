import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceSupabase } from "@/lib/supabase/client";

export const runtime = "nodejs";

const PatchSchema = z.object({
  category: z.enum(["subject", "hook", "story", "proof", "cta", "signoff"]),
  variant_key: z.string().min(1),
  body: z.string().min(1),
  is_active: z.boolean().optional(),
});

export async function GET() {
  const sb = getServiceSupabase();
  const { data, error } = await sb.from("email_modules").select("*").order("category").order("variant_key");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ rows: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const sb = getServiceSupabase();
  const { error } = await sb.from("email_modules").update({
    body: parsed.data.body,
    is_active: parsed.data.is_active,
  }).match({ category: parsed.data.category, variant_key: parsed.data.variant_key });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
