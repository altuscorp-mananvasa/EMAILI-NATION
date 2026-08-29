"use client";

import { useState } from "react";

export type LogRowData = {
  id: string;
  contact_id: string;
  day_index: number;
  status: string;
  subject_used: string | null;
  sent_at: string | null;
  error_message: string | null;
  provider_id: string | null;
  created_at: string;
};

export function LogRow({ row }: { row: LogRowData }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr className="border-t border-ink-100">
        <td className="px-4 py-2 text-xs text-ink-500">{new Date(row.created_at).toLocaleString("en-IN")}</td>
        <td className="px-4 py-2">D{row.day_index + 1}</td>
        <td className="px-4 py-2"><span className={`rounded-full px-2 py-0.5 text-xs ${statusClass(row.status)}`}>{row.status}</span></td>
        <td className="px-4 py-2">
          <button onClick={() => setOpen((v) => !v)} className="text-left text-ink-700 hover:underline">
            {row.subject_used || <span className="text-ink-400">(no subject)</span>}
          </button>
        </td>
        <td className="px-4 py-2 font-mono text-xs text-ink-500">{row.contact_id.slice(0, 8)}…</td>
        <td className="px-4 py-2 font-mono text-xs text-ink-500">{row.provider_id ? row.provider_id.slice(0, 16) + "…" : "—"}</td>
      </tr>
      {open && (
        <tr className="border-t border-ink-100 bg-ink-50/50">
          <td colSpan={6} className="px-4 py-3 text-xs">
            {row.error_message ? (
              <p className="text-red-700"><strong>Error:</strong> {row.error_message}</p>
            ) : (
              <p className="text-ink-500">No preview stored for this row. To see rendered HTML, use the <code>/preview</code> page.</p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function statusClass(s: string) {
  switch (s) {
    case "sent":   return "bg-green-100 text-green-700";
    case "queued": return "bg-amber-100 text-amber-700";
    case "failed": return "bg-red-100 text-red-700";
    case "skipped": return "bg-ink-100 text-ink-600";
    default:       return "bg-ink-100 text-ink-600";
  }
}
