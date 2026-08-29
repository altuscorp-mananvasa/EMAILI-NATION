import { getServiceSupabase } from "@/lib/supabase/client";
import { PreviewForm } from "./PreviewForm";

export const dynamic = "force-dynamic";

export default async function PreviewPage() {
  const sb = getServiceSupabase();
  const [{ data: campaigns }, { data: contacts }] = await Promise.all([
    sb.from("campaigns").select("id,name,start_date,end_date,from_name,from_email").order("created_at", { ascending: false }),
    sb.from("contacts").select("id,email,first_name,last_name,company,role,industry,city,referrer_name,source").eq("status", "active").limit(50),
  ]);
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold text-ink-900">Live preview</h1>
      <p className="mb-6 text-sm text-ink-500">Pick a contact and a day-index. We render exactly what they'd receive, with live variation assignment.</p>
      <PreviewForm campaigns={campaigns ?? []} contacts={contacts ?? []} />
    </main>
  );
}
