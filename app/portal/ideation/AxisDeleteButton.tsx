'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { callAction } from '@/lib/callAction'

export default function AxisDeleteButton({
  action,
  id,
  label,
}: {
  action: (id: string) => Promise<{ error?: string }>
  id: string
  label: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!window.confirm(`Delete "${label}"? Ideas in it are kept, they just lose that tag.`)) return
    setLoading(true)
    const result = await callAction(() => action(id))
    setLoading(false)
    if (!result.error) router.refresh()
  }

  return (
    <button type="button" onClick={handleClick} disabled={loading} className="link-danger" style={{ fontSize: '0.6875rem' }}>
      {loading ? '…' : 'Delete'}
    </button>
  )
}
