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
  const { upcomingDeadlines, myOpenTasks, activeProjects } = await getDashboardData()

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-title">Welcome, {member?.name.split(' ')[0]}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
          Lab project manager: research projects, tasks, deadlines, and datasets.
        </p>
      </div>

      <div className="panel p-5">
        <h2 className="text-subtitle mb-1" style={{ fontSize: '1rem' }}>Meningioma Public Inventory</h2>
        <p className="text-sm mb-3" style={{ color: 'var(--ink-muted)' }}>
          The lab&rsquo;s public catalog of meningioma molecular datasets.
        </p>
        <a
          href="https://meningioma-public-inventory.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
        >
          Open inventory &rarr;
        </a>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <section className="panel p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-subtitle" style={{ fontSize: '0.9375rem' }}>Upcoming deadlines</h2>
            <Link href="/portal/deadlines" className="text-xs link-accent">View all</Link>
          </div>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>Nothing in the next 30 days.</p>
          ) : (
            <ul className="space-y-2">
              {upcomingDeadlines.map((d) => (
                <li key={d.id} className="text-sm flex items-center justify-between gap-2">
                  <span>{d.title}</span>
                  <span className="badge badge-flag">{d.date}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-subtitle" style={{ fontSize: '0.9375rem' }}>Your open tasks</h2>
            <Link href="/portal/tasks" className="text-xs link-accent">View all</Link>
          </div>
          {myOpenTasks.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>No open tasks assigned to you.</p>
          ) : (
            <ul className="space-y-2">
              {myOpenTasks.map((t) => (
                <li key={t.id} className="text-sm">{t.title}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel p-5">
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
    </div>
  )
}
