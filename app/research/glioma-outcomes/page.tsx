import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Glioma Outcome Risk Calculators",
  description: "Survival risk calculators for glioblastoma and IDH1/2-mutant astrocytoma, based on the Bi Lab's nomogram research.",
};

export default function GliomaOutcomesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-10">
      <div>
        <Link href="/research" className="link-accent text-sm">
          &larr; All research areas
        </Link>
        <h1 className="text-display mt-4">Glioma Outcome Risk Calculators</h1>
      </div>

      <div className="panel p-6">
        <h2 className="text-caption uppercase tracking-wide font-semibold mb-2">Disclaimer</h2>
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
          Researchers part of the Skull Base Tumor Laboratory have integrated features from a study
          examining glioma subtypes to create nomograms for clinical outcomes. The prediction tools
          below are based on a cohort of glioblastoma and IDH1/2-mutant astrocytoma patients with
          both clinical and molecular data. After inputting the relevant features, these tools will
          output the likelihood of patient survival at several time points. This is relevant for
          patients who have a primary glioma and not those with recurrent tumors. The primary source
          of data used to generate these calculators is from patients evaluated at the Dana-Farber
          Cancer Institute. Full descriptions of data processing and integration can be found in the
          publication accompanying these tools (see below for additional information).
        </p>
        <p className="text-sm mt-3 font-semibold" style={{ color: "var(--ink)" }}>
          These calculators do not represent a medical opinion from qualified physicians and should
          not be interpreted or used as a substitute for medical care. Clinical decision making for
          these conditions must be individualized: all results from these tools should be discussed
          with a qualified physician and considered in context for each patient.
        </p>
      </div>

      <section>
        <h2 className="section-heading mb-6">Glioblastoma Survival Risk Calculator</h2>
        {/* The calculator widget itself checks the embedding domain against
            an allowlist controlled by the lab's Calconic account, which only
            authorizes skullbase.bwh.harvard.edu -- embedding the widget
            snippet directly here gets silently rejected. Framing their real
            page sidesteps that: the request originates from their own
            domain inside the frame, and the visitor's address bar never
            leaves this site. */}
        <iframe
          src="https://skullbase.bwh.harvard.edu/glioblastoma-survival-risk-calculator/"
          title="Glioblastoma Survival Risk Calculator"
          className="w-full rounded"
          style={{ border: "1px solid var(--hairline)", height: "1400px" }}
          loading="lazy"
        />
      </section>

      <section>
        <h2 className="section-heading mb-6">IDH1/2-Mutant Astrocytoma Survival Risk Calculator</h2>
        <iframe
          src="https://skullbase.bwh.harvard.edu/astrocytoma-survival-risk-calculator/"
          title="IDH1/2-Mutant Astrocytoma Survival Risk Calculator"
          className="w-full rounded"
          style={{ border: "1px solid var(--hairline)", height: "1400px" }}
          loading="lazy"
        />
      </section>

      <div>
        <h2 className="text-caption uppercase tracking-wide font-semibold mb-2">Supporting Publication</h2>
        <a
          href="https://www.medrxiv.org/content/10.1101/2023.09.09.23295096v1"
          target="_blank"
          rel="noopener noreferrer"
          className="link-accent text-sm"
        >
          Contemporary Prognostic Signatures and Refined Risk Stratification of Gliomas: An Analysis of 4,400 Tumors
        </a>
      </div>
    </div>
  );
}
