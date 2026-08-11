'use server'

import bcrypt from 'bcryptjs'
import { headers, cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from './supabase'

// Standalone gate for the JJK research progress portal (/portal/jjk/*) --
// deliberately separate from lab_members/member_sessions in ./auth.ts.
// This section is Justin-only, so it's one shared password (not per-account
// like the rest of /portal), but otherwise follows the same house pattern:
// bcrypt hash in an env var, a real DB-backed session (revocable, unlike a
// signed cookie), IP-based lockout on repeated failures.
const SESSION_COOKIE = 'bilab_jjk_session'
const COOKIE_OPTS = { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 60 }

const LOCKOUT_THRESHOLD = 8
const LOCKOUT_WINDOW_MINUTES = 15

async function clientIp(): Promise<string> {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? 'unknown'
}

export async function loginJjk(password: string): Promise<{ error?: string }> {
  const db = createAdminClient()
  const ip = await clientIp()

  const windowStart = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000).toISOString()
  const { count: recentFailures } = await db
    .from('jjk_login_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', windowStart)

  if ((recentFailures ?? 0) >= LOCKOUT_THRESHOLD) {
    return { error: 'Too many failed attempts. Try again in a few minutes.' }
  }

  const hash = process.env.JJK_PASSWORD_HASH
  const passwordOk = hash ? await bcrypt.compare(password, hash) : false

  if (!passwordOk) {
    await db.from('jjk_login_attempts').insert({ ip })
    await db.from('jjk_login_attempts').delete().lt('created_at', windowStart)
    return { error: 'Incorrect password.' }
  }

  const { data: session, error } = await db.from('jjk_sessions').insert({}).select('token').single()
  if (error || !session) return { error: 'Failed to create session. Try again.' }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, session.token, COOKIE_OPTS)
  return {}
}

export async function logoutJjk() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) {
    const db = createAdminClient()
    await db.from('jjk_sessions').delete().eq('token', token)
  }
  cookieStore.delete(SESSION_COOKIE)
  redirect('/portal/jjk/login')
}

export async function getJjkSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return false

  const db = createAdminClient()
  const { data } = await db.from('jjk_sessions').select('expires_at').eq('token', token).single()
  if (!data) return false
  return new Date(data.expires_at) >= new Date()
}

export async function requireJjk(): Promise<void> {
  if (!(await getJjkSession())) throw new Error('Unauthorized')
}
