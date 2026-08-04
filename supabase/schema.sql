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

-- The public anon key is never meant to touch these tables at all -- the
-- app only ever reads/writes via the service-role key, server-side.
REVOKE ALL ON lab_members, member_sessions, member_login_attempts, projects, tasks, deadlines, datasets
FROM anon, authenticated;
