-- ============================================================================
--  Productivity Shastra Outreach — Supabase schema
--  Run with: supabase db push  (or paste into the SQL editor)
-- ============================================================================

create extension if not exists "pgcrypto";

-- ─── Enums ──────────────────────────────────────────────────────────────────
do $$ begin
  create type contact_status as enum ('active', 'unsubscribed', 'bounced', 'replied');
exception when duplicate_object then null; end $$;

do $$ begin
  create type campaign_status as enum ('draft', 'scheduled', 'running', 'paused', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type send_status as enum ('queued', 'sent', 'failed', 'skipped');
exception when duplicate_object then null; end $$;

-- ─── Contacts ───────────────────────────────────────────────────────────────
create table if not exists public.contacts (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  first_name      text,
  last_name       text,
  company         text,
  role            text,
  industry        text,
  city            text,
  whatsapp        text,
  source          text,
  referrer_name   text,
  status          contact_status not null default 'active',
  unsubscribed_at timestamptz,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (email)
);

create index if not exists contacts_status_idx   on public.contacts (status);
create index if not exists contacts_industry_idx on public.contacts (industry);
