import fs from "fs";
import path from "path";

// The website reads /data directly from the repo root at build time.
// This keeps /data as the single source of truth -- the site is never
// hand-edited with data, only regenerated from these JSON records.
const DATA_DIR = path.join(process.cwd(), "data");
const ADJACENT_DIR = path.join(DATA_DIR, "adjacent");

export interface Publication {
  title: string;
  authors: string[];
  venue: string;
  year: number | null;
  doi: string | null;
  pmid: string | null;
  preprint_id: string | null;
}

export interface Tags {
  grade_comparable: boolean;
  radiation_timepoint: boolean;
  radiation_induced_etiology: boolean;
  brain_invasion_annotated: boolean;
  single_cell_resolved: boolean;
  spatially_resolved: boolean;
  multi_modal_matched: boolean;
  large_cohort: boolean;
  recurrence_annotated: boolean;
  molecular_subtype_annotated: boolean;
  has_outcome_data: boolean;
  peer_reviewed: boolean;
}

export interface SampleRow {
  sample_id: string;
  patient_id?: string | null;
  sex?: string | null;
  age?: string | null;
  who_grade?: string | null;
  diagnosis?: string | null;
  anatomic_location?: string | null;
  treatment_timing?: string | null;
  outcome?: string | null;
  molecular_subtype?: string | null;
}

export interface Ontology {
  disease_id: string | null;
  tissue_ids: string[];
}

export interface GeneExpressionViewerMeta {
  sample_label: string;
  data_url: string;
  cell_count: number;
  gene_count: number;
  embedding_method: string;
  sample_count?: number;
  pathways?: string[];
  integration_note?: string;
  feature_noun?: string;
  value_label?: string;
}

export interface DatasetRecord {
  id: string;
  title: string;
  accessions: string[];
  related_accessions: string[];
  source_repositories: string[];
  publications: Publication[];
  corresponding_author: string;
  institution: string;
  date_deposited: string;
  date_updated: string;
  publication_status: string;
  last_verified_date: string;
  extracted_by: string;
  extraction_date: string;
  verification_tier: number;
  found_via: string[];
  modality: string[];
  platform: string;
  reference_genome: string;
  pipeline: string;
  patient_count: number | string;
  sample_count: number | string;
  cell_count_raw: number | string;
  cell_count_post_qc: number | string;
  grade_breakdown: { grade_1: number | null; grade_2: number | null; grade_3: number | null };
  who_edition: string;
  molecular_subtype_annotated: boolean | string;
  brain_invasion: { status_reported: boolean; counts: string; determination_method: string };
  treatment_timepoint_status: string[];
  anatomic_location_breakdown: string;
  tissue_preservation: string;
  normal_control_tissue: { included: boolean; type: string | null; count: number | null };
  sex_distribution: string;
  age_distribution: string;
  has_outcome_data: boolean | string;
  paired_multimodal: { is_paired: boolean; related_datasets: string[] };
  access_type: string;
  access_blocked_metadata_incomplete: boolean;
  raw_data_available: boolean | string;
  processed_data_available: boolean | string;
  processed_data_format: string;
  license: string;
  controlled_access_approval_timeline: string;
  confidence_level: Record<string, string>;
  needs_manual_review: boolean;
  needs_manual_review_reason: string | null;
  source_urls: string[];
  tags: Tags;
  possible_duplicate_needs_verification: boolean;
  duplicate_notes: string | null;
  samples?: SampleRow[] | null;
  ontology?: Ontology | null;
  gene_expression_viewer?: GeneExpressionViewerMeta | null;
  _adjacent?: boolean;
}

function loadDir(dir: string, adjacent: boolean): DatasetRecord[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf-8");
      const rec = JSON.parse(raw) as DatasetRecord;
      rec._adjacent = adjacent;
      return rec;
    });
}

export function getAllCoreRecords(): DatasetRecord[] {
  return loadDir(DATA_DIR, false).sort((a, b) => a.id.localeCompare(b.id));
}

export function getAllAdjacentRecords(): DatasetRecord[] {
  return loadDir(ADJACENT_DIR, true).sort((a, b) => a.id.localeCompare(b.id));
}

export function getAllRecords(): DatasetRecord[] {
  return [...getAllCoreRecords(), ...getAllAdjacentRecords()];
}

export function getRecordById(id: string): DatasetRecord | undefined {
  return getAllRecords().find((r) => r.id === id);
}

export function getModalities(): string[] {
  const set = new Set<string>();
  for (const r of getAllCoreRecords()) {
    for (const m of r.modality) set.add(m);
  }
  return Array.from(set).sort();
}

export function getRecordsByModality(modality: string): DatasetRecord[] {
  return getAllCoreRecords().filter((r) => r.modality.includes(modality));
}

