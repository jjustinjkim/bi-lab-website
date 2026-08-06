import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { getSessionMember } from '@/lib/auth'
import { getGrants, getProjects } from '@/lib/queries'
import { createGrant, deleteGrant, updateGrantStatus } from '@/lib/actions'
import { GRANT_STATUS_LABELS } from '@/lib/types'
import type { Grant } from '@/lib/types'
import ConfirmSubmitButton from '@/components/ConfirmSubmitButton'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Grants', robots: { index: false, follow: false } }

const ACTIVE_STATUSES = new Set(['researching', 'applying', 'submitted'])
const CLOSED_STATUSES = new Set(['awarded', 'declined'])
const URGENT_WINDOW_DAYS = 60

function daysUntil(dateStr: string): number {
  const target = new Date(`${dateStr}T00:00:00`).getTime()
  return Math.ceil((target - Date.now()) / 86_400_000)
}

// Notes mix a few different kinds of information (eligibility caveats,
// research status, strategic fit). A light `[Tag]` prefix convention keeps
// that scannable without a schema change -- this just renders any bracketed
// tag in bold so the convention actually pays off once people use it.
function renderNotes(notes: string): ReactNode {
  const parts = notes.split(/(\[[^\]]+\])/g)
  return parts.map((part, i) =>
    /^\[[^\]]+\]$/.test(part) ? (
      <span key={i} className="font-semibold" style={{ color: 'var(--ink-muted)' }}>{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

export default async function GrantsPage() {
  const [grants, projects, member] = await Promise.all([getGrants(), getProjects(), getSessionMember()])
  const projectById = new Map(projects.map((p) => [p.id, p.name]))
  const isAdmin = member?.is_admin ?? false

  const active = grants.filter((g) => ACTIVE_STATUSES.has(g.status))
  const identified = grants.filter((g) => g.status === 'identified')
  const closed = grants.filter((g) => CLOSED_STATUSES.has(g.status))

  async function addGrant(formData: FormData) {
    'use server'
    await createGrant(formData)
  }

  async function removeGrant(formData: FormData) {
    'use server'
    await deleteGrant(formData.get('id') as string)
  }

  async function setStatus(formData: FormData) {
    'use server'
    await updateGrantStatus(formData.get('id') as string, formData.get('status') as string)
  }

  function GrantItem(g: Grant) {
    const urgent = g.status === 'identified' && g.deadline_date != null && (() => {
      const d = daysUntil(g.deadline_date as string)
      return d >= 0 && d <= URGENT_WINDOW_DAYS
    })()

    return (
      <li key={g.id} className="panel p-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium flex items-center gap-2 flex-wrap">
            {g.url ? (
              <a href={g.url} target="_blank" rel="noopener noreferrer" className="link-accent">{g.name}</a>
            ) : (
              g.name
            )}
            {urgent && (
              <span className="badge badge-flag">
                Deadline in {daysUntil(g.deadline_date as string)}d, not started
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
            <div className="text-xs mt-1" style={{ color: 'var(--ink-faint)' }}>{renderNotes(g.notes)}</div>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isAdmin ? (
            <>
              <form action={setStatus} className="flex items-center gap-1.5">
                <input type="hidden" name="id" value={g.id} />
                <select
                  name="status"
                  defaultValue={g.status}
                  className="field-input"
                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
                >
                  {Object.entries(GRANT_STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <button type="submit" className="text-xs link-accent">Update</button>
              </form>
              <form action={removeGrant}>
                <input type="hidden" name="id" value={g.id} />
                <ConfirmSubmitButton className="text-xs link-danger" confirmMessage={`Delete "${g.name}" from the grants tracker? This cannot be undone.`}>
                  Delete
                </ConfirmSubmitButton>
              </form>
            </>
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
        <form action={addGrant} className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="name">Name</label>
            <input id="name" name="name" required className="field-input" placeholder="e.g. NBTS Meningioma Research Fund" />
          </div>
          <div>
            <label className="field-label" htmlFor="funder">Funder</label>
            <input id="funder" name="funder" className="field-input" placeholder="e.g. National Brain Tumor Society" />
          </div>
          <div>
            <label className="field-label" htmlFor="amount">Amount</label>
            <input id="amount" name="amount" className="field-input" placeholder="e.g. up to $50,000" />
          </div>
          <div>
            <label className="field-label" htmlFor="status">Status</label>
            <select id="status" name="status" className="field-input" defaultValue="identified">
              {Object.entries(GRANT_STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="deadline_date">Deadline</label>
            <input id="deadline_date" name="deadline_date" type="date" className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="url">Link</label>
            <input id="url" name="url" type="url" className="field-input" placeholder="https://..." />
          </div>
          <div>
            <label className="field-label" htmlFor="project_id">Project</label>
            <select id="project_id" name="project_id" className="field-input" defaultValue="">
              <option value="">None</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              className="field-input"
              placeholder="[Fit] Why it's on the list... [Eligibility] Caveats on who can apply... [Action] Next step..."
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn btn-primary">Add grant</button>
          </div>
        </form>
      </details>

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
