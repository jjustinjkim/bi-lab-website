import { Tags } from "@/lib/inventory/data";

// Single source of truth for tag display labels, shared by TagPills and
// SearchTable so the same underlying tag reads identically everywhere on the
// site. Kept in its own module (no runtime import of lib/data.ts, which pulls
// in Node's `fs`) so client components can import it safely.
export const TAG_LABELS: Record<keyof Tags, string> = {
  grade_comparable: "WHO grade breakdown available",
  radiation_timepoint: "Pre/post-radiation timepoints",
  radiation_induced_etiology: "Radiation-induced etiology",
  brain_invasion_annotated: "Brain invasion annotated",
  single_cell_resolved: "Single-cell resolution",
  spatially_resolved: "Spatial resolution",
  multi_modal_matched: "Linked to other modalities",
  large_cohort: "Large cohort (top quartile)",
  recurrence_annotated: "Primary vs. recurrent annotated",
  molecular_subtype_annotated: "Molecular subtype annotated",
  has_outcome_data: "Outcome/survival data",
  peer_reviewed: "Peer-reviewed",
};

// Groups the 12 priority tags into short, scannable clusters for the /search
// filter row, so they read as related concepts instead of one flat 12-item
// jumble. Order here is the render order.
export const TAG_GROUPS: { label: string; keys: (keyof Tags)[] }[] = [
  {
    label: "Cohort & design",
    keys: ["large_cohort", "multi_modal_matched", "peer_reviewed"],
  },
  {
    label: "Resolution",
    keys: ["single_cell_resolved", "spatially_resolved"],
  },
  {
    label: "Radiation history",
    keys: ["radiation_timepoint", "radiation_induced_etiology"],
  },
  {
    label: "Clinical annotation",
    keys: [
      "grade_comparable",
      "recurrence_annotated",
      "brain_invasion_annotated",
      "molecular_subtype_annotated",
      "has_outcome_data",
    ],
  },
];
