# Productivity Shastra — 90-Day Personalized Outreach Platform

A complete, production-grade email outreach system built around **CA Manan Vasa's**
Productivity Shastra (https://productivityshastra.com) and its free entry point,
the **Productivity Shastra Orientation (PSO)**.

> **What it does:** Sends **900 personalized, non-repeating emails per day** to your
> contact list — for up to 90 days — fully automated via a Vercel cron job.
> Every contact sees a unique combination of subject, hook, story, proof, CTA,
> and sign-off, pulled from 60+ copy modules.

---

## Stack

| Layer        | Technology |
|--------------|------------|
| Frontend     | Next.js 14 (App Router) + Tailwind |
| Backend      | Next.js API Routes (Node runtime) |
| Database     | Supabase (Postgres + RLS) |
| Scheduler    | Vercel Cron |
| Mailer       | Nodemailer + Google Workspace SMTP |
| Deployment   | Vercel |

---

## Folder layout

```
src/
├── app/
│   ├── api/
│   │   ├── cron/daily-send        Vercel-Cron entry
│   │   ├── campaigns/             CRUD + start/pause/run-now
│   │   ├── contacts/              Bulk import + table
│   │   ├── logs/                  Send log
│   │   ├── modules/               Template module editor
│   │   ├── preview/               Live-render any contact × day
│   │   └── unsubscribe/           One-click unsub
│   ├── campaigns/   contacts/  logs/  preview/  settings/  templates/
│   ├── layout.tsx   page.tsx   globals.css
├── lib/
│   ├── campaign.ts                Main engine
│   ├── campaign-pick.ts           Queue picker + module loader
│   ├── crypto.ts
│   ├── hash.ts
│   ├── mailer.ts                  Nodemailer wrapper
│   ├── seed-modules.ts            60+ copy modules
│   ├── seed/                      split module files
│   ├── supabase/                  client + types
│   ├── tokens.ts                  Personalization tokens
│   └── variation.ts               Deterministic assignment
├── emails/
│   └── PSOInvite.tsx              HTML composer
scripts/seed-modules.ts            One-shot DB seeder
supabase/schema*.sql               DB schema (4 files)
```

---

## Local setup

```bash
npm install
cp .env.example .env.local        # fill in Supabase + SMTP creds
# Apply schema in the Supabase SQL editor (run schema.sql, schema.part2.sql,
# schema.part3.sql, schema.part4.sql in order), or `supabase db push`.
npx tsx scripts/seed-modules.ts   # push 60+ modules to the DB
npm run dev
```

Visit `http://localhost:3000`.

---

## Production setup (Vercel)

1. Push to GitHub; import into Vercel.
2. Add every var from `.env.example` in Vercel → Settings → Environment Variables.
3. `vercel.json` declares the cron — Vercel reads it automatically.
4. Dashboard → create a campaign → Start.

### Google Workspace SMTP

1. Enable 2-Step Verification on the sending account.
2. Create an App Password: https://myaccount.google.com/apppasswords
3. Use it as `SMTP_PASSWORD`.
4. Set up SPF, DKIM, and DMARC on your sending domain.

---

## How the "no-repeats-in-90-days" guarantee works

Every email is built from **6 categories** of copy modules:

| Category | Variants | Purpose |
|----------|----------|---------|
| subject  | 12 | The inbox line |
| hook     | 24 | The first 2 lines (personalized) |
| story    | 12 | A 2-3 sentence narrative |
| proof    | 10 | A specific, hard data point |
| cta      | 8  | One clear call-to-action |
| signoff  | 6  | The warm close |

**72 modules** in total. Cross-product = 12 × 24 × 12 × 10 × 8 × 6 = **~16.6 million
unique combinations**. We only need 81,000 (90 × 900), so the same email
virtually never recurs for any contact.

The picker is **deterministic** — for any (contact, day) it returns the exact
same assignment — but uses a per-(contact, day, queue-position) seed, so
different contacts on the same day get different emails.

**Idempotency:** the unique key `(campaign_id, contact_id, day_index)` on
both `send_log` and `variation_assignments` means if the cron fires twice
in a day, the second call is a safe no-op.

---

## API surface

| Method | Path                              | Purpose |
|--------|-----------------------------------|---------|
| GET    | `/api/cron/daily-send?key=…`      | Triggered by Vercel Cron |
| GET    | `/api/contacts?limit&offset&q`    | List contacts |
| POST   | `/api/contacts`                   | Bulk import (CSV → JSON) |
| PATCH  | `/api/contacts/:id`               | Edit |
| DELETE | `/api/contacts/:id`               | Remove |
| GET    | `/api/campaigns`                  | List |
| POST   | `/api/campaigns`                  | Create |
| PATCH  | `/api/campaigns`  `{id, action}`  | start / pause / run-now |
| GET    | `/api/modules`                    | List all template modules |
| PATCH  | `/api/modules`                    | Edit a module |
| GET    | `/api/logs?limit&offset&status`   | Send log |
| POST   | `/api/preview`                    | Render a real email for a (contact, day) |
| GET    | `/api/unsubscribe?c&k` (or `?e`)  | One-click unsubscribe |

---

## Personalization tokens

```
{{firstName}}   {{lastName}}   {{fullName}}
{{company}}     {{role}}       {{industry}}
{{city}}        {{referrer}}   {{source}}
{{dayN}}        {{campaignEnd}}
```

Unknown tokens are left visible so authors can spot typos.

---

## Deployment notes

### Vercel plan limits

This system is tuned for **Vercel Hobby** (free tier). Key constraints:

| Limit | Hobby value | How we handle it |
|---|---|---|
| Function max duration | 10s | Cron route sets `maxDuration = 10` |
| Cron invocations | 100/day | Hourly schedule = 24/day (24% of limit) |
| Build time | 45 min | We slim deps to keep builds ~1 min |
| Bandwidth | 100 GB/mo | Inline-styled HTML emails are tiny |
| Concurrent builds | 1 | Each push builds serially |

If you upgrade to **Pro** later:
- Set `CRON_BATCH_SIZE=900` in env vars (one tick = full daily batch)
- Bump `maxDuration` in `src/app/api/cron/daily-send/route.ts` to `60`
- The variation engine, send log, and idempotency all work the same.

### Why the cron runs every hour, not 9 AM IST

Original design: 9 AM IST = `30 3 * * *` UTC. But Hobby's 10s limit means
one tick can only send ~40 emails. To hit the 900/day target, we shifted
to **hourly** and split across 24 ticks. Vercel auto-handles timezone,
and the engine's `(campaign_id, contact_id, day_index)` unique key
prevents the same contact from being emailed twice in the same day
even if a tick fires extra times.

---

## License

Private — © Productivity Shastra / Unleashed.
