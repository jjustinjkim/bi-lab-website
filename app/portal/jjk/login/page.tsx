'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginJjk } from '@/lib/jjkAuth'
import { callAction } from '@/lib/callAction'

export default function JjkLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await callAction(() => loginJjk(password))
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      router.push('/portal/jjk')
      router.refresh()
    }
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-title">JJK Research Progress</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--ink-muted)' }}>
            Justin&apos;s personal research pipeline
          </p>
        </div>

        <form onSubmit={handleSubmit} className="panel p-6 space-y-4">
          <div>
            <label className="field-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="field-input"
            />
          </div>

          {error && (
            <div className="text-sm p-3 rounded-md" style={{ background: 'color-mix(in srgb, var(--accent-2) 12%, transparent)', color: 'var(--accent-2-ink)' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
