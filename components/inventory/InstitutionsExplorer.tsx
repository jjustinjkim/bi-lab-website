"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { InstitutionSummary, OutreachStatus } from "@/lib/inventory/data";
import { citationLabel } from "@/lib/inventory/citation";
import ModalityTag from "./ModalityTag";

type SortKey = "dataReceived" | "responded" | "datasets" | "patients" | "name";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "dataReceived", label: "Data received" },
  { key: "responded", label: "Responded" },
  { key: "datasets", label: "Datasets" },
  { key: "patients", label: "Patients" },
  { key: "name", label: "Name" },
];

// Short badge text per outreach status, matched to the enum defined in
// lib/data.ts and documented in /outreach/README.md -- keep these two in sync.
const STATUS_LABELS: Record<OutreachStatus, string> = {
  not_contacted: "Not contacted",
  contacted: "Contacted, no reply yet",
  responded_declined: "Replied, declined",
  responded_no_new_data: "Replied, nothing new",
  responded_partial_data: "Replied, partial data",
  responded_full_data: "Replied, full data",
};

function pct(n: number, of: number): string {
  return of > 0 ? `${Math.round((n / of) * 100)}%` : "0%";
}

export default function InstitutionsExplorer({ summaries }: { summaries: InstitutionSummary[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("dataReceived");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpanded = (institution: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(institution)) next.delete(institution);
      else next.add(institution);
      return next;
    });
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(key);
      // Name is naturally ascending; the numeric measures read better
      // defaulting to "biggest first" the way SearchTable's sort does.
      setSortDir(key === "name" ? 1 : -1);
    }
  };

  const sortIndicator = (key: SortKey) => (sortKey === key ? (sortDir === 1 ? "↑" : "↓") : "");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = summaries;
    if (q) {
      out = out.filter((s) => {
        const hay = `${s.institution} ${s.rawNames.join(" ")}`.toLowerCase();
        return hay.includes(q);
      });
    }
    out = [...out].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "dataReceived") cmp = a.outreach.dataReceivedCount - b.outreach.dataReceivedCount;
      else if (sortKey === "responded") cmp = a.outreach.respondedCount - b.outreach.respondedCount;
      else if (sortKey === "datasets") cmp = a.datasetCount - b.datasetCount;
      else if (sortKey === "patients") cmp = a.patientCount - b.patientCount;
      else if (sortKey === "name") cmp = a.institution.localeCompare(b.institution);
      return cmp * sortDir;
    });
    return out;
  }, [summaries, query, sortKey, sortDir]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search institution name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-[220px] px-3 py-2 text-sm bg-transparent"
          style={{ border: "1px solid var(--hairline-strong)", borderRadius: 3 }}
        />
        <div className="flex items-center gap-1.5 text-caption">
          <span>Sort:</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => toggleSort(opt.key)}
              className="ledger-tag"
              data-active={sortKey === opt.key}
            >
              {opt.label} {sortIndicator(opt.key)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-caption">
        {filtered.length} of {summaries.length} institutions shown.
      </p>

      <div className="grid gap-3">
        {filtered.map((s) => {
          const isExpanded = expanded.has(s.institution);
          const { contactedCount, respondedCount, dataReceivedCount } = s.outreach;
          return (
            <div key={s.institution} className="panel p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-subtitle">{s.institution}</h3>
                  {s.rawNames.length > 1 && (
                    <p className="text-caption mt-0.5">
                      Combines {s.rawNames.length} source-name variants: {s.rawNames.join(" · ")}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {s.modalities.map((m) => (
                      <ModalityTag key={m} modality={m} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-6 text-right flex-shrink-0">
                  <div>
                    <div className="text-mono text-lg font-semibold">{s.datasetCount}</div>
                    <div className="manifest-label">Datasets</div>
                  </div>
                  <div>
                    <div className="text-mono text-lg font-semibold">
                      {s.patientCountKnown ? s.patientCount : "?"}
                    </div>
                    <div className="manifest-label">Patients</div>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-caption">Clinical metadata received directly from this institution</span>
                  <span className="text-mono text-xs" style={{ color: "var(--ink-muted)" }}>
                    {dataReceivedCount}/{s.datasetCount} datasets ({pct(dataReceivedCount, s.datasetCount)})
                  </span>
                </div>
                <div className="completeness-track">
                  <div className="completeness-fill" style={{ width: pct(dataReceivedCount, s.datasetCount) }} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  <span className="text-caption">
                    Contacted{" "}
                    <span className="text-mono" style={{ color: "var(--foreground)" }}>
                      {contactedCount}/{s.datasetCount}
                    </span>
                  </span>
                  <span className="text-caption">
                    Responded{" "}
                    <span className="text-mono" style={{ color: "var(--foreground)" }}>
                      {respondedCount}/{s.datasetCount}
                    </span>
                  </span>
                  <span className="text-caption">
                    Data received{" "}
                    <span className="text-mono" style={{ color: "var(--foreground)" }}>
                      {dataReceivedCount}/{s.datasetCount}
                    </span>
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleExpanded(s.institution)}
                className="link-accent text-sm mt-3 hover:underline underline-offset-2"
              >
                {isExpanded ? "Hide" : "Show"} {s.datasetCount} dataset{s.datasetCount === 1 ? "" : "s"} →
              </button>

              {isExpanded && (
                <ul className="mt-3 space-y-2.5 hairline-t pt-3">
                  {s.datasets.map((r) => {
                    const missing = s.missingFieldsById[r.id] || [];
                    const outreach = s.outreachByDatasetId[r.id];
                    return (
                      <li key={r.id} className="text-sm">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <Link href={`/inventory/dataset/${r.id}`} className="link-accent font-semibold">
                            {r.title}
                          </Link>
                          <span className="text-caption whitespace-nowrap">{citationLabel(r.publications)}</span>
                          <span className="ledger-tag" data-active={outreach.status !== "not_contacted"}>
                            {STATUS_LABELS[outreach.status]}
                          </span>
                        </div>
                        <div className="text-mono text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>
                          {r.accessions.join(", ")}
                        </div>
                        <p className="text-caption mt-0.5">
                          Corresponding author:{" "}
                          <span style={{ color: "var(--foreground)" }}>
                            {r.corresponding_author || "Not reported"}
                          </span>
                        </p>
                        {missing.length > 0 ? (
                          <p className="text-caption mt-0.5">Not yet public: {missing.join(", ")}</p>
                        ) : (
                          <p className="text-caption mt-0.5">All checklist fields already public.</p>
                        )}
                        {outreach.contact_log.length > 0 && (
                          <ul className="mt-1 space-y-0.5">
                            {outreach.contact_log.map((entry, i) => (
                              <li key={i} className="text-caption">
                                {entry.date}: {entry.outcome}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
