'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { callAction } from '@/lib/callAction'
import { dispatchToast } from '@/components/portal/Toaster'

// Shared by "Add a category" (columns) and "Add a theme" (rows) -- both
// axes are plain name -> {error?} server actions, passed in as a prop
// rather than duplicating this form twice.
export default function AddAxisForm({
  action,
  placeholder,
  buttonLabel,
  toastMessage,
}: {
  action: (name: string) => Promise<{ error?: string }>
  placeholder: string
  buttonLabel: string
  toastMessage: string
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const name = inputRef.current?.value ?? ''
    setLoading(true)
    const result = await callAction(() => action(name))
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      if (inputRef.current) inputRef.current.value = ''
      dispatchToast(toastMessage)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-1.5">
      <div>
        <input
          ref={inputRef}
          required
          placeholder={placeholder}
          className="field-input"
          style={{ padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
        />
        {error && <div className="text-xs mt-1" style={{ color: 'var(--accent-2-ink)' }}>{error}</div>}
      </div>
      <button type="submit" disabled={loading} className="btn btn-secondary shrink-0" style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}>
        {buttonLabel}
      </button>
    </form>
  )
}
