'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateJjkProjectMeta } from '@/lib/jjkActions'
import { callAction } from '@/lib/callAction'
import { dispatchToast } from '@/components/portal/Toaster'
import { JJK_PILLAR_LABELS, type JjkProject } from '@/lib/jjkTypes'

export default function JjkProjectEditForm({ project }: { project: JjkProject }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await callAction(() => updateJjkProjectMeta(project.id, formData))
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      dispatchToast('Project saved')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label" htmlFor="name">Project</label>
        <input id="name" name="name" defaultValue={project.name} required className="field-input" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="pillar">Pillar</label>
          <select id="pillar" name="pillar" defaultValue={project.pillar} className="field-input">
            {Object.entries(JJK_PILLAR_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="target_date">Target date</label>
          <input id="target_date" name="target_date" type="date" defaultValue={project.target_date ?? ''} className="field-input" />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="collaborators">Collaborators</label>
        <input id="collaborators" name="collaborators" defaultValue={project.collaborators ?? ''} className="field-input" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="progress_percent">Estimated progress</label>
          <input
            id="progress_percent"
            name="progress_percent"
            type="number"
            min={0}
            max={100}
            step={5}
            defaultValue={project.progress_percent ?? ''}
            className="field-input"
            placeholder="0-100"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="checkpoint">Checkpoint</label>
          <input
            id="checkpoint"
            name="checkpoint"
            defaultValue={project.checkpoint ?? ''}
            className="field-input"
            placeholder="Who / what's the barrier right now"
          />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" rows={3} defaultValue={project.notes ?? ''} className="field-input" />
      </div>
      {error && (
        <div className="text-sm p-3 rounded-md" style={{ background: 'color-mix(in srgb, var(--accent-2) 12%, transparent)', color: 'var(--accent-2-ink)' }}>
          {error}
        </div>
      )}
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
