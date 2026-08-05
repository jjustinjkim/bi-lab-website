import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getProject, getTasksForProject, getDeadlinesForProject, getDatasetsForProject } from '@/lib/queries'
import { updateProject, deleteProject } from '@/lib/actions'
import { PROJECT_GROUP_LABELS, type ProjectGroupType } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Project', robots: { index: false, follow: false } }

const STATUS_LABEL: Record<string, string> = {
  planning: 'Planning',
  active: 'Active',
  blocked: 'Blocked',
  done: 'Done',
}

const GROUP_OPTIONS = Object.entries(PROJECT_GROUP_LABELS) as [ProjectGroupType, string][]

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params
  const project = await getProject(id)
  if (!project) notFound()

  const [tasks, deadlines, datasets] = await Promise.all([
    getTasksForProject(id),
    getDeadlinesForProject(id),
    getDatasetsForProject(id),
  ])

  async function saveProject(formData: FormData) {
    'use server'
    await updateProject(id, formData)
  }

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
        <form action={saveProject} className="space-y-4">
          <div>
            <label className="field-label" htmlFor="name">Project</label>
            <input id="name" name="name" defaultValue={project.name} required className="field-input" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="field-label" htmlFor="group_type">Gr</label>
              <select id="group_type" name="group_type" defaultValue={project.group_type ?? ''} className="field-input">
                <option value="">&mdash;</option>
                {GROUP_OPTIONS.map(([v, l]) => (
                  <option key={v} value={v}>{v} &mdash; {l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue={project.status} className="field-input">
                {Object.entries(STATUS_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="work_percent">Work status (% done)</label>
              <input
                id="work_percent"
                name="work_percent"
                type="number"
                min={0}
                max={100}
                defaultValue={project.work_percent ?? ''}
                className="field-input"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="faculty">Faculty</label>
              <input id="faculty" name="faculty" defaultValue={project.faculty ?? ''} className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="personnel">Personnel</label>
              <input id="personnel" name="personnel" defaultValue={project.personnel ?? ''} className="field-input" />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="field-label" htmlFor="pub_status">Pub status</label>
              <input id="pub_status" name="pub_status" defaultValue={project.pub_status ?? ''} className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="meeting">Mtg</label>
              <input id="meeting" name="meeting" defaultValue={project.meeting ?? ''} className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="deadline_date">Deadline</label>
              <input
                id="deadline_date"
                name="deadline_date"
                type="date"
                defaultValue={project.deadline_date ?? ''}
                className="field-input"
              />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="checkpoint">Checkpoint</label>
            <input id="checkpoint" name="checkpoint" defaultValue={project.checkpoint ?? ''} className="field-input" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="journal">Journal / Book</label>
              <input id="journal" name="journal" defaultValue={project.journal ?? ''} className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="pub_year">Year</label>
              <input id="pub_year" name="pub_year" type="number" defaultValue={project.pub_year ?? ''} className="field-input" />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={2} defaultValue={project.description ?? ''} className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" rows={3} defaultValue={project.notes ?? ''} className="field-input" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary">Save changes</button>
          </div>
        </form>
        <form action={removeProject} className="mt-4 pt-4" style={{ borderTop: '1px solid var(--hairline)' }}>
          <button type="submit" className="text-sm" style={{ color: 'var(--accent-2-ink)' }}>Delete project</button>
        </form>
      </div>

      <section>
        <h2 className="text-caption uppercase tracking-wide font-semibold mb-3">Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>No tasks linked to this project.</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li key={t.id} className="text-sm flex items-center justify-between panel px-4 py-2.5">
                <span>{t.title}</span>
                <span className="badge">{t.status}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/portal/tasks" className="text-xs link-accent mt-2 inline-block">Manage tasks &rarr;</Link>
      </section>

      <section>
        <h2 className="text-caption uppercase tracking-wide font-semibold mb-3">Deadlines</h2>
        {deadlines.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>No deadlines linked to this project.</p>
        ) : (
          <ul className="space-y-2">
            {deadlines.map((d) => (
              <li key={d.id} className="text-sm flex items-center justify-between panel px-4 py-2.5">
                <span>{d.title}</span>
                <span className="badge badge-flag">{d.date}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/portal/deadlines" className="text-xs link-accent mt-2 inline-block">Manage deadlines &rarr;</Link>
      </section>

      <section>
        <h2 className="text-caption uppercase tracking-wide font-semibold mb-3">Datasets</h2>
        {datasets.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>No datasets linked to this project.</p>
        ) : (
          <ul className="space-y-2">
            {datasets.map((d) => (
              <li key={d.id} className="text-sm flex items-center justify-between panel px-4 py-2.5">
                <span>{d.name}</span>
                {d.sample_count != null && <span className="badge">{d.sample_count} samples</span>}
              </li>
            ))}
          </ul>
        )}
        <Link href="/portal/datasets" className="text-xs link-accent mt-2 inline-block">Manage datasets &rarr;</Link>
      </section>
    </div>
  )
}
