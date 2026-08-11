import { createAdminClient } from './supabase'
import { requireMember } from './auth'
import type { Project, LabMember, Grant, ProjectIdea, ProjectIdeaVote } from './types'

type Db = ReturnType<typeof createAdminClient>

// Anyone with can_view_all_projects (just the PI, by default) sees
// everything -- returns null, meaning "don't filter." Everyone else only
// sees projects they own or were explicitly tagged onto via project_members
// (not the freeform personnel/faculty text, which names plenty of people
// who never get portal accounts). Returns a Supabase .or() filter string.
async function projectVisibilityFilter(db: Db, member: LabMember): Promise<string | null> {
  if (member.can_view_all_projects) return null
  const { data: tags } = await db.from('project_members').select('project_id').eq('member_id', member.id)
  const taggedIds = (tags ?? []).map((t: { project_id: string }) => t.project_id)
  const clauses = [`owner_id.eq.${member.id}`]
  if (taggedIds.length > 0) clauses.push(`id.in.(${taggedIds.join(',')})`)
  return clauses.join(',')
}

export async function getLabMembers(): Promise<LabMember[]> {
  await requireMember()
  const db = createAdminClient()
  const { data } = await db.from('lab_members').select('*').order('name')
  return data ?? []
}

export async function getProjects(): Promise<Project[]> {
  const member = await requireMember()
  const db = createAdminClient()
  let query = db.from('projects').select('*')
  const filter = await projectVisibilityFilter(db, member)
  if (filter) query = query.or(filter)
  const { data } = await query.order('updated_at', { ascending: false })
  return data ?? []
}

export async function getProject(id: string): Promise<Project | null> {
  const member = await requireMember()
  const db = createAdminClient()
  let query = db.from('projects').select('*').eq('id', id)
  const filter = await projectVisibilityFilter(db, member)
  if (filter) query = query.or(filter)
  const { data } = await query.single()
  return data ?? null
}

export async function getProjectMemberIds(projectId: string): Promise<string[]> {
  await requireMember()
  const db = createAdminClient()
  const { data } = await db.from('project_members').select('member_id').eq('project_id', projectId)
  return (data ?? []).map((r) => r.member_id)
}

// Unfiltered by project visibility -- grant opportunities are lab-wide
// knowledge every member should see, not scoped by who owns/is tagged on a
// project.
export async function getGrants(): Promise<Grant[]> {
  await requireMember()
  const db = createAdminClient()
  const { data } = await db.from('grants').select('*').order('deadline_date', { ascending: true, nullsFirst: false })
  return data ?? []
}

// Not scoped by project visibility, same reasoning as getGrants(): a
// brainstormed idea is lab-wide knowledge until it's promoted into an
// actual project, not private to whoever created it.
export async function getProjectIdeas(): Promise<ProjectIdea[]> {
  await requireMember()
  const db = createAdminClient()
  const { data } = await db.from('project_ideas').select('*').order('created_at', { ascending: false })
  return data ?? []
}

export async function getProjectIdeaVotes(): Promise<ProjectIdeaVote[]> {
  await requireMember()
  const db = createAdminClient()
  const { data } = await db.from('project_idea_votes').select('*')
  return data ?? []
}

export interface DashboardData {
  activeProjects: Project[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const member = await requireMember()
  const db = createAdminClient()

  const filter = await projectVisibilityFilter(db, member)
  let activeProjectsQuery = db.from('projects').select('*').eq('status', 'active')
  if (filter) activeProjectsQuery = activeProjectsQuery.or(filter)

  const { data: activeProjects } = await activeProjectsQuery.order('updated_at', { ascending: false })

  return {
    activeProjects: activeProjects ?? [],
  }
}
