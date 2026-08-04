import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FakeDb } from './testUtils/fakeSupabase'

// Exercises getSessionMember/requireMember/requireAdmin against an
// in-memory fake DB, including the embedded lab_members(...) relation
// select that getSessionMember relies on to resolve a session token to a
// member in one round trip.

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
}))

const { getSessionMember, isMemberSession, requireMember, requireAdmin } = await import('./auth')

beforeEach(() => {
  fakeDb.reset()
  cookieStore = new Map()
})

function seedMemberWithSession(overrides: { isAdmin?: boolean; expiresAt?: string } = {}) {
  fakeDb.seed('lab_members', [
    { id: 'member-1', email: 'member@example.com', name: 'Test Member', title: 'Research Assistant', is_admin: overrides.isAdmin ?? false, created_at: '2026-01-01T00:00:00.000Z' },
  ])
  fakeDb.seed('member_sessions', [
    { member_id: 'member-1', token: 'tok123', expires_at: overrides.expiresAt ?? new Date(Date.now() + 1000 * 60 * 60).toISOString() },
  ])
  // Stored in the same {value} shape the cookies() mock's own set() wrapper
  // uses (matching the real next/headers cookie jar's RequestCookie shape),
  // not a bare string -- getSessionMember reads token via `.get(...)?.value`.
  cookieStore.set('bilab_portal_session', { value: 'tok123' })
}

describe('getSessionMember', () => {
  it('returns null when there is no session cookie at all', async () => {
    expect(await getSessionMember()).toBeNull()
  })

  it('returns null when the cookie token does not match any session', async () => {
    cookieStore.set('bilab_portal_session', { value: 'nonexistent-token' })
    expect(await getSessionMember()).toBeNull()
  })

  it('returns null when the matching session has expired', async () => {
    seedMemberWithSession({ expiresAt: new Date(Date.now() - 1000).toISOString() })
    expect(await getSessionMember()).toBeNull()
  })

  it('resolves a valid session token to the embedded lab_members row', async () => {
    seedMemberWithSession()
    const member = await getSessionMember()
    expect(member).toMatchObject({ id: 'member-1', email: 'member@example.com', name: 'Test Member', is_admin: false })
  })
})

describe('isMemberSession', () => {
  it('reflects whether getSessionMember would resolve to a member', async () => {
    expect(await isMemberSession()).toBe(false)
    seedMemberWithSession()
    expect(await isMemberSession()).toBe(true)
  })
})

describe('requireMember', () => {
  it('throws when there is no valid session', async () => {
    await expect(requireMember()).rejects.toThrow('Unauthorized')
  })

  it('returns the member when the session is valid', async () => {
    seedMemberWithSession()
    await expect(requireMember()).resolves.toMatchObject({ id: 'member-1' })
  })
})

describe('requireAdmin', () => {
  it('throws for a valid but non-admin member', async () => {
    seedMemberWithSession({ isAdmin: false })
    await expect(requireAdmin()).rejects.toThrow('Unauthorized: admin access required')
  })

  it('throws (via requireMember) when there is no session at all', async () => {
    await expect(requireAdmin()).rejects.toThrow('Unauthorized')
  })

  it('returns the member when they are an admin', async () => {
    seedMemberWithSession({ isAdmin: true })
    await expect(requireAdmin()).resolves.toMatchObject({ id: 'member-1', is_admin: true })
  })
})
