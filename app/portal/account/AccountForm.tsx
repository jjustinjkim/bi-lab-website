'use client'

import { useState } from 'react'
import { changeOwnPassword } from '@/lib/actions'
import { callAction } from '@/lib/callAction'

export default function AccountForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }

    setLoading(true)
    const result = await callAction(() => changeOwnPassword(currentPassword, newPassword))
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel p-6 space-y-4">
      <div>
        <label className="field-label" htmlFor="current_password">Current password</label>
        <input
          id="current_password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          autoFocus
          className="field-input"
        />
      </div>
      <div>
        <label className="field-label" htmlFor="new_password">New password</label>
        <input
          id="new_password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          className="field-input"
        />
      </div>
      <div>
        <label className="field-label" htmlFor="confirm_password">Confirm new password</label>
        <input
          id="confirm_password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          className="field-input"
        />
      </div>

      {error && (
        <div className="text-sm p-3 rounded-md" style={{ background: 'color-mix(in srgb, var(--accent-2) 12%, transparent)', color: 'var(--accent-2-ink)' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm p-3 rounded-md" style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent-ink)' }}>
          Password changed. Any other signed-in sessions on your account have been signed out.
        </div>
      )}

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? 'Saving...' : 'Change password'}
      </button>
    </form>
  )
}
