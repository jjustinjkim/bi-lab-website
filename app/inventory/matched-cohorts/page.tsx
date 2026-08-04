import Link from "next/link";
import { getMultiModalGroups } from "@/lib/inventory/data";
import { citationLabel } from "@/lib/inventory/citation";
import ModalityTag from "@/components/inventory/ModalityTag";

export default function MatchedCohortsPage() {
  const groups = getMultiModalGroups();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display">Matched Cohorts</h1>
        <p className="text-sm mt-2 max-w-2xl leading-relaxed" style={{ color: "var(--ink-muted)" }}>
          What you&apos;re looking at: cohorts where the same patients were profiled with two or
          more molecular modalities, so instead of cross-referencing accessions by hand,
          you can go straight from methylation to RNA-seq to spatial data for the same
          tumors. This is the highest-value view in the registry for planning a
          multi-omic analysis. {groups.length} cohort{groups.length === 1 ? "" : "s"} found.
        </p>
      </div>

      <div className="grid gap-4">
        {groups.map((group, i) => {
          const modalities = Array.from(new Set(group.flatMap((r) => r.modality)));
          const totalSamples = group.reduce((sum, r) => {
            const n = typeof r.sample_count === "number" ? r.sample_count : 0;
            return sum + n;
          }, 0);
          return (
            <div key={i} className="panel p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3 hairline-b pb-3">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-mono text-xs" style={{ color: "var(--ink-muted)" }}>
                    COHORT {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {modalities.map((m) => (
                      <ModalityTag key={m} modality={m} />
                    ))}
                  </div>
                </div>
                <span className="text-caption whitespace-nowrap">
                  {group.length} linked records · ~{totalSamples || "?"} total samples
                </span>
              </div>
              <ul className="space-y-3">
                {group.map((r) => (
                  <li key={r.id} className="text-sm">
                    <div className="flex flex-wrap items-center gap-1 mb-1">
                      {r.modality.map((m) => (
                        <ModalityTag key={m} modality={m} />
                      ))}
                      {r._adjacent && <span className="ledger-tag ledger-tag--adjacent">Adjacent (not core)</span>}
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <Link href={`/inventory/dataset/${r.id}`} className="link-accent">
                        {r.title}
                      </Link>
                      <span className="text-caption whitespace-nowrap">{citationLabel(r.publications)}</span>
                    </div>
                    <div className="text-mono text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>
                      {r.accessions.join(", ")}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
