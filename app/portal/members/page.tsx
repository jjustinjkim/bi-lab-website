import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { getLabMembers } from '@/lib/queries'
import { createLabMember, deleteLabMember } from '@/lib/actions'

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

  const members = await getLabMembers()

  async function addMember(formData: FormData) {
    'use server'
    await createLabMember(formData)
  }

  async function removeMember(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    await deleteLabMember(id)
  }

  return (
    <div className="space-y-8">
      <h1 className="text-title">Lab members</h1>

      <div className="panel p-5">
        <h2 className="text-subtitle mb-4" style={{ fontSize: '0.9375rem' }}>Add a lab member</h2>
        <form action={addMember} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="name">Name</label>
            <input id="name" name="name" required className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="title">Title</label>
            <input id="title" name="title" className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="password">Temporary password</label>
            <input id="password" name="password" type="password" required minLength={8} className="field-input" />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" name="is_admin" />
            Grant admin access (can add/remove lab members)
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="btn btn-primary">Add member</button>
          </div>
        </form>
      </div>

      <div className="panel p-5">
        <h2 className="text-subtitle mb-4" style={{ fontSize: '0.9375rem' }}>Current members</h2>
        <ul className="divide-y" style={{ borderColor: 'var(--hairline)' }}>
          {members.map((m) => (
            <li key={m.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium">
                  {m.name} {m.is_admin && <span className="badge badge-accent ml-2">Admin</span>}
                </div>
                <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>{m.email}{m.title ? ` · ${m.title}` : ''}</div>
              </div>
              <form action={removeMember}>
                <input type="hidden" name="id" value={m.id} />
                <button type="submit" className="text-xs" style={{ color: 'var(--accent-2-ink)' }}>Remove</button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
