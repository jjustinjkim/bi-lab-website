'use client'

// A form-submit button that confirms before firing, for actions bound to a
// server action in a parent server component (the <form action={...}> stays
// server-side; only this button needs the client boundary, for
// window.confirm). Used for irreversible deletes across the portal.
export default function ConfirmSubmitButton({
  confirmMessage,
  className,
  children,
}: {
  confirmMessage: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="submit"
      className={className}
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
