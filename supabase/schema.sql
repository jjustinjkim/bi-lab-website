-- Bi Lab website: portal schema
-- Run this in your Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Individual lab member accounts (not a single shared password): access can
-- be revoked per person, and tasks/projects can be attributed to a real
-- assignee/owner rather than an anonymous shared login.
CREATE TABLE IF NOT EXISTS lab_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Separate from is_admin (which only governs member management): controls
-- whether this person sees every project in the tracker, or only the ones
-- they're personally involved in. Intended for the PI, not member-management
-- admins in general.
ALTER TABLE lab_members ADD COLUMN IF NOT EXISTS can_view_all_projects BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS member_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES lab_members(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '60 days'
);

-- Failed login attempts, scoped per-email, for brute-force lockout.
CREATE TABLE IF NOT EXISTS member_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_login_attempts_email_created ON member_login_attempts(email, created_at);
CREATE INDEX IF NOT EXISTS idx_member_sessions_token ON member_sessions(token);

-- ── Project manager tool ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'blocked', 'done')),
  owner_id UUID REFERENCES lab_members(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS projects_updated_at ON projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Lab-wide research tracker fields, matching the structure of the lab's own
-- spreadsheet tracker: group_type/faculty/personnel/work_percent/pub_status/
-- meeting/deadline_date/checkpoint track an in-progress project, journal/
-- pub_year get filled in once it's actually published. faculty and personnel
-- are free text (not FKs to lab_members) because most named collaborators
-- --  co-authoring faculty, historical trainees -- are never lab_members
-- accounts themselves.
-- 'P' shows up in the historical spreadsheet (pre-2015 entries) but was
-- never in its own legend -- kept as a valid value since real rows use it,
-- without guessing at what it stood for.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS group_type TEXT CHECK (group_type IN ('A', 'C', 'Ch', 'R', 'T', 'X', 'P'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS faculty TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS personnel TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS work_percent INTEGER CHECK (work_percent BETWEEN 0 AND 100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS pub_status TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS meeting TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deadline_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS checkpoint TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS journal TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS pub_year INTEGER;

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES lab_members(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('grant', 'abstract', 'conference', 'irb', 'other')),
  date DATE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  sample_count INTEGER,
  processing_status TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_date ON deadlines(date);
CREATE INDEX IF NOT EXISTS idx_deadlines_project ON deadlines(project_id);
CREATE INDEX IF NOT EXISTS idx_datasets_project ON datasets(project_id);

-- Explicit per-person sharing: which lab_members accounts (not the freeform
-- personnel/faculty text, which mostly names people who never get accounts)
-- can see a given project. A member without can_view_all_projects only sees
-- projects where they're tagged here or where they're the owner.
CREATE TABLE IF NOT EXISTS project_members (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES lab_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_member ON project_members(member_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);

-- Disable Row Level Security (portal is gated app-side; all access via
-- the service-role key from server-side code that has already checked
-- requireMember()/requireAdmin()).
ALTER TABLE lab_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE member_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE member_login_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines DISABLE ROW LEVEL SECURITY;
ALTER TABLE datasets DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_members DISABLE ROW LEVEL SECURITY;

-- The public anon key is never meant to touch these tables at all -- the
-- app only ever reads/writes via the service-role key, server-side.
REVOKE ALL ON lab_members, member_sessions, member_login_attempts, projects, tasks, deadlines, datasets, project_members
FROM anon, authenticated;
