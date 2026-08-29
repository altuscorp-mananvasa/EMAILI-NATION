import { getServiceSupabase } from "@/lib/supabase/client";
import { LogRow, type LogRowData } from "./LogRow";

export const dynamic = "force-dynamic";

type LogRowDB = {
  id: string;
  campaign_id: string;
  contact_id: string;
  day_index: number;
  status: string;
  subject_used: string | null;
  sent_at: string | null;
  error_message: string | null;
  provider_id: string | null;
  created_at: string;
};

export default async function LogsPage() {
  const sb = getServiceSupabase();
  const { data } = await sb
    .from("send_log")
    .select("id,campaign_id,contact_id,day_index,status,subject_used,sent_at,error_message,provider_id,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as unknown as LogRowData[];
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold text-ink-900">Send log</h1>
      <p className="mb-6 text-sm text-ink-500">The latest 200 send attempts across all campaigns.</p>
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Day</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Message-Id</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => <LogRow key={r.id} row={r} />)}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-400">No sends yet. Hit “Run now” on a campaign.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
