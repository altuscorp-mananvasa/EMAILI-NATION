export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold text-ink-900">Settings</h1>
      <p className="mb-6 text-sm text-ink-500">All runtime configuration is environment-driven (see <code>.env.example</code>).</p>

      <section className="rounded-xl border border-ink-100 bg-white p-6">
        <h2 className="text-lg font-semibold text-ink-900">Environment checklist</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-600">
          <li>✅ <code>NEXT_PUBLIC_SUPABASE_URL</code> &amp; <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
          <li>✅ <code>SUPABASE_SERVICE_ROLE_KEY</code> (server-only)</li>
          <li>✅ <code>SMTP_USER</code> / <code>SMTP_PASSWORD</code> — Google Workspace app password</li>
          <li>✅ <code>SMTP_FROM_NAME</code> / <code>SMTP_FROM_EMAIL</code></li>
          <li>✅ <code>CRON_SECRET</code> — long random string (used by Vercel Cron + unsubscribe HMAC)</li>
          <li>✅ <code>NEXT_PUBLIC_APP_URL</code> — your Vercel URL</li>
          <li>✅ <code>DAILY_BATCH_SIZE</code> (defaults to 900, matching your volume)</li>
        </ul>
      </section>

      <section className="mt-6 rounded-xl border border-ink-100 bg-white p-6">
        <h2 className="text-lg font-semibold text-ink-900">Cron schedule</h2>
        <p className="mt-2 text-sm text-ink-500">
          Configured in <code>vercel.json</code>. Default is <code>30 3 * * *</code> UTC, which is <strong>9:00 AM IST</strong> — right in your
          working window.
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-ink-100 bg-white p-6">
        <h2 className="text-lg font-semibold text-ink-900">Deliverability tips</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-ink-600">
          <li>Set up SPF, DKIM &amp; DMARC on your sending domain — Google Workspace has a wizard.</li>
          <li>Warm up the new sending address with a small batch (50–100/day) for the first week.</li>
          <li>Keep your <code>reply-to</code> on a monitored inbox (we default to <code>support@unleashed.in</code>).</li>
          <li>Monitor bounces in the send log; the engine skips <code>bounced</code> contacts automatically.</li>
        </ul>
      </section>
    </main>
  );
}
