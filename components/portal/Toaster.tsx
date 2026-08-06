'use client'

import { useEffect, useRef, useState } from 'react'

export const TOAST_EVENT = 'portal:toast'

// Dispatch this from anywhere on a portal page to show a transient
// confirmation, e.g. dispatchToast('Task added').
export function dispatchToast(message: string) {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: message }))
}

type Toast = { id: number; text: string }

const VISIBLE_MS = 2600

// Single mount point (in the portal layout) for transient "Saved" /
// "Deleted" / etc confirmations, fired by SubmitButton and
// ConfirmSubmitButton after their form's server action completes.
// Event-based rather than React context because the forms that trigger
// these are scattered across every portal page as plain <form
// action={serverFn}> elements (kept server-side for progressive
// enhancement) -- only the individual buttons are client components, so
// there's no shared client tree to thread context through.
export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  useEffect(() => {
    function handle(e: Event) {
      const detail = (e as CustomEvent<string>).detail
      const id = nextId.current++
      setToasts((t) => [...t, { id, text: detail }])
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id))
      }, VISIBLE_MS)
    }
    window.addEventListener(TOAST_EVENT, handle)
    return () => window.removeEventListener(TOAST_EVENT, handle)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      style={{ pointerEvents: 'none' }}
      aria-live="polite"
      role="status"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="panel px-4 py-2.5 text-sm font-medium"
          style={{
            background: 'var(--paper)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
            animation: 'portal-toast-in 0.18s ease-out',
          }}
        >
          {t.text}
        </div>
      ))}
      <style>{`
        @keyframes portal-toast-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
