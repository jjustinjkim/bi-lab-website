'use server'

import { cookies } from 'next/headers'
import { createAdminClient } from './supabase'
import type { LabMember } from './types'

const SESSION_COOKIE = 'bilab_portal_session'

interface MemberSessionRow {
  member_id: string
  expires_at: string
  lab_members: LabMember
}

export async function getSessionMember(): Promise<LabMember | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const db = createAdminClient()
  const { data } = await db
    .from('member_sessions')
    .select('member_id, expires_at, lab_members(id, email, name, title, is_admin, can_view_all_projects, created_at)')
    .eq('token', token)
    .single()

  if (!data) return null
  if (new Date(data.expires_at) < new Date()) return null

  return (data as unknown as MemberSessionRow).lab_members
}

export async function isMemberSession(): Promise<boolean> {
  return (await getSessionMember()) !== null
}

export async function requireMember(): Promise<LabMember> {
  const member = await getSessionMember()
  if (!member) throw new Error('Unauthorized')
  return member
}

export async function requireAdmin(): Promise<LabMember> {
  const member = await requireMember()
  if (!member.is_admin) throw new Error('Unauthorized: admin access required')
  return member
}
