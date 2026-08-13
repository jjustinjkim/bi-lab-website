import { describe, it, expect } from 'vitest'
import { computeVelocity, checkpointStaleness, computeStreak, pickFocusProject, findStalledProjects } from './jjkMomentum'
import type { JjkProject } from './jjkTypes'

const NOW = new Date('2026-08-15T12:00:00.000Z')

function project(overrides: Partial<JjkProject>): JjkProject {
  return {
    id: 'p1',
    source_idea_id: null,
    pillar: 'manuscript',
    name: 'Untitled',
    stage: 'drafting',
    collaborators: null,
    target_date: null,
    notes: null,
    progress_percent: null,
    checkpoint: null,
    checkpoint_updated_at: null,
    main_project_id: null,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
    ...overrides,
  }
}

describe('computeVelocity', () => {
  it('returns null with fewer than 2 snapshots', () => {
    expect(computeVelocity([], 7, NOW)).toBeNull()
    expect(computeVelocity([{ progress_percent: 10, recorded_at: '2026-08-14T00:00:00Z' }], 7, NOW)).toBeNull()
  })

  it('computes delta over the full window when history goes back that far', () => {
    const snapshots = [
      { progress_percent: 10, recorded_at: '2026-08-01T00:00:00Z' },
      { progress_percent: 20, recorded_at: '2026-08-08T00:00:00Z' },
      { progress_percent: 45, recorded_at: '2026-08-15T00:00:00Z' },
    ]
    const result = computeVelocity(snapshots, 7, NOW)
    expect(result?.delta).toBe(25) // 45 - 20 (the snapshot at/before the 7-day cutoff)
    expect(result?.days).toBe(7)
  })

  it('falls back to the earliest snapshot and reports the shorter real span when history is younger than the window', () => {
    const snapshots = [
      { progress_percent: 0, recorded_at: '2026-08-13T00:00:00Z' },
      { progress_percent: 30, recorded_at: '2026-08-15T00:00:00Z' },
    ]
    const result = computeVelocity(snapshots, 30, NOW)
    expect(result?.delta).toBe(30)
    expect(result?.days).toBe(2)
  })

  it('handles a project that regressed (negative delta)', () => {
    const snapshots = [
      { progress_percent: 80, recorded_at: '2026-08-08T00:00:00Z' },
      { progress_percent: 50, recorded_at: '2026-08-15T00:00:00Z' },
    ]
    const result = computeVelocity(snapshots, 7, NOW)
    expect(result?.delta).toBe(-30)
  })

  it('is order-independent (unsorted input)', () => {
    const snapshots = [
      { progress_percent: 45, recorded_at: '2026-08-15T00:00:00Z' },
      { progress_percent: 10, recorded_at: '2026-08-01T00:00:00Z' },
      { progress_percent: 20, recorded_at: '2026-08-08T00:00:00Z' },
    ]
    expect(computeVelocity(snapshots, 7, NOW)?.delta).toBe(25)
  })
})

describe('checkpointStaleness', () => {
  it('returns null when there is no checkpoint timestamp', () => {
    expect(checkpointStaleness(null, NOW)).toBeNull()
  })

  it('is "fresh" under the aging threshold', () => {
    const result = checkpointStaleness('2026-08-12T12:00:00.000Z', NOW) // 3 days
    expect(result).toEqual({ days: 3, level: 'fresh' })
  })

  it('is "aging" between the two thresholds', () => {
    const result = checkpointStaleness('2026-08-06T12:00:00.000Z', NOW) // 9 days
    expect(result).toEqual({ days: 9, level: 'aging' })
  })

  it('is "stale" at or past the stale threshold', () => {
    const result = checkpointStaleness('2026-07-30T12:00:00.000Z', NOW) // 16 days
    expect(result).toEqual({ days: 16, level: 'stale' })
  })
})

describe('computeStreak', () => {
  it('is 0 with no activity', () => {
    expect(computeStreak([], NOW)).toBe(0)
  })

  it('counts today if something is logged today', () => {
    expect(computeStreak(['2026-08-15T09:00:00.000Z'], NOW)).toBe(1)
  })

  it('counts consecutive days ending yesterday if nothing is logged yet today', () => {
    const activity = ['2026-08-14T09:00:00.000Z', '2026-08-13T09:00:00.000Z']
    expect(computeStreak(activity, NOW)).toBe(2)
  })

  it('breaks on a gap', () => {
    const activity = ['2026-08-15T09:00:00.000Z', '2026-08-14T09:00:00.000Z', '2026-08-11T09:00:00.000Z']
    expect(computeStreak(activity, NOW)).toBe(2)
  })

  it('treats multiple events on the same day as one', () => {
    const activity = ['2026-08-15T09:00:00.000Z', '2026-08-15T15:00:00.000Z', '2026-08-14T09:00:00.000Z']
    expect(computeStreak(activity, NOW)).toBe(2)
  })

  it('is 0 if the most recent activity is more than a day old', () => {
    expect(computeStreak(['2026-08-10T09:00:00.000Z'], NOW)).toBe(0)
  })
})

describe('pickFocusProject', () => {
  it('returns null when nothing is in an active stage', () => {
    const projects = [project({ id: 'a', stage: 'planning' }), project({ id: 'b', stage: 'published' })]
    expect(pickFocusProject(projects)).toBeNull()
  })

  it('picks the project with the oldest checkpoint over one with a fresher checkpoint', () => {
    const projects = [
      project({ id: 'a', stage: 'drafting', checkpoint: 'Waiting on co-author', checkpoint_updated_at: '2026-08-01T00:00:00Z' }),
      project({ id: 'b', stage: 'drafting', checkpoint: 'Waiting on stats', checkpoint_updated_at: '2026-08-10T00:00:00Z' }),
    ]
    expect(pickFocusProject(projects)?.id).toBe('a')
  })

  it('falls back to least-recently-updated when no active-stage project has a checkpoint', () => {
    const projects = [
      project({ id: 'a', stage: 'drafting', updated_at: '2026-08-10T00:00:00Z' }),
      project({ id: 'b', stage: 'revision', updated_at: '2026-08-01T00:00:00Z' }),
    ]
    expect(pickFocusProject(projects)?.id).toBe('b')
  })

  it('ignores planning and published stages even if they have the oldest checkpoint', () => {
    const projects = [
      project({ id: 'a', stage: 'planning', checkpoint: 'n/a', checkpoint_updated_at: '2026-01-01T00:00:00Z' }),
      project({ id: 'b', stage: 'drafting', checkpoint: 'Waiting on stats', checkpoint_updated_at: '2026-08-10T00:00:00Z' }),
    ]
    expect(pickFocusProject(projects)?.id).toBe('b')
  })
})

describe('findStalledProjects', () => {
  it('flags active-stage projects untouched past the threshold', () => {
    const projects = [
      project({ id: 'a', stage: 'drafting', updated_at: '2026-07-25T00:00:00Z' }), // 21 days
      project({ id: 'b', stage: 'revision', updated_at: '2026-08-14T00:00:00Z' }), // 1 day
    ]
    const stalled = findStalledProjects(projects, 14, NOW)
    expect(stalled.map((p) => p.id)).toEqual(['a'])
  })

  it('ignores planning and published stages regardless of age', () => {
    const projects = [
      project({ id: 'a', stage: 'planning', updated_at: '2026-01-01T00:00:00Z' }),
      project({ id: 'b', stage: 'published', updated_at: '2026-01-01T00:00:00Z' }),
    ]
    expect(findStalledProjects(projects, 14, NOW)).toHaveLength(0)
  })
})
