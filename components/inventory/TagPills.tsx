import { Tags } from "@/lib/inventory/data";
import { TAG_LABELS } from "@/lib/inventory/tags";

export default function TagPills({ tags, only }: { tags: Tags; only?: (keyof Tags)[] }) {
  const keys = (only || (Object.keys(TAG_LABELS) as (keyof Tags)[])).filter((k) => tags[k]);
  if (keys.length === 0) {
    return <span className="text-caption">No priority attributes set for this record.</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {keys.map((k) => (
        <span key={k} className="ledger-tag">
          {TAG_LABELS[k]}
        </span>
      ))}
    </div>
  );
}
