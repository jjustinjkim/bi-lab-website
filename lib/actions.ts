'use server'

import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from './supabase'
import { requireMember, requireAdmin } from './auth'
import { escapeLikePattern } from './escape'

const SESSION_COOKIE = 'bilab_portal_session'
const COOKIE_OPTS = { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 60 }

// Rate-limit is scoped per-email (not global): a global lockout would let
// one person's mistyped password lock out every other lab member.
const LOCKOUT_THRESHOLD = 10
const LOCKOUT_WINDOW_MINUTES = 15

// ── Auth ──────────────────────────────────────────────────────────────────

export async function loginMember(email: string, password: string): Promise<{ error?: string }> {
  const db = createAdminClient()
  const normalized = email.toLowerCase().trim()

  const windowStart = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000).toISOString()
  const { count: recentFailures } = await db
    .from('member_login_attempts')
    .select('id', { count: 'exact', head: true })
    .ilike('email', escapeLikePattern(normalized))
    .gte('created_at', windowStart)

  if ((recentFailures ?? 0) >= LOCKOUT_THRESHOLD) {
    return { error: 'Too many failed attempts for this account. Try again in a few minutes.' }
  }

  const { data: member } = await db
    .from('lab_members')
    .select('id, password_hash')
    .ilike('email', escapeLikePattern(normalized))
    .single()

  const passwordOk = member ? await bcrypt.compare(password, member.password_hash) : false

  if (!member || !passwordOk) {
    await db.from('member_login_attempts').insert({ email: normalized })
    await db.from('member_login_attempts').delete().lt('created_at', windowStart)
    return { error: 'Incorrect email or password.' }
  }

  const { data: session, error } = await db
    .from('member_sessions')
    .insert({ member_id: member.id })
    .select('token')
    .single()

  if (error || !session) return { error: 'Failed to create session. Try again.' }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, session.token, COOKIE_OPTS)
  return {}
}

export async function logout() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) {
    const db = createAdminClient()
    await db.from('member_sessions').delete().eq('token', token)
  }
  cookieStore.delete(SESSION_COOKIE)
  redirect('/portal/login')
}

export async function createLabMember(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin()
  const db = createAdminClient()

  const email = (formData.get('email') as string).toLowerCase().trim()
  const name = formData.get('name') as string
  const title = (formData.get('title') as string) || null
  const password = formData.get('password') as string
  const isAdmin = formData.get('is_admin') === 'on'
  const canViewAllProjects = formData.get('can_view_all_projects') === 'on'

  if (!password || password.length < 8) return { error: 'Password must be at least 8 characters.' }

  const { data: existing } = await db.from('lab_members').select('id').ilike('email', escapeLikePattern(email)).limit(1)
  if (existing && existing.length > 0) return { error: 'A lab member with this email already exists.' }

  const passwordHash = await bcrypt.hash(password, 10)
  const { error } = await db
    .from('lab_members')
    .insert({ email, name, title, is_admin: isAdmin, can_view_all_projects: canViewAllProjects, password_hash: passwordHash })
  if (error) return { error: error.message }
  return {}
}

export async function deleteLabMember(id: string): Promise<{ error?: string }> {
  const actingMember = await requireAdmin()
  if (actingMember.id === id) return { error: 'You cannot remove your own account while logged in as it.' }

  const db = createAdminClient()
  const { error } = await db.from('lab_members').delete().eq('id', id)
  if (error) return { error: error.message }
  return {}
}

export async function setCanViewAllProjects(id: string, canViewAll: boolean): Promise<{ error?: string }> {
  await requireAdmin()
  const db = createAdminClient()
  const { error } = await db.from('lab_members').update({ can_view_all_projects: canViewAll }).eq('id', id)
  if (error) return { error: error.message }
  return {}
}

// ── Projects ──────────────────────────────────────────────────────────────

function intOrNull(formData: FormData, key: string, min?: number, max?: number): number | null {
  const raw = formData.get(key) as string
  if (!raw) return null
  const n = parseInt(raw, 10)
  if (Number.isNaN(n)) return null
  if (min != null && n < min) return min
  if (max != null && n > max) return max
  return n
}

function trackerFields(formData: FormData) {
  return {
    group_type: (formData.get('group_type') as string) || null,
    faculty: (formData.get('faculty') as string) || null,
    personnel: (formData.get('personnel') as string) || null,
    work_percent: intOrNull(formData, 'work_percent', 0, 100),
    pub_status: (formData.get('pub_status') as string) || null,
    meeting: (formData.get('meeting') as string) || null,
    deadline_date: (formData.get('deadline_date') as string) || null,
    checkpoint: (formData.get('checkpoint') as string) || null,
    journal: (formData.get('journal') as string) || null,
    pub_year: intOrNull(formData, 'pub_year'),
    pubmed_url: (formData.get('pubmed_url') as string) || null,
  }
}

