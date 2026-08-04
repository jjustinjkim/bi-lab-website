import { createAdminClient } from './supabase'
import { requireMember } from './auth'
import type { Project, LabTask, Deadline, Dataset, LabMember } from './types'

export async function getLabMembers(): Promise<LabMember[]> {
  await requireMember()
  const db = createAdminClient()
  const { data } = await db.from('lab_members').select('*').order('name')
  return data ?? []
}

export async function getProjects(): Promise<Project[]> {
  await requireMember()
  const db = createAdminClient()
  const { data } = await db.from('projects').select('*').order('updated_at', { ascending: false })
  return data ?? []
}

export async function getProject(id: string): Promise<Project | null> {
  await requireMember()
  const db = createAdminClient()
  const { data } = await db.from('projects').select('*').eq('id', id).single()
  return data ?? null
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

  const [{ data: upcomingDeadlines }, { data: myOpenTasks }, { data: activeProjects }] = await Promise.all([
    db.from('deadlines').select('*').gte('date', today).lte('date', in30Days).order('date', { ascending: true }),
    db.from('tasks').select('*').eq('assignee_id', member.id).neq('status', 'done').order('due_date', { ascending: true }),
    db.from('projects').select('*').eq('status', 'active').order('updated_at', { ascending: false }),
  ])

  return {
    upcomingDeadlines: upcomingDeadlines ?? [],
    myOpenTasks: myOpenTasks ?? [],
    activeProjects: activeProjects ?? [],
  }
}
