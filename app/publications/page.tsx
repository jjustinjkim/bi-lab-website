import type { Metadata } from "next";
import { FEATURED_PUBLICATIONS, PUBLICATIONS_BY_YEAR, PUBMED_URL } from "@/lib/content";

export const metadata: Metadata = {
  title: "Publications",
  description: "Featured studies and the full publication archive from the Bi Lab, 2014 to present.",
};

export default function PublicationsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-14">
      <h1 className="text-display">Publications</h1>

      <section>
        <div className="grid sm:grid-cols-3 gap-5">
          {FEATURED_PUBLICATIONS.map((pub) => (
            <a key={pub.title} href={pub.href} target="_blank" rel="noopener noreferrer" className="panel p-5 block hover:opacity-90 transition-opacity">
              <h3 className="text-subtitle" style={{ fontSize: "1rem", color: "var(--accent-ink)" }}>
                {pub.title}
              </h3>
              <p className="text-sm mt-2" style={{ color: "var(--ink-muted)" }}>
                {pub.excerpt}
              </p>
            </a>
          ))}
        </div>
      </section>

      <div className="text-center">
        <a href={PUBMED_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          Full List of Publications in PubMed
        </a>
      </div>

      {PUBLICATIONS_BY_YEAR.map((group) => (
        <section key={group.year}>
          <h2 className="section-heading mb-6">{group.year}</h2>
          <ul className="space-y-4 list-disc pl-5">
            {group.entries.map((entry) => (
              <li key={entry.title} className="text-sm" style={{ color: "var(--ink-muted)" }}>
                <div className="font-semibold" style={{ color: "var(--ink)" }}>
                  {entry.title}
                </div>
                <div>{entry.authors}.</div>
                <div className="italic">{entry.citation}</div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
