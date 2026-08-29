-- ─── Per-contact send log (one row per email attempt) ───────────────────────
create table if not exists public.send_log (
  id              uuid primary key default gen_random_uuid(),
  campaign_id     uuid not null references public.campaigns(id) on delete cascade,
  contact_id      uuid not null references public.contacts(id) on delete cascade,
  day_index       int  not null,                  -- 0..89 within the campaign
  scheduled_for   timestamptz not null,
  status          send_status not null default 'queued',
  subject_used    text,
  body_used       text,
  provider_id     text,                           -- SMTP messageId
  error_message   text,
  sent_at         timestamptz,
  opened_at       timestamptz,
  clicked_at      timestamptz,
  created_at      timestamptz not null default now(),
  unique (campaign_id, contact_id, day_index)
);

create index if not exists send_log_status_idx    on public.send_log (status);
create index if not exists send_log_scheduled_idx on public.send_log (scheduled_for);
create index if not exists send_log_contact_idx   on public.send_log (contact_id, day_index);

-- ─── Idempotency: the variation engine must NEVER pick the same combo twice
--      for the same contact inside a single 90-day window.
create table if not exists public.variation_assignments (
  id            uuid primary key default gen_random_uuid(),
  campaign_id   uuid not null references public.campaigns(id) on delete cascade,
  contact_id    uuid not null references public.contacts(id) on delete cascade,
  day_index     int  not null,
  subject_key   text not null,
  hook_key      text not null,
  story_key     text not null,
  cta_key       text not null,
  proof_key     text not null,
  signoff_key   text not null,
  created_at    timestamptz not null default now(),
  unique (campaign_id, contact_id, day_index)
);

-- ─── Generic updated_at trigger ─────────────────────────────────────────────
create or replace function public.tg_set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$ begin
  create trigger contacts_set_updated_at
    before update on public.contacts
    for each row execute function public.tg_set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger campaigns_set_updated_at
    before update on public.campaigns
    for each row execute function public.tg_set_updated_at();
exception when duplicate_object then null; end $$;
