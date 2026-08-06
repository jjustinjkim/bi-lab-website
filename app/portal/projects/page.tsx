import type { Metadata } from 'next'
import Link from 'next/link'
import { getProjects } from '@/lib/queries'
import { createProject, updateProjectStatus } from '@/lib/actions'
import { PROJECT_GROUP_LABELS, PROJECT_GROUP_COLORS, type Project, type ProjectGroupType } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Projects', robots: { index: false, follow: false } }

const GROUP_OPTIONS = Object.entries(PROJECT_GROUP_LABELS) as [ProjectGroupType, string][]

// Deliberately not the .field-label class here: it sets display:block,
// which on a <th> overrides the table-cell display the row layout depends
// on and makes every header stack vertically instead of across the row.
const HEADER_CELL_STYLE: React.CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 700,
  color: 'var(--ink)',
  whiteSpace: 'nowrap',
}

// Only the 5 types the lab's spreadsheet legend actually defines -- X and P
// are real values in the data but deliberately left out of the legend so
// they don't read as officially-sanctioned categories.
const LEGEND_GROUPS: ProjectGroupType[] = ['A', 'C', 'Ch', 'R', 'T']

function GroupDot({ group }: { group: string | null }) {
  const color = group ? PROJECT_GROUP_COLORS[group as ProjectGroupType] : null
  const label = group ? (PROJECT_GROUP_LABELS[group as ProjectGroupType] ?? group) : 'Uncategorized'
  return (
    <span
      title={label}
      aria-label={label}
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color ?? 'var(--hairline-strong)',
        marginRight: '0.5rem',
        flexShrink: 0,
      }}
    />
  )
}

// Sticky just below the portal nav bar (which is h-14 / 3.5rem and itself
// sticky at top-0 z-30) so the legend stays visible while scrolling through
// either table, instead of scrolling away with the rest of the page.
function GroupLegend() {
  return (
    <div
      className="flex flex-wrap gap-x-5 gap-y-2 text-xs px-1 py-3"
      style={{
        color: 'var(--ink-muted)',
        position: 'sticky',
        // PortalNav measures the real combined height of the site header +
        // its own bar (both sticky, stacked) and publishes it here -- a
        // fixed rem guess previously only accounted for PortalNav's own
        // height, so the legend stuck underneath both bars instead of below
        // them. 10.4rem is a pre-JS-paint fallback (roughly header + nav at
        // desktop width), replaced within a frame of mount.
        top: 'var(--portal-sticky-stack, 10.4rem)',
        zIndex: 20,
        background: 'var(--paper)',
        borderBottom: '1px solid var(--hairline)',
      }}
    >
      {LEGEND_GROUPS.map((g) => (
        <span key={g} className="flex items-center">
          <GroupDot group={g} />
          {PROJECT_GROUP_LABELS[g]}
        </span>
      ))}
    </div>
  )
}

// A soft tint of the group's color behind the whole row, not just the dot,
// so the category reads at a glance without having to look at each name.
function rowBackground(group: string | null): string | undefined {
  const color = group ? PROJECT_GROUP_COLORS[group as ProjectGroupType] : null
  return color ? `color-mix(in srgb, ${color} 16%, var(--paper-raised))` : undefined
}

