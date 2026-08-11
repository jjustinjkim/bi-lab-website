'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateBigIdeaStep, type BigIdeaStepField } from '@/lib/jjkActions'
import { callAction } from '@/lib/callAction'
import { dispatchToast } from '@/components/portal/Toaster'
import { BIG_IDEA_STEPS, type JjkBigIdea } from '@/lib/jjkTypes'

// Each of the 5 wizard steps saves independently (its own textarea + Save
// button), so leaving mid-way never loses progress on the other fields --
// there's no single "submit the whole wizard" action.
function StepRow({ ideaId, field, label, prompt, initialValue }: { ideaId: string; field: string; label: string; prompt: string; initialValue: string }) {
  const router = useRouter()
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const dirty = value !== initialValue

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await callAction(() => updateBigIdeaStep(ideaId, field as BigIdeaStepField, value))
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      dispatchToast(`${label} saved`)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel p-4 space-y-2">
      <div className="flex items-center justify-between">
        <label className="field-label mb-0">{label}</label>
        {initialValue && <span className="badge badge-accent">Filled in</span>}
      </div>
      <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>{prompt}</p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        className="field-input"
      />
      {error && (
        <div className="text-xs p-2 rounded-md" style={{ background: 'color-mix(in srgb, var(--accent-2) 12%, transparent)', color: 'var(--accent-2-ink)' }}>
          {error}
        </div>
      )}
      <button type="submit" disabled={loading || !dirty} className="btn btn-secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8125rem' }}>
        {loading ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}

function TargetDateRow({ idea }: { idea: JjkBigIdea }) {
  const router = useRouter()
  const [value, setValue] = useState(idea.next_step_target_date ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await callAction(() => updateBigIdeaStep(idea.id, 'next_step_target_date', value))
    setLoading(false)
    dispatchToast('Target date saved')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <label className="field-label mb-0" htmlFor="next_step_target_date">Target date for next step</label>
      <input
        id="next_step_target_date"
        type="date"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="field-input"
        style={{ width: 'auto' }}
      />
      <button type="submit" disabled={loading} className="text-xs link-accent">
        {loading ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}

export default function BigIdeaWizardForm({ idea }: { idea: JjkBigIdea }) {
  return (
    <div className="space-y-4">
      {BIG_IDEA_STEPS.map((step) => (
        <StepRow
          key={step.field}
          ideaId={idea.id}
          field={step.field}
          label={step.label}
          prompt={step.prompt}
          initialValue={(idea[step.field] as string | null) ?? ''}
        />
      ))}
      <TargetDateRow idea={idea} />
    </div>
  )
}
