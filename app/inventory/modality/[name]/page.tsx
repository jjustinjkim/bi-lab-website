import { notFound } from "next/navigation";
import { getRecordsByModality } from "@/lib/inventory/data";
import { modalityLabel, allModalityKeys, modalityColorVar } from "@/lib/inventory/modality";
import DatasetTable from "@/components/inventory/DatasetTable";

export async function generateStaticParams() {
  return allModalityKeys().map((name) => ({ name }));
}

export default async function ModalityPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  if (!allModalityKeys().includes(name)) notFound();
  const records = getRecordsByModality(name);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display flex items-center gap-3">
          <span
            aria-hidden="true"
            style={{ width: 14, height: 14, borderRadius: "50%", background: modalityColorVar(name), flexShrink: 0 }}
          />
          {modalityLabel(name)}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
          {records.length} dataset{records.length === 1 ? "" : "s"} in this modality.
        </p>
      </div>
      {records.length === 0 ? (
        <div className="panel p-6">
          <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
            No public dataset currently satisfies this modality for meningioma.
            This has been searched, not simply left unchecked.
          </p>
        </div>
      ) : (
        <DatasetTable records={records} currentModality={name} />
      )}
    </div>
  );
}
