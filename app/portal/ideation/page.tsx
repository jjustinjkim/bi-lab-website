import type { Metadata } from 'next'
import Link from 'next/link'
import { getSessionMember } from '@/lib/auth'
import { getProjectIdeas, getProjectIdeaVotes, getLabMembers } from '@/lib/queries'
import { findPossibleDuplicates } from '@/lib/ideationSimilarity'
import AddIdeaForm from './AddIdeaForm'
import IdeaCard from './IdeaCard'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Ideation', robots: { index: false, follow: false } }

export default async function IdeationPage() {
  const [ideas, votes, members, member] = await Promise.all([
    getProjectIdeas(),
    getProjectIdeaVotes(),
    getLabMembers(),
    getSessionMember(),
  ])
  const isAdmin = member?.is_admin ?? false

  const voteCountByIdea = new Map<string, number>()
  const votedIdeaIds = new Set<string>()
  for (const v of votes) {
    voteCountByIdea.set(v.idea_id, (voteCountByIdea.get(v.idea_id) ?? 0) + 1)
    if (member && v.member_id === member.id) votedIdeaIds.add(v.idea_id)
  }

  const active = ideas
    .filter((i) => i.status === 'active')
    .sort((a, b) => {
      const diff = (voteCountByIdea.get(b.id) ?? 0) - (voteCountByIdea.get(a.id) ?? 0)
      if (diff !== 0) return diff
      return b.created_at.localeCompare(a.created_at)
    })
  const archived = ideas.filter((i) => i.status === 'archived')
  const promoted = ideas.filter((i) => i.status === 'promoted')

  // Only flag duplicates among active ideas -- an archived or already
  // promoted idea being "similar" to a live one isn't actionable.
  const duplicateMap = findPossibleDuplicates(active.map((i) => ({ id: i.id, title: i.title })))
  const titleById = new Map(ideas.map((i) => [i.id, i.title]))

  function renderCard(idea: (typeof ideas)[number]) {
    return (
      <IdeaCard
        key={idea.id}
        idea={idea}
        voteCount={voteCountByIdea.get(idea.id) ?? 0}
        hasVoted={votedIdeaIds.has(idea.id)}
        duplicateOfTitle={(() => {
          const dupId = duplicateMap.get(idea.id)
          return dupId ? (titleById.get(dupId) ?? null) : null
        })()}
        members={members}
        isAdmin={isAdmin}
      />
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-title">Ideation</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-faint)' }}>
          Brainstorm research project ideas, dot-vote the ones worth pursuing, and promote a survivor
          straight into the Projects tracker with an assigned lead.
        </p>
      </div>

      <details className="panel p-5">
        <summary className="text-subtitle cursor-pointer" style={{ fontSize: '0.9375rem' }}>
          Add idea
        </summary>
        <div className="mt-4">
          <AddIdeaForm />
        </div>
      </details>

      <div className="space-y-3">
        <h2 className="text-subtitle" style={{ fontSize: '0.9375rem' }}>Active ({active.length})</h2>
        <ul className="space-y-2">
          {active.map(renderCard)}
          {active.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>Nothing on the board yet.</p>}
        </ul>
      </div>

      <details>
        <summary className="text-subtitle cursor-pointer" style={{ fontSize: '0.9375rem' }}>
          Promoted ({promoted.length})
        </summary>
        <ul className="space-y-2 mt-3">
          {promoted.map((idea) => (
            <li key={idea.id} className="panel p-4 flex items-center justify-between gap-3">
              <span className="text-sm">{idea.title}</span>
              {idea.promoted_project_id && (
                <Link href={`/portal/projects/${idea.promoted_project_id}`} className="text-xs link-accent shrink-0">
                  View project &rarr;
                </Link>
              )}
            </li>
          ))}
          {promoted.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>None yet.</p>}
        </ul>
      </details>

      <details>
        <summary className="text-subtitle cursor-pointer" style={{ fontSize: '0.9375rem' }}>
          Archived ({archived.length})
        </summary>
        <ul className="space-y-2 mt-3">
          {archived.map(renderCard)}
          {archived.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>None yet.</p>}
        </ul>
      </details>
    </div>
  )
}
