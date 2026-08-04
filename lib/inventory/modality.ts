const MODALITY_LABELS: Record<string, string> = {
  bulk_rna_seq: "Bulk RNA-seq",
  scrna_seq: "scRNA-seq",
  snrna_seq: "snRNA-seq",
  spatial_transcriptomics: "Spatial transcriptomics",
  dna_methylation_array: "DNA methylation (array)",
  dna_methylation_seq: "DNA methylation (seq)",
  cnv_snp_array: "CNV / SNP array",
  wes: "WES",
  wgs: "WGS",
  targeted_panel_seq: "Targeted panel sequencing",
  multiome: "Multiome",
  mirna_seq: "miRNA-seq",
  proteomics_bulk_ms: "Proteomics (bulk MS)",
  proteomics_rppa: "Proteomics (RPPA)",
  proteomics_spatial: "Proteomics (spatial)",
  atac_seq: "ATAC-seq",
  scatac_seq: "scATAC-seq",
  cytof: "CyTOF",
  codex_imc_mibi_mif: "CODEX / IMC / MIBI / mIF",
  cite_seq: "CITE-seq",
  tcr_bcr_seq: "TCR/BCR-seq",
  digital_pathology_paired: "Digital pathology (paired with omics)",
  expression_array: "Expression profiling (microarray)",
  metabolomics: "Metabolomics",
  cfdna_epigenomic: "Cell-free DNA epigenomic profiling",
  chip_seq: "ChIP-seq",
  scdna_seq: "Single-cell / single-nucleus DNA sequencing",
};

export function modalityLabel(m: string): string {
  return MODALITY_LABELS[m] || m;
}

// Every modality in docs/controlled_vocabulary.md, not just the ones with
// datasets currently in /data/ -- so a modality with zero results renders an
// intentional "searched, nothing found yet" page instead of a 404.
export function allModalityKeys(): string[] {
  return Object.keys(MODALITY_LABELS);
}

const MODALITY_KEYS = Object.keys(MODALITY_LABELS);
const CATEGORICAL_SLOTS = 8; // matches --cat-1 through --cat-8 in globals.css

// A modality's color is fixed by its position in the vocabulary above, never
// by its rank in whatever data happens to be on screen -- so the same hue
// names the same modality on the chart, in table rows, and on the
// matched-cohorts page, and doesn't reshuffle when the data is filtered or sorted.
export function modalityColorVar(m: string): string {
  const i = MODALITY_KEYS.indexOf(m);
  const slot = (i === -1 ? 0 : i) % CATEGORICAL_SLOTS;
  return `var(--cat-${slot + 1})`;
}
