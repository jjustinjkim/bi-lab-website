import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getJjkSession } from '@/lib/jjkAuth'
import { getBigIdeas, getJjkProjects, getPresentationOpportunities } from '@/lib/jjkQueries'
import { JJK_PROJECT_STAGE_LABELS, ideaClarityCount, type JjkProjectStage } from '@/lib/jjkTypes'
import { daysUntil, byDeadline, URGENT_WINDOW_DAYS } from '@/lib/jjkDates'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'JJK Research Progress', robots: { index: false, follow: false } }

const STAGE_ORDER: JjkProjectStage[] = ['planning', 'drafting', 'under_review', 'revision', 'published']
const CLOSED_PRESENTATION_STATUSES = new Set(['declined', 'presented'])

export default async function JjkHomePage() {
  if (!(await getJjkSession())) redirect('/portal/jjk/login')

  const [ideas, projects, presentations] = await Promise.all([getBigIdeas(), getJjkProjects(), getPresentationOpportunities()])

  const activeIdeas = ideas.filter((i) => i.status === 'active')
  const readyIdeas = activeIdeas.filter((i) => ideaClarityCount(i) === 5)
  const promotedIdeas = ideas.filter((i) => i.status === 'promoted')

  const stageCounts = STAGE_ORDER.map((stage) => ({ stage, count: projects.filter((p) => p.stage === stage).length }))

  const upcomingDeadlines = presentations
    .filter((p) => !CLOSED_PRESENTATION_STATUSES.has(p.status) && p.deadline_date != null && daysUntil(p.deadline_date) >= 0 && daysUntil(p.deadline_date) <= URGENT_WINDOW_DAYS)
    .sort(byDeadline)

  const projectById = new Map(projects.map((p) => [p.id, p.name]))

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-title">JJK Research Progress</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
          Big ideas, execution, and expansion for your own research pipeline.
        </p>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="panel p-4">
          <div className="text-2xl font-semibold">{activeIdeas.length}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>Active big ideas</div>
        </div>
        <div className="panel p-4">
          <div className="text-2xl font-semibold">{readyIdeas.length}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>Fully clarified, ready to promote</div>
        </div>
        <div className="panel p-4">
          <div className="text-2xl font-semibold">{projects.length}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>Projects in execution</div>
        </div>
        <div className="panel p-4">
          <div className="text-2xl font-semibold">{promotedIdeas.length}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>Ideas promoted to date</div>
        </div>
      </div>

      <section className="panel p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-subtitle" style={{ fontSize: '0.9375rem' }}>Execution by stage</h2>
          <Link href="/portal/jjk/projects" className="text-xs link-accent">View all</Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {stageCounts.map(({ stage, count }) => (
            <span key={stage} className="badge">{JJK_PROJECT_STAGE_LABELS[stage]}: {count}</span>
          ))}
        </div>
      </section>

      <section className="panel p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-subtitle" style={{ fontSize: '0.9375rem' }}>
            Presentation deadlines, within {URGENT_WINDOW_DAYS} days ({upcomingDeadlines.length})
          </h2>
          <Link href="/portal/jjk/presentations" className="text-xs link-accent">View all</Link>
        </div>
        {upcomingDeadlines.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>Nothing coming up.</p>
        ) : (
          <ul className="space-y-2">
            {upcomingDeadlines.map((p) => {
              const daysLeft = p.deadline_date ? daysUntil(p.deadline_date) : null
              return (
                <li key={p.id} className="text-sm flex items-center justify-between gap-3">
                  <span>
                    {p.title}
                    {p.project_id && projectById.get(p.project_id) ? ` · ${projectById.get(p.project_id)}` : ''}
                  </span>
                  <span className={`badge ${daysLeft != null && daysLeft <= 14 ? 'badge-flag' : 'badge-accent'}`}>
                    {daysLeft}d
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="panel p-5 max-w-md">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-subtitle" style={{ fontSize: '0.9375rem' }}>Ready to promote</h2>
          <Link href="/portal/jjk/ideas" className="text-xs link-accent">View all</Link>
        </div>
        {readyIdeas.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>No fully-clarified ideas waiting yet.</p>
        ) : (
          <ul className="space-y-2">
            {readyIdeas.map((i) => (
              <li key={i.id} className="text-sm">
                <Link href={`/portal/jjk/ideas/${i.id}`} className="link-accent">{i.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
