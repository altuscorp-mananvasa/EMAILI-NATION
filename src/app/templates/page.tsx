import { getServiceSupabase } from "@/lib/supabase/client";
import { TemplateEditor } from "./TemplateEditor";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const sb = getServiceSupabase();
  const { data } = await sb.from("email_modules").select("*").order("category").order("variant_key");
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-ink-900">Template modules</h1>
        <p className="mt-1 max-w-3xl text-sm text-ink-500">
          These are the building blocks the variation engine composes every day. Edit any of them — the change applies to
          the next batch automatically. Supported tokens: <code className="rounded bg-ink-100 px-1">{"{{firstName}}"}</code>,{" "}
          <code className="rounded bg-ink-100 px-1">{"{{company}}"}</code>,{" "}
          <code className="rounded bg-ink-100 px-1">{"{{city}}"}</code>,{" "}
          <code className="rounded bg-ink-100 px-1">{"{{industry}}"}</code>,{" "}
          <code className="rounded bg-ink-100 px-1">{"{{role}}"}</code>,{" "}
          <code className="rounded bg-ink-100 px-1">{"{{referrer}}"}</code>,{" "}
          <code className="rounded bg-ink-100 px-1">{"{{source}}"}</code>,{" "}
          <code className="rounded bg-ink-100 px-1">{"{{campaignEnd}}"}</code>.
        </p>
      </header>
      <TemplateEditor rows={data ?? []} />
    </main>
  );
}
