import { createAdminClient } from './supabase'
import { requireJjk } from './jjkAuth'
import type { JjkBigIdea, JjkProject, JjkProjectUpdate, JjkPresentationOpportunity } from './jjkTypes'

// Single-user tool -- unlike lib/queries.ts's getProjects()/getGrants(),
// there's no per-caller visibility filter to apply, just the one auth check.

export async function getBigIdeas(): Promise<JjkBigIdea[]> {
  await requireJjk()
  const db = createAdminClient()
  const { data } = await db.from('jjk_big_ideas').select('*').order('created_at', { ascending: false })
  return data ?? []
}

export async function getBigIdea(id: string): Promise<JjkBigIdea | null> {
  await requireJjk()
  const db = createAdminClient()
  const { data } = await db.from('jjk_big_ideas').select('*').eq('id', id).maybeSingle()
  return data ?? null
}

export async function getJjkProjects(): Promise<JjkProject[]> {
  await requireJjk()
  const db = createAdminClient()
  const { data } = await db.from('jjk_projects').select('*').order('updated_at', { ascending: false })
  return data ?? []
}

export async function getJjkProject(id: string): Promise<JjkProject | null> {
  await requireJjk()
  const db = createAdminClient()
  const { data } = await db.from('jjk_projects').select('*').eq('id', id).maybeSingle()
  return data ?? null
}

export async function getJjkProjectUpdates(projectId: string): Promise<JjkProjectUpdate[]> {
  await requireJjk()
  const db = createAdminClient()
  const { data } = await db.from('jjk_project_updates').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
  return data ?? []
}

export async function getPresentationOpportunities(): Promise<JjkPresentationOpportunity[]> {
  await requireJjk()
  const db = createAdminClient()
  const { data } = await db.from('jjk_presentation_opportunities').select('*').order('deadline_date', { ascending: true, nullsFirst: false })
  return data ?? []
}
