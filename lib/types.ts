export interface LabMember {
  id: string;
  email: string;
  name: string;
  title: string | null;
  is_admin: boolean;
  can_view_all_projects: boolean;
  created_at: string;
}

export type ProjectStatus = "planning" | "active" | "blocked" | "done" | "archived";

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
  pubmed_url: string | null;
}

export type GrantStatus = "identified" | "researching" | "applying" | "submitted" | "awarded" | "declined";

export const GRANT_STATUS_LABELS: Record<GrantStatus, string> = {
  identified: "Identified",
  researching: "Researching",
  applying: "Applying",
  submitted: "Submitted",
  awarded: "Awarded",
  declined: "Declined",
};

export interface Grant {
  id: string;
  name: string;
  funder: string | null;
  status: GrantStatus;
  amount: string | null;
  deadline_date: string | null;
  url: string | null;
  project_id: string | null;
  notes: string | null;
  created_at: string;
}

export type ProjectIdeaStatus = "active" | "archived" | "promoted";

export interface ProjectIdea {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: ProjectIdeaStatus;
  created_by: string | null;
  promoted_project_id: string | null;
  promoted_at: string | null;
  created_at: string;
}

export interface ProjectIdeaVote {
  idea_id: string;
  member_id: string;
  created_at: string;
}
