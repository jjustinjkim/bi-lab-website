import Link from "next/link";
import { DatasetRecord } from "@/lib/inventory/data";
import { citationLabel } from "@/lib/inventory/citation";
import { TAG_LABELS } from "@/lib/inventory/tags";
import ModalityTag from "./ModalityTag";

function gradeString(r: DatasetRecord): string {
  const { grade_1, grade_2, grade_3 } = r.grade_breakdown;
  if (grade_1 == null && grade_2 == null && grade_3 == null) return "Not reported";
  return `G1: ${grade_1 ?? "n/a"}  G2: ${grade_2 ?? "n/a"}  G3: ${grade_3 ?? "n/a"}`;
}

const ROWS: { label: string; render: (r: DatasetRecord) => React.ReactNode }[] = [
  { label: "Citation", render: (r) => citationLabel(r.publications) },
  {
    label: "Modality",
    render: (r) => (
      <div className="flex flex-wrap gap-1">
        {r.modality.map((m) => (
          <ModalityTag key={m} modality={m} />
        ))}
      </div>
    ),
  },
  { label: "Sample count", render: (r) => String(r.sample_count) },
  { label: "Patient count", render: (r) => String(r.patient_count) },
  { label: "Institution", render: (r) => r.institution },
  { label: "Access type", render: (r) => r.access_type },
  { label: "Grade breakdown", render: (r) => gradeString(r) },
  {
    label: "Priority attributes",
    render: (r) => {
      const active = (Object.keys(TAG_LABELS) as (keyof typeof r.tags)[]).filter((k) => r.tags[k]);
      if (active.length === 0) return <span style={{ color: "var(--ink-faint)" }}>None</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {active.map((k) => (
            <span key={k} className="ledger-tag">
              {TAG_LABELS[k]}
            </span>
          ))}
        </div>
      );
    },
  },
];

export default function CompareTable({ records }: { records: DatasetRecord[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-sm" style={{ borderCollapse: "collapse", minWidth: "100%" }}>
        <thead>
          <tr className="hairline-b">
            <th className="text-left align-bottom py-2 pr-4" style={{ minWidth: "9rem" }} />
            {records.map((r) => (
              <th key={r.id} className="text-left align-bottom py-2 px-4 hairline-b" style={{ minWidth: "16rem" }}>
                <Link href={`/inventory/dataset/${r.id}`} className="text-subtitle link-accent block leading-snug">
                  {r.title}
                </Link>
                <span className="text-mono text-xs mt-1 block" style={{ color: "var(--ink-faint)" }}>
                  {r.accessions.join(", ")}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="hairline-b align-top">
              <td
                className="py-3 pr-4 text-caption font-semibold whitespace-nowrap"
                style={{ letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.6875rem" }}
              >
                {row.label}
              </td>
              {records.map((r) => (
                <td key={r.id} className="py-3 px-4">
                  {row.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
