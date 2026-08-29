import Link from "next/link";
import { getServiceSupabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

async function fetchStats() {
  try {
    const sb = getServiceSupabase();
    const [{ count: contacts }, { count: sentToday }] = await Promise.all([
      sb.from("contacts").select("id", { count: "exact", head: true }).eq("status", "active"),
      sb.from("send_log").select("id", { count: "exact", head: true })
        .eq("status", "sent")
        .gte("sent_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    ]);
    return { contacts: contacts ?? 0, sentToday: sentToday ?? 0 };
  } catch {
    return { contacts: 0, sentToday: 0 };
  }
}

export default async function HomePage() {
  const stats = await fetchStats();
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12">
        <p className="text-sm font-medium uppercase tracking-widest text-saffron-600">Productivity Shastra</p>
        <h1 className="mt-2 text-4xl font-bold text-ink-900">Outreach Console</h1>
        <p className="mt-2 max-w-2xl text-ink-500">
          90-day automated, personalized founder outreach — built on Next.js, Supabase, Vercel Cron, and Google Workspace SMTP.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active contacts" value={stats.contacts} href="/contacts" />
        <StatCard label="Sent today"      value={stats.sentToday} href="/logs" />
        <StatCard label="Campaigns"        value="Manage"          href="/campaigns" />
      </section>

      <section className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NavCard href="/contacts"  title="Contacts"  desc="Import, edit and segment your founder list." />
        <NavCard href="/campaigns" title="Campaigns" desc="90-day runs, daily batch size, sender identity." />
        <NavCard href="/templates" title="Templates" desc="Subject, hook, story, proof, CTA, sign-off modules." />
        <NavCard href="/logs"      title="Send log"  desc="Per-email status, provider id, and previews." />
        <NavCard href="/preview"   title="Live preview" desc="See what a contact would receive on day N." />
        <NavCard href="/settings"  title="Settings"  desc="SMTP, cron secret, app URL." />
      </section>
    </main>
  );
}

function StatCard({ label, value, href }: { label: string; value: number | string; href: string }) {
  return (
    <Link href={href} className="rounded-xl border border-ink-100 bg-white p-5 transition hover:border-saffron-300">
      <p className="text-xs font-medium uppercase tracking-wider text-ink-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink-900">{value}</p>
    </Link>
  );
}

function NavCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="group rounded-xl border border-ink-100 bg-white p-5 transition hover:border-saffron-300">
      <h2 className="text-lg font-semibold text-ink-900 group-hover:text-saffron-600">{title}</h2>
      <p className="mt-1 text-sm text-ink-500">{desc}</p>
    </Link>
  );
}