export function getModalityBreakdown(): { modality: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of getAllCoreRecords()) {
    for (const m of r.modality) counts.set(m, (counts.get(m) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([modality, count]) => ({ modality, count }))
    .sort((a, b) => b.count - a.count);
}

export function getMultiModalRecords(): DatasetRecord[] {
  return getAllCoreRecords().filter((r) => r.tags.multi_modal_matched);
}

// A dataset "cohort" = a record plus everything it's paired_multimodal-linked to,
// deduplicated so the same cohort isn't shown twice on /matched-cohorts.
export function getMultiModalGroups(): DatasetRecord[][] {
  const all = getAllRecords();
  const byId = new Map(all.map((r) => [r.id, r]));
  const visited = new Set<string>();
  const groups: DatasetRecord[][] = [];

  for (const r of all) {
    if (!r.tags?.multi_modal_matched || visited.has(r.id)) continue;
    const group: DatasetRecord[] = [];
    const queue = [r.id];
    while (queue.length) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      const rec = byId.get(id);
      if (!rec) continue;
      group.push(rec);
      for (const relId of rec.paired_multimodal?.related_datasets || []) {
        if (!visited.has(relId)) queue.push(relId);
      }
    }
    if (group.length > 1) groups.push(group);
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Institution grouping (for /institutions)
//
// The raw `institution` field is extracted verbatim from each dataset's own
// source metadata (GEO submitter affiliation, paper corresponding-author
// affiliation, etc.), so the same real-world institution frequently appears
// under several different strings across records -- different punctuation
// ("University of California, San Francisco" vs "University of California
// San Francisco"), an abbreviation ("UCSF"), or a parent-system name used by
// one submitter and a division name used by another ("Mass General Brigham"
// vs "Brigham and Women's Hospital"). Grouping on the raw string alone would
// undercount well-known institutions and fragment the outreach picture.
//
// INSTITUTION_ALIASES below canonicalizes only the unambiguous cases --
// clearly the same legal institution, differing only in formatting,
// abbreviation, or a documented parent/division relationship -- never a
// guess at whether two *different* named collaborators are "close enough."
// Multi-institution collaboration strings that combine a different set of
// partners per record (e.g. "Massachusetts General Hospital / Dana-Farber
// Cancer Institute / Broad Institute") are left as their own distinct group
// rather than folded into one of their members, since collapsing them would
// misrepresent which specific collaboration produced that record.
//
// This canonicalization is presentation-only: it never modifies /data/*.json
// (the raw `institution` value on every record is untouched and still shown
// per-dataset), it only decides which rows share one card on /institutions.
const INSTITUTION_ALIASES: Record<string, string> = {
  "UCSF": "University of California, San Francisco (UCSF)",
  "University of California San Francisco": "University of California, San Francisco (UCSF)",
  "University of California, San Francisco": "University of California, San Francisco (UCSF)",

  "Princess Margaret Cancer Center": "University Health Network / Princess Margaret Cancer Centre (Toronto)",
  "Princess Margaret Cancer Centre, University Health Network, Toronto (International Consortium on Meningiomas, multi-institutional)":
    "University Health Network / Princess Margaret Cancer Centre (Toronto)",
  "University Health Network / Princess Margaret Cancer Centre": "University Health Network / Princess Margaret Cancer Centre (Toronto)",
  "University Health Network / University of Toronto": "University Health Network / Princess Margaret Cancer Centre (Toronto)",
  "University of Toronto / Princess Margaret Cancer Centre": "University Health Network / Princess Margaret Cancer Centre (Toronto)",

  "Heidelberg University Hospital": "Heidelberg University Hospital",
  "Department of Neurosurgery, Experimental Neurosurgery, Heidelberg University Hospital": "Heidelberg University Hospital",
  "Department of Neurosurgery, Experimental Neurosurgery, University Hospital Heidelberg": "Heidelberg University Hospital",
  "University Hospital Heidelberg, Intitute of Pathology": "Heidelberg University Hospital",

  "Brigham and Women's Hospital": "Brigham and Women's Hospital / Mass General Brigham",
  "Brigham and Women's Hospital / Harvard Medical School, Center for Biomedical Informatics": "Brigham and Women's Hospital / Mass General Brigham",
  "Mass General Brigham": "Brigham and Women's Hospital / Mass General Brigham",
  "Department of Neurology, Massachusetts General Hospital / Brigham and Women's Hospital, Harvard Medical School":
    "Brigham and Women's Hospital / Mass General Brigham",

  "Northwestern Medicine": "Northwestern University",
  "Northwestern University": "Northwestern University",

  "Yale University": "Yale University School of Medicine",
  "Yale University School of Medicine": "Yale University School of Medicine",

  "Washington University School of Medicine": "Washington University School of Medicine in St. Louis",
  "Washington University School of Medicine in St. Louis": "Washington University School of Medicine in St. Louis",

  "University of Pittsburgh": "University of Pittsburgh / UPMC",
  "University of Pittsburgh Medical Center": "University of Pittsburgh / UPMC",

  "IIT Bombay": "Indian Institute of Technology (IIT) Bombay",
  "Indian Institute of Technology (IIT) Bombay; tissue provided by Tata Memorial Centre, Mumbai": "Indian Institute of Technology (IIT) Bombay",

  "Columbia University": "Columbia University",
  "Columbia University Irving Medical Center": "Columbia University",
  "COLUMBIA UNIVERSITY HEALTH SCIENCES": "Columbia University",

  "University of Southern California": "University of Southern California (USC)",
  "USC": "University of Southern California (USC)",

  "U.C.L.A.": "UCLA",
};

export function canonicalizeInstitution(raw: string): string {
  return INSTITUTION_ALIASES[raw] ?? raw;
}

export interface ClinicalFieldCoverage {
  key: string;
  label: string;
  count: number;
}

// ---------------------------------------------------------------------------
// Outreach tracking (/outreach/status.json)
//
// Real, hand-maintained record of actual emails sent to each dataset's
// source institution and what came back -- distinct from anything computed
// from /data/*.json itself, which only reflects what's already public. See
// /outreach/README.md for the full schema and update convention. Every
// dataset starts "not_contacted" until a real, dated outreach attempt is
// logged; nothing here is ever inferred or guessed.
export type OutreachStatus =
  | "not_contacted"
  | "contacted"
  | "responded_declined"
  | "responded_no_new_data"
  | "responded_partial_data"
  | "responded_full_data";

export interface OutreachContactLogEntry {
  date: string;
  contacted_person: string;
  method: string;
  fields_requested: string[];
  outcome: string;
  fields_received: string[];
}

export interface OutreachRecord {
  status: OutreachStatus;
  contact_log: OutreachContactLogEntry[];
}

const OUTREACH_FILE = path.join(process.cwd(), "outreach", "status.json");
const DEFAULT_OUTREACH: OutreachRecord = { status: "not_contacted", contact_log: [] };

const RESPONDED_STATUSES: OutreachStatus[] = [
  "responded_declined",
  "responded_no_new_data",
  "responded_partial_data",
  "responded_full_data",
];
const DATA_RECEIVED_STATUSES: OutreachStatus[] = ["responded_partial_data", "responded_full_data"];

function loadOutreachTable(): Record<string, OutreachRecord> {
  if (!fs.existsSync(OUTREACH_FILE)) return {};
  return JSON.parse(fs.readFileSync(OUTREACH_FILE, "utf-8"));
}

export function getOutreachStatus(id: string): OutreachRecord {
  return loadOutreachTable()[id] ?? DEFAULT_OUTREACH;
}

export interface InstitutionOutreachSummary {
  contactedCount: number; // status !== not_contacted
  respondedCount: number; // got any reply at all
  dataReceivedCount: number; // reply included new clinical metadata
  byStatus: Record<OutreachStatus, number>;
}

export interface InstitutionSummary {
  institution: string;
  rawNames: string[];
  datasets: DatasetRecord[];
  datasetCount: number;
  patientCount: number;
  patientCountKnown: boolean;
  modalities: string[];
  outreach: InstitutionOutreachSummary;
  outreachByDatasetId: Record<string, OutreachRecord>;
  fieldCoverage: ClinicalFieldCoverage[];
  // Per-record labels for whichever CLINICAL_FIELDS entries that record is
  // missing, keyed by record id -- computed once here (the single source of
  // truth for the checklist) so the client-side explorer can show "ask this
  // PI for X, Y" per dataset without duplicating the field-presence logic.
  missingFieldsById: Record<string, string[]>;
}

// The clinical-annotation checklist used to describe what's already public
// per dataset -- kept only to tell you what to *ask for* (see
// missingFieldsById), no longer the headline metric on /institutions (that's
// now real outreach response data, see InstitutionOutreachSummary above).
// Deliberately limited to fields that apply broadly across modalities (not
// e.g. radiation-timing fields, which only make sense for a subset of
// cohorts). Every field here is either a Phase 3 tag (already a careful
// true/false call, see docs/schema.md) or a top-level field that uses this
// project's "Not reported" sentinel convention -- never inferred beyond
// what's already recorded on the record itself.
const CLINICAL_FIELDS: { key: string; label: string; present: (r: DatasetRecord) => boolean }[] = [
  { key: "grade", label: "WHO grade breakdown", present: (r) => !!r.tags.grade_comparable },
  { key: "recurrence", label: "Primary vs. recurrent", present: (r) => !!r.tags.recurrence_annotated },
  { key: "subtype", label: "Molecular subtype", present: (r) => !!r.tags.molecular_subtype_annotated },
  { key: "outcome", label: "Outcome / survival", present: (r) => !!r.tags.has_outcome_data },
  { key: "invasion", label: "Brain invasion", present: (r) => !!r.tags.brain_invasion_annotated },
  { key: "sex", label: "Sex distribution", present: (r) => r.sex_distribution !== "Not reported" },
  { key: "age", label: "Age distribution", present: (r) => r.age_distribution !== "Not reported" },
];

export function getInstitutionSummaries(): InstitutionSummary[] {
  // Records with no recorded institution aren't a real outreach target --
  // there's no one to contact -- so they're excluded here rather than shown
  // as an "Institution not reported" card with nothing actionable on it.
  const records = getAllCoreRecords().filter((r) => r.institution && r.institution !== "Not reported");
  const outreachTable = loadOutreachTable();
  const byInst = new Map<string, DatasetRecord[]>();
  const rawNamesByInst = new Map<string, Set<string>>();

  for (const r of records) {
    const canonical = canonicalizeInstitution(r.institution || "Not reported");
    if (!byInst.has(canonical)) {
      byInst.set(canonical, []);
      rawNamesByInst.set(canonical, new Set());
    }
    byInst.get(canonical)!.push(r);
    rawNamesByInst.get(canonical)!.add(r.institution || "Not reported");
  }

  const summaries: InstitutionSummary[] = Array.from(byInst.entries()).map(([institution, datasets]) => {
    const modalities = Array.from(new Set(datasets.flatMap((r) => r.modality))).sort();

    let patientCount = 0;
    let patientCountKnown = false;
    for (const r of datasets) {
      const n = typeof r.patient_count === "number" ? r.patient_count : typeof r.sample_count === "number" ? r.sample_count : null;
      if (n !== null) {
        patientCount += n;
        patientCountKnown = true;
      }
    }

    const fieldCoverage = CLINICAL_FIELDS.map((f) => ({
      key: f.key,
      label: f.label,
      count: datasets.filter(f.present).length,
    }));

    const missingFieldsById: Record<string, string[]> = {};
    const outreachByDatasetId: Record<string, OutreachRecord> = {};
    const byStatus: Record<OutreachStatus, number> = {
      not_contacted: 0,
      contacted: 0,
      responded_declined: 0,
      responded_no_new_data: 0,
      responded_partial_data: 0,
      responded_full_data: 0,
    };
    let contactedCount = 0;
    let respondedCount = 0;
    let dataReceivedCount = 0;
    for (const r of datasets) {
      missingFieldsById[r.id] = CLINICAL_FIELDS.filter((f) => !f.present(r)).map((f) => f.label);
      const outreach = outreachTable[r.id] ?? DEFAULT_OUTREACH;
      outreachByDatasetId[r.id] = outreach;
      byStatus[outreach.status]++;
      if (outreach.status !== "not_contacted") contactedCount++;
      if (RESPONDED_STATUSES.includes(outreach.status)) respondedCount++;
      if (DATA_RECEIVED_STATUSES.includes(outreach.status)) dataReceivedCount++;
    }

    return {
      institution,
      rawNames: Array.from(rawNamesByInst.get(institution) || []).sort(),
      datasets: datasets.sort((a, b) => a.title.localeCompare(b.title)),
      datasetCount: datasets.length,
      patientCount,
      patientCountKnown,
      modalities,
      outreach: { contactedCount, respondedCount, dataReceivedCount, byStatus },
      outreachByDatasetId,
      fieldCoverage,
      missingFieldsById,
    };
  });

  // Institutions with real outreach signal (any data received, or any
  // response) sort first, then fall back to dataset count -- so the page
  // leads with "who's actually engaged," matching what it's for.
  return summaries.sort(
    (a, b) =>
      b.outreach.dataReceivedCount - a.outreach.dataReceivedCount ||
      b.outreach.respondedCount - a.outreach.respondedCount ||
      b.datasetCount - a.datasetCount ||
      a.institution.localeCompare(b.institution)
  );
}

export function getSummaryStats() {
  const core = getAllCoreRecords();
  const adjacent = getAllAdjacentRecords();
  return {
    totalCore: core.length,
    totalAdjacent: adjacent.length,
    peerReviewed: core.filter((r) => r.tags.peer_reviewed).length,
    multiModal: core.filter((r) => r.tags.multi_modal_matched).length,
    needsReview: core.filter((r) => r.needs_manual_review).length,
    modalityCount: getModalities().length,
  };
}
