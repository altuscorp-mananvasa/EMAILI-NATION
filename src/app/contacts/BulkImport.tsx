"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Row = {
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  role?: string;
  industry?: string;
  city?: string;
  whatsapp?: string;
  source?: string;
  referrer_name?: string;
};

const TEMPLATE = `email,first_name,last_name,company,role,industry,city,whatsapp,source,referrer_name
ramesh@example.com,Ramesh,Sharma,Sharma Textiles,Founder,Manufacturing,Surat,+919876543210,Friend,Anil
priya@example.com,Priya,,BlueOrbit Studio,Co-founder,Services,Mumbai,,Instagram,`;

function parseCsv(input: string): Row[] {
  const lines = input.split(/\r?\n/).filter((l) => l.trim().length);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  const out: Row[] = [];
  for (const line of lines.slice(1)) {
    const cells = line.split(",").map((c) => c.trim());
    const row: any = {};
    headers.forEach((h, i) => { row[h] = cells[i] || undefined; });
    if (row.email) out.push(row as Row);
  }
  return out;
}

export function BulkImport() {
  const [open, setOpen] = useState(false);
  const [csv, setCsv] = useState(TEMPLATE);
  const [result, setResult] = useState<string>("");
  const [pending, start] = useTransition();
  const router = useRouter();

  const onImport = () => {
    const rows = parseCsv(csv);
    if (rows.length === 0) {
      setResult("No valid rows found.");
      return;
    }
    start(() => {
      void (async () => {
        const r = await fetch("/api/contacts", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ contacts: rows }),
        });
        const j = await r.json();
        setResult(j.inserted ? `Imported ${j.inserted} contacts.` : (j.error ?? "Failed."));
        if (j.inserted) router.refresh();
      })();
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600"
      >
        Bulk import (CSV)
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-ink-900">Bulk import contacts</h2>
            <p className="mt-1 text-sm text-ink-500">Paste CSV below. First row must be headers.</p>
            <textarea
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              className="mt-3 h-72 w-full rounded-md border border-ink-200 p-3 font-mono text-xs"
            />
            {result && <p className="mt-2 text-sm text-saffron-700">{result}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-md border border-ink-200 px-4 py-2 text-sm">Close</button>
              <button
                onClick={onImport}
                disabled={pending}
                className="rounded-md bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600 disabled:opacity-60"
              >
                {pending ? "Importing…" : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
