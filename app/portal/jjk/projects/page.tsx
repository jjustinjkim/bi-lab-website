import type { Metadata } from 'next'
import Link from 'next/link'
import { getJjkProjects } from '@/lib/jjkQueries'
import { JJK_PILLAR_LABELS, JJK_PROJECT_STAGE_LABELS, type JjkProject, type JjkProjectStage } from '@/lib/jjkTypes'
import AddJjkProjectForm from './AddJjkProjectForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Projects', robots: { index: false, follow: false } }

const STAGE_ORDER: JjkProjectStage[] = ['planning', 'drafting', 'under_review', 'revision', 'published']

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

function ProjectTable({ projects }: { projects: JjkProject[] }) {
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function JjkProjectsPage() {
  const projects = await getJjkProjects()

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-title">Projects</h1>
        <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>{projects.length} total</span>
      </div>

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
              <ProjectTable projects={inStage} />
            </div>
          </details>
        )
      })}
    </div>
  )
}
