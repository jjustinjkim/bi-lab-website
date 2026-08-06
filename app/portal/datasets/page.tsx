import type { Metadata } from 'next'
import { getDatasets, getProjects } from '@/lib/queries'
import { createDataset, deleteDataset } from '@/lib/actions'
import ConfirmSubmitButton from '@/components/ConfirmSubmitButton'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Datasets', robots: { index: false, follow: false } }

export default async function DatasetsPage() {
  const [datasets, projects] = await Promise.all([getDatasets(), getProjects()])
  const projectById = new Map(projects.map((p) => [p.id, p.name]))

  async function addDataset(formData: FormData) {
    'use server'
    await createDataset(formData)
  }

  async function removeDataset(formData: FormData) {
    'use server'
    await deleteDataset(formData.get('id') as string)
  }

  return (
    <div className="space-y-8">
      <h1 className="text-title">Datasets</h1>

      <details className="panel p-5">
        <summary className="text-subtitle cursor-pointer" style={{ fontSize: '0.9375rem' }}>
          Add dataset
        </summary>
        <form action={addDataset} className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="name">Name</label>
            <input id="name" name="name" required className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="location">Location</label>
            <input id="location" name="location" placeholder="e.g. Dropbox, freezer box, GEO accession" className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="sample_count">Sample count</label>
            <input id="sample_count" name="sample_count" type="number" min={0} className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="processing_status">Processing status</label>
            <input id="processing_status" name="processing_status" placeholder="e.g. raw, QC'd, analyzed" className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="project_id">Project</label>
            <select id="project_id" name="project_id" className="field-input" defaultValue="">
              <option value="">None</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={2} className="field-input" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn btn-primary">Add dataset</button>
          </div>
        </form>
      </details>

      <ul className="space-y-2">
        {datasets.map((d) => (
          <li key={d.id} className="panel p-4 flex flex-wrap items-center gap-3 justify-between">
            <div>
              <div className="text-sm font-medium">{d.name}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                {d.location ?? 'No location noted'}
                {d.project_id ? ` · ${projectById.get(d.project_id) ?? 'Unknown project'}` : ''}
                {d.processing_status ? ` · ${d.processing_status}` : ''}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {d.sample_count != null && <span className="badge">{d.sample_count} samples</span>}
              <form action={removeDataset}>
                <input type="hidden" name="id" value={d.id} />
                <ConfirmSubmitButton className="text-xs link-danger" confirmMessage={`Delete dataset "${d.name}"? This cannot be undone.`}>
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          </li>
        ))}
        {datasets.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>No datasets yet.</p>}
      </ul>
    </div>
  )
}
