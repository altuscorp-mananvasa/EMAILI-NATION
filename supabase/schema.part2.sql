-- ─── Campaigns (one per outreach run, e.g. "90-day PSO invite") ─────────────
create table if not exists public.campaigns (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  status             campaign_status not null default 'draft',
  start_date         date not null,
  end_date           date not null,
  daily_batch_size   int  not null default 900,
  send_hour_ist      int  not null default 9,
  timezone           text not null default 'Asia/Kolkata',
  from_name          text not null,
  from_email         text not null,
  reply_to           text,
  track_unsubscribe  boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  check (end_date >= start_date)
);

-- ─── Email modules (the 20+ "blocks" the variation engine composes) ─────────
create table if not exists public.email_modules (
  id            uuid primary key default gen_random_uuid(),
  category      text not null,        -- subject | hook | story | cta | proof | signoff
  variant_key   text not null,        -- 'A', 'B', 'C'... (variants inside a category)
  weight        int  not null default 1,
  body          text not null,        -- the actual copy, supports {{tokens}}
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  unique (category, variant_key)
);

create index if not exists email_modules_category_idx on public.email_modules (category, is_active);
