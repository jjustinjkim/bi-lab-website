// Pure functions behind the JJK portal's "make it stimulate progress, not
// just reflect it" features: velocity (progress change over a window,
// makes stalled projects visible as a number instead of requiring you to
// notice), checkpoint staleness (how long the same blocker has sat there),
// a daily activity streak, and picking the one project to put in front of
// you instead of a full menu. All take `now` as a parameter for testing.

import type { JjkProject } from './jjkTypes'

export interface ProgressPoint {
  progress_percent: number
  recorded_at: string
}

const DEFAULT_ACTIVE_STAGES = ['drafting', 'under_review', 'revision']

// The "Right now" card's selection: among projects actually being worked
// (not planning, not published), prefer the one whose checkpoint has sat
// unchanged the longest -- that's the thing most worth unsticking. If none
// of the active-stage projects have a checkpoint set at all, falls back to
// whichever was least recently touched. Returns null if nothing's active.
export function pickFocusProject(projects: JjkProject[], activeStages: string[] = DEFAULT_ACTIVE_STAGES): JjkProject | null {
  const active = projects.filter((p) => activeStages.includes(p.stage))
  if (active.length === 0) return null

  const withCheckpoint = active.filter((p) => p.checkpoint_updated_at)
  const pool = withCheckpoint.length > 0 ? withCheckpoint : active

  return pool.reduce((oldest, p) => {
    const pTime = new Date(p.checkpoint_updated_at ?? p.updated_at).getTime()
    const oldestTime = new Date(oldest.checkpoint_updated_at ?? oldest.updated_at).getTime()
    return pTime < oldestTime ? p : oldest
  })
}

export interface Velocity {
  delta: number
  days: number
}

// Change in progress over the last `windowDays`: latest snapshot minus the
// latest snapshot at or before the cutoff. If history doesn't go back that
// far yet, uses the earliest snapshot instead and reports the shorter
// actual span, rather than pretending the window is longer than the data.
// Returns null with fewer than 2 snapshots -- nothing to compare against.
export function computeVelocity(snapshots: ProgressPoint[], windowDays: number, now: Date = new Date()): Velocity | null {
  if (snapshots.length < 2) return null
  const sorted = [...snapshots].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
  const latest = sorted[sorted.length - 1]
  const cutoffMs = now.getTime() - windowDays * 86_400_000

  let baseline = sorted[0]
  for (const s of sorted) {
    if (new Date(s.recorded_at).getTime() <= cutoffMs) baseline = s
    else break
  }

  const delta = latest.progress_percent - baseline.progress_percent
  const spanMs = new Date(latest.recorded_at).getTime() - new Date(baseline.recorded_at).getTime()
  const days = Math.min(windowDays, Math.max(0, Math.round(spanMs / 86_400_000)))
  return { delta, days }
}

export type StalenessLevel = 'fresh' | 'aging' | 'stale'

export interface Staleness {
  days: number
  level: StalenessLevel
}

const AGING_THRESHOLD_DAYS = 7
const STALE_THRESHOLD_DAYS = 14

// How long the current checkpoint (the blocker) has sat unchanged. null
// when there's no checkpoint at all, or it's never been touched (no
// checkpoint_updated_at) -- distinct from "fresh," which means it exists
// and was recently set.
export function checkpointStaleness(checkpointUpdatedAt: string | null, now: Date = new Date()): Staleness | null {
  if (!checkpointUpdatedAt) return null
  const days = Math.floor((now.getTime() - new Date(checkpointUpdatedAt).getTime()) / 86_400_000)
  const level: StalenessLevel = days >= STALE_THRESHOLD_DAYS ? 'stale' : days >= AGING_THRESHOLD_DAYS ? 'aging' : 'fresh'
  return { days, level }
}

// Consecutive days (ending today, or yesterday if nothing's logged yet
// today so the streak doesn't look reset before the day is even over) with
// at least one activity timestamp. One event on a day is enough. Day
// boundaries are UTC-based (a deliberate simplification, not local time).
export function computeStreak(activityTimestamps: string[], now: Date = new Date()): number {
  const days = new Set(activityTimestamps.map((t) => new Date(t).toISOString().slice(0, 10)))
  const todayStr = now.toISOString().slice(0, 10)

  let cursor = days.has(todayStr) ? now : new Date(now.getTime() - 86_400_000)
  let streak = 0
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++
    cursor = new Date(cursor.getTime() - 86_400_000)
  }
  return streak
}

const STALLED_ACTIVE_STAGES = new Set(['drafting', 'under_review', 'revision'])

// Active-stage projects (not planning, not published) that haven't been
// touched in `thresholdDays` -- the Ideas page's nudge to look at existing
// work before starting something new.
export function findStalledProjects(projects: JjkProject[], thresholdDays: number, now: Date = new Date()): JjkProject[] {
  return projects.filter(
    (p) => STALLED_ACTIVE_STAGES.has(p.stage) && (now.getTime() - new Date(p.updated_at).getTime()) / 86_400_000 >= thresholdDays
  )
}
