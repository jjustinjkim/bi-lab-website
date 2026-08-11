import type { Metadata } from 'next'
import Link from 'next/link'
import { getBigIdeas, getJjkProjects } from '@/lib/jjkQueries'
import { JJK_PILLAR_LABELS, ideaClarityCount, type JjkBigIdea } from '@/lib/jjkTypes'
import AddBigIdeaForm from './AddBigIdeaForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Big Ideas', robots: { index: false, follow: false } }

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

  return (
    <div className="space-y-8">
      <h1 className="text-title">Big Ideas</h1>

      <details className="panel p-5" open={active.length === 0}>
        <summary className="text-subtitle cursor-pointer" style={{ fontSize: '0.9375rem' }}>
          Add a big idea
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
