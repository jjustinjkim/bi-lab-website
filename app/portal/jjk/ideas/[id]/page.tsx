import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getBigIdea, getJjkProject } from '@/lib/jjkQueries'
import { setBigIdeaStatus, deleteBigIdea } from '@/lib/jjkActions'
import { JJK_PILLAR_LABELS, ideaClarityCount } from '@/lib/jjkTypes'
import ConfirmSubmitButton from '@/components/ConfirmSubmitButton'
import SubmitButton from '@/components/portal/SubmitButton'
import BigIdeaWizardForm from './BigIdeaWizardForm'
import PromoteIdeaForm from './PromoteIdeaForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Idea', robots: { index: false, follow: false } }

export default async function BigIdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const idea = await getBigIdea(id)
  if (!idea) notFound()

  // Deleting a promoted idea doesn't touch its project (jjk_projects.source_idea_id
  // is ON DELETE SET NULL) -- only shown so the confirm dialog can name what
  // it's detaching from, not because deletion is blocked by it.
  const promotedProject = idea.promoted_project_id ? await getJjkProject(idea.promoted_project_id) : null

  async function archiveIdea() {
    'use server'
    await setBigIdeaStatus(id, 'archived')
  }

  async function restoreIdea() {
    'use server'
    await setBigIdeaStatus(id, 'active')
  }

  async function removeIdea() {
    'use server'
    await deleteBigIdea(id)
    redirect('/portal/jjk/ideas')
  }

  const clarity = ideaClarityCount(idea)

  return (
    <div className="space-y-8 max-w-2xl">
      <Link href="/portal/jjk/ideas" className="link-accent text-sm">&larr; All big ideas</Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-title">{idea.title}</h1>
          <div className="text-sm mt-1 flex items-center gap-2" style={{ color: 'var(--ink-muted)' }}>
            <span>{JJK_PILLAR_LABELS[idea.pillar]}</span>
            <span className={`badge ${clarity === 5 ? 'badge-accent' : ''}`}>{clarity}/5 clarified</span>
            {idea.status === 'archived' && <span className="badge">Archived</span>}
            {idea.status === 'promoted' && <span className="badge badge-accent">Promoted</span>}
          </div>
        </div>
        {idea.status === 'active' && (
          <form action={archiveIdea}>
            <SubmitButton className="text-xs link-accent" toastMessage="Idea archived">Archive</SubmitButton>
          </form>
        )}
        {idea.status === 'archived' && (
          <form action={restoreIdea}>
            <SubmitButton className="text-xs link-accent" toastMessage="Idea restored">Restore</SubmitButton>
          </form>
        )}
      </div>

      {idea.status !== 'promoted' && <BigIdeaWizardForm idea={idea} />}

      {idea.status === 'active' && (
        <div>
          <h2 className="text-caption uppercase tracking-wide font-semibold mb-3">Promote</h2>
          <PromoteIdeaForm ideaId={idea.id} defaultName={idea.title} />
        </div>
      )}

      <form action={removeIdea} className="pt-4" style={{ borderTop: '1px solid var(--hairline)' }}>
        <ConfirmSubmitButton
          className="text-sm link-danger"
          confirmMessage={
            promotedProject
              ? `Delete "${idea.title}"? Its project "${promotedProject.name}" will NOT be deleted, just detached from this idea. This cannot be undone.`
              : `Delete "${idea.title}"? This cannot be undone.`
          }
        >
          Delete idea
        </ConfirmSubmitButton>
      </form>
    </div>
  )
}
