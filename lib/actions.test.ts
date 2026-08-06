import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FakeDb } from './testUtils/fakeSupabase'

// Exercises the mutation logic in actions.ts against an in-memory fake DB.
// Auth (requireMember/requireAdmin) is stubbed out here on purpose --
// whether a caller is allowed to reach these functions is a separate
// concern (see adminAccessGuard-equivalent coverage in accessGuard.test.ts)
// from whether the mutation itself does the right thing once authorized.

const fakeDb = new FakeDb()
const CURRENT_MEMBER = { id: 'member-1', email: 'member@example.com', name: 'Test Member', title: null, is_admin: false, created_at: '2026-01-01T00:00:00.000Z' }
const CURRENT_ADMIN = { id: 'admin-1', email: 'admin@example.com', name: 'Test Admin', title: null, is_admin: true, created_at: '2026-01-01T00:00:00.000Z' }

let requireMemberImpl = async () => CURRENT_MEMBER
let requireAdminImpl = async () => CURRENT_ADMIN

vi.mock('./supabase', () => ({
  createAdminClient: () => fakeDb,
}))

vi.mock('./auth', () => ({
  requireMember: vi.fn(async () => requireMemberImpl()),
  requireAdmin: vi.fn(async () => requireAdminImpl()),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
}))

// revalidatePath requires a request-scoped static generation store that
// only exists inside a real Next.js render/action -- outside of one (as
// here) it throws, so it's stubbed like the other next/* APIs above.
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// A single shared store per test (reset in beforeEach below), not a fresh
// Map on every cookies() call -- a real request has exactly one cookie jar
// for its lifetime, and callers like logout() call cookies() themselves
// rather than receiving the test's store, so this must actually persist.
let cookieStore = new Map<string, { value: string }>()

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => cookieStore.get(name),
    set: (name: string, value: string) => cookieStore.set(name, { value }),
    delete: (name: string) => cookieStore.delete(name),
  })),
}))

const {
  loginMember, logout, createLabMember, deleteLabMember, setCanViewAllProjects,
  adminResetMemberPassword, changeOwnPassword,
  createProject, updateProject, updateProjectStatus, deleteProject, setProjectMembers,
  createGrant, updateGrantStatus, deleteGrant,
} = await import('./actions')

