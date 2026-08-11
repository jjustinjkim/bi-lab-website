'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBigIdea } from '@/lib/jjkActions'
import { callAction } from '@/lib/callAction'
import { dispatchToast } from '@/components/portal/Toaster'
import { JJK_PILLAR_LABELS, type JjkPillar } from '@/lib/jjkTypes'

export default function AddBigIdeaForm() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const pillar = formData.get('pillar') as JjkPillar
    const title = formData.get('title') as string
    const result = await callAction(() => createBigIdea(pillar, title))
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      formRef.current?.reset()
      dispatchToast('Idea added')
      if (result.id) {
        router.push(`/portal/jjk/ideas/${result.id}`)
      } else {
        router.refresh()
      }
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid sm:grid-cols-[1fr_auto] gap-4 mt-4 items-end">
      <div className="grid sm:grid-cols-2 gap-4 sm:col-span-1">
        <div>
          <label className="field-label" htmlFor="pillar">Pillar</label>
          <select id="pillar" name="pillar" className="field-input" defaultValue="manuscript">
            {Object.entries(JJK_PILLAR_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="title">Title</label>
          <input id="title" name="title" required className="field-input" placeholder="A one-line name for the idea" />
        </div>
      </div>
      <div>
        {error && (
          <div className="text-sm p-2 rounded-md mb-2" style={{ background: 'color-mix(in srgb, var(--accent-2) 12%, transparent)', color: 'var(--accent-2-ink)' }}>
            {error}
          </div>
        )}
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Adding…' : 'Add idea'}
        </button>
      </div>
    </form>
  )
}
