import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isMemberSession } from '@/lib/auth'
import AccountForm from './AccountForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Account', robots: { index: false, follow: false } }

export default async function AccountPage() {
  if (!(await isMemberSession())) redirect('/portal/login')

  return (
    <div className="max-w-sm space-y-8">
      <div>
        <h1 className="text-title">Account</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
          Change your portal password.
        </p>
      </div>
      <AccountForm />
    </div>
  )
}
