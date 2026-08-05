import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'

// On-demand, admin-only backup of the portal's own data (not the public
// site or the inventory, which are both static/git-tracked already and
// don't need this). No automated/scheduled version of this exists -- it
// downloads straight to the admin's browser and is never persisted
// server-side or committed anywhere, on purpose, since lab_members carries
// real names/emails that shouldn't end up in git history without a
// deliberate decision about repo visibility first.
export async function GET() {
  await requireAdmin()
  const db = createAdminClient()

  const [members, projects, tasks, deadlines, datasets, projectMembers] = await Promise.all([
    // Never password_hash, even though it's already bcrypt-hashed -- no
    // reason for a downloadable file to carry it at all.
    db.from('lab_members').select('id, email, name, title, is_admin, can_view_all_projects, created_at'),
    db.from('projects').select('*'),
    db.from('tasks').select('*'),
    db.from('deadlines').select('*'),
    db.from('datasets').select('*'),
    db.from('project_members').select('*'),
  ])

  const backup = {
    exported_at: new Date().toISOString(),
    lab_members: members.data ?? [],
    projects: projects.data ?? [],
    tasks: tasks.data ?? [],
    deadlines: deadlines.data ?? [],
    datasets: datasets.data ?? [],
    project_members: projectMembers.data ?? [],
  }

  const filename = `bilab-portal-backup-${new Date().toISOString().slice(0, 10)}.json`
  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
