'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from './supabase'
import { requireJjkAccess } from './jjkAccess'
import { getJjkProject } from './jjkQueries'
import type { JjkPillar, JjkProjectStage, JjkPresentationStatus } from './jjkTypes'

const BIG_IDEA_STEP_FIELDS = ['spark', 'why_it_matters', 'feasibility_notes', 'specific_aim', 'next_step', 'next_step_target_date'] as const
export type BigIdeaStepField = (typeof BIG_IDEA_STEP_FIELDS)[number]

// ── Ideas ─────────────────────────────────────────────────────────────────

export async function createBigIdea(pillar: JjkPillar, title: string): Promise<{ error?: string; id?: string }> {
  await requireJjkAccess()
  const trimmed = title.trim()
  if (!trimmed) return { error: 'Title is required.' }

  const db = createAdminClient()
  const { data, error } = await db.from('jjk_big_ideas').insert({ pillar, title: trimmed }).select('id').single()
  if (error || !data) return { error: error?.message ?? 'Failed to create idea.' }
  revalidatePath('/portal/jjk/ideas')
  revalidatePath('/portal/jjk')
  return { id: data.id }
}

// Generic setter for any one of the 5 wizard steps (or its target date) --
// saved independently so leaving the wizard mid-way never loses partial
// progress on the other fields.
export async function updateBigIdeaStep(ideaId: string, field: BigIdeaStepField, value: string): Promise<{ error?: string }> {
  await requireJjkAccess()
  if (!BIG_IDEA_STEP_FIELDS.includes(field)) return { error: 'Unknown field.' }

  const db = createAdminClient()
  const { error } = await db.from('jjk_big_ideas').update({ [field]: value || null }).eq('id', ideaId)
  if (error) return { error: error.message }
  revalidatePath(`/portal/jjk/ideas/${ideaId}`)
  revalidatePath('/portal/jjk/ideas')
  return {}
}

export async function setBigIdeaStatus(id: string, status: 'active' | 'archived'): Promise<{ error?: string }> {
  await requireJjkAccess()
  const db = createAdminClient()
  const { error } = await db.from('jjk_big_ideas').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/portal/jjk/ideas')
  revalidatePath(`/portal/jjk/ideas/${id}`)
  return {}
}

export async function deleteBigIdea(id: string): Promise<{ error?: string }> {
  await requireJjkAccess()
  const db = createAdminClient()
  const { error } = await db.from('jjk_big_ideas').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/portal/jjk/ideas')
  return {}
}

// Turns a clarified idea into an active project. pillar carries over
// unchanged; stage always starts at 'planning' regardless of how far the
// idea's own wizard steps got.
export async function promoteBigIdea(ideaId: string, projectName: string): Promise<{ error?: string; projectId?: string }> {
  await requireJjkAccess()
  const db = createAdminClient()

  const { data: idea, error: fetchError } = await db.from('jjk_big_ideas').select('*').eq('id', ideaId).single()
  if (fetchError || !idea) return { error: 'Idea not found.' }
  if (idea.status === 'promoted') return { error: 'This idea was already promoted.' }

  const { data: project, error: insertError } = await db
    .from('jjk_projects')
    .insert({
      source_idea_id: ideaId,
      pillar: idea.pillar,
      name: projectName.trim() || idea.title,
      stage: 'planning',
      notes: idea.next_step ? `Promoted from Ideas. Next step: ${idea.next_step}` : 'Promoted from Ideas.',
    })
    .select('id')
    .single()
  if (insertError || !project) return { error: insertError?.message ?? 'Failed to create project.' }

  const { error: updateError } = await db
    .from('jjk_big_ideas')
    .update({ status: 'promoted', promoted_project_id: project.id, promoted_at: new Date().toISOString() })
    .eq('id', ideaId)
  if (updateError) return { error: updateError.message }

  revalidatePath('/portal/jjk/ideas')
  revalidatePath('/portal/jjk/projects')
  revalidatePath('/portal/jjk')
  return { projectId: project.id }
}

// ── Projects (execution layer) ──────────────────────────────────────────

function intOrNull(formData: FormData, key: string, min?: number, max?: number): number | null {
  const raw = formData.get(key) as string
  if (!raw) return null
  const n = parseInt(raw, 10)
  if (Number.isNaN(n)) return null
  if (min != null && n < min) return min
  if (max != null && n > max) return max
  return n
}

// Only inserted when the value is actually set (not on every save) --
// jjk_project_progress_log is history for velocity, not an audit log of
// every edit that happened not to touch progress.
async function recordProgressSnapshot(db: ReturnType<typeof createAdminClient>, projectId: string, progressPercent: number) {
  await db.from('jjk_project_progress_log').insert({ project_id: projectId, progress_percent: progressPercent })
}

