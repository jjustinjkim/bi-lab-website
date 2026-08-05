import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllRecords, getRecordById } from "@/lib/inventory/data";
import { citationLabel, fullCitation } from "@/lib/inventory/citation";
import { modalityLabel } from "@/lib/inventory/modality";
import TagPills from "@/components/inventory/TagPills";
import ModalityTag from "@/components/inventory/ModalityTag";
import BackLink from "@/components/inventory/BackLink";
import SampleTable from "@/components/inventory/SampleTable";
import GeneExpressionViewer from "@/components/inventory/GeneExpressionViewer";
import { getProfileForId } from "@/lib/inventory/profiles";
import { sourceLabel } from "@/lib/inventory/sources";

export async function generateStaticParams() {
  return getAllRecords().map((r) => ({ id: r.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const record = getRecordById(id);
  if (!record) return {};

  const modalities = record.modality.map(modalityLabel).join(", ");
  const description =
    `${record.accessions.join(", ")}: ${modalities}, ${record.sample_count} samples` +
    `${record.institution ? ` from ${record.institution}` : ""}. Part of the Bi Lab's Meningioma Dataset Registry.`;

  return {
    title: record.title,
    description,
    openGraph: { title: record.title, description, type: "article" },
  };
}

export default async function DatasetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = getRecordById(id);
  if (!record) notFound();

  const profile = getProfileForId(id);

  return (
    <div className="space-y-8 max-w-6xl">
      <BackLink />
      <div>
        {record._adjacent && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="ledger-tag ledger-tag--adjacent">Adjacent (not core)</span>
          </div>
        )}
        <h1 className="text-display">{record.title}</h1>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="readout">{record.accessions.join(", ")}</span>
          <span className="text-sm" style={{ color: "var(--ink-muted)" }}>
            {citationLabel(record.publications)}
          </span>
        </div>
        {record.source_urls.length > 0 && (
          <div className="mt-3">
            <a
              href={record.source_urls[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="ledger-tag"
              data-active="true"
            >
              View on {sourceLabel(record.source_urls[0])} ↗
            </a>
          </div>
        )}
      </div>

      {profile && (
        <section className="panel p-5">
          <h2 className="text-subtitle mb-2">{profile.heading}</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
            {profile.body}
          </p>
        </section>
      )}

      {/* Structured facts live in one bordered card, grouped and visually
          distinct from the narrative sections (publications, sources) below. */}
      <div className="panel p-5 space-y-6">
        <section>
          <h2 className="text-section-label mb-3">Overview</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt
                className="text-caption font-semibold"
                style={{ letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.6875rem" }}
              >
                Modality
              </dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {record.modality.map((m) => (
                  <ModalityTag key={m} modality={m} />
                ))}
              </dd>
            </div>
            <Field label="Sample count" value={String(record.sample_count)} mono />
            <Field label="Patient count" value={String(record.patient_count)} mono />
            <Field label="Institution" value={record.institution} />
            <Field label="Corresponding author" value={record.corresponding_author} />
            <Field label="Platform" value={record.platform} />
            <Field label="Access type" value={record.access_type} />
            {record.publication_status === "corrected" && (
              <Field label="Publication status" value="Corrigendum published" />
            )}
            <Field label="Tissue preservation" value={record.tissue_preservation} />
            <Field label="WHO edition" value={record.who_edition} />
            {record.ontology && (record.ontology.disease_id || record.ontology.tissue_ids?.length > 0) && (
              <Field
                label="Ontology"
                value={[
                  record.ontology.disease_id ? `Disease: ${record.ontology.disease_id}` : null,
                  record.ontology.tissue_ids?.length ? `Tissue: ${record.ontology.tissue_ids.join(", ")}` : null,
                ]
                  .filter(Boolean)
                  .join("  ·  ")}
                mono
              />
            )}
          </dl>
        </section>

        <section className="hairline-t pt-6">
          <h2 className="text-section-label mb-3">Cohort detail</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <Field
              label="Grade breakdown"
              value={
                record.grade_breakdown.grade_1 == null &&
                record.grade_breakdown.grade_2 == null &&
                record.grade_breakdown.grade_3 == null
                  ? ""
                  : `G1: ${record.grade_breakdown.grade_1 ?? "not reported"}   G2: ${record.grade_breakdown.grade_2 ?? "not reported"}   G3: ${record.grade_breakdown.grade_3 ?? "not reported"}`
              }
              mono
            />
            <Field label="Sex distribution" value={record.sex_distribution} />
            <Field label="Age distribution" value={record.age_distribution} />
            <Field label="Anatomic location" value={record.anatomic_location_breakdown} />
            <Field
              label="Brain invasion"
              value={record.brain_invasion.status_reported ? record.brain_invasion.counts : "Not reported"}
            />
            <Field
              label="Normal/control tissue"
              value={
                record.normal_control_tissue.included
                  ? `${record.normal_control_tissue.type ?? "Type not reported"} (n=${record.normal_control_tissue.count ?? "not reported"})`
                  : "None"
              }
            />
          </dl>
        </section>

        <SampleTable samples={record.samples} />

        <GeneExpressionViewer meta={record.gene_expression_viewer} />

        <section className="hairline-t pt-6">
          <h2 className="text-section-label mb-3">Priority attributes</h2>
          <TagPills tags={record.tags} />
        </section>
      </div>

      <section>
        <h2 className="text-section-label mb-3 hairline-b pb-2">Publications</h2>
        {record.publications.length === 0 ? (
          <p className="text-caption">No publication linked.</p>
        ) : (
          <ul className="space-y-3">
            {record.publications.map((p, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {fullCitation(p)}
                {p.pmid && (
                  <>
                    {" "}
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-accent"
                    >
                      PMID {p.pmid}
                    </a>
                  </>
                )}
                {p.doi && (
                  <>
                    {" "}
                    ·{" "}
                    <a
                      href={`https://doi.org/${p.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-accent"
                    >
                      DOI
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {(() => {
        const pairedRecords = record.paired_multimodal.related_datasets
          .map((relId) => getRecordById(relId))
          .filter((r) => r !== undefined);
        const pairedAccessions = new Set(
          pairedRecords.flatMap((r) => r.accessions.map((a) => a.toLowerCase()))
        );
        // Only list accessions that don't already have a clickable pill below,
        // so the same id isn't shown twice on the page.
        const extraAccessions = record.related_accessions.filter(
          (a) => !pairedAccessions.has(a.toLowerCase())
        );
        if (extraAccessions.length === 0 && pairedRecords.length === 0) return null;
        return (
          <section>
            <h2 className="text-section-label mb-3 hairline-b pb-2">Related datasets</h2>
            {pairedRecords.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {pairedRecords.map((r) => (
                  <li key={r.id}>
                    <Link href={`/inventory/dataset/${r.id}`} className="ledger-tag">
                      {r.title}&nbsp;→
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {extraAccessions.length > 0 && (
              <p className="text-sm mt-3">
                <span style={{ color: "var(--ink-muted)" }}>Also related: </span>
                <span className="text-mono">{extraAccessions.join(", ")}</span>
              </p>
            )}
          </section>
        );
      })()}

      <section className="hairline-t pt-8">
        <h2 className="text-caption font-semibold mb-3" style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Sources
        </h2>
        <ul className="space-y-2">
          {record.source_urls.map((url) => (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-accent"
                style={{ fontSize: "0.8125rem" }}
              >
                {sourceLabel(url)}
              </a>
              <div className="text-mono break-all" style={{ fontSize: "0.75rem", color: "var(--ink-faint)" }}>
                {url}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const display = value || "Not reported";
  // Placeholder values (missing data) are de-emphasized rather than given
  // the same visual weight as real data, so what's actually known stands out.
  const isPlaceholder = display === "Not reported" || display === "None";
  return (
    <div className="min-w-0">
      <dt className="text-caption font-semibold" style={{ letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.6875rem" }}>
        {label}
      </dt>
      <dd
        className={`mt-1 break-words ${mono && !isPlaceholder ? "text-mono" : ""}`}
        style={isPlaceholder ? { color: "var(--ink-faint)" } : undefined}
      >
        {display}
      </dd>
    </div>
  );
}
