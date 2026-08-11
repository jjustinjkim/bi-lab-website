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
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'blocked', 'done', 'archived')),
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
ALTER TABLE projects ADD COLUMN IF NOT EXISTS pubmed_url TEXT;

-- 'archived' added after 'done' already existed: distinct from done (which
-- means published/PubMedable, see the journal/pub_year fields above) --
-- archived is for projects that are no longer active but were never
-- necessarily heading toward publication. The inline CREATE TABLE above
-- covers a fresh database; this ALTER re-points the CHECK constraint for a
-- database where the table already exists (Postgres auto-names an unnamed
-- column CHECK "<table>_<column>_check").
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('planning', 'active', 'blocked', 'done', 'archived'));

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

-- Grant opportunity tracker: separate from deadlines (which is for a
-- specific already-committed date like an abstract or IRB renewal) --
-- a grant has its own lifecycle from "found it" through to an outcome,
-- and usually needs a note on eligibility/fit before anyone commits time
-- to actually applying. project_id is optional -- a grant might be
-- earmarked for a specific ongoing project, or just a general lead not
-- yet tied to one.
CREATE TABLE IF NOT EXISTS grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  funder TEXT,
  status TEXT NOT NULL DEFAULT 'identified' CHECK (status IN ('identified', 'researching', 'applying', 'submitted', 'awarded', 'declined')),
  amount TEXT,
  deadline_date DATE,
  url TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_date ON deadlines(date);
CREATE INDEX IF NOT EXISTS idx_deadlines_project ON deadlines(project_id);
CREATE INDEX IF NOT EXISTS idx_datasets_project ON datasets(project_id);
CREATE INDEX IF NOT EXISTS idx_grants_deadline ON grants(deadline_date);
CREATE INDEX IF NOT EXISTS idx_grants_project ON grants(project_id);

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

-- ── Ideation board ───────────────────────────────────────────────────────
-- Lightweight brainstorm-to-project pipeline: an idea starts here, any
-- member can dot-vote/archive it, and a surviving idea gets "promoted" into
-- a real row in `projects` (with an assigned lead, unlike createProject's
-- normal path where the creator is always the owner).
--
-- True 2-axis matrix (matching the sns-pd-academy board this was modeled
-- on): columns and rows are both freeform, member-managed lists (neither
-- axis has an agreed-on fixed set for this lab yet), not hardcoded enums.
CREATE TABLE IF NOT EXISTS project_idea_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_idea_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  column_id UUID REFERENCES project_idea_columns(id) ON DELETE SET NULL,
  row_id UUID REFERENCES project_idea_rows(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'promoted')),
  created_by UUID REFERENCES lab_members(id) ON DELETE SET NULL,
  promoted_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  promoted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dot-voting: one vote per member per idea, toggled on/off (not a count you
-- can increment repeatedly), same shape as project_members above.
CREATE TABLE IF NOT EXISTS project_idea_votes (
  idea_id UUID NOT NULL REFERENCES project_ideas(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES lab_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (idea_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_project_ideas_status ON project_ideas(status);
CREATE INDEX IF NOT EXISTS idx_project_ideas_column ON project_ideas(column_id);
CREATE INDEX IF NOT EXISTS idx_project_ideas_row ON project_ideas(row_id);
CREATE INDEX IF NOT EXISTS idx_project_idea_votes_idea ON project_idea_votes(idea_id);

-- ── JJK research progress portal ────────────────────────────────────────
-- A separate, single-user section of the portal (Justin's own research
-- pipeline: manuscripts, grants, collaborations, presentations), gated by
-- its own standalone password independent of lab_members/member_sessions
-- above -- see lib/jjkAuth.ts. Pillars/stages are fixed CHECK enums rather
-- than editable tables (unlike project_idea_columns/rows above) since this
-- is single-user and the taxonomy was agreed on up front, not something
-- that needs in-app editing by multiple people.

CREATE TABLE IF NOT EXISTS jjk_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '60 days'
);

CREATE TABLE IF NOT EXISTS jjk_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jjk_sessions_token ON jjk_sessions(token);
CREATE INDEX IF NOT EXISTS idx_jjk_login_attempts_ip_created ON jjk_login_attempts(ip, created_at);

CREATE TABLE IF NOT EXISTS jjk_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_idea_id UUID,
  pillar TEXT NOT NULL CHECK (pillar IN ('manuscript', 'grant', 'collaboration', 'presentation', 'tool')),
  name TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'planning' CHECK (stage IN ('planning', 'drafting', 'under_review', 'revision', 'published')),
  collaborators TEXT,
  target_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS jjk_projects_updated_at ON jjk_projects;
CREATE TRIGGER jjk_projects_updated_at
  BEFORE UPDATE ON jjk_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- The "Big Idea" clarification wizard: each of the 5 free-text fields is a
-- separate step, filled in independently (see updateBigIdeaStep in
-- lib/jjkActions.ts) -- the count of non-empty fields is how the UI shows
-- "N/5 clarified," not a separate stored status.
CREATE TABLE IF NOT EXISTS jjk_big_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar TEXT NOT NULL CHECK (pillar IN ('manuscript', 'grant', 'collaboration', 'presentation', 'tool')),
  title TEXT NOT NULL,
  spark TEXT,
  why_it_matters TEXT,
  feasibility_notes TEXT,
  specific_aim TEXT,
  next_step TEXT,
  next_step_target_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'promoted', 'archived')),
  promoted_project_id UUID REFERENCES jjk_projects(id) ON DELETE SET NULL,
  promoted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS jjk_big_ideas_updated_at ON jjk_big_ideas;
