import Link from "next/link";
import { RESEARCH_AREAS } from "@/lib/content";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 space-y-20">
      <section className="max-w-3xl">
        <p className="text-caption uppercase tracking-wide font-semibold mb-3" style={{ color: "var(--accent-ink)" }}>
          Brigham and Women&rsquo;s Hospital &middot; Harvard Medical School
        </p>
        <h1 className="text-display">The Skull Base Tumor Laboratory</h1>
        <p className="mt-5 text-lg" style={{ color: "var(--ink-muted)" }}>
          The Bi Lab studies the translational biology of skull base and brain tumors, with the aim
          of improving clinical outcomes for patients.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/research" className="btn btn-primary">
            Explore our research
          </Link>
          <Link href="/team" className="btn btn-secondary">
            Meet the team
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-title mb-6">Research focus</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {RESEARCH_AREAS.map((area) => (
            <Link key={area.slug} href={`/research/${area.slug}`} className="panel p-6 block hover:opacity-90 transition-opacity">
              <h3 className="text-subtitle" style={{ color: "var(--accent-ink)" }}>
                {area.name}
              </h3>
              <p className="mt-2 text-sm" style={{ color: "var(--ink-muted)" }}>
                {area.summary}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
