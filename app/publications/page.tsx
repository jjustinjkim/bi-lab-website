import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FEATURED_PUBLICATIONS, PUBLICATIONS_BY_YEAR, PUBMED_URL } from "@/lib/content";
import AuthorList from "@/components/AuthorList";

export const metadata: Metadata = {
  title: "Publications",
  description: "Featured studies and the full publication archive from the Bi Lab, 2014 to present.",
  alternates: { canonical: "/publications" },
};

export default function PublicationsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-14">
      <h1 className="text-display">Publications</h1>

      <section>
        <div className="grid sm:grid-cols-3 gap-5">
          {FEATURED_PUBLICATIONS.map((pub) => (
            <Link
              key={pub.slug}
              href={`/publications/${pub.slug}`}
              className="group relative block overflow-hidden"
            >
              <Image
                src={pub.image}
                alt={`First page of "${pub.title}" in ${pub.journal}`}
                width={pub.imageWidth}
                height={pub.imageHeight}
                className="w-full h-auto"
              />
              <div
                className="absolute inset-0 flex flex-col justify-center p-6 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                style={{ background: "var(--paper)" }}
              >
                <h3 className="font-bold" style={{ fontSize: "1.375rem", lineHeight: 1.25, color: "var(--ink)" }}>
                  {pub.title}
                </h3>
                <div style={{ width: "3rem", height: "2px", background: "var(--ink)", margin: "1rem 0" }} />
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                  {pub.excerpt}
                </p>
              </div>
            </Link>
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
                <div>
                  <AuthorList authors={entry.authors} />.
                </div>
                <div className="italic">{entry.citation}</div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
