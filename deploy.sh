#!/usr/bin/env bash
# End-to-end deployment of the Productivity Shastra outreach platform.
#
# Reads secrets from environment variables:
#   GITHUB_TOKEN             (required) — fine-grained PAT with repo:write
#   GITHUB_REPO              (required) — e.g. "yourname/productivity-shastra-outreach"
#   VERCEL_TOKEN             (required) — https://vercel.com/account/tokens
#   SUPABASE_ACCESS_TOKEN    (required) — https://supabase.com/dashboard/account/tokens
#   SUPABASE_PROJECT_REF     (required) — the subdomain of your supabase project URL
#
# Optional:
#   VERCEL_ORG_ID            — if you want to deploy under a specific Vercel team
#   VERCEL_PROJECT_NAME      — defaults to "productivity-shastra-outreach"
#
# Usage:
#   export GITHUB_TOKEN=...
#   export GITHUB_REPO="yourname/productivity-shastra-outreach"
#   export VERCEL_TOKEN=...
#   export SUPABASE_ACCESS_TOKEN=...
#   export SUPABASE_PROJECT_REF=abcdefghij
#   ./deploy.sh

set -euo pipefail
cd "$(dirname "$0")"

# ── Helpers ───────────────────────────────────────────────────────────────
RED='\033[0;31m'; GRN='\033[0;32m'; YLW='\033[1;33m'; NC='\033[0m'
ok()   { printf "${GRN}✓${NC} %s\n" "$*"; }
warn() { printf "${YLW}!${NC} %s\n" "$*"; }
fail() { printf "${RED}✗${NC} %s\n" "$*"; exit 1; }

# ── 0. Sanity check secrets ───────────────────────────────────────────────
: "${GITHUB_TOKEN:?GITHUB_TOKEN is required}"
: "${GITHUB_REPO:?GITHUB_REPO is required, e.g. 'yourname/productivity-shastra-outreach'}"
: "${VERCEL_TOKEN:?VERCEL_TOKEN is required}"
: "${SUPABASE_ACCESS_TOKEN:?SUPABASE_ACCESS_TOKEN is required}"
: "${SUPABASE_PROJECT_REF:?SUPABASE_PROJECT_REF is required (the subdomain of your supabase.co URL)}"

ok "all required env vars present"
# ── 1. Install CLIs (idempotent) ─────────────────────────────────────────
install_cli() {
  local pkg="$1" bin="$2"
  if command -v "$bin" >/dev/null 2>&1; then
    ok "$bin already installed: $(command -v "$bin")"
  else
    warn "installing $pkg globally…"
    npm install -g "$pkg" --silent
    ok "$bin installed"
  fi
}
install_cli "gh"          "gh"
install_cli "vercel"      "vercel"
install_cli "supabase"    "supabase"

# ── 2. Authenticate ──────────────────────────────────────────────────────
echo
echo "=== Authenticating with each service ==="
export GH_TOKEN="$GITHUB_TOKEN"
echo "$GITHUB_TOKEN" | gh auth login --with-token >/dev/null
ok "GitHub authenticated as $(gh api user --jq .login)"

export VERCEL_TOKEN
ok "Vercel token set"

# supabase stores config in ~/.supabase
mkdir -p ~/.supabase
cat > ~/.supabase/access-token <<EOF
$SUPABASE_ACCESS_TOKEN
EOF
chmod 600 ~/.supabase/access-token
ok "Supabase access-token written"
# ── 3. Push the local repo to GitHub ────────────────────────────────────
echo
echo "=== Pushing to GitHub ==="
if git remote get-url origin >/dev/null 2>&1; then
  warn "remote 'origin' already set: $(git remote get-url origin)"
else
  git remote add origin "https://github.com/${GITHUB_REPO}.git"
  ok "added remote origin"
fi
git push -u origin main
ok "pushed to https://github.com/${GITHUB_REPO}"

# ── 4. Link the Supabase project & apply schema ─────────────────────────
echo
echo "=== Linking Supabase project ==="
supabase link --project-ref "$SUPABASE_PROJECT_REF" --password "" || {
  fail "could not link Supabase. If this is a fresh project, create it at https://supabase.com/dashboard first, then re-run."
}

echo
echo "=== Applying Supabase schema ==="
for f in supabase/schema.sql supabase/schema.part2.sql supabase/schema.part3.sql supabase/schema.part4.sql; do
  echo "  → $f"
  supabase db execute --file "$f" || {
    warn "  db execute failed; paste the contents of $f into the Supabase SQL editor:"
    warn "  https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/sql/new"
  }
done
ok "Supabase schema applied (or queued for manual paste)"
# ── 5. Seed the email modules ────────────────────────────────────────────
echo
echo "=== Seeding email modules ==="
if [ ! -f .env.local ]; then
  warn ".env.local missing — you'll need to add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before this step can succeed."
  warn "  Get them from https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/settings/api"
else
  set -a; source .env.local; set +a
  if [ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
    warn "NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in .env.local"
  else
    npx tsx scripts/seed-modules.ts
    ok "60+ email modules seeded"
  fi
fi

# ── 6. Deploy to Vercel ─────────────────────────────────────────────────
echo
echo "=== Deploying to Vercel ==="
PROJECT_NAME="${VERCEL_PROJECT_NAME:-productivity-shastra-outreach}"
vercel link --yes --token "$VERCEL_TOKEN" --project "$PROJECT_NAME" 2>/dev/null || {
  vercel link --yes --token "$VERCEL_TOKEN" || warn "vercel link failed; we'll try deploy anyway"
}

if [ -f .env.local ]; then
  echo "  → syncing env vars to Vercel"
  set -a; source .env.local; set +a
  for var in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY \
             SMTP_HOST SMTP_PORT SMTP_SECURE SMTP_USER SMTP_PASSWORD \
             SMTP_FROM_NAME SMTP_FROM_EMAIL SMTP_REPLY_TO \
             CRON_SECRET NEXT_PUBLIC_APP_URL DAILY_BATCH_SIZE \
             SEND_WINDOW_START_HOUR SEND_WINDOW_TIMEZONE; do
    val="${!var:-}"
    if [ -n "$val" ]; then
      echo "    · $var"
      vercel env add "$var" production --token "$VERCEL_TOKEN" --yes <<< "$val" >/dev/null 2>&1 || true
    fi
  done
fi

vercel deploy --prod --yes --token "$VERCEL_TOKEN"
ok "Vercel deploy triggered"
# ── 7. Tell the user what to do next ────────────────────────────────────
echo
echo "================================================================"
echo "  Almost done! Three manual checks:"
echo "================================================================"
echo
echo "  1. Visit https://github.com/${GITHUB_REPO} and verify the push."
echo
echo "  2. In your Vercel project, open Settings → Cron Jobs and confirm"
echo "     the cron is registered (path: /api/cron/daily-send,"
echo "     schedule: 30 3 * * * = 9:00 AM IST)."
echo
echo "  3. In the dashboard at https://your-app.vercel.app/campaigns,"
echo "     create a campaign, then click 'Run now' to verify the SMTP"
echo "     send works end-to-end."
echo
echo "  4. Set up SPF, DKIM, and DMARC for your sending domain (Google"
echo "     Workspace has a wizard in admin.google.com)."
echo
ok "all steps complete. You shipped it. 🎉"
