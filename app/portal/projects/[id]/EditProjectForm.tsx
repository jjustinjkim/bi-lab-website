'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProject } from '@/lib/actions'
import { callAction } from '@/lib/callAction'
import { dispatchToast } from '@/components/portal/Toaster'
import { PROJECT_GROUP_LABELS, type ProjectGroupType, type Project } from '@/lib/types'

const GROUP_OPTIONS = Object.entries(PROJECT_GROUP_LABELS) as [ProjectGroupType, string][]

const STATUS_LABEL: Record<string, string> = {
  planning: 'Planning',
  active: 'Active',
  blocked: 'Blocked',
  done: 'Done',
  archived: 'Archived',
}

// Client-driven for the same reason as AddMemberForm/AddProjectForm: the
// inline "use server" wrapper this replaced discarded whatever { error }
// updateProject returned (e.g. clearing the name to blank/whitespace).
export default function EditProjectForm({ project }: { project: Project }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await callAction(() => updateProject(project.id, formData))
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

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="field-label" htmlFor="group_type">Gr</label>
          <select id="group_type" name="group_type" defaultValue={project.group_type ?? ''} className="field-input">
            <option value="">None</option>
            {GROUP_OPTIONS.map(([v, l]) => (
              <option key={v} value={v}>{v} - {l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={project.status} className="field-input">
            {Object.entries(STATUS_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="work_percent">Work status (% done)</label>
          <input
            id="work_percent"
            name="work_percent"
            type="number"
            min={0}
            max={100}
            defaultValue={project.work_percent ?? ''}
            className="field-input"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="faculty">Faculty</label>
          <input id="faculty" name="faculty" defaultValue={project.faculty ?? ''} className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="personnel">Personnel</label>
          <input id="personnel" name="personnel" defaultValue={project.personnel ?? ''} className="field-input" />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="field-label" htmlFor="pub_status">Pub status</label>
          <input id="pub_status" name="pub_status" defaultValue={project.pub_status ?? ''} className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="meeting">Mtg</label>
          <input id="meeting" name="meeting" defaultValue={project.meeting ?? ''} className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="deadline_date">Deadline</label>
          <input
            id="deadline_date"
            name="deadline_date"
            type="date"
            defaultValue={project.deadline_date ?? ''}
            className="field-input"
          />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="checkpoint">Checkpoint</label>
        <input id="checkpoint" name="checkpoint" defaultValue={project.checkpoint ?? ''} className="field-input" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="journal">Journal / Book</label>
          <input id="journal" name="journal" defaultValue={project.journal ?? ''} className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="pub_year">Year</label>
          <input id="pub_year" name="pub_year" type="number" defaultValue={project.pub_year ?? ''} className="field-input" />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="pubmed_url">PubMed link</label>
        <input
          id="pubmed_url"
          name="pubmed_url"
          type="url"
          placeholder="https://pubmed.ncbi.nlm.nih.gov/XXXXXXXX/"
          defaultValue={project.pubmed_url ?? ''}
          className="field-input"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={2} defaultValue={project.description ?? ''} className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" rows={3} defaultValue={project.notes ?? ''} className="field-input" />
      </div>
      {error && (
        <div
          className="text-sm p-3 rounded-md"
          style={{ background: 'color-mix(in srgb, var(--accent-2) 12%, transparent)', color: 'var(--accent-2-ink)' }}
        >
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
