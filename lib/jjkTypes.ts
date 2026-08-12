export type JjkPillar = 'manuscript' | 'grant' | 'collaboration' | 'presentation' | 'tool'

export const JJK_PILLAR_LABELS: Record<JjkPillar, string> = {
  manuscript: 'Manuscript',
  grant: 'Grant',
  collaboration: 'Collaboration',
  presentation: 'Presentation',
  tool: 'Tool / Platform',
}

export type JjkBigIdeaStatus = 'active' | 'promoted' | 'archived'

export interface JjkBigIdea {
  id: string
  pillar: JjkPillar
  title: string
  spark: string | null
  why_it_matters: string | null
  feasibility_notes: string | null
  specific_aim: string | null
  next_step: string | null
  next_step_target_date: string | null
  status: JjkBigIdeaStatus
  promoted_project_id: string | null
  promoted_at: string | null
  created_at: string
  updated_at: string
}

// The 5 wizard steps, in order -- used both to render the step list and to
// compute "N/5 clarified" (count of these fields that are non-empty).
export const BIG_IDEA_STEPS: { field: keyof JjkBigIdea; label: string; prompt: string }[] = [
  { field: 'spark', label: 'The spark', prompt: "What's the observation or question that started this?" },
  { field: 'why_it_matters', label: 'Why it matters', prompt: 'What gap does this fill, and who cares?' },
  { field: 'feasibility_notes', label: 'Feasibility', prompt: 'What data or resources already exist? What would be needed?' },
  { field: 'specific_aim', label: 'Specific aim', prompt: 'Turn this into one testable aim or hypothesis.' },
  { field: 'next_step', label: 'Next step', prompt: "What's the concrete next action, and by when?" },
]

export function ideaClarityCount(idea: Pick<JjkBigIdea, 'spark' | 'why_it_matters' | 'feasibility_notes' | 'specific_aim' | 'next_step'>): number {
  return [idea.spark, idea.why_it_matters, idea.feasibility_notes, idea.specific_aim, idea.next_step].filter((v) => v && v.trim().length > 0).length
}

export type JjkProjectStage = 'planning' | 'drafting' | 'under_review' | 'revision' | 'published'

export const JJK_PROJECT_STAGE_LABELS: Record<JjkProjectStage, string> = {
  planning: 'Planning',
  drafting: 'Drafting',
  under_review: 'Under review',
  revision: 'Revision',
  published: 'Published',
}

export interface JjkProject {
  id: string
  source_idea_id: string | null
  pillar: JjkPillar
  name: string
  stage: JjkProjectStage
  collaborators: string | null
  target_date: string | null
  notes: string | null
  progress_percent: number | null
  checkpoint: string | null
  main_project_id: string | null
  created_at: string
  updated_at: string
}

export interface JjkProjectUpdate {
  id: string
  project_id: string
  body: string
  created_at: string
}

export type JjkPresentationType = 'conference' | 'grand_rounds' | 'invited_talk' | 'symposium' | 'other'

export const JJK_PRESENTATION_TYPE_LABELS: Record<JjkPresentationType, string> = {
  conference: 'Conference',
  grand_rounds: 'Grand rounds',
  invited_talk: 'Invited talk',
  symposium: 'Symposium',
  other: 'Other',
}

export type JjkPresentationStatus = 'identified' | 'preparing' | 'submitted' | 'accepted' | 'declined' | 'presented'

export const JJK_PRESENTATION_STATUS_LABELS: Record<JjkPresentationStatus, string> = {
  identified: 'Identified',
  preparing: 'Preparing',
  submitted: 'Submitted',
  accepted: 'Accepted',
  declined: 'Declined',
  presented: 'Presented',
}

export interface JjkPresentationOpportunity {
  id: string
  title: string
  venue: string | null
  type: JjkPresentationType
  deadline_date: string | null
  event_date: string | null
  status: JjkPresentationStatus
  project_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
