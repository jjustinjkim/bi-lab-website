import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FakeDb } from './testUtils/fakeSupabase'
import { requireMember } from './auth'

// Exercises the read logic in queries.ts against an in-memory fake DB.
// Auth (requireMember) is stubbed out -- these tests are about whether each
// query returns the right rows in the right order, not about access control.

const fakeDb = new FakeDb()
// can_view_all_projects: true here since this file is about query
// correctness, not access control -- the project-visibility filter itself
// (restricted members, tagging) is covered separately below.
const CURRENT_MEMBER = { id: 'member-1', email: 'member@example.com', name: 'Test Member', title: null, is_admin: false, can_view_all_projects: true, created_at: '2026-01-01T00:00:00.000Z' }

vi.mock('./supabase', () => ({
  createAdminClient: () => fakeDb,
}))

vi.mock('./auth', () => ({
  requireMember: vi.fn(async () => CURRENT_MEMBER),
}))

const {
  getLabMembers, getProjects, getProject,
  getTasks, getTasksForProject,
  getDeadlines, getDeadlinesForProject,
  getDatasets, getDatasetsForProject,
  getDashboardData,
} = await import('./queries')

beforeEach(() => {
  fakeDb.reset()
})

describe('getLabMembers', () => {
  it('returns members sorted by name', async () => {
    fakeDb.seed('lab_members', [
      { id: '1', name: 'Zara' },
      { id: '2', name: 'Amir' },
    ])
    const result = await getLabMembers()
    expect(result.map(m => m.name)).toEqual(['Amir', 'Zara'])
  })

  it('returns an empty array, not null, when there are no members', async () => {
    expect(await getLabMembers()).toEqual([])
  })
})

describe('getProjects / getProject', () => {
  it('getProjects orders by updated_at descending (most recently touched first)', async () => {
    fakeDb.seed('projects', [
      { id: 'old', name: 'Old', updated_at: '2026-01-01T00:00:00.000Z' },
      { id: 'new', name: 'New', updated_at: '2026-06-01T00:00:00.000Z' },
    ])
    const result = await getProjects()
    expect(result.map(p => p.id)).toEqual(['new', 'old'])
  })

  it('getProject returns the matching project by id', async () => {
    fakeDb.seed('projects', [{ id: 'p1', name: 'X' }, { id: 'p2', name: 'Y' }])
    const result = await getProject('p2')
    expect(result?.name).toBe('Y')
  })

  it('getProject returns null (not throw) when no row matches', async () => {
    const result = await getProject('missing')
    expect(result).toBeNull()
  })
})

describe('project visibility filtering', () => {
  const RESTRICTED_MEMBER = {
    id: 'restricted-1', email: 'r@example.com', name: 'Restricted', title: null,
    is_admin: false, can_view_all_projects: false, created_at: '2026-01-01T00:00:00.000Z',
  }

  it('a restricted member only sees projects they own or are tagged on', async () => {
    fakeDb.seed('projects', [
      { id: 'owned', name: 'Owned by me', owner_id: 'restricted-1' },
      { id: 'tagged', name: 'Tagged to me', owner_id: 'someone-else' },
      { id: 'hidden', name: 'Not mine', owner_id: 'someone-else' },
    ])
    fakeDb.seed('project_members', [{ project_id: 'tagged', member_id: 'restricted-1' }])
    vi.mocked(requireMember).mockResolvedValueOnce(RESTRICTED_MEMBER)

    const result = await getProjects()
    expect(result.map(p => p.id).sort()).toEqual(['owned', 'tagged'])
  })

  it('getProject returns null for a project a restricted member cannot see (not just filtered from the list)', async () => {
    fakeDb.seed('projects', [{ id: 'hidden', name: 'Not mine', owner_id: 'someone-else' }])
    vi.mocked(requireMember).mockResolvedValueOnce(RESTRICTED_MEMBER)

    expect(await getProject('hidden')).toBeNull()
  })

  it('getProject still returns a project the restricted member owns', async () => {
    fakeDb.seed('projects', [{ id: 'mine', name: 'Mine', owner_id: 'restricted-1' }])
    vi.mocked(requireMember).mockResolvedValueOnce(RESTRICTED_MEMBER)

    expect((await getProject('mine'))?.id).toBe('mine')
  })

  it('can_view_all_projects sees every project regardless of ownership or tags', async () => {
    fakeDb.seed('projects', [
      { id: 'a', name: 'A', owner_id: 'someone-else' },
      { id: 'b', name: 'B', owner_id: 'someone-else-2' },
    ])
    // default CURRENT_MEMBER mock has can_view_all_projects: true
    const result = await getProjects()
    expect(result.map(p => p.id).sort()).toEqual(['a', 'b'])
  })
})

