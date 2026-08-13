import { createAdminClient } from './supabase'
import { requireJjkAccess } from './jjkAccess'
import type { JjkBigIdea, JjkProject, JjkProjectUpdate, JjkPresentationOpportunity, JjkProgressSnapshot } from './jjkTypes'

// Single-user tool -- unlike lib/queries.ts's getProjects()/getGrants(),
// there's no per-caller visibility filter to apply, just the one auth check.

export async function getBigIdeas(): Promise<JjkBigIdea[]> {
  await requireJjkAccess()
  const db = createAdminClient()
  const { data } = await db.from('jjk_big_ideas').select('*').order('created_at', { ascending: false })
  return data ?? []
}

export async function getBigIdea(id: string): Promise<JjkBigIdea | null> {
  await requireJjkAccess()
  const db = createAdminClient()
  const { data } = await db.from('jjk_big_ideas').select('*').eq('id', id).maybeSingle()
  return data ?? null
}

export async function getJjkProjects(): Promise<JjkProject[]> {
  await requireJjkAccess()
  const db = createAdminClient()
  const { data } = await db.from('jjk_projects').select('*').order('updated_at', { ascending: false })
  return data ?? []
}

export async function getJjkProject(id: string): Promise<JjkProject | null> {
  await requireJjkAccess()
  const db = createAdminClient()
  const { data } = await db.from('jjk_projects').select('*').eq('id', id).maybeSingle()
  return data ?? null
}

export async function getJjkProjectUpdates(projectId: string): Promise<JjkProjectUpdate[]> {
  await requireJjkAccess()
  const db = createAdminClient()
  const { data } = await db.from('jjk_project_updates').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
  return data ?? []
}

export async function getPresentationOpportunities(): Promise<JjkPresentationOpportunity[]> {
  await requireJjkAccess()
  const db = createAdminClient()
  const { data } = await db.from('jjk_presentation_opportunities').select('*').order('deadline_date', { ascending: true, nullsFirst: false })
  return data ?? []
}

// All snapshots across all projects, not scoped to one -- the Projects list
// needs every project's velocity in one query rather than N round trips.
export async function getAllJjkProgressSnapshots(): Promise<JjkProgressSnapshot[]> {
  await requireJjkAccess()
  const db = createAdminClient()
  const { data } = await db.from('jjk_project_progress_log').select('*').order('recorded_at', { ascending: true })
  return data ?? []
}

// Timestamps only, from both activity sources (a logged update, or a
// progress change) -- the streak only cares whether *something* happened
// on a given day, not what.
export async function getJjkActivityTimestamps(): Promise<string[]> {
  await requireJjkAccess()
  const db = createAdminClient()
  const [updates, snapshots] = await Promise.all([
    db.from('jjk_project_updates').select('created_at'),
    db.from('jjk_project_progress_log').select('recorded_at'),
  ])
  return [
    ...(updates.data ?? []).map((u) => u.created_at as string),
    ...(snapshots.data ?? []).map((s) => s.recorded_at as string),
  ]
}
