import type { Metadata } from 'next'
import { getTasks, getProjects, getLabMembers } from '@/lib/queries'
import { createTask, deleteTask, updateTaskStatus } from '@/lib/actions'
import ConfirmSubmitButton from '@/components/ConfirmSubmitButton'
import SubmitButton from '@/components/portal/SubmitButton'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Tasks', robots: { index: false, follow: false } }

const STATUS_LABEL: Record<string, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
}

export default async function TasksPage() {
  const [tasks, projects, members] = await Promise.all([getTasks(), getProjects(), getLabMembers()])

  const projectById = new Map(projects.map((p) => [p.id, p.name]))
  const memberById = new Map(members.map((m) => [m.id, m.name]))

  async function addTask(formData: FormData) {
    'use server'
    await createTask(formData)
  }

  async function removeTask(formData: FormData) {
    'use server'
    await deleteTask(formData.get('id') as string)
  }

  async function setStatus(formData: FormData) {
    'use server'
    await updateTaskStatus(formData.get('id') as string, formData.get('status') as string)
  }

  return (
    <div className="space-y-8">
      <h1 className="text-title">Tasks</h1>

      <details className="panel p-5">
        <summary className="text-subtitle cursor-pointer" style={{ fontSize: '0.9375rem' }}>
          Add task
        </summary>
        <form action={addTask} className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="title">Title</label>
            <input id="title" name="title" required className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="project_id">Project</label>
            <select id="project_id" name="project_id" className="field-input" defaultValue="">
              <option value="">None</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="assignee_id">Assignee</label>
            <select id="assignee_id" name="assignee_id" className="field-input" defaultValue="">
              <option value="">Unassigned</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="due_date">Due date</label>
            <input id="due_date" name="due_date" type="date" className="field-input" />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton className="btn btn-primary" toastMessage="Task added">Add task</SubmitButton>
          </div>
        </form>
      </details>

      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="panel p-4 flex flex-wrap items-center gap-3 justify-between">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{t.title}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                {t.project_id ? projectById.get(t.project_id) ?? 'Unknown project' : 'No project'}
                {' · '}
                {t.assignee_id ? memberById.get(t.assignee_id) ?? 'Unknown' : 'Unassigned'}
                {t.due_date ? ` · Due ${t.due_date}` : ''}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <form action={setStatus} className="flex items-center gap-1.5">
                <input type="hidden" name="id" value={t.id} />
                <select
                  name="status"
                  defaultValue={t.status}
                  className="field-input"
                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
                >
                  {Object.entries(STATUS_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <SubmitButton className="text-xs link-accent" toastMessage="Status updated">Update</SubmitButton>
              </form>
              <form action={removeTask}>
                <input type="hidden" name="id" value={t.id} />
                <ConfirmSubmitButton className="text-xs link-danger" confirmMessage={`Delete task "${t.title}"? This cannot be undone.`} toastMessage="Task deleted">
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          </li>
        ))}
        {tasks.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>No tasks yet.</p>}
      </ul>
    </div>
  )
}
