'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateGrantTracking } from '@/lib/actions'
import { callAction } from '@/lib/callAction'
import { dispatchToast } from '@/components/portal/Toaster'
import { GRANT_STATUS_LABELS, type Grant } from '@/lib/types'

// Client-driven so a failed update (e.g. a stale deploy) actually surfaces
// to the admin instead of the toast firing on completion regardless of
// whether the write succeeded, per the same fix applied to the other
// portal forms. Status and deadline share one row/one submit since they're
// both "how is this grant being tracked right now" edits.
export default function GrantTrackingForm({ grant }: { grant: Grant }) {
  const router = useRouter()
  const [status, setStatus] = useState(grant.status)
  const [deadline, setDeadline] = useState(grant.deadline_date ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await callAction(() => updateGrantTracking(grant.id, status, deadline))
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      dispatchToast('Grant updated')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Grant['status'])}
          className="field-input"
          style={{ padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
          aria-label={`Status for ${grant.name}`}
        >
          {Object.entries(GRANT_STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="field-input"
          style={{ padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
          aria-label={`Deadline for ${grant.name}`}
        />
        <button type="submit" disabled={loading} className="text-xs link-accent">
          {loading ? 'Saving…' : 'Update'}
        </button>
      </div>
      {error && (
        <div className="text-xs" style={{ color: 'var(--accent-2-ink)' }}>{error}</div>
      )}
    </form>
  )
}