function form(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

beforeEach(() => {
  fakeDb.reset()
  cookieStore = new Map()
  requireMemberImpl = async () => CURRENT_MEMBER
  requireAdminImpl = async () => CURRENT_ADMIN
})

describe('loginMember', () => {
  const NOW = Date.parse('2026-01-01T00:00:00.000Z')

  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    const bcrypt = (await import('bcryptjs')).default
    fakeDb.seed('lab_members', [
      { id: 'member-1', email: 'member@example.com', name: 'Test Member', is_admin: false, password_hash: await bcrypt.hash('correct-horse', 10) },
    ])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('rejects a wrong password and records the failure under that email', async () => {
    const result = await loginMember('member@example.com', 'wrong')
    expect(result.error).toBe('Incorrect email or password.')
    expect(fakeDb.table('member_login_attempts')).toHaveLength(1)
    expect(fakeDb.table('member_login_attempts')[0].email).toBe('member@example.com')
  })

  it('accepts the correct password and creates a session tied to the member', async () => {
    const result = await loginMember('member@example.com', 'correct-horse')
    expect(result.error).toBeUndefined()
    expect(fakeDb.table('member_sessions')).toHaveLength(1)
    expect(fakeDb.table('member_sessions')[0].member_id).toBe('member-1')
  })

  it('normalizes email case and surrounding whitespace', async () => {
    const result = await loginMember('  Member@Example.com  ', 'correct-horse')
    expect(result.error).toBeUndefined()
  })

  it('locks out after repeated failures within the window, without checking the password', async () => {
    for (let i = 0; i < 10; i++) {
      await loginMember('member@example.com', 'wrong')
    }
    const result = await loginMember('member@example.com', 'correct-horse')
    expect(result.error).toBe('Too many failed attempts for this account. Try again in a few minutes.')
    // Session was never created even though the 11th attempt used the right password.
    expect(fakeDb.table('member_sessions')).toHaveLength(0)
  })

  it('does not lock out a different email after one account is locked', async () => {
    fakeDb.seed('lab_members', [
      ...fakeDb.table('lab_members'),
      { id: 'member-2', email: 'other@example.com', name: 'Other', is_admin: false, password_hash: await (await import('bcryptjs')).default.hash('other-pw', 10) },
    ])
    for (let i = 0; i < 10; i++) {
      await loginMember('member@example.com', 'wrong')
    }
    const result = await loginMember('other@example.com', 'other-pw')
    expect(result.error).toBeUndefined()
  })
})

describe('logout', () => {
  it('deletes the session row and clears the cookie, then redirects to login', async () => {
    const { cookies } = await import('next/headers')
    const jar = await cookies()
    fakeDb.seed('member_sessions', [{ id: 's1', member_id: 'member-1', token: 'tok123' }])
    jar.set('bilab_portal_session', 'tok123')

    await expect(logout()).rejects.toThrow('NEXT_REDIRECT')
    expect(fakeDb.table('member_sessions')).toHaveLength(0)
  })
})

describe('createLabMember', () => {
  it('requires requireAdmin (rejects when the caller is not an admin)', async () => {
    requireAdminImpl = async () => { throw new Error('Unauthorized') }
    await expect(createLabMember(form({ email: 'x@example.com', name: 'X', password: 'longenough' }))).rejects.toThrow('Unauthorized')
  })

  it('rejects a password under 8 characters', async () => {
    const result = await createLabMember(form({ email: 'x@example.com', name: 'X', password: 'short' }))
    expect(result.error).toBe('Password must be at least 8 characters.')
    expect(fakeDb.table('lab_members')).toHaveLength(0)
  })

  it('rejects a duplicate email (case-insensitive)', async () => {
    fakeDb.seed('lab_members', [{ id: 'existing', email: 'x@example.com', name: 'X', is_admin: false, password_hash: 'hash' }])
    const result = await createLabMember(form({ email: 'X@Example.com', name: 'Y', password: 'longenough' }))
    expect(result.error).toBe('A lab member with this email already exists.')
  })

  it('creates a member with a bcrypt-hashed password, not the plaintext', async () => {
    const result = await createLabMember(form({ email: 'new@example.com', name: 'New Member', password: 'longenough' }))
    expect(result.error).toBeUndefined()
    const [row] = fakeDb.table('lab_members')
    expect(row.email).toBe('new@example.com')
    expect(row.password_hash).not.toBe('longenough')
    expect(row.is_admin).toBe(false)
  })

  it('sets is_admin when the is_admin checkbox is present', async () => {
    await createLabMember(form({ email: 'admin2@example.com', name: 'Admin Two', password: 'longenough', is_admin: 'on' }))
    expect(fakeDb.table('lab_members')[0].is_admin).toBe(true)
  })
})

describe('deleteLabMember', () => {
  it('refuses to let an admin delete their own account', async () => {
    fakeDb.seed('lab_members', [{ id: 'admin-1', email: 'admin@example.com', name: 'Admin' }])
    const result = await deleteLabMember('admin-1')
    expect(result.error).toBe('You cannot remove your own account while logged in as it.')
    expect(fakeDb.table('lab_members')).toHaveLength(1)
  })

  it('deletes a different member', async () => {
    fakeDb.seed('lab_members', [{ id: 'member-1', email: 'member@example.com', name: 'Member' }])
    const result = await deleteLabMember('member-1')
    expect(result.error).toBeUndefined()
    expect(fakeDb.table('lab_members')).toHaveLength(0)
  })
})

describe('setCanViewAllProjects', () => {
  it('grants full project visibility to a member', async () => {
    fakeDb.seed('lab_members', [{ id: 'member-1', name: 'Member', can_view_all_projects: false }])
    const result = await setCanViewAllProjects('member-1', true)
    expect(result.error).toBeUndefined()
    expect(fakeDb.table('lab_members')[0].can_view_all_projects).toBe(true)
  })

  it('revokes it again', async () => {
    fakeDb.seed('lab_members', [{ id: 'member-1', name: 'Member', can_view_all_projects: true }])
    await setCanViewAllProjects('member-1', false)
    expect(fakeDb.table('lab_members')[0].can_view_all_projects).toBe(false)
  })
})

describe('adminResetMemberPassword', () => {
  it('rejects a password under 8 characters, leaving the hash untouched', async () => {
    fakeDb.seed('lab_members', [{ id: 'member-1', name: 'Member', password_hash: 'old-hash' }])
    const result = await adminResetMemberPassword('member-1', 'short')
    expect(result.error).toBe('Password must be at least 8 characters.')
    expect(fakeDb.table('lab_members')[0].password_hash).toBe('old-hash')
  })

  it('sets a new bcrypt-hashed password and invalidates every session for that member only', async () => {
    fakeDb.seed('lab_members', [{ id: 'member-1', name: 'Member', password_hash: 'old-hash' }])
    fakeDb.seed('member_sessions', [
      { id: 's1', member_id: 'member-1', token: 'tok-a' },
      { id: 's2', member_id: 'member-1', token: 'tok-b' },
      { id: 's3', member_id: 'other-member', token: 'tok-c' },
    ])

    const result = await adminResetMemberPassword('member-1', 'longenough')
    expect(result.error).toBeUndefined()

    const row = fakeDb.table('lab_members')[0]
    expect(row.password_hash).not.toBe('old-hash')
    expect(row.password_hash).not.toBe('longenough') // hashed, not plaintext

    expect(fakeDb.table('member_sessions').map((s) => s.token)).toEqual(['tok-c'])
  })
})

describe('changeOwnPassword', () => {
  beforeEach(async () => {
    const bcrypt = (await import('bcryptjs')).default
    fakeDb.seed('lab_members', [
      { id: 'member-1', email: 'member@example.com', name: 'Test Member', password_hash: await bcrypt.hash('correct-horse', 10) },
    ])
  })

  it('rejects an incorrect current password', async () => {
    const result = await changeOwnPassword('wrong', 'longenough')
    expect(result.error).toBe('Current password is incorrect.')
  })

  it('rejects a new password under 8 characters', async () => {
    const result = await changeOwnPassword('correct-horse', 'short')
    expect(result.error).toBe('New password must be at least 8 characters.')
  })

  it('updates the hash and invalidates every OTHER session, keeping the caller signed in', async () => {
    const { cookies } = await import('next/headers')
    const jar = await cookies()
    jar.set('bilab_portal_session', 'current-tok')
    fakeDb.seed('member_sessions', [
      { id: 's1', member_id: 'member-1', token: 'current-tok' },
      { id: 's2', member_id: 'member-1', token: 'other-tok' },
    ])

    const result = await changeOwnPassword('correct-horse', 'a-new-password')
    expect(result.error).toBeUndefined()

    const bcrypt = (await import('bcryptjs')).default
    const row = fakeDb.table('lab_members').find((r) => r.id === 'member-1')!
    expect(await bcrypt.compare('a-new-password', row.password_hash as string)).toBe(true)

    expect(fakeDb.table('member_sessions').map((s) => s.token)).toEqual(['current-tok'])
  })
})

describe('projects', () => {
  it('createProject requires a name and attributes ownership to the caller', async () => {
    const empty = await createProject(form({ name: '' }))
    expect(empty.error).toBe('Name is required.')

    const result = await createProject(form({ name: 'RT/immune reanalysis', status: 'active' }))
    expect(result.error).toBeUndefined()
    const [row] = fakeDb.table('projects')
    expect(row.name).toBe('RT/immune reanalysis')
    expect(row.owner_id).toBe('member-1')
    expect(row.status).toBe('active')
  })

  it('createProject defaults status to planning when omitted', async () => {
    await createProject(form({ name: 'Untitled' }))
    expect(fakeDb.table('projects')[0].status).toBe('planning')
  })

  it('updateProject overwrites the named fields on the matching row', async () => {
    fakeDb.seed('projects', [{ id: 'p1', name: 'Old', status: 'planning', description: null, notes: null }])
    const result = await updateProject('p1', form({ name: 'New Name', status: 'done' }))
    expect(result.error).toBeUndefined()
    expect(fakeDb.table('projects')[0]).toMatchObject({ name: 'New Name', status: 'done' })
  })

  it('deleteProject removes the row', async () => {
    fakeDb.seed('projects', [{ id: 'p1', name: 'X' }])
    await deleteProject('p1')
    expect(fakeDb.table('projects')).toHaveLength(0)
  })

  it('updateProjectStatus changes only the status field, leaving other fields untouched', async () => {
    fakeDb.seed('projects', [{ id: 'p1', name: 'X', status: 'active', faculty: 'Bi', work_percent: 80 }])
    await updateProjectStatus('p1', 'archived')
    expect(fakeDb.table('projects')[0]).toMatchObject({ name: 'X', status: 'archived', faculty: 'Bi', work_percent: 80 })
  })

  it('createProject persists the lab tracker fields (group, faculty, personnel, work %, etc.)', async () => {
    const result = await createProject(form({
      name: 'Meningioma radiomics',
      group_type: 'A',
      faculty: 'Bi / Ray',
      personnel: 'Shun, Driver',
      work_percent: '50',
      pub_status: 'manuscript',
      meeting: 'AANS',
      deadline_date: '2026-09-01',
      checkpoint: 'await radiomics primary publications',
    }))
    expect(result.error).toBeUndefined()
    expect(fakeDb.table('projects')[0]).toMatchObject({
      group_type: 'A',
      faculty: 'Bi / Ray',
      personnel: 'Shun, Driver',
      work_percent: 50,
      pub_status: 'manuscript',
      meeting: 'AANS',
      deadline_date: '2026-09-01',
      checkpoint: 'await radiomics primary publications',
    })
  })

  it('createProject clamps out-of-range work_percent into 0-100', async () => {
    await createProject(form({ name: 'A', work_percent: '150' }))
    expect(fakeDb.table('projects')[0].work_percent).toBe(100)
  })

  it('createProject records journal, pub_year, and pubmed_url for a completed/published project', async () => {
    await createProject(form({
      name: 'Ki-67 in meningioma', status: 'done', journal: 'J Neurosurg', pub_year: '2025',
      pubmed_url: 'https://pubmed.ncbi.nlm.nih.gov/40712166/',
    }))
    expect(fakeDb.table('projects')[0]).toMatchObject({
      status: 'done', journal: 'J Neurosurg', pub_year: 2025, pubmed_url: 'https://pubmed.ncbi.nlm.nih.gov/40712166/',
    })
  })

  it('updateProject overwrites tracker fields on the matching row', async () => {
    fakeDb.seed('projects', [{ id: 'p1', name: 'Old', status: 'active', work_percent: 10, pub_status: null }])
    const result = await updateProject('p1', form({ name: 'Old', work_percent: '80', pub_status: 'revision' }))
    expect(result.error).toBeUndefined()
    expect(fakeDb.table('projects')[0]).toMatchObject({ work_percent: 80, pub_status: 'revision' })
  })
})

describe('setProjectMembers', () => {
  it('tags the given members to a project, replacing any previous tags', async () => {
    fakeDb.seed('projects', [{ id: 'p1', owner_id: 'member-1' }])
    fakeDb.seed('project_members', [{ project_id: 'p1', member_id: 'old-member' }])
    const fd = new FormData()
    fd.append('member_ids', 'member-a')
    fd.append('member_ids', 'member-b')

    const result = await setProjectMembers('p1', fd)
    expect(result.error).toBeUndefined()
    const rows = fakeDb.table('project_members')
    expect(rows.map(r => r.member_id).sort()).toEqual(['member-a', 'member-b'])
    expect(rows.every(r => r.project_id === 'p1')).toBe(true)
  })

  it('clears all tags when no members are selected', async () => {
    fakeDb.seed('projects', [{ id: 'p1', owner_id: 'member-1' }])
    fakeDb.seed('project_members', [{ project_id: 'p1', member_id: 'member-a' }])
    const result = await setProjectMembers('p1', new FormData())
    expect(result.error).toBeUndefined()
    expect(fakeDb.table('project_members')).toHaveLength(0)
  })

  it('does not touch tags belonging to a different project', async () => {
    fakeDb.seed('projects', [{ id: 'p1', owner_id: 'member-1' }])
    fakeDb.seed('project_members', [{ project_id: 'other', member_id: 'member-a' }])
    await setProjectMembers('p1', new FormData())
    expect(fakeDb.table('project_members')).toHaveLength(1)
  })

  it('rejects tagging a project the caller cannot see (not owner, not tagged, no full-visibility)', async () => {
    fakeDb.seed('projects', [{ id: 'p1', owner_id: 'someone-else' }])
    const fd = new FormData()
    fd.append('member_ids', 'member-a')
    const result = await setProjectMembers('p1', fd)
    expect(result.error).toBe('Project not found.')
    expect(fakeDb.table('project_members')).toHaveLength(0)
  })
})

describe('grants', () => {
  it('requires a name', async () => {
    const result = await createGrant(form({ name: '' }))
    expect(result.error).toBe('Name is required.')
  })

  it('defaults status to identified when omitted', async () => {
    await createGrant(form({ name: 'NBTS Meningioma Research Fund' }))
    expect(fakeDb.table('grants')[0].status).toBe('identified')
  })

  it('stores funder, amount, deadline, url, project, and notes', async () => {
    await createGrant(form({
      name: 'NBTS Meningioma Research Fund',
      funder: 'National Brain Tumor Society',
      status: 'researching',
      amount: 'up to $200,000',
      deadline_date: '2026-12-01',
      url: 'https://braintumor.org/research/initiatives/meningioma-research-fund/',
      project_id: 'p1',
      notes: 'Dedicated meningioma fund, good fit',
    }))
    expect(fakeDb.table('grants')[0]).toMatchObject({
      name: 'NBTS Meningioma Research Fund',
      funder: 'National Brain Tumor Society',
      status: 'researching',
      amount: 'up to $200,000',
      deadline_date: '2026-12-01',
      url: 'https://braintumor.org/research/initiatives/meningioma-research-fund/',
      project_id: 'p1',
      notes: 'Dedicated meningioma fund, good fit',
    })
  })

  it('updateGrantStatus changes only the status field', async () => {
    fakeDb.seed('grants', [{ id: 'g1', name: 'X', status: 'identified' }])
    await updateGrantStatus('g1', 'submitted')
    expect(fakeDb.table('grants')[0].status).toBe('submitted')
    expect(fakeDb.table('grants')[0].name).toBe('X')
  })

  it('updateGrantStatus requires requireAdmin (rejects when the caller is not an admin)', async () => {
    requireAdminImpl = async () => { throw new Error('Unauthorized') }
    fakeDb.seed('grants', [{ id: 'g1', name: 'X', status: 'identified' }])
    await expect(updateGrantStatus('g1', 'submitted')).rejects.toThrow('Unauthorized')
    expect(fakeDb.table('grants')[0].status).toBe('identified')
  })

  it('deleteGrant removes the row', async () => {
    fakeDb.seed('grants', [{ id: 'g1', name: 'X' }])
    await deleteGrant('g1')
    expect(fakeDb.table('grants')).toHaveLength(0)
  })

  it('deleteGrant requires requireAdmin (rejects when the caller is not an admin)', async () => {
    requireAdminImpl = async () => { throw new Error('Unauthorized') }
    fakeDb.seed('grants', [{ id: 'g1', name: 'X' }])
    await expect(deleteGrant('g1')).rejects.toThrow('Unauthorized')
    expect(fakeDb.table('grants')).toHaveLength(1)
  })
})
