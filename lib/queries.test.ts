import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FakeDb } from './testUtils/fakeSupabase'

// Exercises the read logic in queries.ts against an in-memory fake DB.
// Auth (requireMember) is stubbed out -- these tests are about whether each
// query returns the right rows in the right order, not about access control.

const fakeDb = new FakeDb()
const CURRENT_MEMBER = { id: 'member-1', email: 'member@example.com', name: 'Test Member', title: null, is_admin: false, created_at: '2026-01-01T00:00:00.000Z' }

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
})
