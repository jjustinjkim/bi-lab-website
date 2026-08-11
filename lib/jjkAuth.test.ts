import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import bcrypt from 'bcryptjs'
import { FakeDb } from './testUtils/fakeSupabase'

// Exercises loginJjk/getJjkSession/requireJjk/logoutJjk against an
// in-memory fake DB -- same approach as auth.test.ts, but this gate has no
// per-account table, just one shared password compared against
// JJK_PASSWORD_HASH and a jjk_sessions row on success.

const fakeDb = new FakeDb()
let cookieStore = new Map<string, { value: string }>()

vi.mock('./supabase', () => ({
  createAdminClient: () => fakeDb,
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => cookieStore.get(name),
    set: (name: string, value: string) => cookieStore.set(name, { value }),
    delete: (name: string) => cookieStore.delete(name),
  })),
  headers: vi.fn(async () => new Map([['x-forwarded-for', '203.0.113.5']])),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
}))

const REAL_PASSWORD = 'test-password-123'
// Pinned before FakeDb's own fake clock epoch (2026-02-02, see
// testUtils/fakeSupabase.ts) so the lockout window's cleanup delete
// (created_at < windowStart) never sweeps up rows this same test just
// inserted -- same trick actions.test.ts's loginMember suite uses.
const NOW = Date.parse('2026-01-01T00:00:00.000Z')

const { loginJjk, logoutJjk, getJjkSession, requireJjk } = await import('./jjkAuth')

beforeEach(async () => {
  fakeDb.reset()
  cookieStore = new Map()
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
  process.env.JJK_PASSWORD_HASH = await bcrypt.hash(REAL_PASSWORD, 4)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('loginJjk', () => {
  it('rejects an incorrect password and records a failed attempt', async () => {
    const result = await loginJjk('wrong-password')
    expect(result.error).toBe('Incorrect password.')
    expect(fakeDb.table('jjk_login_attempts').length).toBe(1)
    expect(cookieStore.has('bilab_jjk_session')).toBe(false)
  })

  it('locks out after repeated failures from the same IP', async () => {
    for (let i = 0; i < 8; i++) await loginJjk('wrong-password')
    const result = await loginJjk('wrong-password')
    expect(result.error).toMatch(/too many failed attempts/i)
  })

  it('accepts the correct password and sets a session cookie', async () => {
    const result = await loginJjk(REAL_PASSWORD)
    expect(result.error).toBeUndefined()
    expect(cookieStore.has('bilab_jjk_session')).toBe(true)
    expect(fakeDb.table('jjk_sessions').length).toBe(1)
  })
})

describe('getJjkSession / requireJjk', () => {
  it('returns false / throws when there is no session cookie', async () => {
    expect(await getJjkSession()).toBe(false)
    await expect(requireJjk()).rejects.toThrow('Unauthorized')
  })

  it('returns true / resolves after a successful login', async () => {
    await loginJjk(REAL_PASSWORD)
    expect(await getJjkSession()).toBe(true)
    await expect(requireJjk()).resolves.toBeUndefined()
  })

  it('returns false once the session has expired', async () => {
    await loginJjk(REAL_PASSWORD)
    const token = cookieStore.get('bilab_jjk_session')?.value
    const sessions = fakeDb.table('jjk_sessions')
    const row = sessions.find((r) => r.token === token)
    if (row) row.expires_at = new Date(Date.now() - 1000).toISOString()
    expect(await getJjkSession()).toBe(false)
  })
})

describe('logoutJjk', () => {
  it('deletes the session row and the cookie', async () => {
    await loginJjk(REAL_PASSWORD)
    expect(fakeDb.table('jjk_sessions').length).toBe(1)
    await expect(logoutJjk()).rejects.toThrow('NEXT_REDIRECT')
    expect(fakeDb.table('jjk_sessions').length).toBe(0)
    expect(cookieStore.has('bilab_jjk_session')).toBe(false)
  })
})
