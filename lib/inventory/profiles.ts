// Narrative profiles for high-priority datasets. Kept in sync with
// /processed/dataset_profiles.md by hand -- that file is the canonical
// human-readable version; this is the structured form the website reads.
// Each entry's `ids` lists every dataset id the narrative applies to.

export interface Profile {
  ids: string[];
  heading: string;
  body: string;
}

export const PROFILES: Profile[] = [
  {
    ids: ["gse-183647-methylation", "gse-183653-bulk-rnaseq", "gse-183655-scrnaseq"],
    heading: "Choudhury/Raleigh UCSF meningioma multi-omic cohort",
    body: "This UCSF cohort (Choudhury, Magill, Raleigh et al., Nature Genetics 2022, PMID 35534562) is the most heavily cross-linked dataset in this registry: 565 meningiomas profiled by DNA methylation array, 185 of the same tumors additionally bulk RNA-sequenced, and a 10-sample subset (6 patients, 57,114 cells, including matched dura and brain-tumor-interface pieces) single-cell RNA-sequenced. The paper established the widely-used three-group DNA methylation classification of meningioma (Merlin-intact, immune-enriched, hypermitotic) that several later datasets in this registry explicitly reference or build on. Strengths: large methylation cohort, real multi-modal matching (methylation + bulk RNA-seq + scRNA-seq on overlapping samples, a rare combination), open access with processed data files available. Limitations: per-sample clinical fields are only partially extracted so far. The bulk RNA-seq set has a per-sample grade breakdown (86 grade 1, 74 grade 2, 25 grade 3) and per-sample age, and the scRNA-seq set has per-sample age and a brain-tumor-interface sample count, but sex distribution remains unreported for all three records, and the 565-sample methylation series itself has no per-sample clinical fields extracted yet. Five other publications are also linked to this GEO SuperSeries family, suggesting a productive, still-active dataset with secondary reuse.",
  },
  {
    ids: ["gse-270371-methylation", "gse-270638-nassiri-retrospective-rnaseq"],
    heading: "Princess Margaret / Nassiri-Zadeh retrospective cohort",
    body: "At 994 methylation samples and 384 RNA-seq samples (1,378 combined under the parent SuperSeries), this is the single largest cohort in the registry by sample count. Deposited by the Princess Margaret Cancer Centre group in June 2024 (made public in August 2024). Publication resolved: the linked paper is Wang, Patil, Landry et al., Molecular classification to refine surgical and radiotherapeutic decision-making in meningioma (Nature Medicine 2024, PMID 39169220), confirmed via a full-text search for the literal accession strings and an exact corresponding-author match on both paired records. A different, smaller (n=100) trial-cohort paper from the same senior authors was checked earlier and correctly ruled out as a false match. Both records are now fully corroborated against their live source.",
  },
  {
    ids: ["gse-189521-methylation", "gse-189672-bulk-rnaseq"],
    heading: "Baylor / Patel Lab three-subtype cohort",
    body: "110 primary meningiomas profiled by both DNA methylation array and bulk RNA-seq, published as \"Multiple approaches converge on three biological subtypes of meningioma and extract new insights from published studies\" (PMID 35108039). A moderate-sized but cleanly matched multi-omic cohort. Every methylation sample has a corresponding RNA-seq sample from the same tumor, making it directly usable for methylation-expression integration analyses without needing to solve a sample-matching problem first.",
  },
  {
    ids: ["gse-304094-methylation", "gse-304087-bulk-rnaseq"],
    heading: "Hertie-Institute protocadherin silencing cohort",
    body: "231 meningiomas profiled by DNA methylation array in this discovery cohort, cross-linked to a 10-sample bulk RNA-seq companion, both from the Hertie-Institute for Clinical Brain Research (corresponding authors Daniel J Merk and Ghazaleh Tabatabai). The study title, \"DNA methylation profiling identifies long-range epigenetic silencing of clustered protocadherins as a key determinant of meningioma progression,\" points to protocadherin silencing as the central finding. A related 42-sample longitudinal methylation cohort from the same study (GSE304096) is recorded separately and is not itself flagged as multi-modal matched in this registry, though it shares the same investigators and study family. None of the three records has a linked publication yet, and none of them carry the peer_reviewed tag; treat findings as provisional until a paper is identified.",
  },
  {
    ids: ["mng-utoronto-2021-genomic"],
    heading: "University of Toronto integrative classification",
    body: "Nassiri et al.'s 2021 Nature paper \"A clinically applicable integrative molecular classification of meningiomas\" (PMID 34433969), hosted on cBioPortal rather than GEO, the only cBioPortal-native record in this registry. 121 samples with copy-number data, 115 with sequencing-based mutation calls, 96 with mass-spectrometry proteomic data, and (confirmed on a later re-check via cBioPortal's molecular-profiles and sample-lists endpoints, which surfaced a real TPM-level RNA-seq profile that a summary-level API field had missed) bulk RNA-seq data for all 121 samples, all confirmed directly via the cBioPortal API. This cohort's raw sequencing reads (as opposed to this record's processed cBioPortal calls) are separately catalogued via EGA under egad00001007494-nassiri-rnaseq and egad00001007677-nassiri-snrnaseq, cross-linked here. The exact WES/WGS/targeted-panel assay split was also not confirmed with certainty. No methylation molecular profile exists in cBioPortal for this study; that data lives separately in gse-180061-methylation.",
  },
  {
    ids: ["gse-313693-snrnaseq", "gse-313694-spatial-transcriptomics"],
    heading: "Heidelberg snRNA-seq + spatial cohort",
    body: "The most methodologically current paired dataset in the registry (Maas, Sahm et al., Nature Genetics 2026, PMID 41663806): 26 meningiomas profiled by single-nucleus RNA-seq and 42 by Visium spatial transcriptomics, spanning WHO grades and DNA methylation classes. The series description reports a decrease in myeloid cell proportion from grade 1 to grade 3, a concrete, testable finding for anyone reusing this data. Genuinely multi-modal at the single-cell/spatial resolution level, which very few meningioma datasets in this registry achieve simultaneously.",
  },
  {
    ids: ["gse-299374-spatial-transcriptomics"],
    heading: "Brain-invasion-focused spatial transcriptomics",
    body: "Small (2 tumors) but purpose-built: UCSF/Raleigh Lab specifically dissected and spatially profiled brain-invasive regions of meningioma (PMID 41476144, Neuro-Oncology 2026). This is one of only two records in the entire registry tagged brain_invasion_annotated (the other being gse-183655-scrnaseq, where the tag reflects a sampling-location proxy rather than a formal pathology call), making it a uniquely valuable, if small, resource for anyone studying the invasion phenotype specifically, pending confirmation of the exact per-spot pathology annotation from the paper's methods.",
  },
  {
    ids: ["gse-299027-spatial-transcriptomics"],
    heading: "Johns Hopkins low-grade meningioma spatial atlas",
    body: "19 low-grade (WHO I/II) meningiomas profiled with full-transcriptome Visium spatial transcriptomics, cross-classified into the Choudhury/Raleigh methylation groups (Merlin-intact/immune-enriched/hypermitotic). No linked publication as of this session, likely an in-progress or very recently released dataset from the Fan Lab (computational spatial transcriptomics methods group).",
  },
  {
    ids: ["gse-85133-polr2a-rnaseq"],
    heading: "POLR2A driver-mutation discovery cohort",
    body: "The original description of recurrent POLR2A mutations as a distinct meningioma driver (Clark et al., Nature Genetics 2016, PMID 27548314), a landmark paper in meningioma genomics. 19 tumors RNA-sequenced representing the major mutation groups (NF2/chr22 loss, POLR2A, KLF4/TRAF7, AKT1/TRAF7), part of the combined GSE85135 SuperSeries, which also includes array data and a companion ChIP-seq SubSeries. A secondary paper (Nat Commun 2023, PMID 37805627) later reused this same RNA-seq data for an unrelated hedgehog-pathway finding, demonstrating this dataset's continued value for secondary analysis.",
  },
  {
    ids: ["gse-289349-scrnaseq", "gse-290805-bulk-rnaseq"],
    heading: "Mass General Brigham immune landscape cohort",
    body: "Guo, Bi et al. (Neuro-Oncology 2026, PMID 41630100) profiled the meningioma immune microenvironment with a 9-sample single-cell RNA-seq set (8 of 9 samples with a WHO grade recorded: 1 grade 1, 6 grade 2, 1 grade 3) matched to a 47-sample bulk RNA-seq companion (grade breakdown 21 grade 1, 23 grade 2, 3 grade 3), both from Mass General Brigham. The two records are explicitly cross-linked via paired_multimodal. Strengths: real multi-modal matching from the same study and cohort, per-sample sex and grade already extracted for both records. Limitations: age is only partially parsed, anatomic location and treatment timepoint are not yet reported for either record.",
  },
  {
    ids: ["pxd012923-proteomics", "pxd007044-proteomics"],
    heading: "Proteomic profiling: Diamandis lab and Hanemann lab cohorts",
    body: "Two independent proteomics efforts stand out: PXD012923 (Papaioannou, Diamandis et al., Neuro-Oncology 2019) profiled meningiomas by clinically-distinct molecular pattern; PXD007044 (Dunn, Hanemann et al., EBioMedicine 2019, consolidated from three duplicate PRIDE submissions, PXD007044/PXD007125/PXD007073) discovered differential expression of NEK9, HK2, and SET across meningioma grades. Neither has RNA-seq or methylation companions in this registry yet, making them currently \"orphan\" modalities for their respective cohorts, a candidate target for future cross-referencing if the underlying patient IDs can be matched to other repositories.",
  },
];

export function getProfileForId(id: string): Profile | undefined {
  return PROFILES.find((p) => p.ids.includes(id));
}
