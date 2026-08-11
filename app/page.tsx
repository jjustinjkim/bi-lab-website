import type { Metadata } from "next";
import Image from "next/image";
import { RESEARCH_AREAS } from "@/lib/content";

// Title/description are inherited from the root layout's defaults (they
// already describe the home page); this only adds the canonical, which
// Next.js merges in rather than overriding the rest.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const textShadow = "0 1px 3px rgba(0,0,0,0.95), 0 2px 18px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.9)";

export default function HomePage() {
  return (
    <section
      className="relative flex flex-col items-center px-4 pt-16 pb-0 sm:pt-20"
      style={{
        backgroundImage: "url(/brand/hero.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.05) 100%)" }}
      />

      <h1
        className="relative text-white font-bold text-center px-4 w-full max-w-full"
        style={{ fontSize: "clamp(2.25rem, 7vw, 5.5rem)", letterSpacing: "-0.01em", textShadow, overflowWrap: "break-word" }}
      >
        Bi Lab
      </h1>

      <div
        className="relative mt-10 w-full text-center px-6 sm:px-16"
        style={{ border: "1px solid rgba(255,255,255,0.7)", background: "rgba(0,0,0,0.45)", paddingTop: "clamp(1.5rem, 3vw, 2.5rem)", paddingBottom: "clamp(1.5rem, 3vw, 2.5rem)" }}
      >
        <p className="text-white mx-auto" style={{ fontSize: "clamp(1.0625rem, 1.8vw, 1.375rem)", maxWidth: "80rem", textShadow }}>
          The Bi Lab focuses on the translational biology of skull base and brain tumors, with an
          aim to improve clinical management and patient outcomes.
        </p>
      </div>

      <div
        className="relative mt-6 w-full grid grid-cols-2 sm:grid-cols-4"
        style={{ border: "1px solid rgba(255,255,255,0.7)", background: "rgba(0,0,0,0.35)", padding: "clamp(1.5rem, 4vw, 3.5rem) clamp(1rem, 3vw, 2rem)" }}
      >
        {RESEARCH_AREAS.map((area) => (
          <a key={area.anchor} href={`/research#${area.anchor}`} className="flex flex-col items-center text-center gap-5 hover:opacity-85 px-2">
            <span
              className="text-white font-semibold uppercase tracking-wide underline underline-offset-4"
              style={{ textShadow, fontSize: "clamp(0.8125rem, 1.3vw, 1.0625rem)" }}
            >
              {area.name}
            </span>
            <span
              className="rounded-full overflow-hidden flex-shrink-0"
              style={{ width: "clamp(90px, 17vw, 300px)", height: "clamp(90px, 17vw, 300px)", background: "white", border: "4px solid white" }}
            >
              <Image src={area.image} alt="" width={300} height={300} className="w-full h-full object-cover" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
