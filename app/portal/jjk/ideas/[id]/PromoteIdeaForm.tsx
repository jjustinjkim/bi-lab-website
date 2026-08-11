'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { promoteBigIdea } from '@/lib/jjkActions'
import { callAction } from '@/lib/callAction'
import { dispatchToast } from '@/components/portal/Toaster'

export default function PromoteIdeaForm({ ideaId, defaultName }: { ideaId: string; defaultName: string }) {
  const router = useRouter()
  const [name, setName] = useState(defaultName)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await callAction(() => promoteBigIdea(ideaId, name))
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      dispatchToast('Promoted to a project')
      if (result.projectId) {
        router.push(`/portal/jjk/projects/${result.projectId}`)
      } else {
        router.refresh()
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel p-4 space-y-3">
      <div>
        <label className="field-label" htmlFor="project_name">Project name</label>
        <input id="project_name" value={name} onChange={(e) => setName(e.target.value)} required className="field-input" />
      </div>
      {error && (
        <div className="text-sm p-2 rounded-md" style={{ background: 'color-mix(in srgb, var(--accent-2) 12%, transparent)', color: 'var(--accent-2-ink)' }}>
          {error}
        </div>
      )}
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Promoting…' : 'Promote to project'}
      </button>
    </form>
  )
}
