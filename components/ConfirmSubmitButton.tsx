'use client'

import { useFormStatus } from 'react-dom'
import { useEffect, useRef } from 'react'
import { dispatchToast } from './portal/Toaster'

// A form-submit button that confirms before firing, for actions bound to a
// server action in a parent server component (the <form action={...}> stays
// server-side; only this button needs the client boundary, for
// window.confirm). Used for irreversible deletes across the portal.
//
// Also fires a transient toast once the action completes (same
// completion-not-confirmed-success caveat as SubmitButton -- the inline
// server action wrappers this is used with discard the real action's
// { error } return value, so there's no success signal to key off).
export default function ConfirmSubmitButton({
  confirmMessage,
  className,
  children,
  toastMessage = 'Deleted',
}: {
  confirmMessage: string
  className?: string
  children: React.ReactNode
  toastMessage?: string
}) {
  const { pending } = useFormStatus()
  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !pending) {
      dispatchToast(toastMessage)
    }
    wasPending.current = pending
  }, [pending, toastMessage])

  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault()
        }
      }}
    >
      {children}
    </button>
  )
}
