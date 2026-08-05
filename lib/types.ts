export interface LabMember {
  id: string;
  email: string;
  name: string;
  title: string | null;
  is_admin: boolean;
  created_at: string;
}

export type ProjectStatus = "planning" | "active" | "blocked" | "done";

// Matches the "Gr" column in the lab's own tracker spreadsheet. "P" appears
// in older (pre-2015) rows but was never in its own legend there either.
export type ProjectGroupType = "A" | "C" | "Ch" | "R" | "T" | "X" | "P";

export const PROJECT_GROUP_LABELS: Record<ProjectGroupType, string> = {
  A: "Article",
  C: "Case report",
  Ch: "Chapter",
  R: "Review",
  T: "Trial",
  X: "Other",
  P: "P",
};

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  owner_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  group_type: ProjectGroupType | null;
  faculty: string | null;
  personnel: string | null;
  work_percent: number | null;
  pub_status: string | null;
  meeting: string | null;
  deadline_date: string | null;
  checkpoint: string | null;
  journal: string | null;
  pub_year: number | null;
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
