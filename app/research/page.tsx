import Link from "next/link";
import { RESEARCH_AREAS } from "@/lib/content";

export default function ResearchPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 space-y-8">
      <div className="max-w-2xl">
        <h1 className="text-display">Research</h1>
        <p className="mt-4" style={{ color: "var(--ink-muted)" }}>
          The lab&rsquo;s work spans four research areas, from molecular profiling of tumors to the
          operating room itself.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {RESEARCH_AREAS.map((area) => (
          <Link key={area.slug} href={`/research/${area.slug}`} className="panel p-6 block hover:opacity-90 transition-opacity">
            <h2 className="text-subtitle" style={{ color: "var(--accent-ink)" }}>
              {area.name}
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--ink-muted)" }}>
              {area.summary}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
