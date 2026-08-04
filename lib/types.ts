export interface LabMember {
  id: string;
  email: string;
  name: string;
  title: string | null;
  is_admin: boolean;
  created_at: string;
}

export type ProjectStatus = "planning" | "active" | "blocked" | "done";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  owner_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = "todo" | "in_progress" | "done";

export interface LabTask {
  id: string;
  title: string;
  description: string | null;
  project_id: string | null;
  assignee_id: string | null;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
}

export type DeadlineType = "grant" | "abstract" | "conference" | "irb" | "other";

export interface Deadline {
  id: string;
  title: string;
  type: DeadlineType;
  date: string;
  project_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface Dataset {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  sample_count: number | null;
  processing_status: string | null;
  project_id: string | null;
  created_at: string;
}
