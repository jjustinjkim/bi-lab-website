import { requireMember } from './auth'
import type { LabMember } from './types'

// The JJK research progress portal is visible to exactly two people --
// gated by email, not by is_admin, since there are other admins (e.g. lab
// operations staff) who should not see it. No separate password/session
// anymore: access rides on the normal lab-member login, same as every
// other /portal/* section.
const ALLOWED_EMAILS = new Set(['jkim183@mgh.harvard.edu', 'wbi@bwh.harvard.edu'])

export function isJjkAllowedEmail(email: string): boolean {
  return ALLOWED_EMAILS.has(email.toLowerCase())
}

export async function requireJjkAccess(): Promise<LabMember> {
  const member = await requireMember()
  if (!isJjkAllowedEmail(member.email)) throw new Error('Unauthorized: JJK access required')
  return member
}

export async function hasJjkAccess(): Promise<boolean> {
  try {
    await requireJjkAccess()
    return true
  } catch {
    return false
  }
}
