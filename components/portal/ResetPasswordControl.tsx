'use client'

import { useState } from 'react'
import { adminResetMemberPassword } from '@/lib/actions'
import { callAction } from '@/lib/callAction'

// Matches createLabMember's convention (no email sending -- an admin sets a
// temporary password directly and shares it out of band), rather than
// generating one server-side, so both flows work the same way.
export default function ResetPasswordControl({ memberId }: { memberId: string }) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  if (success) {
    return <span className="text-xs" style={{ color: 'var(--accent-ink)' }}>Password reset</span>
  }

  if (!open) {
    return (
      <button type="button" className="text-xs link-accent" onClick={() => setOpen(true)}>
        Reset password
      </button>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Must be at least 8 characters.')
      return
    }
    setLoading(true)
    const result = await callAction(() => adminResetMemberPassword(memberId, password))
    setLoading(false)
    if (result.error) setError(result.error)
    else setSuccess(true)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5 flex-wrap">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New temporary password"
        aria-label="New temporary password"
        minLength={8}
        className="field-input"
        style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', width: '170px' }}
        autoFocus
      />
      <button type="submit" disabled={loading} className="text-xs link-accent">
        {loading ? 'Saving...' : 'Set'}
      </button>
      <button
        type="button"
        className="text-xs"
        style={{ color: 'var(--ink-faint)' }}
        onClick={() => { setOpen(false); setPassword(''); setError('') }}
      >
        Cancel
      </button>
      {error && <span className="text-xs" style={{ color: 'var(--accent-2-ink)' }}>{error}</span>}
    </form>
  )
}
