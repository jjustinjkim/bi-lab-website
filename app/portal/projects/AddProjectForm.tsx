'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '@/lib/actions'
import { callAction } from '@/lib/callAction'
import { dispatchToast } from '@/components/portal/Toaster'
import { PROJECT_GROUP_LABELS, type ProjectGroupType } from '@/lib/types'

const GROUP_OPTIONS = Object.entries(PROJECT_GROUP_LABELS) as [ProjectGroupType, string][]

// Client-driven for the same reason as AddMemberForm: the inline "use
// server" wrapper this replaced (<form action={addProject}>) discarded
// whatever { error } createProject returned, so a real validation failure
// would just silently do nothing.
export default function AddProjectForm() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await callAction(() => createProject(formData))
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      formRef.current?.reset()
      dispatchToast('Project created')
      router.refresh()
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <label className="field-label" htmlFor="name">Project</label>
        <input id="name" name="name" required className="field-input" />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="field-label" htmlFor="group_type">Gr</label>
          <select id="group_type" name="group_type" className="field-input" defaultValue="">
            <option value="">None</option>
            {GROUP_OPTIONS.map(([v, l]) => (
              <option key={v} value={v}>{v} - {l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="status">Status</label>
          <select id="status" name="status" className="field-input" defaultValue="planning">
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="work_percent">Work status (% done)</label>
          <input id="work_percent" name="work_percent" type="number" min={0} max={100} className="field-input" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="faculty">Faculty</label>
          <input id="faculty" name="faculty" className="field-input" placeholder="e.g. Bi / Aizer" />
        </div>
        <div>
          <label className="field-label" htmlFor="personnel">Personnel</label>
          <input id="personnel" name="personnel" className="field-input" placeholder="e.g. Varun, Ruchit" />
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="field-label" htmlFor="pub_status">Pub status</label>
          <input id="pub_status" name="pub_status" className="field-input" placeholder="e.g. manuscript, revision" />
        </div>
        <div>
          <label className="field-label" htmlFor="meeting">Mtg</label>
          <input id="meeting" name="meeting" className="field-input" placeholder="e.g. AANS" />
        </div>
        <div>
          <label className="field-label" htmlFor="deadline_date">Deadline</label>
          <input id="deadline_date" name="deadline_date" type="date" className="field-input" />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="checkpoint">Checkpoint</label>
        <input id="checkpoint" name="checkpoint" className="field-input" placeholder="Next step / reminder" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="journal">Journal / Book</label>
          <input id="journal" name="journal" className="field-input" placeholder="Filled in once published" />
        </div>
        <div>
          <label className="field-label" htmlFor="pub_year">Year</label>
          <input id="pub_year" name="pub_year" type="number" className="field-input" />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="pubmed_url">PubMed link</label>
        <input id="pubmed_url" name="pubmed_url" type="url" placeholder="https://pubmed.ncbi.nlm.nih.gov/XXXXXXXX/" className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={2} className="field-input" />
      </div>
      {error && (
        <div
          className="text-sm p-3 rounded-md"
          style={{ background: 'color-mix(in srgb, var(--accent-2) 12%, transparent)', color: 'var(--accent-2-ink)' }}
        >
          {error}
        </div>
      )}
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Creating…' : 'Create project'}
      </button>
    </form>
  )
}
