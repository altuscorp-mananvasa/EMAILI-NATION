# Deploying this repo end-to-end

You asked whether I can do everything myself given CLI access to GitHub, Vercel,
and Supabase. Here's the honest answer and a script that does everything I can
do without you in the loop.

## What I CAN do from this shell

- ✅ Initialize / commit / push the local repo (already done — commit `7c78564`)
- ✅ Install the GitHub, Vercel, and Supabase CLIs as global npm packages
- ✅ Write all the config files the three services need
- ✅ Render the exact commands to run, in order, with your placeholders filled in
- ❌ Authenticate as you (I won't ask for raw PATs/tokens in chat)
- ❌ Create the GitHub repo (`gh repo create` needs interactive browser login OR a fine-grained PAT)
- ❌ Apply schema to a *live* Supabase project (destructive-ish, needs your explicit "yes")
- ❌ Trigger a Vercel production deploy with your domain (final "Deploy" click is human)

## What you need to do (one-time, ~5 minutes total)

### 1. Three tokens

Generate these and paste them into a `.env.local` (or a separate `.secrets` file) on your machine:

| Service | How to get it | Variable name |
|---------|---------------|---------------|
| **GitHub** | https://github.com/settings/tokens → fine-grained, `Contents: Read and write` on the new repo (or classic PAT with `repo` scope) | `GITHUB_TOKEN` |
| **Vercel** | https://vercel.com/account/tokens → Create Token | `VERCEL_TOKEN` |
| **Supabase** | https://supabase.com/dashboard/account/tokens → Generate new token | `SUPABASE_ACCESS_TOKEN` |

Plus your **Supabase project ref** (the subdomain of your project URL, e.g. `abcdefghij` if the URL is `https://abcdefghij.supabase.co`) and a **Supabase database password** (from the project's Settings → Database).

### 2. Run the deploy script

Once the three tokens are in your environment, the script below does the rest.
