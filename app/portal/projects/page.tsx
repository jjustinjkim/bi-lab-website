import Link from 'next/link'
import { getProjects } from '@/lib/queries'
import { createProject } from '@/lib/actions'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  planning: 'Planning',
  active: 'Active',
  blocked: 'Blocked',
  done: 'Done',
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  async function addProject(formData: FormData) {
    'use server'
    await createProject(formData)
  }

  return (
    <div className="space-y-8">
      <h1 className="text-title">Projects</h1>

      <div className="panel p-5">
        <h2 className="text-subtitle mb-4" style={{ fontSize: '0.9375rem' }}>New project</h2>
        <form action={addProject} className="space-y-4">
          <div>
            <label className="field-label" htmlFor="name">Name</label>
            <input id="name" name="name" required className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={2} className="field-input" />
          </div>
          <div className="flex gap-4">
            <div>
              <label className="field-label" htmlFor="status">Status</label>
              <select id="status" name="status" className="field-input" defaultValue="planning">
                {Object.entries(STATUS_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Create project</button>
        </form>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {projects.map((p) => (
          <Link key={p.id} href={`/portal/projects/${p.id}`} className="panel p-5 block hover:opacity-90 transition-opacity">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-subtitle" style={{ fontSize: '1rem' }}>{p.name}</h3>
              <span className="badge badge-accent">{STATUS_LABEL[p.status]}</span>
            </div>
            {p.description && (
              <p className="text-sm mt-2" style={{ color: 'var(--ink-muted)' }}>{p.description}</p>
            )}
          </Link>
        ))}
        {projects.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>No projects yet.</p>
        )}
      </div>
    </div>
  )
}
