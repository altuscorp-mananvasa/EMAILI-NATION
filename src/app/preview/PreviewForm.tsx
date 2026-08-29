"use client";

import { useState } from "react";
import type { Contact } from "@/lib/supabase/types";

type CampaignLite = { id: string; name: string; start_date: string; end_date: string; from_name: string; from_email: string };

export function PreviewForm({ campaigns, contacts }: { campaigns: CampaignLite[]; contacts: Partial<Contact>[] }) {
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id ?? "");
  const [contactId, setContactId]   = useState(contacts[0]?.id ?? "");
  const [dayIndex, setDayIndex]     = useState(0);
  const [busy, setBusy]             = useState(false);
  const [result, setResult]         = useState<any>(null);

  const render = async () => {
    if (!campaignId || !contactId) return;
    setBusy(true);
    const r = await fetch("/api/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ campaign_id: campaignId, contact_id: contactId, day_index: dayIndex }),
    });
    setResult(await r.json());
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="block text-xs font-medium uppercase tracking-wider text-ink-500">Campaign</span>
          <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2">
            {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="block text-sm">
          <span className="block text-xs font-medium uppercase tracking-wider text-ink-500">Contact</span>
          <select value={contactId} onChange={(e) => setContactId(e.target.value)} className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2">
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.email}</option>)}
          </select>
        </label>
        <label className="block text-sm">
          <span className="block text-xs font-medium uppercase tracking-wider text-ink-500">Day (0–89)</span>
          <input type="number" min={0} max={89} value={dayIndex} onChange={(e) => setDayIndex(Math.max(0, Math.min(89, Number(e.target.value))))} className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2" />
        </label>
      </div>
      <button onClick={render} disabled={busy} className="rounded-md bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600 disabled:opacity-60">
        {busy ? "Rendering…" : "Render email"}
      </button>

      {result && (
        <div className="space-y-3">
          <div className="rounded-lg border border-ink-100 bg-white p-4 text-sm">
            <p><span className="text-ink-500">Subject:</span> <strong>{result.subject}</strong></p>
            <p className="mt-1 text-ink-500">Preheader: {result.preheader}</p>
            <p className="mt-2 text-xs text-ink-400">
              Assignment → subject:{result.assignment.subject}, hook:{result.assignment.hook},
              story:{result.assignment.story}, proof:{result.assignment.proof},
              cta:{result.assignment.cta}, signoff:{result.assignment.signoff}
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border border-ink-100 bg-white">
            <iframe title="preview" srcDoc={result.html} className="h-[600px] w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
