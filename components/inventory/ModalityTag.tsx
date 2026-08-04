import { modalityLabel, modalityColorVar } from "@/lib/inventory/modality";

// Every modality tag anywhere on the site carries the same fixed identity
// dot from lib/modality's stable color mapping, so a hue is never
// decoration, it always names the same modality (chart, table, matched cohorts).
export default function ModalityTag({ modality }: { modality: string }) {
  return (
    <span className="ledger-tag">
      <span className="modality-dot" style={{ background: modalityColorVar(modality) }} />
      {modalityLabel(modality)}
    </span>
  );
}
