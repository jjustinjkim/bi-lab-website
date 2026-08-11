'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createJjkProject } from '@/lib/jjkActions'
import { callAction } from '@/lib/callAction'
import { dispatchToast } from '@/components/portal/Toaster'
import { JJK_PILLAR_LABELS, JJK_PROJECT_STAGE_LABELS } from '@/lib/jjkTypes'

// For logging an existing manuscript/project directly -- not everything
// starts life as a Big Idea worked through the wizard.
export default function AddJjkProjectForm() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await callAction(() => createJjkProject(formData))
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      formRef.current?.reset()
      dispatchToast('Project added')
      router.refresh()
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4 mt-4">
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="name">Name</label>
        <input id="name" name="name" required className="field-input" placeholder="e.g. Progestin manuscript" />
      </div>
      <div>
        <label className="field-label" htmlFor="pillar">Pillar</label>
        <select id="pillar" name="pillar" className="field-input" defaultValue="manuscript">
          {Object.entries(JJK_PILLAR_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="field-label" htmlFor="stage">Stage</label>
        <select id="stage" name="stage" className="field-input" defaultValue="planning">
          {Object.entries(JJK_PROJECT_STAGE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="field-label" htmlFor="collaborators">Collaborators</label>
        <input id="collaborators" name="collaborators" className="field-input" placeholder="e.g. Zsombor, Dr. Bi" />
      </div>
      <div>
        <label className="field-label" htmlFor="target_date">Target date</label>
        <input id="target_date" name="target_date" type="date" className="field-input" />
      </div>
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" rows={2} className="field-input" placeholder="Where it stands, next step..." />
      </div>
      {error && (
        <div className="text-sm p-3 rounded-md sm:col-span-2" style={{ background: 'color-mix(in srgb, var(--accent-2) 12%, transparent)', color: 'var(--accent-2-ink)' }}>
          {error}
        </div>
      )}
      <div className="sm:col-span-2">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Adding…' : 'Add project'}
        </button>
      </div>
    </form>
  )
}
