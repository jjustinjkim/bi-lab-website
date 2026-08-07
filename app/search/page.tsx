import type { Metadata } from "next";
import Link from "next/link";
import {
  RESEARCH_AREAS,
  PRINCIPAL_INVESTIGATOR,
  CURRENT_MEMBERS,
  ALUMNI,
  FEATURED_PUBLICATIONS,
  PUBLICATIONS_BY_YEAR,
} from "@/lib/content";

function matches(query: string, ...fields: (string | undefined)[]): boolean {
  const q = query.toLowerCase();
  return fields.some((f) => f?.toLowerCase().includes(q));
}

type SearchParams = Promise<{ q?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search",
    // Query-dependent results pages are thin/duplicate content from a
    // search engine's perspective -- keep them out of the index, same as
    // the real site's own search results. The canonical points every
    // ?q= variant back at the bare page for the same reason.
    robots: { index: false, follow: true },
    alternates: { canonical: "/search" },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const researchResults = query ? RESEARCH_AREAS.filter((a) => matches(query, a.name, a.description)) : [];

  const teamResults = query
    ? [PRINCIPAL_INVESTIGATOR, ...CURRENT_MEMBERS, ...ALUMNI].filter((m) =>
        matches(query, m.name, "titles" in m ? m.titles.join(" ") : "role" in m ? m.role : "")
      )
    : [];

  const featuredResults = query ? FEATURED_PUBLICATIONS.filter((p) => matches(query, p.title, p.excerpt, p.body)) : [];

  const publicationResults = query
    ? PUBLICATIONS_BY_YEAR.flatMap((group) =>
        group.entries.filter((e) => matches(query, e.title, e.authors, e.citation)).map((entry) => ({ year: group.year, entry }))
      )
    : [];

  const totalResults = researchResults.length + teamResults.length + featuredResults.length + publicationResults.length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-10">
      <div>
        <h1 className="text-display">Search</h1>
        <form action="/search" method="get" className="mt-6 flex gap-2">
          <label htmlFor="search-q" className="sr-only">
            Search
          </label>
          <input
            id="search-q"
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search research, team, publications..."
            autoFocus
            className="field-input"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      {query && (
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
          {totalResults === 0 ? `No results for "${query}".` : `${totalResults} result${totalResults === 1 ? "" : "s"} for "${query}".`}
        </p>
      )}

      {researchResults.length > 0 && (
        <section>
          <h2 className="text-caption uppercase tracking-wide font-semibold mb-3">Research</h2>
          <ul className="space-y-2">
            {researchResults.map((a) => (
              <li key={a.anchor}>
                <a href={`/research#${a.anchor}`} className="link-accent">
                  {a.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {teamResults.length > 0 && (
        <section>
          <h2 className="text-caption uppercase tracking-wide font-semibold mb-3">Team</h2>
          <ul className="space-y-2">
            {teamResults.map((m) => (
              <li key={m.name}>
                <Link href="/team" className="link-accent">
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {featuredResults.length > 0 && (
        <section>
          <h2 className="text-caption uppercase tracking-wide font-semibold mb-3">Publications</h2>
          <ul className="space-y-2">
            {featuredResults.map((p) => (
              <li key={p.slug}>
                <Link href={`/publications/${p.slug}`} className="link-accent">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {publicationResults.length > 0 && (
        <section>
          <h2 className="text-caption uppercase tracking-wide font-semibold mb-3">Publications archive</h2>
          <ul className="space-y-2">
            {publicationResults.slice(0, 20).map(({ year, entry }) => (
              <li key={entry.title} className="text-sm">
                <Link href="/publications" className="link-accent">
                  {entry.title}
                </Link>
                <span className="text-caption ml-2">{year}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