CREATE TRIGGER jjk_big_ideas_updated_at
  BEFORE UPDATE ON jjk_big_ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE jjk_projects ADD CONSTRAINT jjk_projects_source_idea_id_fkey
  FOREIGN KEY (source_idea_id) REFERENCES jjk_big_ideas(id) ON DELETE SET NULL;

-- Lightweight append-only progress log per project -- no versioning/realtime
-- needed for a single-user tool (see jjk_projects above).
CREATE TABLE IF NOT EXISTS jjk_project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES jjk_projects(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jjk_project_updates_project ON jjk_project_updates(project_id, created_at DESC);

CREATE TABLE IF NOT EXISTS jjk_presentation_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  venue TEXT,
  type TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('conference', 'grand_rounds', 'invited_talk', 'symposium', 'other')),
  deadline_date DATE,
  event_date DATE,
  status TEXT NOT NULL DEFAULT 'identified' CHECK (status IN ('identified', 'preparing', 'submitted', 'accepted', 'declined', 'presented')),
  project_id UUID REFERENCES jjk_projects(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS jjk_presentation_opportunities_updated_at ON jjk_presentation_opportunities;
CREATE TRIGGER jjk_presentation_opportunities_updated_at
  BEFORE UPDATE ON jjk_presentation_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_jjk_presentations_deadline ON jjk_presentation_opportunities(deadline_date);

ALTER TABLE jjk_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE jjk_login_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE jjk_big_ideas DISABLE ROW LEVEL SECURITY;
ALTER TABLE jjk_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE jjk_project_updates DISABLE ROW LEVEL SECURITY;
ALTER TABLE jjk_presentation_opportunities DISABLE ROW LEVEL SECURITY;

REVOKE ALL ON jjk_sessions, jjk_login_attempts, jjk_big_ideas, jjk_projects, jjk_project_updates, jjk_presentation_opportunities
FROM anon, authenticated;

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
ALTER TABLE grants DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_ideas DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_idea_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_idea_columns DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_idea_rows DISABLE ROW LEVEL SECURITY;

-- The public anon key is never meant to touch these tables at all -- the
-- app only ever reads/writes via the service-role key, server-side.
REVOKE ALL ON lab_members, member_sessions, member_login_attempts, projects, tasks, deadlines, datasets, project_members, grants, project_ideas, project_idea_votes, project_idea_columns, project_idea_rows
FROM anon, authenticated;