describe('tasks / deadlines / datasets scoped to a project', () => {
  it('getTasksForProject only returns tasks for that project', async () => {
    fakeDb.seed('tasks', [
      { id: 't1', title: 'A', project_id: 'p1', created_at: '2026-01-01T00:00:00.000Z' },
      { id: 't2', title: 'B', project_id: 'p2', created_at: '2026-01-02T00:00:00.000Z' },
    ])
    const result = await getTasksForProject('p1')
    expect(result.map(t => t.id)).toEqual(['t1'])
  })

  it('getDeadlinesForProject orders by date ascending', async () => {
    fakeDb.seed('deadlines', [
      { id: 'd1', title: 'Later', project_id: 'p1', date: '2026-12-01' },
      { id: 'd2', title: 'Sooner', project_id: 'p1', date: '2026-09-01' },
    ])
    const result = await getDeadlinesForProject('p1')
    expect(result.map(d => d.id)).toEqual(['d2', 'd1'])
  })

  it('getDatasetsForProject only returns datasets for that project', async () => {
    fakeDb.seed('datasets', [
      { id: 'ds1', name: 'A', project_id: 'p1', created_at: '2026-01-01T00:00:00.000Z' },
      { id: 'ds2', name: 'B', project_id: null, created_at: '2026-01-02T00:00:00.000Z' },
    ])
    const result = await getDatasetsForProject('p1')
    expect(result.map(d => d.id)).toEqual(['ds1'])
  })
})

describe('getDeadlines / getTasks / getDatasets (unscoped)', () => {
  it('getDeadlines orders all deadlines by date ascending regardless of project', async () => {
    fakeDb.seed('deadlines', [
      { id: 'd1', title: 'B', date: '2026-10-01' },
      { id: 'd2', title: 'A', date: '2026-08-01' },
    ])
    expect((await getDeadlines()).map(d => d.id)).toEqual(['d2', 'd1'])
  })

  it('getTasks orders by created_at descending', async () => {
    fakeDb.seed('tasks', [
      { id: 't1', title: 'Older', created_at: '2026-01-01T00:00:00.000Z' },
      { id: 't2', title: 'Newer', created_at: '2026-02-01T00:00:00.000Z' },
    ])
    expect((await getTasks()).map(t => t.id)).toEqual(['t2', 't1'])
  })

  it('getDatasets orders by created_at descending', async () => {
    fakeDb.seed('datasets', [
      { id: 'ds1', name: 'Older', created_at: '2026-01-01T00:00:00.000Z' },
      { id: 'ds2', name: 'Newer', created_at: '2026-02-01T00:00:00.000Z' },
    ])
    expect((await getDatasets()).map(d => d.id)).toEqual(['ds2', 'ds1'])
  })
})

describe('getDashboardData', () => {
  const NOW = Date.parse('2026-08-04T12:00:00.000Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('includes deadlines within the next 30 days but not before today or beyond 30 days', async () => {
    fakeDb.seed('deadlines', [
      { id: 'past', title: 'Past', date: '2026-08-01' },
      { id: 'soon', title: 'Soon', date: '2026-08-10' },
      { id: 'today', title: 'Today', date: '2026-08-04' },
      { id: 'far', title: 'Far', date: '2026-12-01' },
    ])
    const { upcomingDeadlines } = await getDashboardData()
    expect(upcomingDeadlines.map(d => d.id).sort()).toEqual(['soon', 'today'])
  })

  it('includes only the current member\'s open (non-done) tasks', async () => {
    fakeDb.seed('tasks', [
      { id: 't1', title: 'Mine, open', assignee_id: 'member-1', status: 'todo' },
      { id: 't2', title: 'Mine, done', assignee_id: 'member-1', status: 'done' },
      { id: 't3', title: 'Someone else\'s', assignee_id: 'member-2', status: 'todo' },
    ])
    const { myOpenTasks } = await getDashboardData()
    expect(myOpenTasks.map(t => t.id)).toEqual(['t1'])
  })

  it('includes only active projects', async () => {
    fakeDb.seed('projects', [
      { id: 'p1', name: 'Active', status: 'active', updated_at: '2026-08-01T00:00:00.000Z' },
      { id: 'p2', name: 'Planning', status: 'planning', updated_at: '2026-08-01T00:00:00.000Z' },
    ])
    const { activeProjects } = await getDashboardData()
    expect(activeProjects.map(p => p.id)).toEqual(['p1'])
  })

  it('activeProjects is also restricted to owned/tagged projects for a restricted member', async () => {
    fakeDb.seed('projects', [
      { id: 'mine', name: 'Mine', status: 'active', owner_id: 'member-1' },
      { id: 'not-mine', name: 'Not mine', status: 'active', owner_id: 'someone-else' },
    ])
    vi.mocked(requireMember).mockResolvedValueOnce({
      id: 'member-1', email: 'member@example.com', name: 'Test Member', title: null,
      is_admin: false, can_view_all_projects: false, created_at: '2026-01-01T00:00:00.000Z',
    })
    const { activeProjects } = await getDashboardData()
    expect(activeProjects.map(p => p.id)).toEqual(['mine'])
  })
})
