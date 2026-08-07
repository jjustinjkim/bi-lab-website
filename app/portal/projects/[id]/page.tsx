import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  getProject,
  getLabMembers,
  getProjectMemberIds,
} from '@/lib/queries'
import { deleteProject } from '@/lib/actions'
import ConfirmSubmitButton from '@/components/ConfirmSubmitButton'
import EditProjectForm from './EditProjectForm'
import ProjectAccessForm from './ProjectAccessForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Project', robots: { index: false, follow: false } }

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params
  const project = await getProject(id)
  if (!project) notFound()

  const [allMembers, taggedMemberIds] = await Promise.all([
    getLabMembers(),
    getProjectMemberIds(id),
  ])

  async function removeProject() {
    'use server'
    await deleteProject(id)
    redirect('/portal/projects')
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <Link href="/portal/projects" className="link-accent text-sm">&larr; All projects</Link>

      <div className="panel p-5">
        <h1 className="text-title mb-4">{project.name}</h1>
        <EditProjectForm project={project} />
        <form action={removeProject} className="mt-4 pt-4" style={{ borderTop: '1px solid var(--hairline)' }}>
          <ConfirmSubmitButton
            className="text-sm link-danger"
            confirmMessage={`Delete project "${project.name}"? This cannot be undone.`}
          >
            Delete project
          </ConfirmSubmitButton>
        </form>
      </div>

      <div className="panel p-5">
        <h2 className="text-caption uppercase tracking-wide font-semibold mb-1">Team members with access</h2>
        <p className="text-xs mb-3" style={{ color: 'var(--ink-faint)' }}>
          Whoever created this project, and anyone with full project visibility, can already see it.
          Tag other lab member accounts here to share it with them specifically.
        </p>
        <ProjectAccessForm projectId={id} allMembers={allMembers} taggedMemberIds={taggedMemberIds} />
      </div>
    </div>
  )
}
