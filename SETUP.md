# Bi Lab Website — Setup Guide

## What this is

The public website for Dr. Wenya Linda Bi's lab (Home / Research / Team / Publications / Contact), modeled on the lab's existing BWH-hosted site, plus a login-gated `/portal` for lab members: a lightweight project manager (research projects, tasks, deadlines, datasets) and a link out to the [Meningioma Public Inventory](https://meningioma-public-inventory.vercel.app).

Public pages need no setup — they're static content in `lib/content.ts`. The portal needs a Supabase project.

---

## 1. Create a Supabase project (free)

1. Go to https://supabase.com → New Project
2. Pick a name (e.g., `bi-lab-website`) and a strong DB password
3. After it's created, go to **Settings → API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret)
5. In the Supabase dashboard, go to **SQL Editor**
6. Paste and run the contents of `supabase/schema.sql`
   - Creates `lab_members`, `member_sessions`, `member_login_attempts`, `projects`, `tasks`, `deadlines`, `datasets`; disables Row Level Security; revokes all table access from the public `anon`/`authenticated` roles (the app only ever reads/writes through the service-role key, server-side, gated by `requireMember()`/`requireAdmin()`)

---

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual values. Never commit `.env.local` to git.

---

## 3. Bootstrap the first lab member account (admin)

Lab members are normally added through the app itself (Portal → Members), but that page requires being logged in as an admin already, so the first account has to be created directly against the database:

```bash
npm run create-admin -- --email wbi@bwh.harvard.edu --name "Wenya Linda Bi" --password "a-strong-password" --title "Principal Investigator"
```

Every member after this one should be added from **Portal → Members** in the app, not by re-running this script.

---

## 4. Run locally

```bash
npm install
npm run dev
```

Public site at `http://localhost:3000`, portal at `http://localhost:3000/portal`.

---

## 5. Deploying

1. Push this repo to GitHub.
2. Import it into Vercel, set the three Supabase environment variables in the Vercel project settings, and deploy.

---

## Known limitations / next steps

- **Publications list is a short representative slice**, not the full historical archive — the page links out to the lab's PubMed author list for the complete record. Add more entries to `lib/content.ts`'s `PUBLICATIONS` array as needed.
- **Research area copy is a short summary** sourced from the current BWH site, which itself has minimal per-area text — expand `RESEARCH_AREAS` in `lib/content.ts` with more detail as it becomes available.
- **No email sending**: adding a lab member sets a temporary password directly; there's no invite email. Share the temporary password with the new member out of band and have them treat it as one-time (there's no self-service password change yet).
