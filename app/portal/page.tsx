import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isMemberSession, getSessionMember } from '@/lib/auth'
import { getDashboardData } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Portal', robots: { index: false, follow: false } }

export default async function PortalDashboard() {
  if (!(await isMemberSession())) redirect('/portal/login')

  const member = await getSessionMember()
  const { activeProjects } = await getDashboardData()

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-title">Welcome, {member?.name.split(' ')[0]}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
          Lab project manager: research projects and grant opportunities.
        </p>
      </div>

      <section className="panel p-5 max-w-md">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-subtitle" style={{ fontSize: '0.9375rem' }}>Active projects</h2>
          <Link href="/portal/projects" className="text-xs link-accent">View all</Link>
        </div>
        {activeProjects.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>No active projects yet.</p>
        ) : (
          <ul className="space-y-2">
            {activeProjects.map((p) => (
              <li key={p.id} className="text-sm">
                <Link href={`/portal/projects/${p.id}`} className="link-accent">{p.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
