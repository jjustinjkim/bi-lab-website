'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addJjkProjectUpdate } from '@/lib/jjkActions'
import { callAction } from '@/lib/callAction'
import { dispatchToast } from '@/components/portal/Toaster'

export default function JjkProjectUpdatesForm({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await callAction(() => addJjkProjectUpdate(projectId, body))
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setBody('')
      dispatchToast('Update logged')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        className="field-input"
        placeholder="What happened, and what's next..."
      />
      {error && (
        <div className="text-xs p-2 rounded-md" style={{ background: 'color-mix(in srgb, var(--accent-2) 12%, transparent)', color: 'var(--accent-2-ink)' }}>
          {error}
        </div>
      )}
      <button type="submit" disabled={loading || !body.trim()} className="btn btn-secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8125rem' }}>
        {loading ? 'Logging…' : 'Log update'}
      </button>
    </form>
  )
}
