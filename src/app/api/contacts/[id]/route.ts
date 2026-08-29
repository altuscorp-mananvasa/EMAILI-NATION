import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceSupabase } from "@/lib/supabase/client";

export const runtime = "nodejs";

const PatchSchema = z.object({
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  referrer_name: z.string().nullable().optional(),
  status: z.enum(["active", "unsubscribed", "bounced", "replied"]).optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const sb = getServiceSupabase();
  const { error } = await sb.from("contacts").update(parsed.data).eq("id", ctx.params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: { params: { id: string } }) {
  const sb = getServiceSupabase();
  const { error } = await sb.from("contacts").delete().eq("id", ctx.params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
