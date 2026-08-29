import { getServiceSupabase } from "@/lib/supabase/client";
import { ContactsTable } from "./ContactsTable";
import { BulkImport } from "./BulkImport";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const sb = getServiceSupabase();
  const { data, count } = await sb
    .from("contacts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(200);
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Contacts</h1>
          <p className="mt-1 text-sm text-ink-500">{count ?? 0} total — showing the latest 200.</p>
        </div>
        <BulkImport />
      </header>
      <ContactsTable rows={data ?? []} />
    </main>
  );
}
