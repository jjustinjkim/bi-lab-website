'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPresentationOpportunity } from '@/lib/jjkActions'
import { callAction } from '@/lib/callAction'
import { dispatchToast } from '@/components/portal/Toaster'
import { JJK_PRESENTATION_TYPE_LABELS, JJK_PRESENTATION_STATUS_LABELS, type JjkProject } from '@/lib/jjkTypes'

export default function AddPresentationForm({ projects }: { projects: JjkProject[] }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await callAction(() => createPresentationOpportunity(formData))
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      formRef.current?.reset()
      dispatchToast('Presentation opportunity added')
      router.refresh()
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4 mt-4">
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="title">Title</label>
        <input id="title" name="title" required className="field-input" placeholder="e.g. AANS Annual Meeting abstract" />
      </div>
      <div>
        <label className="field-label" htmlFor="venue">Venue</label>
        <input id="venue" name="venue" className="field-input" placeholder="e.g. AANS 2027" />
      </div>
      <div>
        <label className="field-label" htmlFor="type">Type</label>
        <select id="type" name="type" className="field-input" defaultValue="conference">
          {Object.entries(JJK_PRESENTATION_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="field-label" htmlFor="status">Status</label>
        <select id="status" name="status" className="field-input" defaultValue="identified">
          {Object.entries(JJK_PRESENTATION_STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="field-label" htmlFor="deadline_date">Submission deadline</label>
        <input id="deadline_date" name="deadline_date" type="date" className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="event_date">Event date</label>
        <input id="event_date" name="event_date" type="date" className="field-input" />
      </div>
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="project_id">Project</label>
        <select id="project_id" name="project_id" className="field-input" defaultValue="">
          <option value="">None</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" rows={2} className="field-input" />
      </div>
      {error && (
        <div className="text-sm p-3 rounded-md sm:col-span-2" style={{ background: 'color-mix(in srgb, var(--accent-2) 12%, transparent)', color: 'var(--accent-2-ink)' }}>
          {error}
        </div>
      )}
      <div className="sm:col-span-2">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Adding…' : 'Add opportunity'}
        </button>
      </div>
    </form>
  )
}
