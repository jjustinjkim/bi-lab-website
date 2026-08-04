import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RESEARCH_AREAS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Research",
  description:
    "The Bi Lab's research spans immunogenomics, imaging, intraoperative neuromonitoring, and outcomes across meningiomas, pituitary tumors, schwannomas, and brain metastases.",
};

export default function ResearchPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-16">
      <h1 className="text-display">Research</h1>

      {RESEARCH_AREAS.map((area) => (
        <section key={area.anchor} id={area.anchor} className="scroll-mt-24">
          <h2 className="section-heading mb-6">{area.name}</h2>
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
              <p className="text-lg" style={{ color: "var(--ink-muted)" }}>
                {area.description}
              </p>
              {area.extraLink && (
                <Link href={area.extraLink.href} className="link-accent inline-block mt-4" style={{ fontSize: "1.125rem" }}>
                  {area.extraLink.label}
                </Link>
              )}
            </div>
          </div>

          {area.extraImages && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
              {area.extraImages.map((img) => (
                <div key={img.label} className="text-center">
                  <Image
                    src={img.src}
                    alt={img.label}
                    width={311}
                    height={311}
                    className="w-full h-auto rounded"
                    style={{ border: "1px solid var(--hairline)" }}
                  />
                  <div className="mt-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--accent-ink)" }}>
                    {img.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
