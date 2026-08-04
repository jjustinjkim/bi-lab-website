import { getLastUpdatedDate } from "@/lib/inventory/markdown";

export default function MethodologyPage() {
  const lastUpdated = getLastUpdatedDate();
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-display">Methodology</h1>
        <p className="text-sm mt-3 max-w-2xl leading-relaxed" style={{ color: "var(--ink-muted)" }}>
          The broad strokes of how this registry is built and what to trust it for.
        </p>
        <p className="text-caption mt-2 text-mono">Last data update: {lastUpdated}</p>
      </div>

      <section>
        <h2 className="text-title mb-2">Scope</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
          The core registry covers molecular data (RNA-seq, methylation, sequencing,
          proteomics, and more) from human meningioma patient tissue. Cell line, PDX,
          and organoid data are tracked separately as &quot;adjacent&quot; rather than
          mixed into the core counts, since they&apos;re model systems, not patient
          tissue.
        </p>
      </section>

      <section>
        <h2 className="text-title mb-2">Verification</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
          Every record is checked directly against its live source (GEO, EGA, PubMed,
          and similar repositories) before being added, never taken from memory or
          inference.
        </p>
      </section>

      <section>
        <h2 className="text-title mb-2">Compliance</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
          Only public metadata is ever displayed here (accessions, sample counts,
          institutions, publication links). Controlled-access datasets are logged
          from their public study-level description only; the restricted data itself
          is never accessed.
        </p>
      </section>

      <section>
        <h2 className="text-title mb-2">Limitations</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
          Some cohorts collected from different repositories may overlap in the
          patients they contain -- this is flagged internally when suspected, but it
          is not always resolvable from public metadata alone, since that requires
          comparing controlled-access, patient-level identifiers. Sample and patient
          counts reflect what each source repository reports at the time of
          extraction and may lag behind later corrections at the source.
        </p>
      </section>

      <section>
        <h2 className="text-title mb-2">Citing this registry</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
          This registry aggregates publicly available metadata; it is not the
          dataset. When citing the underlying data, cite the original publication
          or repository accession linked from each record&apos;s Sources section,
          not this site.
        </p>
      </section>
    </div>
  );
}
