import Link from "next/link";
import { DatasetRecord } from "@/lib/inventory/data";
import { citationLabel } from "@/lib/inventory/citation";
import ModalityTag from "./ModalityTag";

export default function DatasetTable({
  records,
  currentModality,
}: {
  records: DatasetRecord[];
  // When set (the /modality/[name] view), every record already shares this
  // modality, so repeating it on every single card is pure noise -- only
  // show a record's *other* modalities, which is the info actually worth a
  // reader's attention here (e.g. "also has matched RNA-seq").
  currentModality?: string;
}) {
  if (records.length === 0) {
    return <p className="text-caption">No datasets match.</p>;
  }
  return (
    <ul className="space-y-2">
      {records.map((r) => {
        const shownModalities = currentModality
          ? r.modality.filter((m) => m !== currentModality)
          : r.modality;
        return (
          <li key={r.id} className="panel p-3">
            <Link href={`/inventory/dataset/${r.id}`} className="text-subtitle link-accent block">
              {r.title}
            </Link>
            <p className="text-caption mt-0.5">{citationLabel(r.publications)}</p>
            <p className="text-mono text-xs mt-1" style={{ color: "var(--ink-faint)" }}>
              {r.accessions.join(", ")}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-sm">
              <span style={{ color: "var(--ink-muted)" }}>
                Samples <span className="text-mono" style={{ color: "var(--foreground)" }}>{r.sample_count}</span>
              </span>
              {shownModalities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {shownModalities.map((m) => (
                    <ModalityTag key={m} modality={m} />
                  ))}
                </div>
              )}
              <span className="text-caption">{r.institution}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
