import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

// A file or route handler could call createAdminClient() (the service-role
// client, which bypasses all RLS/permission checks) without first verifying
// the caller is actually logged in. proxy.ts only does a lightweight
// cookie-presence check on /portal/:path*, so every file that touches the
// admin DB client directly is responsible for its own real auth check --
// nothing else enforces it. Ported from the nasbs-committee-portal
// precedent: it makes forgetting that check a CI/test failure instead of a
// silent production hole.
const ROOT = join(__dirname, '..')
const SCAN_DIRS = ['app', 'lib']
const AUTH_CALLS = ['isMemberSession(', 'requireMember(', 'requireAdmin(', 'getSessionMember(', 'requireJjkAccess(']

// Files allowed to construct the admin client without their own auth check,
// because they are not independent DB-access entry points:
//   - lib/supabase.ts only *defines* createAdminClient(); it never calls it.
//   - lib/auth.ts itself performs the session lookup that every auth check
//     is built on -- it is the auth check, not a caller of it.
// (lib/jjkAccess.ts doesn't need an entry here -- it never touches
// createAdminClient() itself, it just layers an email check on top of
// requireMember().)
const ALLOWLIST = new Set(['lib/supabase.ts', 'lib/auth.ts'])

function walk(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...walk(full))
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith('.test.ts')) {
      files.push(full)
    }
  }
  return files
}

function usesAdminClient(source: string): boolean {
  if (source.includes('createAdminClient(')) return true
  const aliasMatch = source.match(/import\s*\{[^}]*\bcreateAdminClient\b\s+as\s+(\w+)[^}]*\}\s*from\s*['"][^'"]*\/supabase['"]/)
  return !!aliasMatch && source.includes(`${aliasMatch[1]}(`)
}

describe('every app/ or lib/ file that uses the admin DB client checks auth first', () => {
  const files = SCAN_DIRS.flatMap((d) => walk(join(ROOT, d)))
  const offenders = files
    .map((f) => ({ path: relative(ROOT, f), source: readFileSync(f, 'utf-8') }))
    .filter(({ path, source }) => usesAdminClient(source) && !ALLOWLIST.has(path))
    .filter(({ source }) => !AUTH_CALLS.some((call) => source.includes(call)))

  it('finds no page, route handler, or lib helper using createAdminClient() -- directly or via an aliased import -- without an auth check', () => {
    expect(offenders.map((o) => o.path)).toEqual([])
  })

  it('sanity check: this test actually inspects files (does not vacuously pass)', () => {
    const usesIt = files.filter((f) => usesAdminClient(readFileSync(f, 'utf-8')))
    expect(usesIt.length).toBeGreaterThan(0)
  })
})