export async function createProject(formData: FormData): Promise<{ error?: string }> {
  const member = await requireMember()
  const db = createAdminClient()

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Name is required.' }

  const { error } = await db.from('projects').insert({
    name,
    description: (formData.get('description') as string) || null,
    status: (formData.get('status') as string) || 'planning',
    owner_id: member.id,
    notes: (formData.get('notes') as string) || null,
    ...trackerFields(formData),
  })
  if (error) return { error: error.message }
  return {}
}

export async function updateProject(id: string, formData: FormData): Promise<{ error?: string }> {
  await requireMember()
  const db = createAdminClient()

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Name is required.' }

  const { error } = await db
    .from('projects')
    .update({
      name,
      description: (formData.get('description') as string) || null,
      status: (formData.get('status') as string) || 'planning',
      notes: (formData.get('notes') as string) || null,
      ...trackerFields(formData),
    })
    .eq('id', id)
  if (error) return { error: error.message }
  return {}
}

export async function deleteProject(id: string): Promise<{ error?: string }> {
  await requireMember()
  const db = createAdminClient()
  const { error } = await db.from('projects').delete().eq('id', id)
  if (error) return { error: error.message }
  return {}
}

// Replaces the full set of tagged members for a project with whatever was
// checked in the form (rather than incremental add/remove calls) -- simpler
// to reason about and avoids partial-failure states.
export async function setProjectMembers(projectId: string, formData: FormData): Promise<{ error?: string }> {
  await requireMember()
  const db = createAdminClient()

  const memberIds = formData.getAll('member_ids') as string[]

  const { error: deleteError } = await db.from('project_members').delete().eq('project_id', projectId)
  if (deleteError) return { error: deleteError.message }

  if (memberIds.length > 0) {
    const { error: insertError } = await db
      .from('project_members')
      .insert(memberIds.map((memberId) => ({ project_id: projectId, member_id: memberId })))
    if (insertError) return { error: insertError.message }
  }
  return {}
}

// ── Tasks ─────────────────────────────────────────────────────────────────

export async function createTask(formData: FormData): Promise<{ error?: string }> {
  await requireMember()
  const db = createAdminClient()

  const title = (formData.get('title') as string)?.trim()
  if (!title) return { error: 'Title is required.' }

  const projectId = (formData.get('project_id') as string) || null
  const assigneeId = (formData.get('assignee_id') as string) || null
  const dueDate = (formData.get('due_date') as string) || null

  const { error } = await db.from('tasks').insert({
    title,
    description: (formData.get('description') as string) || null,
    project_id: projectId,
    assignee_id: assigneeId,
    status: (formData.get('status') as string) || 'todo',
    due_date: dueDate,
  })
  if (error) return { error: error.message }
  return {}
}

export async function updateTaskStatus(id: string, status: string): Promise<{ error?: string }> {
  await requireMember()
  const db = createAdminClient()
  const { error } = await db.from('tasks').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  return {}
}

export async function deleteTask(id: string): Promise<{ error?: string }> {
  await requireMember()
  const db = createAdminClient()
  const { error } = await db.from('tasks').delete().eq('id', id)
  if (error) return { error: error.message }
  return {}
}

// ── Deadlines ─────────────────────────────────────────────────────────────

export async function createDeadline(formData: FormData): Promise<{ error?: string }> {
  await requireMember()
  const db = createAdminClient()

  const title = (formData.get('title') as string)?.trim()
  const date = formData.get('date') as string
  if (!title || !date) return { error: 'Title and date are required.' }

  const { error } = await db.from('deadlines').insert({
    title,
    type: (formData.get('type') as string) || 'other',
    date,
    project_id: (formData.get('project_id') as string) || null,
    notes: (formData.get('notes') as string) || null,
  })
  if (error) return { error: error.message }
  return {}
}

export async function deleteDeadline(id: string): Promise<{ error?: string }> {
  await requireMember()
  const db = createAdminClient()
  const { error } = await db.from('deadlines').delete().eq('id', id)
  if (error) return { error: error.message }
  return {}
}

// ── Datasets ──────────────────────────────────────────────────────────────

export async function createDataset(formData: FormData): Promise<{ error?: string }> {
  await requireMember()
  const db = createAdminClient()

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Name is required.' }

  const sampleCountRaw = formData.get('sample_count') as string
  const sampleCount = sampleCountRaw ? parseInt(sampleCountRaw, 10) : null

  const { error } = await db.from('datasets').insert({
    name,
    description: (formData.get('description') as string) || null,
    location: (formData.get('location') as string) || null,
    sample_count: Number.isFinite(sampleCount) ? sampleCount : null,
    processing_status: (formData.get('processing_status') as string) || null,
    project_id: (formData.get('project_id') as string) || null,
  })
  if (error) return { error: error.message }
  return {}
}

export async function deleteDataset(id: string): Promise<{ error?: string }> {
  await requireMember()
  const db = createAdminClient()
  const { error } = await db.from('datasets').delete().eq('id', id)
  if (error) return { error: error.message }
  return {}
}
