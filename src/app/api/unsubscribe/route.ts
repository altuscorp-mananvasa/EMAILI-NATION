import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/client";
import { sha256Hex } from "@/lib/crypto";

export const runtime = "nodejs";

/**
 * Public one-click unsubscribe endpoint.
 *   GET /api/unsubscribe?c=<contactId>&k=<sha256(contactId:email:CRON_SECRET)>
 *   GET /api/unsubscribe?e=<email>          (one-click w/o token, simpler)
 *
 * On success: marks the contact as 'unsubscribed' in Supabase and shows
 * a friendly HTML confirmation page.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const c = url.searchParams.get("c");
  const k = url.searchParams.get("k");
  const e = url.searchParams.get("e");

  const sb = getServiceSupabase();

  if (c && k) {
    const { data: contact } = await sb.from("contacts").select("id,email").eq("id", c).single();
    if (contact) {
      const expected = await sha256Hex(`${contact.id}:${contact.email}:${process.env.CRON_SECRET}`);
      if (expected === k) {
        await sb.from("contacts").update({
          status: "unsubscribed",
          unsubscribed_at: new Date().toISOString(),
        }).eq("id", c);
        return page(`You're unsubscribed. We won't email ${contact.email} again.`);
      }
    }
    return page("We couldn't verify that link. Reply 'stop' to any of our emails and we'll handle it manually.", 400);
  }

  if (e) {
    await sb.rpc("mark_unsubscribed", { p_email: e });
    return page(`You're unsubscribed. We won't email ${e} again.`);
  }

  return page("Missing parameters.", 400);
}

function page(msg: string, status = 200): NextResponse {
  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Unsubscribed</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f6f8;color:#1f2937;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px}
.card{max-width:520px;background:#fff;border:1px solid #e8eaef;border-radius:12px;padding:32px;text-align:center}
h1{font-family:Georgia,serif;color:#f97316;margin:0 0 8px}
p{color:#4a5568;line-height:1.6}</style></head>
<body><div class="card"><h1>Productivity Shastra</h1><p>${msg}</p></div></body></html>`;
  return new NextResponse(html, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}
