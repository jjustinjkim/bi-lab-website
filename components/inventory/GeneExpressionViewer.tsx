"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GeneExpressionViewerMeta } from "@/lib/inventory/data";

interface ClusterAnnotation {
  label: string;
  confidence: "high" | "medium" | "low" | "n/a";
  note: string;
  top_markers: string[];
}

interface ViewerData {
  cell_ids: string[];
  umap_x: number[];
  umap_y: number[];
  leiden_cluster: string[];
  genes: Record<string, number[]>;
  cluster_annotations?: Record<string, ClusterAnnotation>;
  sample_id?: string[];
  pathway_scores?: Record<string, number[]>;
}

type Mode = "gene" | "cluster" | "sample" | "pathway";

// Single-hue sequential ramp derived from the site's own --accent color, light
// end deliberately receding toward the panel surface (per the dataviz skill:
// for a continuous magnitude scale, "near zero" fading toward the background
// is correct, unlike a discrete ordinal ramp where every step must clear
// contrast independently). Reused for both gene expression and pathway scores
// -- both are continuous magnitudes on the same visual grammar.
const SEQUENTIAL_LIGHT = ["#f4f2fa", "#e0d9f0", "#c3b3e0", "#9f85cc", "#6f57a0", "#423876"];
const SEQUENTIAL_DARK = ["#241f3d", "#3d3468", "#584888", "#7360a8", "#9a8ade", "#c3b3e8"];

// Categorical palette for Leiden clusters: 8 hues generated and validated
// specifically for this component (not the site's shared cat-1..8, which packs
// two greens and two oranges into 8 slots -- fine for its own use elsewhere but
// too similar when all 8 sit in a single always-visible legend here). Chosen by
// maximizing worst-case CIE76 Delta-E across ALL pairs (not just adjacent) under
// protan/deutan/tritan simulation via scripts/validate_palette.js from the
// dataviz skill -- worst all-pairs Delta-E 22.6 light / 13.5 dark, both above
// the skill's 12.0 CVD target (dark still clears the 8-12 floor band, legal
// with the direct labels already shown here).
const CLUSTER_LIGHT = ["#c8af3e", "#668227", "#2f905d", "#4ac2f4", "#313de7", "#a568ef", "#87207e", "#f591b0"];
const CLUSTER_DARK = ["#b72a55", "#f16032", "#6f972f", "#38a96c", "#3597e2", "#6975ed", "#7d2bc3", "#bc30a2"];

