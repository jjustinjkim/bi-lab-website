import Link from "next/link";
import { getModalityBreakdown, getSummaryStats, getMultiModalGroups } from "@/lib/inventory/data";
import ModalityBreakdownChart from "@/components/inventory/charts/ModalityBreakdownChart";
import { modalityLabel, modalityColorVar } from "@/lib/inventory/modality";

export default function OverviewPage() {
  const stats = getSummaryStats();
  const breakdown = getModalityBreakdown();
  const groups = getMultiModalGroups();

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-display">Meningioma Dataset Registry</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--ink-muted)" }}>
          Every publicly discoverable meningioma molecular dataset, verified and tracked in one place.
        </p>
      </section>

      <section>
        <div className="manifest">
          <div className="manifest-item">
            <span className="manifest-value">{stats.totalCore}</span>
            <span className="manifest-label">Core datasets</span>
          </div>
          <div className="manifest-item">
            <span className="manifest-value manifest-value--accent2">{stats.totalAdjacent}</span>
            <span className="manifest-label">Adjacent (cell line / PDX / organoid)</span>
          </div>
          <div className="manifest-item">
            <span className="manifest-value">{stats.modalityCount}</span>
            <span className="manifest-label">Modalities covered</span>
          </div>
          <div className="manifest-item">
            <span className="manifest-value">{stats.multiModal}</span>
            <span className="manifest-label">Linked to other modalities</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-title mb-4">Datasets by modality</h2>
        <div className="panel p-4">
          <ModalityBreakdownChart data={breakdown} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {breakdown.map((b) => (
            <Link key={b.modality} href={`/inventory/modality/${b.modality}`} className="ledger-tag">
              <span className="modality-dot" style={{ background: modalityColorVar(b.modality) }} />
              {modalityLabel(b.modality)} ({b.count})
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-title mb-2">Multi-modal matched cohorts</h2>
        <p className="text-sm mb-4 max-w-2xl" style={{ color: "var(--ink-muted)" }}>
          The highest-value view in this registry: cohorts where the same underlying
          patients are represented across two or more modalities, so you can go
          straight from methylation to RNA-seq to spatial data for the same tumors.{" "}
          {groups.length} cohort{groups.length === 1 ? "" : "s"} found.
        </p>
        <Link
          href="/inventory/matched-cohorts"
          className="inline-block px-4 py-2 text-sm font-semibold"
          style={{ background: "var(--accent)", color: "var(--paper)", borderRadius: 3 }}
        >
          Explore matched cohorts →
        </Link>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <QuickLink href="/inventory/search" title="Search" desc="Full searchable, filterable table across every dataset." />
        <QuickLink href="/inventory/methodology" title="Methodology" desc="Verification standards and scope." />
      </section>
    </div>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="panel p-4 block hover:opacity-80 transition-opacity">
      <div className="text-subtitle">{title} →</div>
      <div className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
        {desc}
      </div>
    </Link>
  );
}
