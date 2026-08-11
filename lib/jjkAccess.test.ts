import { describe, it, expect, vi, beforeEach } from 'vitest'

// Exercises requireJjkAccess/hasJjkAccess/isJjkAllowedEmail against a
// stubbed requireMember() -- same mocking approach as actions.test.ts,
// since whether requireMember() itself resolves correctly is already
// covered by auth.test.ts.

const ALLOWED_MEMBER = { id: 'jjk-1', email: 'jkim183@mgh.harvard.edu', name: 'Justin Kim', title: null, is_admin: true, can_view_all_projects: true, created_at: '2026-01-01T00:00:00.000Z' }
const OTHER_ADMIN = { id: 'other-1', email: 'zmoynihan@bwh.harvard.edu', name: 'Zach Moynihan', title: null, is_admin: true, can_view_all_projects: false, created_at: '2026-01-01T00:00:00.000Z' }

let requireMemberImpl: () => Promise<typeof ALLOWED_MEMBER> = async () => {
  throw new Error('Unauthorized')
}

vi.mock('./auth', () => ({
  requireMember: vi.fn(async () => requireMemberImpl()),
}))

const { requireJjkAccess, hasJjkAccess, isJjkAllowedEmail } = await import('./jjkAccess')

beforeEach(() => {
  requireMemberImpl = async () => {
    throw new Error('Unauthorized')
  }
})

describe('isJjkAllowedEmail', () => {
  it('matches Justin and Dr. Bi, case-insensitively', () => {
    expect(isJjkAllowedEmail('jkim183@mgh.harvard.edu')).toBe(true)
    expect(isJjkAllowedEmail('WBI@BWH.HARVARD.EDU')).toBe(true)
  })

  it('rejects any other address, including another admin', () => {
    expect(isJjkAllowedEmail('zmoynihan@bwh.harvard.edu')).toBe(false)
    expect(isJjkAllowedEmail('random@example.com')).toBe(false)
  })
})

describe('requireJjkAccess', () => {
  it('throws when there is no session at all', async () => {
    await expect(requireJjkAccess()).rejects.toThrow('Unauthorized')
  })

  it('throws for a logged-in member who is not on the allowlist, even if admin', async () => {
    requireMemberImpl = async () => OTHER_ADMIN
    await expect(requireJjkAccess()).rejects.toThrow('Unauthorized: JJK access required')
  })

  it('resolves for an allowlisted member', async () => {
    requireMemberImpl = async () => ALLOWED_MEMBER
    await expect(requireJjkAccess()).resolves.toMatchObject({ id: 'jjk-1' })
  })
})

describe('hasJjkAccess', () => {
  it('reflects whether requireJjkAccess would resolve', async () => {
    expect(await hasJjkAccess()).toBe(false)
    requireMemberImpl = async () => OTHER_ADMIN
    expect(await hasJjkAccess()).toBe(false)
    requireMemberImpl = async () => ALLOWED_MEMBER
    expect(await hasJjkAccess()).toBe(true)
  })
})
