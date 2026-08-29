"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function NewCampaignForm() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const end   = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [form, setForm] = useState({
    name: "90-day PSO invite",
    start_date: today,
    end_date: end,
    daily_batch_size: 900,
    send_hour_ist: 9,
    from_name: "Manan from Productivity Shastra",
    from_email: "invites@yourdomain.com",
    reply_to: "support@unleashed.in",
  });

  const onSubmit = () => {
    start(() => {
      void (async () => {
        const r = await fetch("/api/campaigns", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(form),
        });
        if (r.ok) {
          setOpen(false);
          router.refresh();
        } else {
          const j = await r.json();
          alert(JSON.stringify(j.error ?? j, null, 2));
        }
      })();
    });
  };

  const set = (k: keyof typeof form, v: any) => setForm((s) => ({ ...s, [k]: v }));

  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-md bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600">New campaign</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">New campaign</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Field label="Name"            v={form.name}            on={(v) => set("name", v)} />
              <Field label="Daily batch"     v={form.daily_batch_size} on={(v) => set("daily_batch_size", Number(v) || 900)} type="number" />
              <Field label="Start (YYYY-MM-DD)" v={form.start_date}   on={(v) => set("start_date", v)} />
              <Field label="End (YYYY-MM-DD)"   v={form.end_date}     on={(v) => set("end_date", v)} />
              <Field label="Send hour IST"   v={form.send_hour_ist}   on={(v) => set("send_hour_ist", Number(v) || 9)} type="number" />
              <Field label="From name"       v={form.from_name}       on={(v) => set("from_name", v)} />
              <Field label="From email"      v={form.from_email}      on={(v) => set("from_email", v)} />
              <Field label="Reply-to"        v={form.reply_to ?? ""}  on={(v) => set("reply_to", v)} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-md border border-ink-200 px-4 py-2 text-sm">Cancel</button>
              <button onClick={onSubmit} disabled={pending} className="rounded-md bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600 disabled:opacity-60">
                {pending ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, v, on, type = "text" }: { label: string; v: any; on: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium uppercase tracking-wider text-ink-500">{label}</span>
      <input
        type={type}
        value={v}
        onChange={(e) => on(e.target.value)}
        className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-saffron-500 focus:outline-none"
      />
    </label>
  );
}