function formatDeadline(date: string | null) {
  if (!date) return null
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  const active = projects
    .filter((p) => p.status !== 'done' && p.status !== 'archived')
    .sort((a, b) => (b.work_percent ?? -1) - (a.work_percent ?? -1))

  const completed = projects
    .filter((p) => p.status === 'done')
    .sort((a, b) => (b.pub_year ?? 0) - (a.pub_year ?? 0))

  const archived = projects
    .filter((p) => p.status === 'archived')
    .sort((a, b) => a.name.localeCompare(b.name))

  async function addProject(formData: FormData) {
    'use server'
    await createProject(formData)
  }

  async function archiveProject(formData: FormData) {
    'use server'
    await updateProjectStatus(formData.get('id') as string, 'archived')
  }

  async function unarchiveProject(formData: FormData) {
    'use server'
    await updateProjectStatus(formData.get('id') as string, 'active')
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
                <option value="">None</option>
                {GROUP_OPTIONS.map(([v, l]) => (
                  <option key={v} value={v}>{v} - {l}</option>
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
            <label className="field-label" htmlFor="pubmed_url">PubMed link</label>
            <input id="pubmed_url" name="pubmed_url" type="url" placeholder="https://pubmed.ncbi.nlm.nih.gov/XXXXXXXX/" className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={2} className="field-input" />
          </div>
          <button type="submit" className="btn btn-primary">Create project</button>
        </form>
      </details>

      <GroupLegend />

      <details open>
        <summary className="text-caption uppercase tracking-wide font-semibold cursor-pointer mb-3" style={{ display: 'inline-block' }}>
          Active ({active.length})
        </summary>
        <div className="mt-3">
          <ProjectTable projects={active} variant="active" archiveProject={archiveProject} />
        </div>
      </details>

      <details open>
        <summary className="text-caption uppercase tracking-wide font-semibold cursor-pointer mb-3" style={{ display: 'inline-block' }}>
          Completed / PubMedable ({completed.length})
        </summary>
        <div className="mt-3">
          <ProjectTable projects={completed} variant="completed" />
        </div>
      </details>

      <details>
        <summary className="text-caption uppercase tracking-wide font-semibold cursor-pointer mb-3" style={{ display: 'inline-block' }}>
          Archived ({archived.length})
        </summary>
        <div className="mt-3">
          <ProjectTable projects={archived} variant="archived" unarchiveProject={unarchiveProject} />
        </div>
      </details>
    </div>
  )
}

function ProjectTable({
  projects,
  variant,
  archiveProject,
  unarchiveProject,
}: {
  projects: Project[]
  variant: 'active' | 'completed' | 'archived'
  archiveProject?: (formData: FormData) => Promise<void>
  unarchiveProject?: (formData: FormData) => Promise<void>
}) {
  if (projects.length === 0) {
    return <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>No {variant} projects yet.</p>
  }

  return (
    <div className="panel overflow-x-auto">
      <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--hairline-strong)' }}>
            <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Project</th>
            <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Faculty</th>
            <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Personnel</th>
            {variant === 'completed' ? (
              <>
                <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Journal / Book</th>
                <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Year</th>
              </>
            ) : (
              <>
                <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Work %</th>
                <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Pub status</th>
                <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Mtg</th>
                <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Deadline</th>
                <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Checkpoint</th>
              </>
            )}
            {(variant === 'active' || variant === 'archived') && (
              <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}></th>
            )}
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid var(--hairline)', background: rowBackground(p.group_type) }}>
              <td className="px-3 py-2.5">
                <Link href={`/portal/projects/${p.id}`} className="link-accent font-medium flex items-center">
                  <GroupDot group={p.group_type} />
                  {p.name}
                </Link>
              </td>
              <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>{p.faculty ?? 'n/a'}</td>
              <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>{p.personnel ?? 'n/a'}</td>
              {variant === 'completed' ? (
                <>
                  <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>
                    {p.pubmed_url ? (
                      <a href={p.pubmed_url} target="_blank" rel="noopener noreferrer" className="link-accent">
                        {p.journal ?? 'PubMed'}
                      </a>
                    ) : (
                      p.journal ?? 'n/a'
                    )}
                  </td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>{p.pub_year ?? 'n/a'}</td>
                </>
              ) : (
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
                      <span style={{ color: 'var(--ink-faint)' }}>n/a</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>{p.pub_status ?? 'n/a'}</td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>{p.meeting ?? 'n/a'}</td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>{formatDeadline(p.deadline_date) ?? 'n/a'}</td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>{p.checkpoint ?? 'n/a'}</td>
                </>
              )}
              {variant === 'active' && archiveProject && (
                <td className="px-3 py-2.5">
                  <form action={archiveProject}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="text-xs link-accent whitespace-nowrap">Archive</button>
                  </form>
                </td>
              )}
              {variant === 'archived' && unarchiveProject && (
                <td className="px-3 py-2.5">
                  <form action={unarchiveProject}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="text-xs link-accent whitespace-nowrap">Unarchive</button>
                  </form>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
