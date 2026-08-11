'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateJjkProjectStage } from '@/lib/jjkActions'
import { callAction } from '@/lib/callAction'
import { dispatchToast } from '@/components/portal/Toaster'
import { JJK_PROJECT_STAGE_LABELS, type JjkProject, type JjkProjectStage } from '@/lib/jjkTypes'

export default function JjkProjectStageForm({ project }: { project: JjkProject }) {
  const router = useRouter()
  const [stage, setStage] = useState(project.stage)
  const [loading, setLoading] = useState(false)

  async function handleChange(next: JjkProjectStage) {
    setStage(next)
    setLoading(true)
    const result = await callAction(() => updateJjkProjectStage(project.id, next))
    setLoading(false)
    if (result.error) {
      setStage(project.stage)
    } else {
      dispatchToast('Stage updated')
      router.refresh()
    }
  }

  return (
    <select
      value={stage}
      onChange={(e) => handleChange(e.target.value as JjkProjectStage)}
      disabled={loading}
      className="field-input"
      style={{ width: 'auto' }}
      aria-label="Stage"
    >
      {Object.entries(JJK_PROJECT_STAGE_LABELS).map(([v, l]) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
  )
}
