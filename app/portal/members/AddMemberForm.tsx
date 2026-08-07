'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createLabMember } from '@/lib/actions'
import { callAction } from '@/lib/callAction'
import { dispatchToast } from '@/components/portal/Toaster'

// Client-driven (not a plain <form action={serverFn}>) specifically so a
// real failure -- e.g. a duplicate email, the one concrete case found while
// testing this -- actually reaches the admin instead of the form just
// silently doing nothing. The inline "use server" wrapper pattern used
// elsewhere in the portal discards whatever { error } the action returns;
// this one doesn't. Fields stay uncontrolled (no per-field useState) and
// are read via FormData on submit, same ergonomics as the native version.
export default function AddMemberForm() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await callAction(() => createLabMember(formData))
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      formRef.current?.reset()
      dispatchToast('Member added')
      router.refresh()
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4 mt-4">
      <div>
        <label className="field-label" htmlFor="name">Name</label>
        <input id="name" name="name" required className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="title">Title</label>
        <input id="title" name="title" className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="password">Temporary password</label>
        <input id="password" name="password" type="password" required minLength={8} className="field-input" />
      </div>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="is_admin" />
        Grant admin access (can add/remove lab members)
      </label>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="can_view_all_projects" />
        Full project visibility (sees every project, not just the ones they&rsquo;re tagged on)
      </label>
      {error && (
        <div
          className="text-sm p-3 rounded-md sm:col-span-2"
          style={{ background: 'color-mix(in srgb, var(--accent-2) 12%, transparent)', color: 'var(--accent-2-ink)' }}
        >
          {error}
        </div>
      )}
      <div className="sm:col-span-2">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Adding…' : 'Add member'}
        </button>
      </div>
    </form>
  )
}