function interpolateHex(ramp: string[], t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (ramp.length - 1);
  const i = Math.floor(scaled);
  const frac = scaled - i;
  if (i >= ramp.length - 1) return ramp[ramp.length - 1];
  const a = hexToRgb(ramp[i]);
  const b = hexToRgb(ramp[i + 1]);
  const r = Math.round(a[0] + (b[0] - a[0]) * frac);
  const g = Math.round(a[1] + (b[1] - a[1]) * frac);
  const bl = Math.round(a[2] + (b[2] - a[2]) * frac);
  return `rgb(${r},${g},${bl})`;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Plain loops instead of Math.min(...arr)/Math.max(...arr) -- spreading an
// array into a function call has a V8 argument-count ceiling (well under
// 164,181, this project's largest merged cohort), which throws "Maximum call
// stack size exceeded" for any dataset with enough cells, not just this one.
function arrMin(arr: number[]): number {
  let m = Infinity;
  for (let i = 0; i < arr.length; i++) if (arr[i] < m) m = arr[i];
  return m;
}
function arrMax(arr: number[]): number {
  let m = -Infinity;
  for (let i = 0; i < arr.length; i++) if (arr[i] > m) m = arr[i];
  return m;
}

// Sample identity has no fixed cardinality (anywhere from 2 to 40+ samples in a
// merged cohort), so it can't use a small validated discrete palette the way
// clusters do -- there simply aren't 40 maximally-distinct CVD-safe hues.
// Golden-angle HSL rotation gives a deterministic, reasonably-separated color
// per sample for visual pattern-spotting ("do same-colored dots clump
// together, i.e. does this look patient-driven rather than biological"), not
// for reading exact sample identity off the legend -- hover and the table
// view carry the authoritative sample_id for that.
function sampleColor(index: number, isDark: boolean): string {
  const hue = (index * 137.508) % 360;
  const s = 62;
  const l = isDark ? 64 : 42;
  return `hsl(${hue}, ${s}%, ${l}%)`;
}

// Only surface a cluster's assigned identity where the marker-gene evidence was
// actually specific -- a "low confidence" call is, honestly, no call at all, so
// it's omitted rather than shown as a hedge.
function confidentAnnotation(ann?: ClusterAnnotation): ClusterAnnotation | undefined {
  return ann && ann.confidence !== "low" ? ann : undefined;
}

export default function GeneExpressionViewer({ meta }: { meta?: GeneExpressionViewerMeta | null }) {
  const [data, setData] = useState<ViewerData | null>(null);
  const [error, setError] = useState(false);
  const [mode, setMode] = useState<Mode>("gene");
  const [gene, setGene] = useState<string | null>(null);
  const [pathway, setPathway] = useState<string | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number; cellId: string; value: string } | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!meta) return;
    fetch(meta.data_url)
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then((d: ViewerData) => {
        setData(d);
        const sortedGenes = Object.keys(d.genes).sort();
        // Prefer NF2 as the default gene when the panel has it (the most
        // relevant meningioma driver gene), otherwise fall back to whatever
        // the panel's first entry is -- some panels (e.g. a variant panel)
        // never contain "NF2" as a literal key at all.
        setGene(sortedGenes.includes("NF2") ? "NF2" : sortedGenes[0] ?? null);
        const pathwayNames = d.pathway_scores ? Object.keys(d.pathway_scores).sort() : [];
        if (pathwayNames.length > 0) setPathway(pathwayNames[0]);
      })
      .catch(() => setError(true));
  }, [meta]);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute("data-theme") === "dark" || (!document.documentElement.hasAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const geneNames = useMemo(() => (data ? Object.keys(data.genes).sort() : []), [data]);
  const pathwayNames = useMemo(() => (data?.pathway_scores ? Object.keys(data.pathway_scores).sort() : []), [data]);
  const clusters = useMemo(() => (data ? Array.from(new Set(data.leiden_cluster)).sort((a, b) => Number(a) - Number(b)) : []), [data]);
  const sampleIds = useMemo(() => (data?.sample_id ? Array.from(new Set(data.sample_id)).sort() : []), [data]);
  const hasSamples = sampleIds.length > 1;
  const hasPathways = pathwayNames.length > 0;

  // Composition: % of cells per cluster, computed client-side from data already
  // in the artifact -- no separate schema field needed, this is purely a
  // different view of the same cluster assignments the scatter plot already uses.
  const composition = useMemo(() => {
    if (!data) return [];
    const counts = new Map<string, number>();
    for (const c of data.leiden_cluster) counts.set(c, (counts.get(c) ?? 0) + 1);
    return clusters.map((c) => ({ cluster: c, count: counts.get(c) ?? 0, pct: ((counts.get(c) ?? 0) / data.leiden_cluster.length) * 100 }));
  }, [data, clusters]);

  const seqRamp = isDark ? SEQUENTIAL_DARK : SEQUENTIAL_LIGHT;
  const clusterRamp = isDark ? CLUSTER_DARK : CLUSTER_LIGHT;

  // Draw the scatter plot to canvas whenever data/mode/gene/theme changes.
  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const xs = data.umap_x;
    const ys = data.umap_y;
    const xMin = arrMin(xs), xMax = arrMax(xs);
    const yMin = arrMin(ys), yMax = arrMax(ys);
    const pad = 20;
    const sx = (v: number) => pad + ((v - xMin) / (xMax - xMin)) * (width - 2 * pad);
    const sy = (v: number) => height - pad - ((v - yMin) / (yMax - yMin)) * (height - 2 * pad);

    let colorFor: (i: number) => string;
    if (mode === "gene" && gene && data.genes[gene]) {
      const vals = data.genes[gene];
      const vMax = Math.max(arrMax(vals), 0.0001);
      colorFor = (i) => interpolateHex(seqRamp, vals[i] / vMax);
    } else if (mode === "pathway" && pathway && data.pathway_scores) {
      const vals = data.pathway_scores[pathway];
      const vMin = arrMin(vals);
      const vMax = Math.max(arrMax(vals), vMin + 0.0001);
      colorFor = (i) => interpolateHex(seqRamp, (vals[i] - vMin) / (vMax - vMin));
    } else if (mode === "sample" && data.sample_id) {
      colorFor = (i) => sampleColor(sampleIds.indexOf(data.sample_id![i]), isDark);
    } else {
      colorFor = (i) => {
        const idx = clusters.indexOf(data.leiden_cluster[i]);
        return clusterRamp[idx % clusterRamp.length];
      };
    }

    for (let i = 0; i < xs.length; i++) {
      ctx.beginPath();
      ctx.arc(sx(xs[i]), sy(ys[i]), 2.2, 0, 2 * Math.PI);
      ctx.fillStyle = colorFor(i);
      ctx.fill();
    }
  }, [data, mode, gene, pathway, seqRamp, clusterRamp, sampleIds, isDark, clusters]);

  if (!meta) return null;

  // Defaults describe gene expression; a record like the Tapestri scDNA one
  // overrides these to describe variant genotype instead, since the
  // component's "gene" mode is really just "color by a numeric value per
  // cell" and shouldn't imply log-normalized expression where there isn't any.
  const featureNoun = meta.feature_noun ?? "gene";
  const valueLabel = meta.value_label ?? "log-norm";

  if (error) {
    return (
      <section className="hairline-t pt-6">
        <h2 className="text-section-label mb-2">Interactive gene-expression viewer</h2>
        <p className="text-caption">Could not load the viewer data.</p>
      </section>
    );
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const xs = data.umap_x;
    const ys = data.umap_y;
    const xMin = arrMin(xs), xMax = arrMax(xs);
    const yMin = arrMin(ys), yMax = arrMax(ys);
    const pad = 20;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const sx = (v: number) => pad + ((v - xMin) / (xMax - xMin)) * (width - 2 * pad);
    const sy = (v: number) => height - pad - ((v - yMin) / (yMax - yMin)) * (height - 2 * pad);

    let closest = -1;
    let closestDist = 8; // hit radius in px
    for (let i = 0; i < xs.length; i++) {
      const dx = sx(xs[i]) - mx;
      const dy = sy(ys[i]) - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    }
    if (closest >= 0) {
      let value: string;
      if (mode === "gene" && gene && data.genes[gene]) {
        value = `${gene}: ${data.genes[gene][closest].toFixed(2)} (${valueLabel})`;
      } else if (mode === "pathway" && pathway && data.pathway_scores) {
        value = `${pathway}: ${data.pathway_scores[pathway][closest].toFixed(3)}`;
      } else if (mode === "sample" && data.sample_id) {
        value = `Sample: ${data.sample_id[closest]}`;
      } else {
        const c = data.leiden_cluster[closest];
        const ann = confidentAnnotation(data.cluster_annotations?.[c]);
        value = ann ? `Cluster ${c} -- ${ann.label}` : `Cluster ${c}`;
      }
      setHover({ x: mx, y: my, cellId: data.cell_ids[closest], value });
    } else {
      setHover(null);
    }
  };

  return (
    <section className="hairline-t pt-6">
      <h2 className="text-section-label mb-1">Interactive gene-expression viewer</h2>
      <p className="text-caption mb-3">
        {meta.sample_label} · {meta.cell_count.toLocaleString()} cells, {meta.gene_count} genes
        {meta.sample_count && meta.sample_count > 1 ? `, ${meta.sample_count} samples merged` : ""}.
      </p>
      {meta.integration_note && (
        <p className="text-caption mb-3" style={{ color: "var(--ink-faint)" }}>
          {meta.integration_note}
        </p>
      )}

      {!data ? (
        <p className="text-caption">Loading…</p>
      ) : (
        <div className="panel p-4">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="flex gap-1.5 flex-wrap">
              <button onClick={() => setMode("gene")} className="ledger-tag" data-active={mode === "gene"}>
                Color by {featureNoun}
              </button>
              <button onClick={() => setMode("cluster")} className="ledger-tag" data-active={mode === "cluster"}>
                Color by cluster
              </button>
              {hasSamples && (
                <button onClick={() => setMode("sample")} className="ledger-tag" data-active={mode === "sample"}>
                  Color by sample
                </button>
              )}
              {hasPathways && (
                <button onClick={() => setMode("pathway")} className="ledger-tag" data-active={mode === "pathway"}>
                  Color by pathway score
                </button>
              )}
            </div>
            {mode === "gene" && (
              <label className="flex items-center gap-2 text-sm">
                <span style={{ color: "var(--ink-muted)" }}>{featureNoun.charAt(0).toUpperCase() + featureNoun.slice(1)}</span>
                <select
                  value={gene ?? ""}
                  onChange={(e) => setGene(e.target.value)}
                  className="px-2 py-1 text-sm bg-transparent text-mono"
                  style={{ border: "1px solid var(--hairline-strong)", borderRadius: 3 }}
                >
                  {geneNames.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <span className="text-caption" style={{ color: "var(--ink-faint)" }}>
                  {`${geneNames.length} ${featureNoun}s in this cohort's panel`}
                </span>
              </label>
            )}
            {mode === "pathway" && hasPathways && (
              <label className="flex items-center gap-2 text-sm">
                <span style={{ color: "var(--ink-muted)" }}>Pathway</span>
                <select
                  value={pathway ?? ""}
                  onChange={(e) => setPathway(e.target.value)}
                  className="px-2 py-1 text-sm bg-transparent"
                  style={{ border: "1px solid var(--hairline-strong)", borderRadius: 3 }}
                >
                  {pathwayNames.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div className="relative" style={{ height: "420px" }}>
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "crosshair" }}
            />
            {hover && (
              <div
                className="absolute pointer-events-none panel px-2 py-1 text-xs text-mono"
                style={{ left: hover.x + 12, top: hover.y + 12, zIndex: 10, whiteSpace: "nowrap" }}
              >
                <div style={{ color: "var(--ink-faint)" }}>{hover.cellId}</div>
                <div>{hover.value}</div>
              </div>
            )}
          </div>

          {/* Legend: sequential ramp for gene/pathway mode, categorical swatches
              for cluster/sample mode -- never color-alone, per the dataviz
              skill's accessibility requirement. */}
          <div className="mt-3 flex flex-wrap items-start gap-3 text-xs">
            {mode === "gene" || mode === "pathway" ? (
              <div className="flex items-center gap-2">
                <span style={{ color: "var(--ink-muted)" }}>Low</span>
                <div
                  className="h-3 w-32 rounded"
                  style={{ background: `linear-gradient(to right, ${seqRamp.join(",")})` }}
                />
                <span style={{ color: "var(--ink-muted)" }}>{mode === "gene" ? (meta.value_label ? `High ${meta.value_label}` : "High expression") : "High score"}</span>
              </div>
            ) : mode === "sample" ? (
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-2">
                {sampleIds.map((s, i) => (
                  <span key={s} className="flex items-center gap-1">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: sampleColor(i, isDark) }}
                    />
                    <span style={{ color: "var(--ink-muted)" }}>{s}</span>
                  </span>
                ))}
                {sampleIds.length > 12 && (
                  <span className="text-caption" style={{ color: "var(--ink-faint)" }}>
                    {sampleIds.length} samples -- colors are for spotting whether cells clump by patient, not for
                    reading exact identity off this list. Hover a cell for its exact sample.
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {clusters.map((c, idx) => {
                  const ann = confidentAnnotation(data.cluster_annotations?.[c]);
                  const title = ann ? `${ann.note} Top genes: ${ann.top_markers.join(", ")}.` : undefined;
                  return (
                    <span key={c} className="flex items-center gap-1" title={title}>
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: clusterRamp[idx % clusterRamp.length] }}
                      />
                      <span style={{ color: "var(--ink-muted)" }}>
                        Cluster {c}
                        {ann ? ` -- ${ann.label}` : ""}
                      </span>
                    </span>
                  );
                })}
              </div>
            )}
            <button onClick={() => setShowTable((s) => !s)} className="link-accent ml-auto">
              {showTable ? "Hide" : "View"} as table
            </button>
          </div>

          {mode === "cluster" && data.cluster_annotations && Object.values(data.cluster_annotations).some((a) => a.top_markers.length > 0) && (
            <p className="text-caption mt-1" style={{ color: "var(--ink-faint)" }}>
              Cluster labels are informal identities from each cluster&apos;s top marker genes -- not verified
              against the original study&apos;s own annotations. Hover a legend swatch for its top genes.
            </p>
          )}
          {mode === "cluster" && data.cluster_annotations && Object.values(data.cluster_annotations).every((a) => a.top_markers.length === 0) && (
            <p className="text-caption mt-1" style={{ color: "var(--ink-faint)" }}>
              Cluster labels come directly from the original processing pipeline&apos;s own clustering, not
              independently re-derived or verified here.
            </p>
          )}
          {mode === "sample" && (
            <p className="text-caption mt-1" style={{ color: "var(--ink-faint)" }}>
              Samples were merged without batch correction/integration (raw concatenation, matching this
              project&apos;s documented approach) -- if cells visibly cluster by sample rather than mixing, that can
              reflect patient-to-patient technical/biological difference as much as real biology.
            </p>
          )}
          {mode === "pathway" && (
            <p className="text-caption mt-1" style={{ color: "var(--ink-faint)" }}>
              Pathway scores are computed per cell (scanpy <code>score_genes</code> against a literature-standard
              gene set), not verified against the original study&apos;s own pathway analysis, if any.
            </p>
          )}

          {/* Composition: what fraction of cells fall in each cluster -- a
              quantitative summary alongside the scatter plot, modeled on 3CA's
              cell-type-composition pie chart but rendered as a labeled bar list
              (matching this site's own "clarity over decoration" chart style
              elsewhere rather than introducing a new pie-chart component). */}
          <div className="mt-4 hairline-t pt-3">
            <h3 className="text-caption font-semibold mb-2" style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Cluster composition
            </h3>
            <div className="space-y-1.5">
              {composition.map(({ cluster, count, pct }) => {
                const ann = confidentAnnotation(data.cluster_annotations?.[cluster]);
                const idx = clusters.indexOf(cluster);
                return (
                  <div key={cluster} className="flex items-center gap-2 text-xs">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: clusterRamp[idx % clusterRamp.length] }}
                    />
                    <span className="w-40 shrink-0" style={{ color: "var(--ink-muted)" }}>
                      Cluster {cluster}
                      {ann ? ` -- ${ann.label}` : ""}
                    </span>
                    <div className="flex-1 h-2 rounded" style={{ background: "var(--hairline)" }}>
                      <div
                        className="h-2 rounded"
                        style={{ width: `${pct}%`, background: clusterRamp[idx % clusterRamp.length] }}
                      />
                    </div>
                    <span className="text-mono w-16 text-right shrink-0" style={{ color: "var(--ink-faint)" }}>
                      {pct.toFixed(1)}% ({count.toLocaleString()})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {showTable && (
            <div className="mt-3 overflow-x-auto" style={{ maxHeight: "300px", overflowY: "auto" }}>
              <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr className="hairline-b">
                    <th className="text-left py-1 pr-3 text-mono">Cell</th>
                    {hasSamples && <th className="text-left py-1 pr-3">Sample</th>}
                    <th className="text-left py-1 pr-3">Cluster</th>
                    <th className="text-left py-1 pr-3">
                      {mode === "gene" ? `${gene} (${valueLabel})` : mode === "pathway" ? pathway ?? "" : ""}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.cell_ids.slice(0, 200).map((id, i) => {
                    const c = data.leiden_cluster[i];
                    const ann = confidentAnnotation(data.cluster_annotations?.[c]);
                    return (
                      <tr key={id} className="hairline-b">
                        <td className="py-1 pr-3 text-mono">{id}</td>
                        {hasSamples && <td className="py-1 pr-3">{data.sample_id?.[i]}</td>}
                        <td className="py-1 pr-3">{ann ? `${c} -- ${ann.label}` : c}</td>
                        <td className="py-1 pr-3">
                          {mode === "gene" && gene && data.genes[gene] ? data.genes[gene][i].toFixed(2) : mode === "pathway" && pathway && data.pathway_scores ? data.pathway_scores[pathway][i].toFixed(3) : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-caption mt-1">Showing first 200 of {data.cell_ids.length.toLocaleString()} cells.</p>
              {data.cluster_annotations && Object.values(data.cluster_annotations).some((a) => a.top_markers.length > 0) && (
                <p className="text-caption mt-2" style={{ color: "var(--ink-faint)" }}>
                  Cluster labels are informal identities I assigned from each cluster&apos;s top differentially-expressed
                  genes (Wilcoxon rank-sum) matched against canonical cell-type markers -- not verified against the
                  original study&apos;s own cell annotations. Confidence reflects how specific/consistent those top genes
                  were, not a statistical measure.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
