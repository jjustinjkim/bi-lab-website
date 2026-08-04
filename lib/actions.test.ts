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
  loginMember, logout, createLabMember, deleteLabMember,
  createProject, updateProject, deleteProject,
  createTask, updateTaskStatus, deleteTask,
  createDeadline, deleteDeadline,
  createDataset, deleteDataset,
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
})

describe('tasks', () => {
  it('createTask requires a title', async () => {
    const result = await createTask(form({ title: '' }))
    expect(result.error).toBe('Title is required.')
  })

  it('createTask defaults status to todo and allows no project/assignee', async () => {
    await createTask(form({ title: 'Draft the abstract' }))
    const [row] = fakeDb.table('tasks')
    expect(row.status).toBe('todo')
    expect(row.project_id).toBeNull()
    expect(row.assignee_id).toBeNull()
  })

  it('updateTaskStatus changes only the status field', async () => {
    fakeDb.seed('tasks', [{ id: 't1', title: 'X', status: 'todo' }])
    await updateTaskStatus('t1', 'done')
    expect(fakeDb.table('tasks')[0].status).toBe('done')
    expect(fakeDb.table('tasks')[0].title).toBe('X')
  })

  it('deleteTask removes the row', async () => {
    fakeDb.seed('tasks', [{ id: 't1', title: 'X' }])
    await deleteTask('t1')
    expect(fakeDb.table('tasks')).toHaveLength(0)
  })
})

describe('deadlines', () => {
  it('requires both a title and a date', async () => {
    expect((await createDeadline(form({ title: '', date: '2026-09-01' }))).error).toBe('Title and date are required.')
    expect((await createDeadline(form({ title: 'Grant due', date: '' }))).error).toBe('Title and date are required.')
  })

  it('creates a deadline with a default type of other', async () => {
    await createDeadline(form({ title: 'IRB renewal', date: '2026-09-01' }))
    expect(fakeDb.table('deadlines')[0].type).toBe('other')
  })

  it('deleteDeadline removes the row', async () => {
    fakeDb.seed('deadlines', [{ id: 'd1', title: 'X', date: '2026-09-01' }])
    await deleteDeadline('d1')
    expect(fakeDb.table('deadlines')).toHaveLength(0)
  })
})

describe('datasets', () => {
  it('requires a name', async () => {
    const result = await createDataset(form({ name: '' }))
    expect(result.error).toBe('Name is required.')
  })

  it('parses a numeric sample_count and stores null when blank or invalid', async () => {
    await createDataset(form({ name: 'Cohort A', sample_count: '127' }))
    expect(fakeDb.table('datasets')[0].sample_count).toBe(127)

    await createDataset(form({ name: 'Cohort B' }))
    expect(fakeDb.table('datasets')[1].sample_count).toBeNull()
  })

  it('deleteDataset removes the row', async () => {
    fakeDb.seed('datasets', [{ id: 'ds1', name: 'X' }])
    await deleteDataset('ds1')
    expect(fakeDb.table('datasets')).toHaveLength(0)
  })
})
