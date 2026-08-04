import Link from "next/link";
import { getRecordById } from "@/lib/inventory/data";
import CompareTable from "@/components/inventory/CompareTable";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const idList = (ids ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const records = idList.map((id) => getRecordById(id)).filter((r) => r !== undefined);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display">Compare</h1>
        <p className="text-sm mt-2 max-w-2xl" style={{ color: "var(--ink-muted)" }}>
          Datasets you selected on the search page, side by side. Unlike{" "}
          <Link href="/inventory/matched-cohorts" className="link-accent">
            Matched Cohorts
          </Link>
          , which groups the same patients profiled across modalities, this is any set of
          datasets you want to weigh against each other directly.
        </p>
      </div>

      {records.length === 0 ? (
        <div className="panel p-5 text-sm" style={{ color: "var(--ink-muted)" }}>
          No datasets selected. Go to{" "}
          <Link href="/inventory/search" className="link-accent">
            Search
          </Link>{" "}
          and check the box on up to 6 datasets to compare them here.
        </div>
      ) : (
        <CompareTable records={records} />
      )}
    </div>
  );
}
