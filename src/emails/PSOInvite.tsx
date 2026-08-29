/**
 * Renders the final HTML email body for a given contact + assignment.
 * Composed of: Hook → Bridge → Story → Proof → Bridge → CTA → Sign-off.
 * Inline-styled, table-based for max email-client compatibility.
 */

import { renderTokens, type TokenContext } from "@/lib/tokens";
import type { Assignment } from "@/lib/variation";

export type ComposedEmail = {
  subject: string;
  preheader: string;
  html: string;
  text: string;
};

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const nl2br = (s: string): string => escapeHtml(s).replace(/\n/g, "<br/>");

const BRIDGE_BEFORE_STORY =
  "Here's the part most founders don't realize until they're already in the room:";

const BRIDGE_AFTER_PROOF =
  "If that hits the kind of founder you're trying to be, the next step is small and free.";

export function composeEmail(
  assignment: Assignment,
  ctx: TokenContext,
  options: {
    unsubscribeUrl: string;
    psoRegisterUrl: string;
  } = {
    unsubscribeUrl: "https://your-app.vercel.app/api/unsubscribe",
    psoRegisterUrl: "https://productivityshastra.com/register",
  },
): ComposedEmail {
  const t = (s: string) => renderTokens(s, ctx);

  const subject = t(assignment.subject.body);
  const hook    = t(assignment.hook.body);
  const story   = t(assignment.story.body);
  const proof   = t(assignment.proof.body);
  const cta     = t(assignment.cta.body);
  const signoff = t(assignment.signoff.body);

  const preheader = hook.replace(/\s+/g, " ").trim().slice(0, 140);

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1f2937;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#f5f6f8;">
    ${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f6f8;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8eaef;">
          <tr>
            <td style="background-color:#0a0e1a;padding:20px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="color:#fdba74;font-family:Georgia,serif;font-size:18px;font-weight:700;letter-spacing:0.4px;">Productivity Shastra</td>
                  <td align="right" style="color:#9aa3b3;font-size:12px;letter-spacing:0.6px;text-transform:uppercase;">No Gyaan. Only Gain.</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px 32px;font-size:16px;line-height:1.65;color:#1f2937;">
              <p style="margin:0 0 20px 0;">${nl2br(hook)}</p>
              <p style="margin:24px 0 16px 0;color:#4a5568;font-size:15px;line-height:1.6;">${escapeHtml(BRIDGE_BEFORE_STORY)}</p>
              <p style="margin:0 0 20px 0;">${nl2br(story)}</p>
              <p style="margin:0 0 20px 0;">${nl2br(proof)}</p>
              <p style="margin:0 0 24px 0;color:#4a5568;font-size:15px;line-height:1.6;">${escapeHtml(BRIDGE_AFTER_PROOF)}</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" style="padding:8px 0 24px 0;">
                    <a href="${escapeHtml(options.psoRegisterUrl)}" style="display:inline-block;background-color:#f97316;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 22px;border-radius:8px;">Save my PSO seat →</a>
                  </td>
                </tr>
                <tr>
                  <td style="font-size:14px;color:#1f2937;line-height:1.6;padding-bottom:8px;">${nl2br(cta)}</td>
                </tr>
              </table>
              <p style="margin:24px 0 0 0;">${nl2br(signoff)}</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f5f6f8;padding:20px 32px;border-top:1px solid #e8eaef;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-size:12px;color:#6c7689;line-height:1.6;">
                    You're receiving this because you opted in via our network.<br/>
                    <a href="${escapeHtml(options.unsubscribeUrl)}" style="color:#6c7689;text-decoration:underline;">Unsubscribe</a>
                    &nbsp;·&nbsp;
                    <a href="https://productivityshastra.com" style="color:#6c7689;text-decoration:underline;">productivityshastra.com</a>
                  </td>
                </tr>
                <tr>
                  <td style="font-size:12px;color:#9aa3b3;padding-top:8px;">© ${new Date().getFullYear()} Productivity Shastra · by CA Manan Vasa · Mumbai, India</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text =
    `${hook}\n\n${BRIDGE_BEFORE_STORY}\n\n${story}\n\n${proof}\n\n${BRIDGE_AFTER_PROOF}\n\n` +
    `${cta}\n${options.psoRegisterUrl}\n\n${signoff}\n\n` +
    `--\nUnsubscribe: ${options.unsubscribeUrl}\nproductivityshastra.com`;

  return { subject, preheader, html, text };
}
