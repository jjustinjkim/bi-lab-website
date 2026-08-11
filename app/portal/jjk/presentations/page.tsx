import type { Metadata } from 'next'
import { getPresentationOpportunities, getJjkProjects } from '@/lib/jjkQueries'
import { deletePresentationOpportunity } from '@/lib/jjkActions'
import { JJK_PRESENTATION_TYPE_LABELS, type JjkPresentationOpportunity } from '@/lib/jjkTypes'
import { daysUntil, byDeadline, URGENT_WINDOW_DAYS, SOON_WINDOW_DAYS } from '@/lib/jjkDates'
import ConfirmSubmitButton from '@/components/ConfirmSubmitButton'
import AddPresentationForm from './AddPresentationForm'
import PresentationTrackingForm from './PresentationTrackingForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Presentations', robots: { index: false, follow: false } }

const ACTIVE_STATUSES = new Set(['preparing', 'submitted', 'accepted'])
const CLOSED_STATUSES = new Set(['declined', 'presented'])

export default async function PresentationsPage() {
  const [presentations, projects] = await Promise.all([getPresentationOpportunities(), getJjkProjects()])
  const projectById = new Map(projects.map((p) => [p.id, p.name]))

  const active = presentations.filter((p) => ACTIVE_STATUSES.has(p.status)).sort(byDeadline)
  const identified = presentations.filter((p) => p.status === 'identified').sort(byDeadline)
  const closed = presentations.filter((p) => CLOSED_STATUSES.has(p.status)).sort(byDeadline)

  const upcoming = presentations
    .filter((p) => !CLOSED_STATUSES.has(p.status) && p.deadline_date != null && daysUntil(p.deadline_date) >= 0 && daysUntil(p.deadline_date) <= URGENT_WINDOW_DAYS)
    .sort(byDeadline)

  async function removePresentation(formData: FormData) {
    'use server'
    await deletePresentationOpportunity(formData.get('id') as string)
  }

  function PresentationItem(item: JjkPresentationOpportunity) {
    const closed = CLOSED_STATUSES.has(item.status)
    const daysLeft = !closed && item.deadline_date != null ? daysUntil(item.deadline_date) : null
    const dueSoon = daysLeft != null && daysLeft >= 0 && daysLeft <= URGENT_WINDOW_DAYS
    const dueVerySoon = daysLeft != null && daysLeft >= 0 && daysLeft <= SOON_WINDOW_DAYS
    const overdue = daysLeft != null && daysLeft < 0

    return (
      <li key={item.id} className="panel p-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium flex items-center gap-2 flex-wrap">
            {item.title}
            {overdue && <span className="badge badge-flag">Deadline passed</span>}
            {dueSoon && (
              <span className={`badge ${dueVerySoon ? 'badge-flag' : 'badge-accent'}`}>
                Deadline in {daysLeft}d
              </span>
            )}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
            {JJK_PRESENTATION_TYPE_LABELS[item.type]}
            {item.venue ? ` · ${item.venue}` : ''}
            {item.deadline_date ? ` · Deadline ${item.deadline_date}` : ''}
            {item.project_id ? ` · ${projectById.get(item.project_id) ?? 'Unknown project'}` : ''}
          </div>
          {item.notes && <div className="text-xs mt-1" style={{ color: 'var(--ink-faint)' }}>{item.notes}</div>}
        </div>
        <div className="flex items-start gap-3 shrink-0">
          <PresentationTrackingForm item={item} />
          <form action={removePresentation}>
            <input type="hidden" name="id" value={item.id} />
            <ConfirmSubmitButton className="text-xs link-danger" confirmMessage={`Delete "${item.title}"? This cannot be undone.`} toastMessage="Opportunity deleted">
              Delete
            </ConfirmSubmitButton>
          </form>
        </div>
      </li>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-title">Presentation Opportunities</h1>

      <details className="panel p-5">
        <summary className="text-subtitle cursor-pointer" style={{ fontSize: '0.9375rem' }}>
          Add opportunity
        </summary>
        <AddPresentationForm projects={projects} />
      </details>

      <div className="space-y-3">
        <h2 className="text-subtitle" style={{ fontSize: '0.9375rem' }}>
          Upcoming deadlines, within {URGENT_WINDOW_DAYS} days ({upcoming.length})
        </h2>
        <ul className="space-y-2">
          {upcoming.map(PresentationItem)}
          {upcoming.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>None. Deadlines show here once added, closest first.</p>
          )}
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="text-subtitle" style={{ fontSize: '0.9375rem' }}>In progress ({active.length})</h2>
        <ul className="space-y-2">
          {active.map(PresentationItem)}
          {active.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>Nothing actively in progress.</p>}
        </ul>
      </div>

      <details open>
        <summary className="text-subtitle cursor-pointer" style={{ fontSize: '0.9375rem' }}>
          Identified ({identified.length})
        </summary>
        <ul className="space-y-2 mt-3">
          {identified.map(PresentationItem)}
          {identified.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>Nothing identified yet.</p>}
        </ul>
      </details>

      <details>
        <summary className="text-subtitle cursor-pointer" style={{ fontSize: '0.9375rem' }}>
          Declined and presented ({closed.length})
        </summary>
        <ul className="space-y-2 mt-3">
          {closed.map(PresentationItem)}
          {closed.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>None yet.</p>}
        </ul>
      </details>

      {presentations.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>No presentation opportunities tracked yet.</p>}
    </div>
  )
}
