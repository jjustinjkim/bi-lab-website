// Human-readable labels for the raw source_urls shown on a dataset page --
// records with several source links (a study page, a data page, a paper, a
// DAC) otherwise show as a bare list of URLs with no way to tell them apart
// at a glance.
const PATTERNS: [RegExp, string][] = [
  [/ega-archive\.org\/studies\//, "EGA study page"],
  [/ega-archive\.org\/datasets\//, "EGA dataset page"],
  [/ega-archive\.org\/dacs\//, "EGA Data Access Committee"],
  [/ega-archive\.org\/policies\//, "EGA data access policy"],
  [/pubmed\.ncbi\.nlm\.nih\.gov/, "PubMed"],
  [/doi\.org/, "DOI"],
  [/ncbi\.nlm\.nih\.gov\/geo/, "GEO"],
  [/ncbi\.nlm\.nih\.gov\/pmc/, "PMC full text"],
  [/figshare\.com/, "Figshare"],
  [/ebi\.ac\.uk\/biostudies/, "ArrayExpress / BioStudies"],
  [/ebi\.ac\.uk\/arrayexpress/, "ArrayExpress"],
  [/portal\.gdc\.cancer\.gov/, "GDC Portal"],
  [/cbioportal\.org/, "cBioPortal"],
  [/zenodo\.org/, "Zenodo"],
  [/synapse\.org/, "Synapse"],
];

export function sourceLabel(url: string): string {
  for (const [pattern, label] of PATTERNS) {
    if (pattern.test(url)) return label;
  }
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
