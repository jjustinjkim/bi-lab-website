'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { createProjectIdeaColumn, deleteProjectIdeaColumn, createProjectIdeaRow, deleteProjectIdeaRow } from '@/lib/actions'
import { findPossibleDuplicates } from '@/lib/ideationSimilarity'
import type { LabMember, ProjectIdea, ProjectIdeaColumn, ProjectIdeaRow, ProjectIdeaVote } from '@/lib/types'
import AddAxisForm from './AddAxisForm'
import AxisDeleteButton from './AxisDeleteButton'
import AddIdeaCellForm from './AddIdeaCellForm'
import IdeaChip from './IdeaChip'

export default function IdeationGrid({
  ideas,
  votes,
  columns,
  rows,
  members,
  isAdmin,
  currentMemberId,
}: {
  ideas: ProjectIdea[]
  votes: ProjectIdeaVote[]
  columns: ProjectIdeaColumn[]
  rows: ProjectIdeaRow[]
  members: LabMember[]
  isAdmin: boolean
  currentMemberId: string | null
}) {
  const [showArchived, setShowArchived] = useState(false)

  const voteCountByIdea = useMemo(() => {
    const m = new Map<string, number>()
    for (const v of votes) m.set(v.idea_id, (m.get(v.idea_id) ?? 0) + 1)
    return m
  }, [votes])

  const votedIdeaIds = useMemo(
    () => new Set(votes.filter((v) => v.member_id === currentMemberId).map((v) => v.idea_id)),
    [votes, currentMemberId]
  )

  const boardIdeas = useMemo(() => ideas.filter((i) => i.status !== 'promoted'), [ideas])
  const promoted = useMemo(() => ideas.filter((i) => i.status === 'promoted'), [ideas])

  // Flagged across the whole board, not just within one cell -- the same
  // idea filed under two different themes is exactly the kind of duplicate
  // worth catching.
  const duplicateIds = useMemo(() => {
    const active = boardIdeas.filter((i) => i.status === 'active')
    return new Set(findPossibleDuplicates(active.map((i) => ({ id: i.id, title: i.title }))).keys())
  }, [boardIdeas])

  function cellIdeas(rowId: string, columnId: string) {
    return boardIdeas
      .filter((i) => i.row_id === rowId && i.column_id === columnId)
      .filter((i) => showArchived || i.status !== 'archived')
      .sort((a, b) => (voteCountByIdea.get(b.id) ?? 0) - (voteCountByIdea.get(a.id) ?? 0))
  }

  const uncategorized = boardIdeas
    .filter((i) => !i.row_id || !i.column_id)
    .filter((i) => showArchived || i.status !== 'archived')

  if (columns.length === 0 || rows.length === 0) {
    const missing = columns.length === 0 && rows.length === 0
      ? 'a category and a theme'
      : columns.length === 0
        ? 'a category'
        : 'a theme'
    return (
      <div className="space-y-6">
        <div className="panel p-6 text-sm" style={{ color: 'var(--ink-muted)' }}>
          The board needs at least one category and one theme before ideas can be added. Still
          missing {missing} below.
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="field-label">Add a category (column)</div>
            <AddAxisForm action={createProjectIdeaColumn} placeholder="e.g. Meningioma" buttonLabel="Add category" toastMessage="Category added" />
            {columns.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {columns.map((c) => (
                  <li key={c.id} className="badge flex items-center gap-2">
                    {c.name}
                    <AxisDeleteButton action={deleteProjectIdeaColumn} id={c.id} label={c.name} />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="space-y-3">
            <div className="field-label">Add a theme (row)</div>
            <AddAxisForm action={createProjectIdeaRow} placeholder="e.g. Genomic Profiling" buttonLabel="Add theme" toastMessage="Theme added" />
            {rows.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {rows.map((r) => (
                  <li key={r.id} className="badge flex items-center gap-2">
                    {r.name}
                    <AxisDeleteButton action={deleteProjectIdeaRow} id={r.id} label={r.name} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--ink-muted)' }}>
        <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
        Show archived ideas
      </label>

      <div>
        {/* Fluid grid, not a fixed-width scroller -- columns share out
            whatever width the page actually has (minmax(0, 1fr) each) so
            they get bigger with fewer categories instead of needing a
            horizontal scrollbar with more. Row labels use the same
            gridTemplateColumns as each theme's band so everything lines up. */}
        <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: `160px repeat(${columns.length}, minmax(0, 1fr))` }}>
          <div />
          {columns.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2 min-w-0">
              <span className="text-caption uppercase tracking-wide font-semibold">{c.name}</span>
              <AxisDeleteButton action={deleteProjectIdeaColumn} id={c.id} label={c.name} />
            </div>
          ))}
        </div>

        {/* One band per theme (row) */}
        <div className="space-y-6">
          {rows.map((r) => (
            <div key={r.id} className="grid gap-3" style={{ gridTemplateColumns: `160px repeat(${columns.length}, minmax(0, 1fr))` }}>
              <div className="flex flex-col justify-between min-w-0">
                <div className="text-sm font-semibold">{r.name}</div>
                <AxisDeleteButton action={deleteProjectIdeaRow} id={r.id} label={r.name} />
              </div>
              {columns.map((c) => (
                <div key={c.id} className="panel p-3 space-y-2 min-w-0">
                  <AddIdeaCellForm columnId={c.id} rowId={r.id} />
                  {cellIdeas(r.id, c.id).map((idea) => (
                    <IdeaChip
                      key={idea.id}
                      idea={idea}
                      voteCount={voteCountByIdea.get(idea.id) ?? 0}
                      hasVoted={votedIdeaIds.has(idea.id)}
                      isDuplicate={duplicateIds.has(idea.id)}
                      members={members}
                      rows={rows}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <div className="field-label mb-2">Add a category (column)</div>
          <AddAxisForm action={createProjectIdeaColumn} placeholder="e.g. Glioma" buttonLabel="Add category" toastMessage="Category added" />
        </div>
        <div>
          <div className="field-label mb-2">Add a theme (row)</div>
          <AddAxisForm action={createProjectIdeaRow} placeholder="e.g. Outcomes Analysis" buttonLabel="Add theme" toastMessage="Theme added" />
        </div>
      </div>

      {uncategorized.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-subtitle" style={{ fontSize: '0.9375rem' }}>
            Uncategorized ({uncategorized.length})
          </h2>
          <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>
            Ideas whose category or theme was deleted. Still here, just not sorted into a cell.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {uncategorized.map((idea) => (
              <IdeaChip
                key={idea.id}
                idea={idea}
                voteCount={voteCountByIdea.get(idea.id) ?? 0}
                hasVoted={votedIdeaIds.has(idea.id)}
                isDuplicate={duplicateIds.has(idea.id)}
                members={members}
                rows={rows}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </div>
      )}

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
    </div>
  )
}
