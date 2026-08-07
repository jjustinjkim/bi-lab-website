'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setProjectMembers } from '@/lib/actions'
import { callAction } from '@/lib/callAction'
import { dispatchToast } from '@/components/portal/Toaster'
import type { LabMember } from '@/lib/types'

// Client-driven for the same reason as the other converted forms here --
// setProjectMembers can fail (e.g. the visibility check added earlier this
// project: a member calling this for a project they can no longer see
// returns { error: 'Project not found.' }), and the inline wrapper this
// replaced discarded that.
export default function ProjectAccessForm({
  projectId,
  allMembers,
  taggedMemberIds,
}: {
  projectId: string
  allMembers: LabMember[]
  taggedMemberIds: string[]
}) {
  const router = useRouter()
  const taggedSet = new Set(taggedMemberIds)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await callAction(() => setProjectMembers(projectId, formData))
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      dispatchToast('Access updated')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {allMembers.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>No other lab member accounts yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {allMembers.map((m) => (
            <li key={m.id}>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="member_ids" value={m.id} defaultChecked={taggedSet.has(m.id)} />
                {m.name}
                {m.can_view_all_projects && (
                  <span className="text-xs" style={{ color: 'var(--ink-faint)' }}>(already sees all projects)</span>
                )}
              </label>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <div
          className="text-sm p-3 rounded-md"
          style={{ background: 'color-mix(in srgb, var(--accent-2) 12%, transparent)', color: 'var(--accent-2-ink)' }}
        >
          {error}
        </div>
      )}
      <button type="submit" disabled={loading} className="btn btn-secondary">
        {loading ? 'Saving…' : 'Save access'}
      </button>
    </form>
  )
}
