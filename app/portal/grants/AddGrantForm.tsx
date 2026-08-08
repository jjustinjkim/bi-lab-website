'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createGrant } from '@/lib/actions'
import { callAction } from '@/lib/callAction'
import { dispatchToast } from '@/components/portal/Toaster'
import { GRANT_STATUS_LABELS, type Project } from '@/lib/types'

// Client-driven for the same reason as the other converted forms: the
// inline "use server" wrapper this replaced discarded whatever { error }
// createGrant returned.
export default function AddGrantForm({ projects }: { projects: Project[] }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await callAction(() => createGrant(formData))
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      formRef.current?.reset()
      dispatchToast('Grant added')
      router.refresh()
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4 mt-4">
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="name">Name</label>
        <input id="name" name="name" required className="field-input" placeholder="e.g. NBTS Meningioma Research Fund" />
      </div>
      <div>
        <label className="field-label" htmlFor="funder">Funder</label>
        <input id="funder" name="funder" className="field-input" placeholder="e.g. National Brain Tumor Society" />
      </div>
      <div>
        <label className="field-label" htmlFor="amount">Amount</label>
        <input id="amount" name="amount" className="field-input" placeholder="e.g. up to $50,000" />
      </div>
      <div>
        <label className="field-label" htmlFor="status">Status</label>
        <select id="status" name="status" className="field-input" defaultValue="identified">
          {Object.entries(GRANT_STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="field-label" htmlFor="deadline_date">Deadline</label>
        <input id="deadline_date" name="deadline_date" type="date" className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="url">Link</label>
        <input id="url" name="url" type="url" className="field-input" placeholder="https://..." />
      </div>
      <div>
        <label className="field-label" htmlFor="project_id">Project</label>
        <select id="project_id" name="project_id" className="field-input" defaultValue="">
          <option value="">None</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className="field-input"
          placeholder="Why it's on the list, eligibility caveats, next steps..."
        />
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
          {loading ? 'Adding…' : 'Add grant'}
        </button>
      </div>
    </form>
  )
}
