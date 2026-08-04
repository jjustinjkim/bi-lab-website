import { PUBLICATIONS, PUBMED_URL } from "@/lib/content";

export default function PublicationsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-8">
      <div>
        <h1 className="text-display">Publications</h1>
        <p className="mt-4" style={{ color: "var(--ink-muted)" }}>
          A selection of the lab&rsquo;s publications. For the complete, up to date list, see{" "}
          <a href={PUBMED_URL} target="_blank" rel="noopener noreferrer" className="link-accent">
            Dr. Bi&rsquo;s full list on PubMed
          </a>
          .
        </p>
      </div>

      <ul className="space-y-5">
        {PUBLICATIONS.map((pub) => (
          <li key={pub.title} className="panel p-5">
            <div className="text-subtitle" style={{ fontSize: "1rem" }}>
              {pub.title}
            </div>
            <div className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
              {pub.authors}
            </div>
            <div className="text-sm mt-1" style={{ color: "var(--ink-faint)" }}>
              {pub.journal}, {pub.date}
              {pub.pmid ? ` · PMID: ${pub.pmid}` : ""}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
