/**
 * Main entry point — called by the Vercel cron and by the manual
 * "send now" button in the dashboard.
 */

import { getServiceSupabase } from "@/lib/supabase/client";
import { buildAssignment, type Assignment } from "@/lib/variation";
import { composeEmail } from "@/emails/PSOInvite";
import { sendOne } from "@/lib/mailer";
import type { Campaign } from "@/lib/supabase/types";
import { pickTodaysQueue, loadActiveModules } from "./campaign-pick";
import { sha256Hex } from "./crypto";

export type RunResult = {
  campaignId: string;
  dayIndex: number;
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
  errors: Array<{ contactId: string; email: string; error: string }>;
};

const dayDiff = (a: Date, b: Date): number => {
  const ms = 24 * 60 * 60 * 1000;
  const aUTC = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bUTC = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.floor((aUTC - bUTC) / ms);
};

export function dayIndexFor(
  campaign: Pick<Campaign, "start_date" | "end_date">,
  now = new Date(),
): number | null {
  const start = new Date(campaign.start_date + "T00:00:00Z");
  const end   = new Date(campaign.end_date   + "T23:59:59Z");
  if (now < start || now > end) return null;
  return dayDiff(now, start);
}

export async function runDailySend(opts: {
  campaignId: string;
  forceDayIndex?: number;
  batchSizeOverride?: number;
}): Promise<RunResult> {
  const sb = getServiceSupabase();
  const { data: campaign, error } = await sb
    .from("campaigns")
    .select("*")
    .eq("id", opts.campaignId)
    .single();
  if (error || !campaign) throw new Error(`Campaign not found: ${opts.campaignId}`);
  const c = campaign as Campaign;

  const dayIndex = opts.forceDayIndex ?? dayIndexFor(c);
  if (dayIndex === null) {
    return { campaignId: c.id, dayIndex: -1, attempted: 0, sent: 0, failed: 0, skipped: 0, errors: [] };
  }

  const batchSize = opts.batchSizeOverride ?? c.daily_batch_size;
  const queue = await pickTodaysQueue(c.id, dayIndex, batchSize);
  const modules = await loadActiveModules();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app";
  const unsubTpl = `${appUrl}/api/unsubscribe?c={cid}&k={hash}`;
  const psoUrl   = "https://productivityshastra.com/register";

  let sent = 0, failed = 0;
  const errors: RunResult["errors"] = [];

  for (let i = 0; i < queue.length; i++) {
    const contact = queue[i];
    const assignment: Assignment = buildAssignment({
      contactSeed: contact.email,
      dayIndex,
      queuePosition: i,
      modules,
    });

    const ctx = { contact, campaign: c, dayIndex };
    const composed = composeEmail(assignment, ctx, {
      unsubscribeUrl: unsubTpl,
      psoRegisterUrl: psoUrl,
    });

    const hash = await sha256Hex(`${contact.id}:${contact.email}:${process.env.CRON_SECRET}`);
    const personalizedUnsub = unsubTpl.replace("{cid}", contact.id).replace("{hash}", hash);

    await sb.from("variation_assignments").upsert({
      campaign_id: c.id,
      contact_id:  contact.id,
      day_index:   dayIndex,
      subject_key: `subject:${assignment.subject.variant_key}`,
      hook_key:    `hook:${assignment.hook.variant_key}`,
      story_key:   `story:${assignment.story.variant_key}`,
      cta_key:     `cta:${assignment.cta.variant_key}`,
      proof_key:   `proof:${assignment.proof.variant_key}`,
      signoff_key: `signoff:${assignment.signoff.variant_key}`,
    }, { onConflict: "campaign_id,contact_id,day_index" });

    const { data: logRow, error: logErr } = await sb
      .from("send_log")
      .upsert({
        campaign_id: c.id,
        contact_id:  contact.id,
        day_index:   dayIndex,
        scheduled_for: new Date().toISOString(),
        status:      "queued",
        subject_used: composed.subject,
        body_used:    composed.text,
      }, { onConflict: "campaign_id,contact_id,day_index" })
      .select("id")
      .single();

    if (logErr || !logRow) {
      failed++;
      errors.push({ contactId: contact.id, email: contact.email, error: logErr?.message ?? "log insert failed" });
      continue;
    }

    const result = await sendOne({
      to: contact.email,
      subject: composed.subject,
      html: composed.html.replace(unsubTpl, personalizedUnsub),
      text: composed.text.replace(unsubTpl, personalizedUnsub),
      fromName: c.from_name,
      fromEmail: c.from_email,
      replyTo: c.reply_to,
      campaignId: c.id,
      contactId: contact.id,
      dayIndex,
    });

    if (result.ok) {
      await sb.from("send_log").update({
        status: "sent",
        sent_at: new Date().toISOString(),
        provider_id: result.messageId,
      }).eq("id", logRow.id);
      sent++;
    } else {
      await sb.from("send_log").update({
        status: "failed",
        error_message: result.error,
      }).eq("id", logRow.id);
      failed++;
      errors.push({ contactId: contact.id, email: contact.email, error: result.error });
    }
  }

  return {
    campaignId: c.id,
    dayIndex,
    attempted: queue.length,
    sent, failed, skipped: 0,
    errors,
  };
}
