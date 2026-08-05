export interface LabMember {
  id: string;
  email: string;
  name: string;
  title: string | null;
  is_admin: boolean;
  can_view_all_projects: boolean;
  created_at: string;
}

export type ProjectStatus = "planning" | "active" | "blocked" | "done";

// Matches the "Gr" column in the lab's own tracker spreadsheet. "P" appears
// in older (pre-2015) rows but was never in its own legend there either.
export type ProjectGroupType = "A" | "C" | "Ch" | "R" | "T" | "X" | "P";

export const PROJECT_GROUP_LABELS: Record<ProjectGroupType, string> = {
  A: "Article from study",
  C: "Case report",
  Ch: "Chapter",
  R: "Review",
  T: "Trial",
  X: "Other",
  P: "P",
};

// Colorblind-safe categorical palette (Okabe-Ito), one fixed hue per group
// so a color always means the same thing across both project tables. X/P
// (not part of the lab's own legend) get muted grays instead of a vivid hue
// so they read as "uncategorized," not as a 6th and 7th real category.
export const PROJECT_GROUP_COLORS: Record<ProjectGroupType, string> = {
  A: "#0072B2",
  C: "#009E73",
  Ch: "#E69F00",
  R: "#CC79A7",
  T: "#D55E00",
  X: "#94A3B8",
  P: "#64748B",
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
