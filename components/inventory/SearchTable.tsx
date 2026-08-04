"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DatasetRecord, Tags } from "@/lib/inventory/data";
import { TAG_LABELS, TAG_GROUPS } from "@/lib/inventory/tags";
import { modalityLabel } from "@/lib/inventory/modality";
import { citationLabel } from "@/lib/inventory/citation";
import ModalityTag from "./ModalityTag";

type SortKey = "title" | "sample_count" | "year";

const CART_STORAGE_KEY = "registry-compare-cart";
const CART_MAX = 6;

// A handful of institution values are full descriptive clauses (100+ chars)
// rather than a short name -- truncate what's shown in the filter dropdown
// so it can't force the control (and the row it's in) wider than the
// viewport; the full text is still on the option via `title`.
function truncateLabel(s: string, max = 60): string {
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadCsv(records: DatasetRecord[]) {
  const header = ["Title", "Citation", "Accessions", "Modality", "Sample count", "Institution", "Access type"];
  const rows = records.map((r) => [
    r.title,
    citationLabel(r.publications),
    r.accessions.join("; "),
    r.modality.map(modalityLabel).join("; "),
    String(r.sample_count),
    r.institution,
    r.access_type,
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "meningioma-registry-search-results.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function SearchTable({
  records,
  modalities,
  initialQuery,
}: {
  records: DatasetRecord[];
  modalities: string[];
  initialQuery?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery ?? "");
  const [modalityFilter, setModalityFilter] = useState<string>("");
  const [institutionFilter, setInstitutionFilter] = useState<string>("");
  const [accessTypeFilter, setAccessTypeFilter] = useState<string>("");
  const [activeTags, setActiveTags] = useState<Set<keyof Tags>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  // Compare cart: hand-picked datasets to weigh side by side, independent of
  // the filters above and persisted across navigation to /compare.
  const [cartIds, setCartIds] = useState<Set<string>>(new Set());
  const [cartHydrated, setCartHydrated] = useState(false);

  useEffect(() => {
    // Deferred to after mount for the same SSR-hydration-safety reason as
    // ThemeToggle: cartIds must start empty on both the server render and the
    // client's first hydration pass, then sync from localStorage once, here.
    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setCartIds(new Set(JSON.parse(stored)));
    } catch {
      // malformed/blocked storage -- start with an empty cart rather than crash
    }
    setCartHydrated(true);
  }, []);

  const persistCart = (next: Set<string>) => {
    setCartIds(next);
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(Array.from(next)));
    } catch {
      // ignore -- selection still works for this session even if storage is blocked
    }
  };

  const toggleCart = (id: string) => {
    const next = new Set(cartIds);
    if (next.has(id)) next.delete(id);
    else if (next.size < CART_MAX) next.add(id);
    persistCart(next);
  };

  const clearCart = () => persistCart(new Set());

  const institutions = useMemo(
    () => Array.from(new Set(records.map((r) => r.institution).filter(Boolean))).sort(),
    [records]
  );

  const toggleTag = (key: keyof Tags) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = records.filter((r) => {
      if (q) {
        const hay = `${r.title} ${r.accessions.join(" ")} ${r.institution} ${r.corresponding_author}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (modalityFilter && !r.modality.includes(modalityFilter)) return false;
      if (institutionFilter && r.institution !== institutionFilter) return false;
      if (accessTypeFilter && r.access_type !== accessTypeFilter) return false;
      for (const tag of activeTags) {
        if (!r.tags[tag]) return false;
      }
      return true;
    });

    out = out.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "sample_count") {
        const an = typeof a.sample_count === "number" ? a.sample_count : -1;
        const bn = typeof b.sample_count === "number" ? b.sample_count : -1;
        cmp = an - bn;
      } else if (sortKey === "year") {
        const ay = a.publications[0]?.year ?? -1;
        const by = b.publications[0]?.year ?? -1;
        cmp = ay - by;
      }
      return cmp * sortDir;
    });

    return out;
  }, [records, query, modalityFilter, institutionFilter, accessTypeFilter, activeTags, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(key);
      setSortDir(1);
    }
  };

  const sortIndicator = (key: SortKey) => (sortKey === key ? (sortDir === 1 ? "↑" : "↓") : "");

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "title", label: "Title" },
    { key: "sample_count", label: "Samples" },
    { key: "year", label: "Year" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search title, accession, institution, author…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-[220px] px-3 py-2 text-sm bg-transparent"
          style={{ border: "1px solid var(--hairline-strong)", borderRadius: 3 }}
        />
        <select
          value={modalityFilter}
          onChange={(e) => setModalityFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-transparent"
          style={{ border: "1px solid var(--hairline-strong)", borderRadius: 3 }}
        >
          <option value="">All modalities</option>
          {modalities.map((m) => (
            <option key={m} value={m}>
              {modalityLabel(m)}
            </option>
          ))}
        </select>
        <select
          value={institutionFilter}
          onChange={(e) => setInstitutionFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-transparent max-w-[220px] truncate"
          style={{ border: "1px solid var(--hairline-strong)", borderRadius: 3 }}
        >
          <option value="">All institutions</option>
          {institutions.map((inst) => (
            <option key={inst} value={inst} title={inst}>
              {truncateLabel(inst)}
            </option>
          ))}
        </select>
        <select
          value={accessTypeFilter}
          onChange={(e) => setAccessTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-transparent"
          style={{ border: "1px solid var(--hairline-strong)", borderRadius: 3 }}
        >
          <option value="">All access types</option>
          <option value="open">Open access</option>
          <option value="controlled">Controlled access</option>
        </select>
      </div>

      <div className="panel px-3 py-3 flex flex-wrap gap-x-6 gap-y-2.5">
        {TAG_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <span className="text-section-label">{group.label}</span>
            <div className="flex flex-wrap gap-1.5">
              {group.keys.map((key) => (
                <button
                  key={key}
                  onClick={() => toggleTag(key)}
                  className="ledger-tag"
                  data-active={activeTags.has(key)}
                  aria-pressed={activeTags.has(key)}
                >
                  {TAG_LABELS[key]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-caption">
          {filtered.length} of {records.length} datasets shown.
          {activeTags.size > 0 && (
            <>
              {" "}
              <button
                onClick={() => setActiveTags(new Set())}
                className="link-accent underline-offset-2 hover:underline"
              >
                Clear {activeTags.size} attribute filter{activeTags.size > 1 ? "s" : ""}
              </button>
            </>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-3">
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
          <button onClick={() => downloadCsv(filtered)} className="ledger-tag">
            Download CSV ({filtered.length})
          </button>
        </div>
      </div>

      <ul className="space-y-2 pb-16">
        {filtered.map((r) => {
          const inCart = cartIds.has(r.id);
          const cartFull = !inCart && cartIds.size >= CART_MAX;
          return (
            <li key={r.id} className="panel p-3 flex gap-3">
              <label
                className="mt-1 flex-shrink-0"
                title={cartFull ? `Compare cart is full (max ${CART_MAX})` : inCart ? "Remove from compare" : "Add to compare"}
              >
                <input
                  type="checkbox"
                  checked={inCart}
                  disabled={cartFull}
                  onChange={() => toggleCart(r.id)}
                  aria-label={`Add ${r.title} to compare`}
                  className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                  style={{ accentColor: "var(--accent)" }}
                />
              </label>
              <div className="min-w-0 flex-1">
                <Link href={`/inventory/dataset/${r.id}`} className="text-subtitle link-accent block">
                  {r.title}
                </Link>
                <p className="text-caption mt-0.5">{citationLabel(r.publications)}</p>
                <p className="text-mono text-xs mt-1" style={{ color: "var(--ink-faint)" }}>
                  {r.accessions.join(", ")}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-sm">
                  <span style={{ color: "var(--ink-muted)" }}>
                    Samples <span className="text-mono" style={{ color: "var(--foreground)" }}>{r.sample_count}</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {r.modality.map((m) => (
                      <ModalityTag key={m} modality={m} />
                    ))}
                  </div>
                  <span className="text-caption">{r.institution}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {cartHydrated && cartIds.size > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-20 backdrop-blur"
          style={{ borderTop: "1px solid var(--hairline-strong)", background: "color-mix(in srgb, var(--background) 94%, transparent)" }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">
              {cartIds.size} selected{cartIds.size >= CART_MAX ? ` (max ${CART_MAX})` : ""}
            </span>
            <button
              onClick={() => router.push(`/inventory/compare?ids=${Array.from(cartIds).join(",")}`)}
              className="ledger-tag"
              data-active="true"
            >
              Compare
            </button>
            <button
              onClick={() => downloadCsv(records.filter((r) => cartIds.has(r.id)))}
              className="ledger-tag"
            >
              Export selected CSV
            </button>
            <button onClick={clearCart} className="ledger-tag ml-auto sm:ml-0">
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
