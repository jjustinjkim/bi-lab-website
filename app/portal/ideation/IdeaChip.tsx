'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleProjectIdeaVote, setProjectIdeaStatus, promoteProjectIdea, deleteProjectIdea, moveProjectIdeaRow } from '@/lib/actions'
import { callAction } from '@/lib/callAction'
import { dispatchToast } from '@/components/portal/Toaster'
import type { LabMember, ProjectIdea, ProjectIdeaRow } from '@/lib/types'

// A single idea's card as it sits inside a matrix cell -- compact, since
// several of these can stack inside one (row, column) intersection.
export default function IdeaChip({
  idea,
  voteCount,
  hasVoted,
  isDuplicate,
  members,
  rows,
  isAdmin,
}: {
  idea: ProjectIdea
  voteCount: number
  hasVoted: boolean
  isDuplicate: boolean
  members: LabMember[]
  rows: ProjectIdeaRow[]
  isAdmin: boolean
}) {
  const router = useRouter()
  const [voting, setVoting] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [moving, setMoving] = useState(false)
  const [promoting, setPromoting] = useState(false)
  const [promoteError, setPromoteError] = useState('')
  const [promoteLoading, setPromoteLoading] = useState(false)

  const isArchived = idea.status === 'archived'

  async function handleVote() {
    setVoting(true)
    const result = await callAction(() => toggleProjectIdeaVote(idea.id))
    setVoting(false)
    if (!result.error) router.refresh()
  }

  async function handleArchiveToggle() {
    setArchiving(true)
    const nextStatus = isArchived ? 'active' : 'archived'
    const result = await callAction(() => setProjectIdeaStatus(idea.id, nextStatus))
    setArchiving(false)
    if (!result.error) {
      dispatchToast(nextStatus === 'archived' ? 'Idea archived' : 'Idea restored')
      router.refresh()
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${idea.title}" from the ideation board? This cannot be undone.`)) return
    setDeleting(true)
    const result = await callAction(() => deleteProjectIdea(idea.id))
    setDeleting(false)
    if (!result.error) {
      dispatchToast('Idea deleted')
      router.refresh()
    }
  }

  async function handleMove(e: React.ChangeEvent<HTMLSelectElement>) {
    const rowId = e.target.value
    setMoving(true)
    const result = await callAction(() => moveProjectIdeaRow(idea.id, rowId))
    setMoving(false)
    if (!result.error) router.refresh()
  }

  async function handlePromote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPromoteError('')
    setPromoteLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await callAction(() => promoteProjectIdea(idea.id, formData))
    setPromoteLoading(false)
    if (result.error) {
      setPromoteError(result.error)
    } else {
      dispatchToast('Promoted to a project')
      router.refresh()
    }
  }

  return (
    <div
      className="rounded-md p-2.5 text-sm space-y-1.5"
      style={{
        border: `1px solid ${isDuplicate ? 'var(--accent-2)' : 'var(--hairline-strong)'}`,
        background: isArchived ? 'var(--paper-raised)' : 'var(--paper)',
        opacity: isArchived ? 0.65 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium">{idea.title}</span>
        <button
          type="button"
          onClick={handleVote}
          disabled={voting}
          className="text-xs shrink-0 rounded-full px-2 py-0.5 flex items-center gap-1"
          style={{
            border: '1px solid var(--hairline-strong)',
            background: hasVoted ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
            color: hasVoted ? 'var(--accent-ink)' : 'var(--ink-muted)',
          }}
        >
          &#9650; {voteCount}
        </button>
      </div>

      {isDuplicate && (
        <span className="badge badge-flag" style={{ fontSize: '0.6875rem', padding: '0.1rem 0.4rem' }}>
          dup?
        </span>
      )}

      {rows.length > 1 && (
        <select
          value={idea.row_id ?? ''}
          onChange={handleMove}
          disabled={moving}
          className="field-input"
          style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
          aria-label={`Move "${idea.title}" to a different row`}
        >
          {rows.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      )}

      <div className="flex items-center gap-2 flex-wrap" style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
        <button type="button" onClick={handleArchiveToggle} disabled={archiving} className="link-accent">
          {isArchived ? 'Restore' : 'Archive'}
        </button>
        {!isArchived && (
          <button type="button" onClick={() => setPromoting((p) => !p)} className="link-accent">
            {promoting ? 'Cancel' : 'Promote'}
          </button>
        )}
        {isAdmin && (
          <button type="button" onClick={handleDelete} disabled={deleting} className="link-danger">
            {deleting ? '…' : 'Delete'}
          </button>
        )}
      </div>

      {promoting && (
        <form onSubmit={handlePromote} className="pt-1.5 space-y-1.5" style={{ borderTop: '1px solid var(--hairline)' }}>
          <select
            name="project_lead_id"
            required
            className="field-input"
            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
            defaultValue=""
          >
            <option value="" disabled>Project lead…</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          {promoteError && (
            <div
              className="p-1.5 rounded"
              style={{ fontSize: '0.6875rem', background: 'color-mix(in srgb, var(--accent-2) 12%, transparent)', color: 'var(--accent-2-ink)' }}
            >
              {promoteError}
            </div>
          )}
          <button type="submit" disabled={promoteLoading} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
            {promoteLoading ? 'Promoting…' : 'Create project'}
          </button>
        </form>
      )}
    </div>
  )
}
