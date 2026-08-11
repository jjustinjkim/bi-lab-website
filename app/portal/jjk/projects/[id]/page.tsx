import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getJjkProject, getJjkProjectUpdates } from '@/lib/jjkQueries'
import { deleteJjkProject } from '@/lib/jjkActions'
import ConfirmSubmitButton from '@/components/ConfirmSubmitButton'
import JjkProjectEditForm from './JjkProjectEditForm'
import JjkProjectStageForm from './JjkProjectStageForm'
import JjkProjectUpdatesForm from './JjkProjectUpdatesForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Project', robots: { index: false, follow: false } }

function formatDateTime(date: string) {
  return new Date(date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default async function JjkProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [project, updates] = await Promise.all([getJjkProject(id), getJjkProjectUpdates(id)])
  if (!project) notFound()

  async function removeProject() {
    'use server'
    await deleteJjkProject(id)
    redirect('/portal/jjk/projects')
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <Link href="/portal/jjk/projects" className="link-accent text-sm">&larr; All projects</Link>

      <div className="panel p-5 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-title">{project.name}</h1>
          <JjkProjectStageForm project={project} />
        </div>
        <JjkProjectEditForm project={project} />
        <form action={removeProject} className="pt-4" style={{ borderTop: '1px solid var(--hairline)' }}>
          <ConfirmSubmitButton className="text-sm link-danger" confirmMessage={`Delete project "${project.name}"? This cannot be undone.`}>
            Delete project
          </ConfirmSubmitButton>
        </form>
      </div>

      <div className="panel p-5 space-y-4">
        <h2 className="text-caption uppercase tracking-wide font-semibold">Progress log</h2>
        <JjkProjectUpdatesForm projectId={id} />
        {updates.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>No updates logged yet.</p>
        ) : (
          <ul className="space-y-3">
            {updates.map((u) => (
              <li key={u.id} className="text-sm">
                <div style={{ color: 'var(--ink-faint)' }} className="text-xs">{formatDateTime(u.created_at)}</div>
                <div>{u.body}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
