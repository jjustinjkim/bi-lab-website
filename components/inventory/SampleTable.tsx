import { SampleRow } from "@/lib/inventory/data";

const COLUMNS: { key: keyof SampleRow; label: string }[] = [
  { key: "sample_id", label: "Sample" },
  { key: "sex", label: "Sex" },
  { key: "age", label: "Age" },
  { key: "who_grade", label: "WHO grade" },
  { key: "diagnosis", label: "Diagnosis" },
  { key: "anatomic_location", label: "Location" },
  { key: "treatment_timing", label: "Treatment timing" },
  { key: "molecular_subtype", label: "Molecular subtype" },
  { key: "outcome", label: "Outcome" },
];

// Renders a real per-sample table only when the record actually carries one --
// most records only have cohort-level aggregates (grade_breakdown counts,
// sex_distribution as a summary string), which stay in the existing "Cohort
// detail" section above this. Columns that are null for every row in this
// specific record are dropped, so a record with only grade+sex data doesn't
// render a wall of empty cells for the other fields.
export default function SampleTable({ samples }: { samples?: SampleRow[] | null }) {
  if (!samples || samples.length === 0) return null;

  const columns = COLUMNS.filter((c) => samples.some((s) => s[c.key] != null && s[c.key] !== ""));

  // Location and outcome strings run long ("Cavernous Sinus/Middle Fossa",
  // "Recurrence: N; Follow-up: 60.6 mo"); letting just these two wrap keeps
  // the table's total width sane instead of forcing horizontal scroll.
  const WRAP_COLUMNS = new Set<keyof SampleRow>(["anatomic_location", "outcome"]);

  return (
    <section className="hairline-t pt-6">
      <h2 className="text-section-label mb-3">
        Per-sample detail <span style={{ color: "var(--ink-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>({samples.length} samples)</span>
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr className="hairline-b">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`text-left py-1.5 pr-4 text-caption font-semibold ${WRAP_COLUMNS.has(c.key) ? "" : "whitespace-nowrap"}`}
                  style={{ letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.6875rem" }}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {samples.map((s, i) => (
              <tr key={s.sample_id + i} className="hairline-b">
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`py-1.5 pr-4 ${WRAP_COLUMNS.has(c.key) ? "" : "whitespace-nowrap"} ${c.key === "sample_id" ? "text-mono" : ""}`}
                  >
                    {s[c.key] ?? <span style={{ color: "var(--ink-faint)" }}>n/a</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
