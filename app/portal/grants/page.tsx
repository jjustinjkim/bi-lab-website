import type { Metadata } from 'next'
import { getGrants, getProjects } from '@/lib/queries'
import { createGrant, deleteGrant, updateGrantStatus } from '@/lib/actions'
import { GRANT_STATUS_LABELS } from '@/lib/types'
import ConfirmSubmitButton from '@/components/ConfirmSubmitButton'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Grants', robots: { index: false, follow: false } }

export default async function GrantsPage() {
  const [grants, projects] = await Promise.all([getGrants(), getProjects()])
  const projectById = new Map(projects.map((p) => [p.id, p.name]))

  async function addGrant(formData: FormData) {
    'use server'
    await createGrant(formData)
  }

  async function removeGrant(formData: FormData) {
    'use server'
    await deleteGrant(formData.get('id') as string)
  }

  async function setStatus(formData: FormData) {
    'use server'
    await updateGrantStatus(formData.get('id') as string, formData.get('status') as string)
  }

  return (
    <div className="space-y-8">
      <h1 className="text-title">Grants</h1>

      <details className="panel p-5">
        <summary className="text-subtitle cursor-pointer" style={{ fontSize: '0.9375rem' }}>
          Add grant opportunity
        </summary>
        <form action={addGrant} className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="name">Name</label>
            <input id="name" name="name" required className="field-input" placeholder="e.g. NBTS Meningioma Research Fund" />
          </div>
          <div>
            <label className="field-label" htmlFor="funder">Funder</label>
            <input id="funder" name="funder" className="field-input" placeholder="e.g. National Brain Tumor Society" />
          </div>
          <div>
            <label className="field-label" htmlFor="amount">Amount</label>
            <input id="amount" name="amount" className="field-input" placeholder="e.g. up to $50,000" />
          </div>
          <div>
            <label className="field-label" htmlFor="status">Status</label>
            <select id="status" name="status" className="field-input" defaultValue="identified">
              {Object.entries(GRANT_STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="deadline_date">Deadline</label>
            <input id="deadline_date" name="deadline_date" type="date" className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="url">Link</label>
            <input id="url" name="url" type="url" className="field-input" placeholder="https://..." />
          </div>
          <div>
            <label className="field-label" htmlFor="project_id">Project</label>
            <select id="project_id" name="project_id" className="field-input" defaultValue="">
              <option value="">None</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" rows={2} className="field-input" placeholder="Eligibility, fit, why it's on the list..." />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn btn-primary">Add grant</button>
          </div>
        </form>
      </details>

      <ul className="space-y-2">
        {grants.map((g) => (
          <li key={g.id} className="panel p-4 flex flex-wrap items-center gap-3 justify-between">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">
                {g.url ? (
                  <a href={g.url} target="_blank" rel="noopener noreferrer" className="link-accent">{g.name}</a>
                ) : (
                  g.name
                )}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                {g.funder ?? 'Funder not noted'}
                {g.amount ? ` · ${g.amount}` : ''}
                {g.deadline_date ? ` · Deadline ${g.deadline_date}` : ''}
                {g.project_id ? ` · ${projectById.get(g.project_id) ?? 'Unknown project'}` : ''}
              </div>
              {g.notes && (
                <div className="text-xs mt-1" style={{ color: 'var(--ink-faint)' }}>{g.notes}</div>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <form action={setStatus} className="flex items-center gap-1.5">
                <input type="hidden" name="id" value={g.id} />
                <select
                  name="status"
                  defaultValue={g.status}
                  className="field-input"
                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
                >
                  {Object.entries(GRANT_STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <button type="submit" className="text-xs link-accent">Update</button>
              </form>
              <form action={removeGrant}>
                <input type="hidden" name="id" value={g.id} />
                <ConfirmSubmitButton className="text-xs link-danger" confirmMessage={`Delete "${g.name}" from the grants tracker? This cannot be undone.`}>
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          </li>
        ))}
        {grants.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>No grants tracked yet.</p>}
      </ul>
    </div>
  )
}
