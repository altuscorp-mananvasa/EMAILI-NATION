import nodemailer, { type Transporter } from "nodemailer";
import { createHash } from "node:crypto";

let cached: Transporter | null = null;

export function getTransporter(): Transporter {
  if (cached) return cached;
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: (process.env.SMTP_SECURE ?? "true") === "true",
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASSWORD!,
    },
    pool: true,                                  // reuse connections
    maxConnections: 5,
    rateDelta: 1000,                             // 1 sec window
    rateLimit: 10,                               // max 10 msg / sec
  });
  return cached;
}

export type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string | null;
  campaignId: string;
  contactId: string;
  dayIndex: number;
};

export type SendResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string };

/**
 * Sends a single transactional email via the configured SMTP transport
 * and returns the provider messageId. We add custom headers so the
 * dashboard's open/click tracker (and external ESPs) can attribute.
 */
export async function sendOne(args: SendArgs): Promise<SendResult> {
  const transporter = getTransporter();
  const from = `"${args.fromName.replace(/"/g, "'")}" <${args.fromEmail}>`;

  // A short, non-PII message-id used for our own log correlation
  const internalId = createHash("sha1")
    .update(`${args.campaignId}:${args.contactId}:${args.dayIndex}`)
    .digest("hex")
    .slice(0, 16);

  try {
    const info = await transporter.sendMail({
      from,
      to: args.to,
      replyTo: args.replyTo || undefined,
      subject: args.subject,
      text: args.text,
      html: args.html,
      headers: {
        "X-PS-Campaign": args.campaignId,
        "X-PS-Contact":  args.contactId,
        "X-PS-Day":      String(args.dayIndex),
        "X-PS-Internal": internalId,
      },
    });
    return { ok: true, messageId: info.messageId || internalId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
