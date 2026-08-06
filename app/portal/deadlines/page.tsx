import type { Metadata } from 'next'
import { getDeadlines, getProjects } from '@/lib/queries'
import { createDeadline, deleteDeadline } from '@/lib/actions'
import ConfirmSubmitButton from '@/components/ConfirmSubmitButton'
import SubmitButton from '@/components/portal/SubmitButton'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Deadlines', robots: { index: false, follow: false } }

const TYPE_LABEL: Record<string, string> = {
  grant: 'Grant',
  abstract: 'Abstract',
  conference: 'Conference',
  irb: 'IRB',
  other: 'Other',
}

export default async function DeadlinesPage() {
  const [deadlines, projects] = await Promise.all([getDeadlines(), getProjects()])
  const projectById = new Map(projects.map((p) => [p.id, p.name]))

  async function addDeadline(formData: FormData) {
    'use server'
    await createDeadline(formData)
  }

  async function removeDeadline(formData: FormData) {
    'use server'
    await deleteDeadline(formData.get('id') as string)
  }

  return (
    <div className="space-y-8">
      <h1 className="text-title">Deadlines</h1>

      <details className="panel p-5">
        <summary className="text-subtitle cursor-pointer" style={{ fontSize: '0.9375rem' }}>
          Add deadline
        </summary>
        <form action={addDeadline} className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="title">Title</label>
            <input id="title" name="title" required className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="type">Type</label>
            <select id="type" name="type" className="field-input" defaultValue="other">
              {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="date">Date</label>
            <input id="date" name="date" type="date" required className="field-input" />
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
            <textarea id="notes" name="notes" rows={2} className="field-input" />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton className="btn btn-primary" toastMessage="Deadline added">Add deadline</SubmitButton>
          </div>
        </form>
      </details>

      <ul className="space-y-2">
        {deadlines.map((d) => (
          <li key={d.id} className="panel p-4 flex flex-wrap items-center gap-3 justify-between">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{d.title}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                {TYPE_LABEL[d.type]}
                {d.project_id ? ` · ${projectById.get(d.project_id) ?? 'Unknown project'}` : ''}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="badge badge-flag">{d.date}</span>
              <form action={removeDeadline}>
                <input type="hidden" name="id" value={d.id} />
                <ConfirmSubmitButton className="text-xs link-danger" confirmMessage={`Delete deadline "${d.title}"? This cannot be undone.`} toastMessage="Deadline deleted">
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          </li>
        ))}
        {deadlines.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>No deadlines yet.</p>}
      </ul>
    </div>
  )
}
