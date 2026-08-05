# Bi Lab Website

The public website for Dr. Wenya Linda Bi's lab (the Skull Base Tumor Laboratory, Brigham and Women's Hospital), plus a login-gated portal for lab members.

Live at [wlbilab.org](https://wlbilab.org).

## What's here

- **Public site** (`/`, `/research`, `/team`, `/publications`, `/contact`, `/search`): content and structure modeled on the lab's existing BWH-hosted site, with real team photos, publication citations, and research area copy.
- **Lab portal** (`/portal`): a login-gated project manager for lab members only, covering research projects, tasks, deadlines, and datasets.
- **Meningioma Dataset Registry** (`/inventory`): the lab's public catalog of meningioma molecular datasets, merged into this site from its own former standalone repo.
- **Tools** (`/tools`): a directory of the lab's standalone interactive tools, currently just the registry above; also reachable from within the portal.

## Stack

Next.js 16 (App Router) + TypeScript (strict) + Tailwind v4. Portal auth is custom cookie sessions on Postgres (Supabase, service-role client only, no `@supabase/ssr`), matching the pattern in the sibling `nasbs-committee-portal` / `nasbs-grant-portal` repos.

## Getting started

```bash
npm install
npm run dev
```

The public site works immediately. The portal needs a Supabase project — see [`SETUP.md`](./SETUP.md) for the full setup guide (schema, env vars, bootstrapping the first admin account).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest (`lib/**/*.test.ts`) |
| `npm run create-admin` | Bootstrap the first portal admin account (see SETUP.md) |

## Project structure

```
app/            Routes (App Router). Public pages at the top level, portal under app/portal/.
components/     Shared UI: Header, Footer, ThemeToggle, icons.
lib/            content.ts (site copy), types.ts, supabase.ts/auth.ts (portal auth),
                actions.ts/queries.ts (portal CRUD), testUtils/ (in-memory Supabase fake).
public/         Images (team photos, research icons, brand logos).
supabase/       schema.sql for the portal's Postgres tables.
scripts/        create-admin.mjs to bootstrap the first portal account.
```

## Testing

`lib/**/*.test.ts` covers the portal's auth and CRUD logic against an in-memory Supabase-compatible fake (`lib/testUtils/fakeSupabase.ts`), plus a guard test (`lib/accessGuard.test.ts`) that fails CI if any file touches the database client without a paired auth check. Run with `npm test`.

## Deployment

Hosted on Vercel, auto-deploying from `main`. Custom domain (`wlbilab.org`) DNS is managed externally (A records pointed at Vercel's edge).
