import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceSupabase } from "@/lib/supabase/client";
import { buildAssignment } from "@/lib/variation";
import { composeEmail } from "@/emails/PSOInvite";

export const runtime = "nodejs";

const Schema = z.object({
  contact_id: z.string().uuid().optional(),
  sample: z.object({
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
  }).optional(),
  campaign_id: z.string().uuid(),
  day_index: z.number().int().min(0).default(0),
});

/** POST /api/preview — build a fully-rendered email for a contact or a synthetic sample. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { contact_id, sample, campaign_id, day_index } = parsed.data;

  const sb = getServiceSupabase();
  const [{ data: campaign }, { data: modules }] = await Promise.all([
    sb.from("campaigns").select("*").eq("id", campaign_id).single(),
    sb.from("email_modules").select("*").eq("is_active", true),
  ]);
  if (!campaign) return NextResponse.json({ error: "campaign not found" }, { status: 404 });
  if (!modules || modules.length === 0) return NextResponse.json({ error: "no active modules" }, { status: 400 });

  let contact = sample as any;
  if (contact_id) {
    const { data } = await sb.from("contacts").select("*").eq("id", contact_id).single();
    if (!data) return NextResponse.json({ error: "contact not found" }, { status: 404 });
    contact = data;
  }
  if (!contact) return NextResponse.json({ error: "no contact" }, { status: 400 });

  const assignment = buildAssignment({
    contactSeed: contact.email,
    dayIndex: day_index,
    queuePosition: 0,
    modules: modules as any,
  });

  const composed = composeEmail(assignment, { contact, campaign, dayIndex: day_index });

  return NextResponse.json({
    assignment: {
      subject: assignment.subject.variant_key,
      hook:    assignment.hook.variant_key,
      story:   assignment.story.variant_key,
      proof:   assignment.proof.variant_key,
      cta:     assignment.cta.variant_key,
      signoff: assignment.signoff.variant_key,
    },
    subject: composed.subject,
    preheader: composed.preheader,
    html: composed.html,
    text: composed.text,
  });
}
