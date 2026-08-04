import { getInstitutionSummaries } from "@/lib/inventory/data";
import InstitutionsExplorer from "@/components/inventory/InstitutionsExplorer";

export default function InstitutionsPage() {
  const summaries = getInstitutionSummaries();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display">Institutions</h1>
        <p className="text-sm mt-2 max-w-2xl leading-relaxed" style={{ color: "var(--ink-muted)" }}>
          Core datasets grouped by source institution, with real outreach status
          per institution: datasets contacted, datasets replied to, and datasets
          that yielded new clinical metadata beyond the public deposit.
        </p>
      </div>
      <InstitutionsExplorer summaries={summaries} />
    </div>
  );
}
