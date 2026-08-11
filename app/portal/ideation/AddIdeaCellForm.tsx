'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProjectIdea } from '@/lib/actions'
import { callAction } from '@/lib/callAction'

// The tiny "Add an idea..." input that lives inside a single matrix cell --
// which cell it's in (column_id/row_id) is baked into the hidden fields, not
// chosen from a dropdown, since the cell itself is the choice.
export default function AddIdeaCellForm({ columnId, rowId }: { columnId: string; rowId: string }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await callAction(() => createProjectIdea(formData))
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      if (inputRef.current) inputRef.current.value = ''
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      <input type="hidden" name="column_id" value={columnId} />
      <input type="hidden" name="row_id" value={rowId} />
      <div className="flex gap-1.5">
        <input
          ref={inputRef}
          name="title"
          required
          placeholder="Add an idea…"
          className="field-input"
          style={{ padding: '0.3rem 0.5rem', fontSize: '0.8125rem' }}
        />
        <button type="submit" disabled={loading} className="btn btn-secondary shrink-0" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
          Add
        </button>
      </div>
      {error && (
        <div
          className="p-1.5 rounded"
          style={{ fontSize: '0.6875rem', background: 'color-mix(in srgb, var(--accent-2) 12%, transparent)', color: 'var(--accent-2-ink)' }}
        >
          {error}
        </div>
      )}
    </form>
  )
}
