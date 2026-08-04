import { getAllCoreRecords, getModalities } from "@/lib/inventory/data";
import SearchTable from "@/components/inventory/SearchTable";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const records = getAllCoreRecords();
  const modalities = getModalities();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display">Search</h1>
        <p className="text-sm mt-2 max-w-2xl leading-relaxed" style={{ color: "var(--ink-muted)" }}>
          Every core dataset in one sortable, filterable table. Filter by modality
          or any priority attribute below to narrow down to datasets that actually
          fit what you need.
        </p>
      </div>
      <SearchTable records={records} modalities={modalities} initialQuery={q} />
    </div>
  );
}
