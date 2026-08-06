'use client'

import { useFormStatus } from 'react-dom'
import { useEffect, useRef } from 'react'
import { dispatchToast } from './Toaster'

// Drop-in replacement for a plain <button type="submit"> inside a
// <form action={serverFn}> that shows a transient toast once the action
// completes. useFormStatus() only works in a component nested inside the
// <form>, which is why this is its own client component rather than a prop
// on the form itself (the form stays a plain server-rendered element for
// progressive enhancement, matching ConfirmSubmitButton's approach).
//
// Fires on completion, not confirmed success -- the inline "use server"
// action wrappers used throughout the portal (e.g. `async function
// addTask(formData) { 'use server'; await createTask(formData) }`) already
// discard whatever { error } the real action returns, so there's no
// success/failure signal available here to key off of either. Same
// known limitation, not a new one introduced by this component.
export default function SubmitButton({
  children,
  className,
  toastMessage,
  disabled,
}: {
  children: React.ReactNode
  className?: string
  toastMessage: string
  disabled?: boolean
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
    <button type="submit" className={className} disabled={disabled || pending}>
      {pending ? 'Saving…' : children}
    </button>
  )
}