export async function createJjkProject(formData: FormData): Promise<{ error?: string }> {
  await requireJjkAccess()
  const db = createAdminClient()

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Name is required.' }
  const pillar = formData.get('pillar') as string
  if (!pillar) return { error: 'Pillar is required.' }
  const progressPercent = intOrNull(formData, 'progress_percent', 0, 100)

  const { data: project, error } = await db
    .from('jjk_projects')
    .insert({
      name,
      pillar,
      stage: (formData.get('stage') as string) || 'planning',
      collaborators: (formData.get('collaborators') as string) || null,
      target_date: (formData.get('target_date') as string) || null,
      notes: (formData.get('notes') as string) || null,
      progress_percent: progressPercent,
      checkpoint: (formData.get('checkpoint') as string) || null,
    })
    .select('id')
    .single()
  if (error) return { error: error.message }
  if (progressPercent != null && project) await recordProgressSnapshot(db, project.id, progressPercent)
  revalidatePath('/portal/jjk/projects')
  revalidatePath('/portal/jjk')
  return {}
}

export async function updateJjkProjectMeta(id: string, formData: FormData): Promise<{ error?: string }> {
  await requireJjkAccess()
  const db = createAdminClient()

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Name is required.' }
  const progressPercent = intOrNull(formData, 'progress_percent', 0, 100)

  const { data: before } = await db.from('jjk_projects').select('progress_percent').eq('id', id).maybeSingle()

  const { error } = await db
    .from('jjk_projects')
    .update({
      name,
      pillar: formData.get('pillar') as string,
      collaborators: (formData.get('collaborators') as string) || null,
      target_date: (formData.get('target_date') as string) || null,
      notes: (formData.get('notes') as string) || null,
      progress_percent: progressPercent,
      checkpoint: (formData.get('checkpoint') as string) || null,
    })
    .eq('id', id)
  if (error) return { error: error.message }
  if (progressPercent != null && progressPercent !== before?.progress_percent) {
    await recordProgressSnapshot(db, id, progressPercent)
  }
  revalidatePath(`/portal/jjk/projects/${id}`)
  revalidatePath('/portal/jjk/projects')
  revalidatePath('/portal/jjk')
  return {}
}

export async function updateJjkProjectStage(id: string, stage: JjkProjectStage): Promise<{ error?: string }> {
  await requireJjkAccess()
  const db = createAdminClient()
  const { error } = await db.from('jjk_projects').update({ stage }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/portal/jjk/projects/${id}`)
  revalidatePath('/portal/jjk/projects')
  revalidatePath('/portal/jjk')
  return {}
}

export async function deleteJjkProject(id: string): Promise<{ error?: string }> {
  await requireJjkAccess()
  const db = createAdminClient()
  const { error } = await db.from('jjk_projects').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/portal/jjk/projects')
  revalidatePath('/portal/jjk')
  return {}
}

export async function addJjkProjectUpdate(projectId: string, body: string): Promise<{ error?: string }> {
  await requireJjkAccess()
  const trimmed = body.trim()
  if (!trimmed) return { error: 'Update text is required.' }

  // Confirms the project exists before writing a log entry against it --
  // cheap sanity check, mirrors getProject()-before-write in lib/actions.ts.
  const project = await getJjkProject(projectId)
  if (!project) return { error: 'Project not found.' }

  const db = createAdminClient()
  const { error } = await db.from('jjk_project_updates').insert({ project_id: projectId, body: trimmed })
  if (error) return { error: error.message }
  revalidatePath(`/portal/jjk/projects/${projectId}`)
  return {}
}

// ── Presentation opportunities (expansion layer) ────────────────────────

export async function createPresentationOpportunity(formData: FormData): Promise<{ error?: string }> {
  await requireJjkAccess()
  const db = createAdminClient()

  const title = (formData.get('title') as string)?.trim()
  if (!title) return { error: 'Title is required.' }

  const { error } = await db.from('jjk_presentation_opportunities').insert({
    title,
    venue: (formData.get('venue') as string) || null,
    type: (formData.get('type') as string) || 'other',
    deadline_date: (formData.get('deadline_date') as string) || null,
    event_date: (formData.get('event_date') as string) || null,
    status: (formData.get('status') as string) || 'identified',
    project_id: (formData.get('project_id') as string) || null,
    notes: (formData.get('notes') as string) || null,
  })
  if (error) return { error: error.message }
  revalidatePath('/portal/jjk/presentations')
  revalidatePath('/portal/jjk')
  return {}
}

export async function updatePresentationTracking(
  id: string,
  status: JjkPresentationStatus,
  deadlineDate: string,
  eventDate: string
): Promise<{ error?: string }> {
  await requireJjkAccess()
  const db = createAdminClient()
  const { error } = await db
    .from('jjk_presentation_opportunities')
    .update({ status, deadline_date: deadlineDate || null, event_date: eventDate || null })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/portal/jjk/presentations')
  revalidatePath('/portal/jjk')
  return {}
}

export async function deletePresentationOpportunity(id: string): Promise<{ error?: string }> {
  await requireJjkAccess()
  const db = createAdminClient()
  const { error } = await db.from('jjk_presentation_opportunities').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/portal/jjk/presentations')
  return {}
}
