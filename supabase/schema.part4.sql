-- ─── Row-level security ─────────────────────────────────────────────────────
alter table public.contacts              enable row level security;
alter table public.campaigns             enable row level security;
alter table public.email_modules         enable row level security;
alter table public.send_log              enable row level security;
alter table public.variation_assignments enable row level security;

-- The dashboard uses the service-role key on the server, so we keep RLS
-- locked-down for anon/authenticated.
drop policy if exists "no anon access contacts"  on public.contacts;
drop policy if exists "no anon access campaigns" on public.campaigns;
drop policy if exists "no anon access modules"  on public.email_modules;
drop policy if exists "no anon access send_log"  on public.send_log;
drop policy if exists "no anon access va"       on public.variation_assignments;

create policy "no anon access contacts"  on public.contacts              for all to anon, authenticated using (false);
create policy "no anon access campaigns" on public.campaigns             for all to anon, authenticated using (false);
create policy "no anon access modules"  on public.email_modules         for all to anon, authenticated using (false);
create policy "no anon access send_log"  on public.send_log              for all to anon, authenticated using (false);
create policy "no anon access va"       on public.variation_assignments for all to anon, authenticated using (false);

-- ─── Public one-click unsubscribe (no auth required) ────────────────────────
create or replace function public.mark_unsubscribed(p_email text) returns void
language sql security definer as $$
  update public.contacts
     set status = 'unsubscribed', unsubscribed_at = now()
   where lower(email) = lower(p_email);
$$;

grant execute on function public.mark_unsubscribed(text) to anon, authenticated;
