import type { Metadata } from 'next'
import Link from 'next/link'
import { getProjects } from '@/lib/queries'
import { createProject } from '@/lib/actions'
import { PROJECT_GROUP_LABELS, type Project, type ProjectGroupType } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Projects', robots: { index: false, follow: false } }

const GROUP_OPTIONS = Object.entries(PROJECT_GROUP_LABELS) as [ProjectGroupType, string][]

// Deliberately not the .field-label class here: it sets display:block,
// which on a <th> overrides the table-cell display the row layout depends
// on and makes every header stack vertically instead of across the row.
const HEADER_CELL_STYLE: React.CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: 'var(--ink-muted)',
  whiteSpace: 'nowrap',
}

function GroupBadge({ group }: { group: string | null }) {
  if (!group) return <span style={{ color: 'var(--ink-faint)' }}>&mdash;</span>
  return (
    <span className="badge" title={PROJECT_GROUP_LABELS[group as ProjectGroupType] ?? group}>
      {group}
    </span>
  )
}

function formatDeadline(date: string | null) {
  if (!date) return null
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  const active = projects
    .filter((p) => p.status !== 'done')
    .sort((a, b) => (b.work_percent ?? -1) - (a.work_percent ?? -1))

  const completed = projects
    .filter((p) => p.status === 'done')
    .sort((a, b) => (b.pub_year ?? 0) - (a.pub_year ?? 0))

  async function addProject(formData: FormData) {
    'use server'
    await createProject(formData)
  }

  return (
    <div className="space-y-10">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-title">Projects</h1>
        <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>
          {active.length} active &middot; {completed.length} completed
        </span>
      </div>

      <details className="panel p-5">
        <summary className="text-subtitle cursor-pointer" style={{ fontSize: '0.9375rem' }}>
          Add project
        </summary>
        <form action={addProject} className="space-y-4 mt-4">
          <div>
            <label className="field-label" htmlFor="name">Project</label>
            <input id="name" name="name" required className="field-input" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="field-label" htmlFor="group_type">Gr</label>
              <select id="group_type" name="group_type" className="field-input" defaultValue="">
                <option value="">&mdash;</option>
                {GROUP_OPTIONS.map(([v, l]) => (
                  <option key={v} value={v}>{v} &mdash; {l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="status">Status</label>
              <select id="status" name="status" className="field-input" defaultValue="planning">
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="work_percent">Work status (% done)</label>
              <input id="work_percent" name="work_percent" type="number" min={0} max={100} className="field-input" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="faculty">Faculty</label>
              <input id="faculty" name="faculty" className="field-input" placeholder="e.g. Bi / Aizer" />
            </div>
            <div>
              <label className="field-label" htmlFor="personnel">Personnel</label>
              <input id="personnel" name="personnel" className="field-input" placeholder="e.g. Varun, Ruchit" />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="field-label" htmlFor="pub_status">Pub status</label>
              <input id="pub_status" name="pub_status" className="field-input" placeholder="e.g. manuscript, revision" />
            </div>
            <div>
              <label className="field-label" htmlFor="meeting">Mtg</label>
              <input id="meeting" name="meeting" className="field-input" placeholder="e.g. AANS" />
            </div>
            <div>
              <label className="field-label" htmlFor="deadline_date">Deadline</label>
              <input id="deadline_date" name="deadline_date" type="date" className="field-input" />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="checkpoint">Checkpoint</label>
            <input id="checkpoint" name="checkpoint" className="field-input" placeholder="Next step / reminder" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="journal">Journal / Book</label>
              <input id="journal" name="journal" className="field-input" placeholder="Filled in once published" />
            </div>
            <div>
              <label className="field-label" htmlFor="pub_year">Year</label>
              <input id="pub_year" name="pub_year" type="number" className="field-input" />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={2} className="field-input" />
          </div>
          <button type="submit" className="btn btn-primary">Create project</button>
        </form>
      </details>

      <section>
        <h2 className="text-caption uppercase tracking-wide font-semibold mb-3">Active</h2>
        <ProjectTable projects={active} variant="active" />
      </section>

      <section>
        <h2 className="text-caption uppercase tracking-wide font-semibold mb-3">Completed / PubMedable</h2>
        <ProjectTable projects={completed} variant="completed" />
      </section>
    </div>
  )
}

function ProjectTable({ projects, variant }: { projects: Project[]; variant: 'active' | 'completed' }) {
  if (projects.length === 0) {
    return <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>No {variant} projects yet.</p>
  }

  return (
    <div className="panel overflow-x-auto">
      <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--hairline-strong)' }}>
            <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Gr</th>
            <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Project</th>
            <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Faculty</th>
            <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Personnel</th>
            {variant === 'active' ? (
              <>
                <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Work %</th>
                <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Pub status</th>
                <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Mtg</th>
                <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Deadline</th>
                <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Checkpoint</th>
              </>
            ) : (
              <>
                <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Journal / Book</th>
                <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Year</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid var(--hairline)' }}>
              <td className="px-3 py-2.5"><GroupBadge group={p.group_type} /></td>
              <td className="px-3 py-2.5">
                <Link href={`/portal/projects/${p.id}`} className="link-accent font-medium">
                  {p.name}
                </Link>
              </td>
              <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>{p.faculty ?? '—'}</td>
              <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>{p.personnel ?? '—'}</td>
              {variant === 'active' ? (
                <>
                  <td className="px-3 py-2.5">
                    {p.work_percent != null ? (
                      <div className="flex items-center gap-2">
                        <div style={{ width: 48, height: 6, borderRadius: 3, background: 'var(--hairline)', overflow: 'hidden' }}>
                          <div style={{ width: `${p.work_percent}%`, height: '100%', background: 'var(--accent)' }} />
                        </div>
                        <span style={{ color: 'var(--ink-muted)' }}>{p.work_percent}%</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--ink-faint)' }}>&mdash;</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>{p.pub_status ?? '—'}</td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>{p.meeting ?? '—'}</td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>{formatDeadline(p.deadline_date) ?? '—'}</td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>{p.checkpoint ?? '—'}</td>
                </>
              ) : (
                <>
                  <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>{p.journal ?? '—'}</td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>{p.pub_year ?? '—'}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
