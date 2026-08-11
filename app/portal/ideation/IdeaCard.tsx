'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleProjectIdeaVote, setProjectIdeaStatus, promoteProjectIdea, deleteProjectIdea } from '@/lib/actions'
import { callAction } from '@/lib/callAction'
import { dispatchToast } from '@/components/portal/Toaster'
import type { LabMember, ProjectIdea } from '@/lib/types'

export default function IdeaCard({
  idea,
  voteCount,
  hasVoted,
  duplicateOfTitle,
  members,
  isAdmin,
}: {
  idea: ProjectIdea
  voteCount: number
  hasVoted: boolean
  duplicateOfTitle: string | null
  members: LabMember[]
  isAdmin: boolean
}) {
  const router = useRouter()
  const [voting, setVoting] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [deleting, setDeleting] = useState(false)
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
    <li className="panel p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium">{idea.title}</div>
          {idea.description && (
            <div className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>{idea.description}</div>
          )}
          <div className="flex items-center gap-2 flex-wrap mt-1.5">
            {idea.category && <span className="badge">{idea.category}</span>}
            {duplicateOfTitle && (
              <span className="badge badge-flag" title={`Possibly similar to "${duplicateOfTitle}"`}>
                Possible duplicate
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleVote}
          disabled={voting}
          className="text-xs shrink-0 rounded-full px-2.5 py-1 flex items-center gap-1"
          style={{
            border: '1px solid var(--hairline-strong)',
            background: hasVoted ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
            color: hasVoted ? 'var(--accent-ink)' : 'var(--ink-muted)',
          }}
        >
          &#9650; {voteCount}
        </button>
      </div>

      <div className="flex items-center gap-3 text-xs pt-1 flex-wrap" style={{ color: 'var(--ink-muted)' }}>
        <button type="button" onClick={handleArchiveToggle} disabled={archiving} className="link-accent">
          {isArchived ? 'Restore' : 'Archive'}
        </button>
        {!isArchived && (
          <button type="button" onClick={() => setPromoting((p) => !p)} className="link-accent">
            {promoting ? 'Cancel' : 'Promote to project'}
          </button>
        )}
        {isAdmin && (
          <button type="button" onClick={handleDelete} disabled={deleting} className="link-danger">
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>

      {promoting && (
        <form onSubmit={handlePromote} className="pt-2 space-y-2" style={{ borderTop: '1px solid var(--hairline)' }}>
          <div>
            <label className="field-label" htmlFor={`lead-${idea.id}`}>Project lead</label>
            <select id={`lead-${idea.id}`} name="project_lead_id" required className="field-input" defaultValue="">
              <option value="" disabled>Choose a lead</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          {promoteError && (
            <div
              className="text-xs p-2 rounded"
              style={{ background: 'color-mix(in srgb, var(--accent-2) 12%, transparent)', color: 'var(--accent-2-ink)' }}
            >
              {promoteError}
            </div>
          )}
          <button type="submit" disabled={promoteLoading} className="btn btn-primary text-xs" style={{ padding: '0.35rem 0.75rem' }}>
            {promoteLoading ? 'Promoting…' : 'Create project'}
          </button>
        </form>
      )}
    </li>
  )
}
