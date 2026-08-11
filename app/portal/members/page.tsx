import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin, getSessionMember } from '@/lib/auth'
import { getLabMembers } from '@/lib/queries'
import { deleteLabMember, setCanViewAllProjects } from '@/lib/actions'
import ConfirmSubmitButton from '@/components/ConfirmSubmitButton'
import ResetPasswordControl from '@/components/portal/ResetPasswordControl'
import SubmitButton from '@/components/portal/SubmitButton'
import AddMemberForm from './AddMemberForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Members', robots: { index: false, follow: false } }

export default async function MembersPage() {
  let isAdmin = true
  try {
    await requireAdmin()
  } catch {
    isAdmin = false
  }
  if (!isAdmin) redirect('/portal')

  const [members, currentMember] = await Promise.all([getLabMembers(), getSessionMember()])

  async function removeMember(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    await deleteLabMember(id)
  }

  async function toggleViewAll(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const next = formData.get('next') === 'true'
    await setCanViewAllProjects(id, next)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-title">Lab members</h1>
        <a href="/portal/export" className="btn btn-secondary">
          Download backup
        </a>
      </div>

      <details className="panel p-5">
        <summary className="text-subtitle cursor-pointer" style={{ fontSize: '0.9375rem' }}>
          Add a lab member
        </summary>
        <AddMemberForm />
      </details>

      <div className="panel p-5">
        <h2 className="text-subtitle mb-4" style={{ fontSize: '0.9375rem' }}>Current members</h2>
        <ul className="divide-y" style={{ borderColor: 'var(--hairline)' }}>
          {members.map((m) => (
            <li key={m.id} className="py-3 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-sm font-medium">
                  {/* The name itself links to /portal/jjk, but only on your
                      own row -- not for an admin viewing someone else's.
                      Personal shortcut, not a lab-wide feature, so it stays
                      private even on a page other admins can otherwise see
                      in full. */}
                  {m.id === currentMember?.id ? (
                    <Link href="/portal/jjk" className="link-accent">{m.name}</Link>
                  ) : (
                    m.name
                  )}{' '}
                  {m.is_admin && <span className="badge badge-accent ml-1">Admin</span>}{' '}
                  {m.can_view_all_projects && <span className="badge ml-1">All projects</span>}
                </div>
                <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>{m.email}{m.title ? ` · ${m.title}` : ''}</div>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <form action={toggleViewAll}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="next" value={(!m.can_view_all_projects).toString()} />
                  <SubmitButton
                    className="text-xs link-accent"
                    toastMessage={m.can_view_all_projects ? 'Restricted to tagged projects' : 'Full project visibility granted'}
                  >
                    {m.can_view_all_projects ? 'Restrict to tagged projects' : 'Grant full project visibility'}
                  </SubmitButton>
                </form>
                <ResetPasswordControl memberId={m.id} />
                <form action={removeMember}>
                  <input type="hidden" name="id" value={m.id} />
                  <ConfirmSubmitButton
                    className="text-xs link-danger"
                    confirmMessage={`Remove ${m.name} from the lab portal? They will lose access immediately. This cannot be undone.`}
                    toastMessage="Member removed"
                  >
                    Remove
                  </ConfirmSubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
