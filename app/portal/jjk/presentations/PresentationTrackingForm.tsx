'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePresentationTracking } from '@/lib/jjkActions'
import { callAction } from '@/lib/callAction'
import { dispatchToast } from '@/components/portal/Toaster'
import { JJK_PRESENTATION_STATUS_LABELS, type JjkPresentationOpportunity, type JjkPresentationStatus } from '@/lib/jjkTypes'

export default function PresentationTrackingForm({ item }: { item: JjkPresentationOpportunity }) {
  const router = useRouter()
  const [status, setStatus] = useState(item.status)
  const [deadline, setDeadline] = useState(item.deadline_date ?? '')
  const [eventDate, setEventDate] = useState(item.event_date ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await callAction(() => updatePresentationTracking(item.id, status, deadline, eventDate))
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      dispatchToast('Opportunity updated')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5 flex-wrap justify-end">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as JjkPresentationStatus)}
          className="field-input"
          style={{ padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
          aria-label={`Status for ${item.title}`}
        >
          {Object.entries(JJK_PRESENTATION_STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="field-input"
          style={{ padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
          aria-label={`Submission deadline for ${item.title}`}
        />
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="field-input"
          style={{ padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
          aria-label={`Event date for ${item.title}`}
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
