import type { Metadata } from 'next'
import Link from 'next/link'
import { getBigIdeas, getJjkProjects, getPresentationOpportunities, getJjkActivityTimestamps } from '@/lib/jjkQueries'
import { JJK_PROJECT_STAGE_LABELS, JJK_PILLAR_LABELS, ideaClarityCount, type JjkProjectStage } from '@/lib/jjkTypes'
import { daysUntil, byDeadline, URGENT_WINDOW_DAYS } from '@/lib/jjkDates'
import { pickFocusProject, computeStreak, checkpointStaleness } from '@/lib/jjkMomentum'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'JJK', robots: { index: false, follow: false } }

const STAGE_ORDER: JjkProjectStage[] = ['planning', 'drafting', 'under_review', 'revision', 'published']
const CLOSED_PRESENTATION_STATUSES = new Set(['declined', 'presented'])

export default async function JjkHomePage() {
  const [ideas, projects, presentations, activityTimestamps] = await Promise.all([
    getBigIdeas(),
    getJjkProjects(),
    getPresentationOpportunities(),
    getJjkActivityTimestamps(),
  ])

  const activeIdeas = ideas.filter((i) => i.status === 'active')
  const readyIdeas = activeIdeas.filter((i) => ideaClarityCount(i) === 5)
  const promotedIdeas = ideas.filter((i) => i.status === 'promoted')

  const stageCounts = STAGE_ORDER.map((stage) => ({ stage, count: projects.filter((p) => p.stage === stage).length }))

  const streak = computeStreak(activityTimestamps)
  const focusProject = pickFocusProject(projects)
  const focusStaleness = focusProject ? checkpointStaleness(focusProject.checkpoint_updated_at) : null

  const upcomingDeadlines = presentations
    .filter((p) => !CLOSED_PRESENTATION_STATUSES.has(p.status) && p.deadline_date != null && daysUntil(p.deadline_date) >= 0 && daysUntil(p.deadline_date) <= URGENT_WINDOW_DAYS)
    .sort(byDeadline)

  const projectById = new Map(projects.map((p) => [p.id, p.name]))

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-title">JJK</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
            Ideas, execution, and expansion for your own research pipeline.
          </p>
        </div>
        {streak > 0 && (
          <div className="panel px-4 py-2 text-center shrink-0">
            <div className="text-2xl font-semibold" style={{ color: 'var(--accent-ink)' }}>{streak}</div>
            <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>day streak</div>
          </div>
        )}
      </div>

      <section className="panel p-5" style={{ borderColor: 'var(--accent)', borderWidth: '2px' }}>
        <h2 className="text-caption uppercase tracking-wide font-semibold mb-3">Right now</h2>
        {focusProject ? (
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Link href={`/portal/jjk/projects/${focusProject.id}`} className="text-lg font-semibold link-accent">
                {focusProject.name}
              </Link>
              <div className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
                {JJK_PILLAR_LABELS[focusProject.pillar]} &middot; {JJK_PROJECT_STAGE_LABELS[focusProject.stage]}
                {focusProject.progress_percent != null ? ` · ${focusProject.progress_percent}%` : ''}
              </div>
              {focusProject.checkpoint && (
                <div className="text-sm mt-2">
                  <span style={{ color: 'var(--ink-muted)' }}>Checkpoint: </span>
                  {focusProject.checkpoint}
                  {focusStaleness && focusStaleness.level !== 'fresh' && (
                    <span className="ml-2 badge badge-flag">Stuck {focusStaleness.days}d</span>
                  )}
                </div>
              )}
            </div>
            <Link href={`/portal/jjk/projects/${focusProject.id}`} className="btn btn-primary shrink-0">
              Open
            </Link>
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>
            Nothing in Drafting, Under Review, or Revision right now. Promote a ready idea to start something.
          </p>
        )}
      </section>

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="panel p-4">
          <div className="text-2xl font-semibold">{activeIdeas.length}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>Active ideas</div>
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
