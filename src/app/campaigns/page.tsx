import { getServiceSupabase } from "@/lib/supabase/client";
import { CampaignActions } from "./CampaignActions";
import { NewCampaignForm } from "./NewCampaignForm";
import type { Campaign } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const sb = getServiceSupabase();
  const { data } = await sb.from("campaigns").select("*").order("created_at", { ascending: false });
  const rows = (data ?? []) as Campaign[];

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Campaigns</h1>
          <p className="mt-1 text-sm text-ink-500">Each campaign is a scheduled run of the variation engine over your contacts.</p>
        </div>
        <NewCampaignForm />
      </header>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Window</th>
              <th className="px-4 py-3">Batch</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-ink-100">
                <td className="px-4 py-2 font-medium">{c.name}</td>
                <td className="px-4 py-2">{c.start_date} → {c.end_date}</td>
                <td className="px-4 py-2">{c.daily_batch_size}/day @ {c.send_hour_ist}:00 IST</td>
                <td className="px-4 py-2">{c.from_name} &lt;{c.from_email}&gt;</td>
                <td className="px-4 py-2"><span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs">{c.status}</span></td>
                <td className="px-4 py-2 text-right"><CampaignActions id={c.id} status={c.status} /></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-400">No campaigns yet. Create your first one →</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
