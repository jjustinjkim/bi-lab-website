import type { Metadata } from 'next'
import Link from 'next/link'
import { getBigIdeas, getJjkProjects } from '@/lib/jjkQueries'
import { JJK_PILLAR_LABELS, JJK_PROJECT_STAGE_LABELS, ideaClarityCount, type JjkBigIdea } from '@/lib/jjkTypes'
import { findStalledProjects } from '@/lib/jjkMomentum'
import AddBigIdeaForm from './AddBigIdeaForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Ideas', robots: { index: false, follow: false } }

const STALLED_THRESHOLD_DAYS = 14
// Only worth interrupting the "add a new idea" impulse for -- one stalled
// project isn't a pattern, several at once is.
const STALLED_CALLOUT_MIN_COUNT = 2

function ClarityBadge({ idea }: { idea: JjkBigIdea }) {
  const n = ideaClarityCount(idea)
  return <span className={`badge ${n === 5 ? 'badge-accent' : ''}`}>{n}/5 clarified</span>
}

export default async function IdeasPage() {
  const [ideas, projects] = await Promise.all([getBigIdeas(), getJjkProjects()])
  const projectById = new Map(projects.map((p) => [p.id, p.name]))

  const active = ideas.filter((i) => i.status === 'active')
  const promoted = ideas.filter((i) => i.status === 'promoted')
  const archived = ideas.filter((i) => i.status === 'archived')

  const stalledProjects = findStalledProjects(projects, STALLED_THRESHOLD_DAYS)

  return (
    <div className="space-y-8">
      <h1 className="text-title">Ideas</h1>

      {stalledProjects.length >= STALLED_CALLOUT_MIN_COUNT && (
        <div className="panel p-5" style={{ borderColor: 'var(--accent-2)', borderWidth: '2px' }}>
          <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--accent-2-ink)' }}>
            {stalledProjects.length} projects haven&rsquo;t moved in {STALLED_THRESHOLD_DAYS}+ days
          </h2>
          <p className="text-sm mb-3" style={{ color: 'var(--ink-muted)' }}>
            Worth a look before starting something new.
          </p>
          <ul className="space-y-1.5">
            {stalledProjects.map((p) => (
              <li key={p.id} className="text-sm flex items-center justify-between gap-3">
                <Link href={`/portal/jjk/projects/${p.id}`} className="link-accent">{p.name}</Link>
                <span style={{ color: 'var(--ink-faint)' }}>{JJK_PROJECT_STAGE_LABELS[p.stage]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <details className="panel p-5" open={active.length === 0}>
        <summary className="text-subtitle cursor-pointer" style={{ fontSize: '0.9375rem' }}>
          Add an idea
        </summary>
        <AddBigIdeaForm />
      </details>

      <div className="space-y-3">
        <h2 className="text-caption uppercase tracking-wide font-semibold">Active ({active.length})</h2>
        {active.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>No active ideas yet.</p>
        ) : (
          <ul className="space-y-2">
            {active.map((idea) => (
              <li key={idea.id} className="panel p-4 flex flex-wrap items-center gap-3 justify-between">
                <div className="min-w-0 flex-1">
                  <Link href={`/portal/jjk/ideas/${idea.id}`} className="link-accent font-medium">{idea.title}</Link>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>{JJK_PILLAR_LABELS[idea.pillar]}</div>
                </div>
                <ClarityBadge idea={idea} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <details>
        <summary className="text-caption uppercase tracking-wide font-semibold cursor-pointer" style={{ display: 'inline-block' }}>
          Promoted ({promoted.length})
        </summary>
        <ul className="space-y-2 mt-3">
          {promoted.map((idea) => (
            <li key={idea.id} className="panel p-4 flex flex-wrap items-center gap-3 justify-between">
              <div className="min-w-0 flex-1">
                <span className="font-medium">{idea.title}</span>
                <div className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>{JJK_PILLAR_LABELS[idea.pillar]}</div>
              </div>
              {idea.promoted_project_id && projectById.get(idea.promoted_project_id) && (
                <Link href={`/portal/jjk/projects/${idea.promoted_project_id}`} className="link-accent text-sm">
                  {projectById.get(idea.promoted_project_id)}
                </Link>
              )}
            </li>
          ))}
          {promoted.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>None yet.</p>}
        </ul>
      </details>

      <details>
        <summary className="text-caption uppercase tracking-wide font-semibold cursor-pointer" style={{ display: 'inline-block' }}>
          Archived ({archived.length})
        </summary>
        <ul className="space-y-2 mt-3">
          {archived.map((idea) => (
            <li key={idea.id} className="panel p-4">
              <Link href={`/portal/jjk/ideas/${idea.id}`} className="link-accent font-medium">{idea.title}</Link>
              <span className="text-xs ml-2" style={{ color: 'var(--ink-muted)' }}>{JJK_PILLAR_LABELS[idea.pillar]}</span>
            </li>
          ))}
          {archived.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>None.</p>}
        </ul>
      </details>
    </div>
  )
}
