import type { Metadata } from 'next'
import { getSessionMember } from '@/lib/auth'
import { getGrants, getProjects } from '@/lib/queries'
import { deleteGrant } from '@/lib/actions'
import { GRANT_STATUS_LABELS } from '@/lib/types'
import type { Grant } from '@/lib/types'
import ConfirmSubmitButton from '@/components/ConfirmSubmitButton'
import AddGrantForm from './AddGrantForm'
import GrantTrackingForm from './GrantTrackingForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Grants', robots: { index: false, follow: false } }

const ACTIVE_STATUSES = new Set(['researching', 'applying', 'submitted'])
const CLOSED_STATUSES = new Set(['awarded', 'declined'])
const URGENT_WINDOW_DAYS = 90
const SOON_WINDOW_DAYS = 14

function daysUntil(dateStr: string): number {
  const target = new Date(`${dateStr}T00:00:00`).getTime()
  return Math.ceil((target - Date.now()) / 86_400_000)
}

// Nearest deadline first; grants with no deadline sort to the end and keep
// their relative order.
function byDeadline(a: Grant, b: Grant): number {
  if (a.deadline_date && b.deadline_date) return a.deadline_date.localeCompare(b.deadline_date)
  if (a.deadline_date) return -1
  if (b.deadline_date) return 1
  return 0
}

export default async function GrantsPage() {
  const [grants, projects, member] = await Promise.all([getGrants(), getProjects(), getSessionMember()])
  const projectById = new Map(projects.map((p) => [p.id, p.name]))
  const isAdmin = member?.is_admin ?? false

  const active = grants.filter((g) => ACTIVE_STATUSES.has(g.status)).sort(byDeadline)
  const identified = grants.filter((g) => g.status === 'identified').sort(byDeadline)
  const closed = grants.filter((g) => CLOSED_STATUSES.has(g.status)).sort(byDeadline)

  const upcoming = grants
    .filter((g) => !CLOSED_STATUSES.has(g.status) && g.deadline_date != null && daysUntil(g.deadline_date) >= 0 && daysUntil(g.deadline_date) <= URGENT_WINDOW_DAYS)
    .sort(byDeadline)

  async function removeGrant(formData: FormData) {
    'use server'
    await deleteGrant(formData.get('id') as string)
  }

  function GrantItem(g: Grant) {
    const closed = CLOSED_STATUSES.has(g.status)
    const daysLeft = !closed && g.deadline_date != null ? daysUntil(g.deadline_date) : null
    const dueSoon = daysLeft != null && daysLeft >= 0 && daysLeft <= URGENT_WINDOW_DAYS
    const dueVerySoon = daysLeft != null && daysLeft >= 0 && daysLeft <= SOON_WINDOW_DAYS
    const overdue = daysLeft != null && daysLeft < 0

    return (
      <li key={g.id} className="panel p-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium flex items-center gap-2 flex-wrap">
            {g.url ? (
              <a href={g.url} target="_blank" rel="noopener noreferrer" className="link-accent">{g.name}</a>
            ) : (
              g.name
            )}
            {overdue && <span className="badge badge-flag">Deadline passed</span>}
            {dueSoon && (
              <span className={`badge ${dueVerySoon ? 'badge-flag' : 'badge-accent'}`}>
                Deadline in {daysLeft}d
              </span>
            )}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
            {g.funder ?? 'Funder not noted'}
            {g.amount ? ` · ${g.amount}` : ''}
            {g.deadline_date ? ` · Deadline ${g.deadline_date}` : ''}
            {g.project_id ? ` · ${projectById.get(g.project_id) ?? 'Unknown project'}` : ''}
          </div>
          {g.notes && (
            <div className="text-xs mt-1" style={{ color: 'var(--ink-faint)' }}>{g.notes}</div>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isAdmin ? (
            <div className="flex items-start gap-3">
              <GrantTrackingForm grant={g} />
              <form action={removeGrant}>
                <input type="hidden" name="id" value={g.id} />
                <ConfirmSubmitButton className="text-xs link-danger" confirmMessage={`Delete "${g.name}" from the grants tracker? This cannot be undone.`} toastMessage="Grant deleted">
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          ) : (
            <span className="badge">{GRANT_STATUS_LABELS[g.status]}</span>
          )}
        </div>
      </li>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-title">Grants</h1>

      <details className="panel p-5">
        <summary className="text-subtitle cursor-pointer" style={{ fontSize: '0.9375rem' }}>
          Add grant opportunity
        </summary>
        <AddGrantForm projects={projects} />
      </details>

      <div className="space-y-3">
        <h2 className="text-subtitle" style={{ fontSize: '0.9375rem' }}>
          Upcoming deadlines, within {URGENT_WINDOW_DAYS} days ({upcoming.length})
        </h2>
        <ul className="space-y-2">
          {upcoming.map(GrantItem)}
          {upcoming.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>
              None. Deadlines show here once added to a grant, closest first.
            </p>
          )}
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="text-subtitle" style={{ fontSize: '0.9375rem' }}>Active pipeline ({active.length})</h2>
        <ul className="space-y-2">
          {active.map(GrantItem)}
          {active.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>Nothing actively in progress.</p>}
        </ul>
      </div>

      <details open>
        <summary className="text-subtitle cursor-pointer" style={{ fontSize: '0.9375rem' }}>
          Identified ({identified.length})
        </summary>
        <ul className="space-y-2 mt-3">
          {identified.map(GrantItem)}
          {identified.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>Nothing identified yet.</p>}
        </ul>
      </details>

      <details>
        <summary className="text-subtitle cursor-pointer" style={{ fontSize: '0.9375rem' }}>
          Awarded and declined ({closed.length})
        </summary>
        <ul className="space-y-2 mt-3">
          {closed.map(GrantItem)}
          {closed.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>None yet.</p>}
        </ul>
      </details>

      {grants.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>No grants tracked yet.</p>}
    </div>
  )
}
