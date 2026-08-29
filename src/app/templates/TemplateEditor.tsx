"use client";

import { useState, useTransition } from "react";
import type { EmailModule } from "@/lib/supabase/types";

const CATEGORIES = ["subject", "hook", "story", "proof", "cta", "signoff"] as const;

export function TemplateEditor({ rows }: { rows: EmailModule[] }) {
  const [byCat, setByCat] = useState(() => group(rows));
  const [pending, start] = useTransition();

  const onBodyChange = (cat: typeof CATEGORIES[number], key: string, body: string) => {
    setByCat((s) => ({
      ...s,
      [cat]: s[cat].map((m) => (m.variant_key === key ? { ...m, body } : m)),
    }));
  };

  const onSave = (cat: string, m: EmailModule) => {
    start(() => {
      void (async () => {
        const r = await fetch("/api/modules", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ category: cat, variant_key: m.variant_key, body: m.body, is_active: m.is_active }),
        });
        if (!r.ok) alert("Save failed");
      })();
    });
  };

  return (
    <div className="space-y-8">
      {CATEGORIES.map((cat) => (
        <section key={cat}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink-500">{cat}</h2>
          <div className="space-y-3">
            {byCat[cat].map((m) => (
              <div key={m.variant_key} className="rounded-lg border border-ink-100 bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded bg-ink-100 px-2 py-0.5 text-xs font-medium">{m.variant_key}</span>
                  <button onClick={() => onSave(cat, m)} disabled={pending} className="rounded bg-saffron-500 px-3 py-1 text-xs font-medium text-white hover:bg-saffron-600 disabled:opacity-60">
                    {pending ? "Saving…" : "Save"}
                  </button>
                </div>
                <textarea
                  value={m.body}
                  onChange={(e) => onBodyChange(cat, m.variant_key, e.target.value)}
                  rows={Math.min(8, Math.max(2, m.body.split("\n").length))}
                  className="w-full rounded-md border border-ink-200 p-2 font-mono text-xs"
                />
              </div>
            ))}
            {byCat[cat].length === 0 && (
              <p className="rounded-lg border border-dashed border-ink-200 bg-white p-4 text-center text-sm text-ink-400">
                No {cat} modules yet.
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function group(rows: EmailModule[]) {
  const out: Record<string, EmailModule[]> = { subject: [], hook: [], story: [], proof: [], cta: [], signoff: [] };
  for (const r of rows) {
    if (out[r.category]) out[r.category].push(r);
  }
  return out as Record<typeof CATEGORIES[number], EmailModule[]>;
}
