# This is NOT the Next.js you know

This version has breaking changes: APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Bi Lab website

Public marketing site (Home/Research/Team/Publications/Contact) for Dr. Wenya Linda Bi's lab, plus a login-gated `/portal` area (project manager tool: projects, tasks, deadlines, datasets) for lab members only.

Auth follows the pattern established in the sibling repos `nasbs-committee-portal` and `nasbs-grant-portal` (same folder level): custom cookie sessions backed by Postgres tables via a Supabase service-role client, NOT Supabase Auth / `@supabase/ssr`. See `lib/auth.ts`, `lib/supabase.ts`, `proxy.ts`.

Every file under `app/` or `lib/` that calls `createAdminClient()` must also call `requireMember()` / `requireAdmin()` / `getSessionMember()` in the same file, or add itself to `lib/accessGuard.test.ts`'s allowlist with a comment explaining why. `proxy.ts` only does a cheap cookie-presence check on `/portal/:path*` -- the real check happens per page/action.

No em dashes in any UI copy or content strings.
