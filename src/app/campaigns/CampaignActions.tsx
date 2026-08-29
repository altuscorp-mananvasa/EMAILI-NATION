"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function CampaignActions({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  const run = (action: "start" | "pause" | "complete" | "run-now") => {
    start(() => {
      void (async () => {
        await fetch("/api/campaigns", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id, action }),
        });
        router.refresh();
      })();
    });
  };

  return (
    <div className="flex justify-end gap-2 text-xs">
      <button onClick={() => run("run-now")} disabled={pending} className="rounded border border-ink-200 px-2 py-1 hover:bg-ink-50 disabled:opacity-50">Run now</button>
      {status !== "running" && <button onClick={() => run("start")}     disabled={pending} className="rounded bg-green-100 px-2 py-1 text-green-700 hover:bg-green-200">Start</button>}
      {status === "running" && <button onClick={() => run("pause")}     disabled={pending} className="rounded bg-amber-100 px-2 py-1 text-amber-700 hover:bg-amber-200">Pause</button>}
      <button onClick={() => run("complete")} disabled={pending} className="rounded bg-ink-100 px-2 py-1 text-ink-700 hover:bg-ink-200">Complete</button>
    </div>
  );
}
