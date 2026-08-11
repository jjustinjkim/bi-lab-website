'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProjectIdea } from '@/lib/actions'
import { callAction } from '@/lib/callAction'
import { dispatchToast } from '@/components/portal/Toaster'

// Client-driven for the same reason as AddGrantForm: the old inline
// "use server" wrapper pattern discarded whatever { error } the real
// action returned.
export default function AddIdeaForm() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
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
      formRef.current?.reset()
      dispatchToast('Idea added')
      router.refresh()
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="title">Idea</label>
        <input id="title" name="title" required className="field-input" placeholder="e.g. Spatial transcriptomics of recurrent meningioma" />
      </div>
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={2} className="field-input" placeholder="Optional -- the hypothesis, data source, or why it's worth pursuing" />
      </div>
      <div>
        <label className="field-label" htmlFor="category">Category</label>
        <input id="category" name="category" className="field-input" placeholder="Optional, freeform (e.g. Imaging)" />
      </div>
      {error && (
        <div
          className="text-sm p-3 rounded-md sm:col-span-2"
          style={{ background: 'color-mix(in srgb, var(--accent-2) 12%, transparent)', color: 'var(--accent-2-ink)' }}
        >
          {error}
        </div>
      )}
      <div className="sm:col-span-2">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Adding…' : 'Add idea'}
        </button>
      </div>
    </form>
  )
}
