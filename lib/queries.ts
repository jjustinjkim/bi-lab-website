import { createAdminClient } from './supabase'
import { requireMember } from './auth'
import type { Project, LabTask, Deadline, Dataset, LabMember } from './types'

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

export async function getTasks(): Promise<LabTask[]> {
  await requireMember()
  const db = createAdminClient()
  const { data } = await db.from('tasks').select('*').order('created_at', { ascending: false })
  return data ?? []
}

export async function getTasksForProject(projectId: string): Promise<LabTask[]> {
  await requireMember()
  const db = createAdminClient()
  const { data } = await db.from('tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
  return data ?? []
}

export async function getDeadlines(): Promise<Deadline[]> {
  await requireMember()
  const db = createAdminClient()
  const { data } = await db.from('deadlines').select('*').order('date', { ascending: true })
  return data ?? []
}

export async function getDeadlinesForProject(projectId: string): Promise<Deadline[]> {
  await requireMember()
  const db = createAdminClient()
  const { data } = await db.from('deadlines').select('*').eq('project_id', projectId).order('date', { ascending: true })
  return data ?? []
}

export async function getDatasets(): Promise<Dataset[]> {
  await requireMember()
  const db = createAdminClient()
  const { data } = await db.from('datasets').select('*').order('created_at', { ascending: false })
  return data ?? []
}

export async function getDatasetsForProject(projectId: string): Promise<Dataset[]> {
  await requireMember()
  const db = createAdminClient()
  const { data } = await db.from('datasets').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
  return data ?? []
}

export interface DashboardData {
  upcomingDeadlines: Deadline[];
  myOpenTasks: LabTask[];
  activeProjects: Project[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const member = await requireMember()
  const db = createAdminClient()

  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const today = new Date().toISOString().slice(0, 10)

  const filter = await projectVisibilityFilter(db, member)
  let activeProjectsQuery = db.from('projects').select('*').eq('status', 'active')
  if (filter) activeProjectsQuery = activeProjectsQuery.or(filter)

  const [{ data: upcomingDeadlines }, { data: myOpenTasks }, { data: activeProjects }] = await Promise.all([
    db.from('deadlines').select('*').gte('date', today).lte('date', in30Days).order('date', { ascending: true }),
    db.from('tasks').select('*').eq('assignee_id', member.id).neq('status', 'done').order('due_date', { ascending: true }),
    activeProjectsQuery.order('updated_at', { ascending: false }),
  ])

  return {
    upcomingDeadlines: upcomingDeadlines ?? [],
    myOpenTasks: myOpenTasks ?? [],
    activeProjects: activeProjects ?? [],
  }
}
