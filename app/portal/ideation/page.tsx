import type { Metadata } from 'next'
import { getSessionMember } from '@/lib/auth'
import { getProjectIdeas, getProjectIdeaVotes, getProjectIdeaColumns, getProjectIdeaRows, getLabMembers } from '@/lib/queries'
import IdeationGrid from './IdeationGrid'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Ideation', robots: { index: false, follow: false } }

export default async function IdeationPage() {
  const [ideas, votes, columns, rows, members, member] = await Promise.all([
    getProjectIdeas(),
    getProjectIdeaVotes(),
    getProjectIdeaColumns(),
    getProjectIdeaRows(),
    getLabMembers(),
    getSessionMember(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title">Ideation</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-faint)' }}>
          Brainstorm research project ideas by theme and category, dot-vote the ones worth pursuing,
          and promote a survivor straight into the Projects tracker with an assigned lead.
        </p>
      </div>

      <IdeationGrid
        ideas={ideas}
        votes={votes}
        columns={columns}
        rows={rows}
        members={members}
        isAdmin={member?.is_admin ?? false}
        currentMemberId={member?.id ?? null}
      />
    </div>
  )
}
