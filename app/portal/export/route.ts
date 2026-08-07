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
  try {
    await requireAdmin()
  } catch {
    // requireAdmin() throws a plain Error -- fine in a page/Server Component,
    // where the pattern (see app/portal/members/page.tsx) is to catch it and
    // redirect() within the render tree. A route handler isn't part of that
    // tree, so the same throw would otherwise surface as a raw, unhandled
    // 500 instead of a clean 403 (only reachable via direct URL -- the
    // Download backup link itself only renders on the already admin-gated
    // Members page).
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const db = createAdminClient()

  const [members, projects, grants, projectMembers] = await Promise.all([
    // Never password_hash, even though it's already bcrypt-hashed -- no
    // reason for a downloadable file to carry it at all.
    db.from('lab_members').select('id, email, name, title, is_admin, can_view_all_projects, created_at'),
    db.from('projects').select('*'),
    db.from('grants').select('*'),
    db.from('project_members').select('*'),
  ])

  const backup = {
    exported_at: new Date().toISOString(),
    lab_members: members.data ?? [],
    projects: projects.data ?? [],
    grants: grants.data ?? [],
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
