import type { Metadata } from 'next'
import Link from 'next/link'
import { getJjkProjects, getAllJjkProgressSnapshots } from '@/lib/jjkQueries'
import { computeVelocity, checkpointStaleness, type StalenessLevel } from '@/lib/jjkMomentum'
import { JJK_PILLAR_LABELS, JJK_PROJECT_STAGE_LABELS, type JjkProject, type JjkProjectStage, type JjkProgressSnapshot } from '@/lib/jjkTypes'
import AddJjkProjectForm from './AddJjkProjectForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Projects', robots: { index: false, follow: false } }

const STAGE_ORDER: JjkProjectStage[] = ['planning', 'drafting', 'under_review', 'revision', 'published']
const VELOCITY_WINDOW_DAYS = 7
// Soft, not enforced -- exceeding it just surfaces a banner, doesn't block
// adding another project. The point is making the pileup visible, not
// stopping you outright (see the design discussion this was built from).
const DRAFTING_WIP_LIMIT = 3

function formatDate(date: string | null) {
  if (!date) return null
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const HEADER_CELL_STYLE: React.CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 700,
  color: 'var(--ink)',
  whiteSpace: 'nowrap',
}

const STALENESS_COLOR: Record<StalenessLevel, string> = {
  fresh: 'var(--ink-muted)',
  aging: 'var(--accent-2-ink)',
  stale: 'var(--accent-2-ink)',
}

function ProgressCell({ project, snapshots }: { project: JjkProject; snapshots: JjkProgressSnapshot[] }) {
  if (project.progress_percent == null) {
    return <span style={{ color: 'var(--ink-muted)' }}>n/a</span>
  }
  const velocity = computeVelocity(snapshots, VELOCITY_WINDOW_DAYS)
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className="rounded-full overflow-hidden shrink-0" style={{ width: '72px', height: '6px', background: 'var(--hairline-strong)' }}>
          <div className="h-full rounded-full" style={{ width: `${project.progress_percent}%`, background: 'var(--accent)' }} />
        </div>
        <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>{project.progress_percent}%</span>
      </div>
      {velocity && (
        <div className="text-xs" style={{ color: velocity.delta > 0 ? 'var(--accent-ink)' : velocity.delta < 0 ? 'var(--accent-2-ink)' : 'var(--ink-faint)' }}>
          {velocity.delta > 0 ? '+' : ''}{velocity.delta}% ({velocity.days}d)
        </div>
      )}
    </div>
  )
}

function CheckpointCell({ project }: { project: JjkProject }) {
  if (!project.checkpoint) return <span style={{ color: 'var(--ink-muted)' }}>n/a</span>
  const staleness = checkpointStaleness(project.checkpoint_updated_at)
  return (
    <div>
      <div>{project.checkpoint}</div>
      {staleness && staleness.level !== 'fresh' && (
        <div className="text-xs mt-0.5" style={{ color: STALENESS_COLOR[staleness.level] }}>
          Stuck {staleness.days}d
        </div>
      )}
    </div>
  )
}

function ProjectTable({ projects, snapshotsByProject }: { projects: JjkProject[]; snapshotsByProject: Map<string, JjkProgressSnapshot[]> }) {
  if (projects.length === 0) {
    return <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>None.</p>
  }
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--hairline-strong)' }}>
            <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Project</th>
            <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Pillar</th>
            <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Collaborators</th>
            <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Target date</th>
            <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Progress</th>
            <th className="text-left px-3 py-2.5" style={HEADER_CELL_STYLE}>Checkpoint</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid var(--hairline)' }}>
              <td className="px-3 py-2.5">
                <Link href={`/portal/jjk/projects/${p.id}`} className="link-accent font-medium">{p.name}</Link>
              </td>
              <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>{JJK_PILLAR_LABELS[p.pillar]}</td>
              <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>{p.collaborators ?? 'n/a'}</td>
              <td className="px-3 py-2.5" style={{ color: 'var(--ink-muted)' }}>{formatDate(p.target_date) ?? 'n/a'}</td>
              <td className="px-3 py-2.5"><ProgressCell project={p} snapshots={snapshotsByProject.get(p.id) ?? []} /></td>
              <td className="px-3 py-2.5"><CheckpointCell project={p} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function JjkProjectsPage() {
  const [projects, snapshots] = await Promise.all([getJjkProjects(), getAllJjkProgressSnapshots()])

  const snapshotsByProject = new Map<string, JjkProgressSnapshot[]>()
  for (const s of snapshots) {
    const list = snapshotsByProject.get(s.project_id) ?? []
    list.push(s)
    snapshotsByProject.set(s.project_id, list)
  }

  const draftingCount = projects.filter((p) => p.stage === 'drafting').length

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-title">Projects</h1>
        <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>{projects.length} total</span>
      </div>

      {draftingCount > DRAFTING_WIP_LIMIT && (
        <div className="panel p-4 text-sm" style={{ borderColor: 'var(--accent-2)', color: 'var(--accent-2-ink)' }}>
          {draftingCount} projects in Drafting at once, more than the soft limit of {DRAFTING_WIP_LIMIT}. Not a
          block, just a nudge: finishing one usually beats starting another.
        </div>
      )}

      <details className="panel p-5">
        <summary className="text-subtitle cursor-pointer" style={{ fontSize: '0.9375rem' }}>
          Add project
        </summary>
        <AddJjkProjectForm />
      </details>

      {STAGE_ORDER.map((stage) => {
        const inStage = projects.filter((p) => p.stage === stage)
        return (
          <details key={stage} open={inStage.length > 0}>
            <summary className="text-caption uppercase tracking-wide font-semibold cursor-pointer mb-3" style={{ display: 'inline-block' }}>
              {JJK_PROJECT_STAGE_LABELS[stage]} ({inStage.length})
            </summary>
            <div className="mt-3">
              <ProjectTable projects={inStage} snapshotsByProject={snapshotsByProject} />
            </div>
          </details>
        )
      })}
    </div>
  )
}
