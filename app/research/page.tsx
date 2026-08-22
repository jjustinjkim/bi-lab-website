import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RESEARCH_AREAS, RESEARCH_IMAGING_NOTE, type ResearchTeamCredit } from "@/lib/content";

export const metadata: Metadata = {
  title: "Research",
  description:
    "The Bi Lab's active research projects across meningiomas, gliomas, pituitary tumors, brain metastases, and epidermoid cysts, spanning immunogenomics, outcomes, and intraoperative neuromonitoring.",
  alternates: { canonical: "/research" },
};

function TeamCredit({ team }: { team: ResearchTeamCredit[] }) {
  return (
    <p className="text-sm italic mt-6" style={{ color: "var(--ink-muted)" }}>
      Research team:{" "}
      {team.map((member, i) => (
        <span key={member.name}>
          <Link href={member.slug ? `/team/${member.slug}` : "/team"} className="link-accent not-italic">
            {member.name}
          </Link>
          {i < team.length - 1 ? ", " : "."}
        </span>
      ))}
    </p>
  );
}

export default function ResearchPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-16">
      <div>
        <h1 className="text-display">Research</h1>
        <p className="text-lg mt-4" style={{ color: "var(--ink-muted)" }}>
          The Bi Lab studies the biology of meningiomas, pituitary tumors, gliomas, brain metastases, and other
          skull base tumors, combining genomics, imaging, and outcomes research to sharpen diagnosis, guide
          treatment, and make surgery safer. Below are a few of our active projects, organized by disease, and
          the research directions each one draws on.
        </p>
      </div>

      {RESEARCH_AREAS.map((area) => (
        <section key={area.anchor} id={area.anchor} className="scroll-mt-24">
          <div className={`flex flex-col gap-8 items-start ${area.imageSide === "right" ? "sm:flex-row-reverse" : "sm:flex-row"}`}>
            <div className="sm:w-1/3 flex-shrink-0">
              <Image
                src={area.image}
                alt={area.name}
                width={300}
                height={300}
                className="w-full h-auto rounded"
                style={{ border: "1px solid var(--hairline)" }}
              />
            </div>
            <div className="sm:w-2/3">
              <h2 className="section-heading mb-2">{area.name}</h2>
              <div className="flex flex-wrap gap-2 mb-5">
                {area.directions.map((d) => (
                  <span
                    key={d}
                    className="text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full"
                    style={{ color: "var(--accent-ink)", background: "var(--paper-raised)", border: "1px solid var(--hairline)" }}
                  >
                    {d}
                  </span>
                ))}
              </div>
              <div className="space-y-4">
                {area.body.map((paragraph, i) => (
                  <p key={i} style={{ color: "var(--ink-muted)" }}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {area.publications && area.publications.length > 0 && (
                <div className="mt-6">
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--ink-faint)" }}>
                    Selected publications
                  </div>
                  <ul className="text-sm space-y-1.5">
                    {area.publications.map((pub) => (
                      <li key={pub.pmid}>
                        <a
                          href={`https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-accent"
                        >
                          {pub.title}
                        </a>
                        <span style={{ color: "var(--ink-muted)" }}> &middot; {pub.journal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {area.extraLinks && area.extraLinks.length > 0 && (
                <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4">
                  {area.extraLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="link-accent inline-block" style={{ fontSize: "1.0625rem" }}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}

              {area.team && area.team.length > 0 && <TeamCredit team={area.team} />}
            </div>
          </div>
        </section>
      ))}

      <section className="pt-4" style={{ borderTop: "1px solid var(--hairline)" }}>
        <h2 className="section-heading mb-4">Imaging</h2>
        <p style={{ color: "var(--ink-muted)" }}>{RESEARCH_IMAGING_NOTE}</p>
      </section>
    </div>
  );
}
