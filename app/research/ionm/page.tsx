import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import EmbedFrame from "@/components/EmbedFrame";

export const metadata: Metadata = {
  title: "Intraoperative Neuromonitoring Training Module",
  description:
    "An interactive training module on intraoperative neuromonitoring (IONM): modalities, electrode types, safety precautions, and cranial nerve monitoring, from the Bi Lab.",
};

const TOC = [
  { href: "#modalities", label: "Neuromonitoring Modalities" },
  { href: "#electrode-types", label: "Electrode Types" },
  { href: "#safety", label: "Safety Precautions" },
  { href: "#10-20-system", label: "10-20 System" },
  { href: "#electrode-placement", label: "Electrode Placement" },
  { href: "#cranial-nerves", label: "Cranial Nerve Monitoring" },
  { href: "#body", label: "Body Electrode Placement" },
  { href: "#clinical-scenarios", label: "Clinical Scenarios" },
  { href: "#references", label: "Select References" },
];

const REFERENCES = [
  "American Electroencephalographic Society guidelines for standard electrode position nomenclature. J Clin Neurophysiol 1991;8:200-2.",
  "Deletis V, Fernandez-Conejero I. Intraoperative monitoring and mapping of the functional integrity of the brainstem. J Clin Neurol 2016; 12(3):262-273.",
  "Dong CCJ, MacDonald DB, Akagami R, Westerberg B, AlKhani A, Kanaan I, Hassounah M. Intraoperative facial motor evoked potential monitoring with transcranial electrical stimulation during skull base surgery. Clinical Neurophysiology 2005; 116:588-596.",
  "Chen JH, Gonzalez AA, Shilian P, Cheongsiatmoy J. An alternative transcranial motor evoked potential montage to minimize ipsilateral “crossover” motor responses. Neurodiagn J 2018; 58:218-25.",
  "Holdefer RN, Sadleir R, Russell MJ. Predicted current densities in the brain during transcranial electrical stimulation. Clinical Neurophysiology 2006; 117:1388-97.",
  "Raabe A, Beck J, Schucht P, Seidel K. Continuous dynamic mapping of the corticospinal tract during surgery of motor eloquent brain tumors: evaluation of a new method. J Neurosurg 2014; 120:1015-1024.",
  "Rossi M, Sciortino T, Conti Nibali M, Gay L, Vigano L, Puglisi G, Leonetti A, Howells H, Fornia L, Cerri G, Riva M, Bello L. Clinical pearls and methods for intraoperative motor mapping. Neurosurgery 2021; 88(3):457-467.",
  "Sinclair CF, Tellez M, Ulkatan S. Noninvasive, tube-based, continuous vagal nerve monitoring using the laryngeal adductor reflex: feasibility study of 134 nerves at risk. Head & Neck 2018; 40(11):2498-2506.",
];

function Figure({
  src,
  width,
  height,
  caption,
  className = "",
}: {
  src: string;
  width: number;
  height: number;
  caption?: string;
  className?: string;
}) {
  return (
    <figure className={className}>
      <Image
        src={src}
        alt={caption ?? ""}
        width={width}
        height={height}
        className="w-full h-auto rounded"
        style={{ border: "1px solid var(--hairline)" }}
      />
      {caption && (
        <figcaption className="text-sm mt-2" style={{ color: "var(--ink-muted)" }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function SketchfabEmbed({ title, modelId }: { title: string; modelId: string }) {
  return (
    <figure>
      <EmbedFrame
        title={title}
        src={`https://sketchfab.com/models/${modelId}/embed`}
        className="w-full rounded h-[300px] sm:h-[400px] lg:h-[480px]"
        allowFullScreen
      />
      <figcaption className="text-sm mt-2" style={{ color: "var(--ink-muted)" }}>
        {title} by{" "}
        <a
          href={`https://sketchfab.com/bolesxian`}
          target="_blank"
          rel="noopener noreferrer"
          className="link-accent"
        >
          bolesxian
        </a>{" "}
        on Sketchfab. Having trouble viewing this?{" "}
        <a
          href={`https://sketchfab.com/models/${modelId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="link-accent"
        >
          Open directly
        </a>
        .
      </figcaption>
    </figure>
  );
}

function InProgress() {
  return (
    <div className="panel p-6 text-center" style={{ color: "var(--ink-muted)" }}>
      <Image
        src="/ionm/content-in-progress.png"
        alt="Content in progress"
        width={161}
        height={152}
        className="mx-auto mb-3"
        style={{ width: "80px", height: "auto" }}
      />
      Content in progress.
    </div>
  );
}

export default function IonmPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
      <Link href="/research" className="link-accent text-sm">
        &larr; All research areas
      </Link>
      <h1 className="text-display mt-4">Intraoperative Neuromonitoring Training Module</h1>

      <div className="flex flex-wrap gap-3 mt-4">
        <Link href="/research/ionm/quiz" className="btn btn-secondary">
          Quiz
        </Link>
        <Link href="/research/ionm/feedback" className="btn btn-secondary">
          Feedback
        </Link>
      </div>

      <div className="panel p-6 mt-8 space-y-3" style={{ fontSize: "0.9375rem", color: "var(--ink-muted)" }}>
        <p>
          Intraoperative neuromonitoring (IONM) is a powerful adjunct to improve the safety of
          high-risk neurosurgical procedures. We present an interactive training module to help
          make concepts and techniques more broadly accessible to all practitioners.
        </p>
        <p>
          We envision constant refinement of our strategies, which will be shared through this
          online platform, and welcome any{" "}
          <Link href="/research/ionm/feedback" className="link-accent">
            feedback
          </Link>{" "}
          for continued improvement.
        </p>
        <p>
          Created in fulfillment of the Master of Fine Arts in Medical Illustration at Rochester
          Institute of Technology. Any visual material contained in this website may not be
          manipulated, reproduced, extracted, or distributed without permission.
        </p>
        <p>
          All Illustrations and models &copy;Xian Marie Boles and &copy;Wenya Linda Bi. All rights
          Reserved. Content developed in collaboration with Mitali Bose, CNIM, and Matthew
          Toczylowski, CNIM. Clinical content reflects the practice of the user. No clinical
          liability will be held for individual application of these practices.
        </p>
        <div className="flex items-center gap-3 pt-1">
          <span>Made possible by The Vesalius Trust for Visual Communication in the Health Sciences</span>
          <Image
            src="/ionm/vesalius-logo.png"
            alt="The Vesalius Trust"
            width={300}
            height={73}
            style={{ width: "140px", height: "auto" }}
          />
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12 mt-12">
        <nav className="hidden lg:block sticky top-24 self-start pb-12" aria-label="Module contents">
          <div className="text-caption uppercase tracking-wide font-semibold mb-3">On this page</div>
          <ul className="space-y-2 text-sm">
            {TOC.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="link-accent" style={{ color: "var(--ink-muted)" }}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-16 min-w-0">
          <Figure src="/ionm/1.1-overview.jpg" width={663} height={504} />

          <section id="modalities">
            <h2 className="section-heading mb-6">Neuromonitoring Modalities</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="panel p-5">
                <h3 className="text-subtitle mb-2">Motor Evoked Potential (MEP)</h3>
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                  Monitors motor function by recording from electrodes placed in the muscles with
                  stimulation delivered transcranially via electrodes under the scalp (tcMEPs) or
                  directly to cortex via electrodes on the surface of the brain (dcMEPs)
                </p>
              </div>
              <div className="panel p-5">
                <h3 className="text-subtitle mb-2">Somatosensory Evoked Potential (SSEP)</h3>
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                  Detects sensory responses by stimulating sensory nerves in the periphery and
                  recording from electrodes under the scalp that generate a near-field potential to
                  the cortex
                </p>
              </div>
              <div className="panel p-5">
                <h3 className="text-subtitle mb-2">Visual Evoked Potential (VEP)</h3>
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                  Measures the functional integrity of visual pathways from the retina to the visual
                  cortex of brain by recording electrical potentials from scalp overlying visual
                  cortex in response to visual stimulus delivered to the eyes
                </p>
              </div>
              <div className="panel p-5">
                <h3 className="text-subtitle mb-2">Brainstem Auditory Evoked Response (BAER)</h3>
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                  Measures the neural response of the auditory system, from peripheral to central,
                  to sound (click) stimulation
                </p>
              </div>
            </div>
          </section>

          <section id="electrode-types">
            <h2 className="section-heading mb-6">Electrode Types</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Figure src="/ionm/1.2a-electrode-ssep.jpg" width={875} height={875} caption="SSEP surface sticker electrode" />
              <Figure src="/ionm/1.2a-electrode-mri.jpg" width={1812} height={906} caption="MRI safe scalp electrodes" />
              <Figure src="/ionm/1.2b-electrode-basic.jpg" width={884} height={884} caption="Basic solid paired electrodes" />
              <Figure
                src="/ionm/1.2b-electrode-insulated.jpg"
                width={813}
                height={813}
                caption="Insulated paired electrodes (corticobulbar). Can be interchangeable with insulated paired electrodes if corticobulbar MEP readings are desired."
              />
              <Figure src="/ionm/1.2b-electrode-corkscrew.jpg" width={767} height={767} caption="Corkscrew electrodes" />
            </div>
          </section>

          <section id="safety">
            <h2 className="section-heading mb-6">Safety Precautions</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="panel p-5">
                <h3 className="text-subtitle mb-2">Bite blocks</h3>
                <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: "var(--ink-muted)" }}>
                  <li>2 bite blocks are necessary when monitoring MEPs to prevent injury to the tongue</li>
                </ul>
              </div>
              <div className="panel p-5">
                <h3 className="text-subtitle mb-2">Electrode placement</h3>
                <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: "var(--ink-muted)" }}>
                  <li>Point sharp tips away from incision and surgical field</li>
                  <li>
                    Place ground electrodes sufficiently far from each other to avoid stimulus
                    artifact (e.g. for CN III and VI or for CN V and VII)
                  </li>
                  <li>Avoid placing electrodes on titanium hardware, shunts, or other hardware</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="10-20-system">
            <h2 className="section-heading mb-6">10-20 System of Electrode Placement</h2>
            <p className="text-sm mb-5" style={{ color: "var(--ink-muted)" }}>
              The 10-20 system is a standardized method of head electrode placement based on the
              relationship between the electrode location and the cerebral cortex.
            </p>
            <Figure src="/ionm/1.4-10-20-system-composite.jpg" width={1042} height={360} className="mb-5" />
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-8" style={{ color: "var(--ink-muted)" }}>
              <li><strong style={{ color: "var(--ink)" }}>A:</strong> auricular</li>
              <li><strong style={{ color: "var(--ink)" }}>C:</strong> central</li>
              <li><strong style={{ color: "var(--ink)" }}>F:</strong> frontal</li>
              <li><strong style={{ color: "var(--ink)" }}>Fp:</strong> frontal polar</li>
              <li><strong style={{ color: "var(--ink)" }}>O:</strong> occipital</li>
              <li><strong style={{ color: "var(--ink)" }}>P:</strong> parietal</li>
              <li><strong style={{ color: "var(--ink)" }}>T:</strong> temporal</li>
              <li><strong style={{ color: "var(--ink)" }}>Z:</strong> midline</li>
            </ul>
            <SketchfabEmbed title="10/20 System of Electrode Placement" modelId="a1a3f706b75f4ab7aa26eadf4a6e00cc" />
          </section>

          <section id="electrode-placement">
            <h2 className="section-heading mb-6">Electrode Placement</h2>

            <div className="space-y-12">
              <div>
                <h3 className="text-subtitle mb-3">Standard Bipolar MEPs</h3>
                <p className="text-sm mb-5" style={{ color: "var(--ink-muted)" }}>
                  Electrodes for the Standard Bipolar setup for MEP stimulation are placed along the
                  preauricular line, overlying the primary motor cortex (or as closely approximated
                  as permissible by the incision).
                </p>
                <Figure src="/ionm/2.1a-standard-bipolar-composite.jpg" width={878} height={360} className="mb-5" />
                <SketchfabEmbed title="Standard Bipolar Head Electrode Setup" modelId="416b2d2c1bb74e89a1924080685e7c63" />
              </div>

              <div>
                <h3 className="text-subtitle mb-3">Linked Quadripolar MEPs</h3>
                <p className="text-sm mb-5" style={{ color: "var(--ink-muted)" }}>
                  Linked quadripolar stimulation utilizes 4 scalp electrodes; stimulating from two
                  anode electrodes placed on one hemisphere of the head to two cathode electrodes
                  placed on the opposite hemisphere. The lateral electrodes for the linked
                  quadripolar setup are placed on the preauricular line and intersects with a line
                  drawn posteriorly from the junction of the superior orbital rim and the lateral
                  orbital rim. The medial stimulating electrodes are placed approximately 1-2 cm
                  posterior from the preauricular line, adjacent to the midline.
                </p>
                <Figure src="/ionm/2.1b-lqp-composite.jpg" width={878} height={360} className="mb-5" />
                <SketchfabEmbed title="Linked Quadripolar Head Electrode Setup" modelId="925ab1be4271403b81ae78a96d6932ea" />
              </div>

              <div>
                <h3 className="text-subtitle mb-3">Corticobulbar MEPs</h3>
                <InProgress />
              </div>

              <div>
                <h3 className="text-subtitle mb-3">Head SSEPs</h3>
                <p className="text-sm mb-5" style={{ color: "var(--ink-muted)" }}>
                  Electrodes for monitoring SSEPs are placed at Fpz, Cp3, Cpz, Cp4, and Cv. The
                  ground electrode is placed at the base of the neck. A short-hand approximation for
                  the primary sensory cortex is a coronal line at the level of the mastoid process,
                  along which Cp3, Cpz, and Cp4 can be placed. Cp3 and Cp4 are placed approximately
                  3-4 cm lateral (two-finger breadths) to the midline. Cv/Cv5 (subcortical/cervical
                  recording electrode) is placed at the external occipital protuberance (Cv) or
                  above the C5 vertebra on the posterior neck (Cv5).
                </p>
                <Figure src="/ionm/2.2-head-ssep-composite.jpg" width={1202} height={360} className="mb-5" />
                <SketchfabEmbed title="Head SSEP" modelId="e759ba3d4a1149f7a7d59b064028fe26" />
              </div>
            </div>
          </section>

          <section id="cranial-nerves">
            <h2 className="section-heading mb-6">Cranial Nerve Monitoring</h2>

            <div className="grid md:grid-cols-[280px_1fr] gap-8 mb-10">
              <Figure src="/ionm/2.3a-cn-overview.jpg" width={720} height={891} />
              <div>
                <h3 className="text-subtitle mb-3">Overview</h3>
                <ul className="text-sm space-y-1.5" style={{ color: "var(--ink-muted)" }}>
                  <li><strong style={{ color: "var(--ink)" }}>Optic (II):</strong> VEP goggles*</li>
                  <li><strong style={{ color: "var(--ink)" }}>Oculomotor (III):</strong> Superior rectus m.</li>
                  <li><strong style={{ color: "var(--ink)" }}>Trochlear (IV):</strong> Superior oblique m.</li>
                  <li>
                    <strong style={{ color: "var(--ink)" }}>Trigeminal (V1):</strong> Supraorbital n.*
                    {"; "}
                    <strong style={{ color: "var(--ink)" }}>(V2):</strong> Infraorbital n.*
                    {"; "}
                    <strong style={{ color: "var(--ink)" }}>(V3):</strong> Masseter m.
                  </li>
                  <li><strong style={{ color: "var(--ink)" }}>Abducens (VI):</strong> Lateral rectus m.</li>
                  <li>
                    <strong style={{ color: "var(--ink)" }}>Facial (VII):</strong> Frontalis m., Oculi m., Oris
                    m., Nasalis m., Buccal, Mentalis m., Platysma m.*
                  </li>
                  <li><strong style={{ color: "var(--ink)" }}>Vestibulocochlear (VIII):</strong> Audio stimulator</li>
                  <li><strong style={{ color: "var(--ink)" }}>Vagus (X):</strong> Vocal cords, cricothyroid m.*</li>
                  <li><strong style={{ color: "var(--ink)" }}>Accessory (XI):</strong> Trapezius m.*</li>
                  <li><strong style={{ color: "var(--ink)" }}>Hypoglossal (XII):</strong> Tongue*</li>
                </ul>
                <p className="text-caption mt-3">Legend: *not pictured; m., muscle; n., nerve</p>
              </div>
            </div>

            <div className="space-y-12">
              <div>
                <h3 className="text-subtitle mb-3">Optic (II) nerve</h3>
                <p className="text-sm mb-4" style={{ color: "var(--ink-muted)" }}>VEP goggles</p>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Figure src="/ionm/2.3b-cn-ii-optic-1.jpg" width={720} height={891} />
                  <Figure src="/ionm/2.3b-cn-ii-optic-2.gif" width={640} height={480} />
                </div>
              </div>

              <div>
                <h3 className="text-subtitle mb-3">Oculomotor (III) and Trochlear (IV) nerves</h3>
                <p className="text-sm mb-5" style={{ color: "var(--ink-muted)" }}>
                  Superior rectus muscle and superior oblique muscle. Intramuscular needle is bent
                  just past 90 degrees and slips underneath the mid-aspect of the superior orbital
                  rim. Insulated electrodes may also be used if corticobulbar MEPs desired.
                </p>
                <Figure src="/ionm/2.3c-cn-iii-iv-composite.jpg" width={1296} height={504} />
              </div>

              <div>
                <h3 className="text-subtitle mb-3">Abducens (VI) nerve</h3>
                <p className="text-sm mb-5" style={{ color: "var(--ink-muted)" }}>
                  Lateral rectus muscle. Intramuscular needle is bent just past 90 degrees and
                  slides within inside of the lateral orbital rim to rest in the lateral rectus
                  muscle. Insulated electrodes may also be used if corticobulbar MEPs desired.
                </p>
                <Figure src="/ionm/2.3c-cn-vi-composite.jpg" width={1296} height={504} />
              </div>

              <div>
                <h3 className="text-subtitle mb-3">Trigeminal (V) nerve</h3>
                <div className="grid md:grid-cols-[280px_1fr] gap-8">
                  <Figure src="/ionm/2.3d-cn-v-trigeminal.jpg" width={720} height={891} />
                  <ul className="text-sm space-y-3" style={{ color: "var(--ink-muted)" }}>
                    <li>
                      <strong style={{ color: "var(--ink)" }}>V1: Ophthalmic:</strong> Supraorbital
                      nerve, intramuscular needles placed around supraorbital foramen
                    </li>
                    <li>
                      <strong style={{ color: "var(--ink)" }}>V2: Maxillary:</strong> Infraorbital
                      nerve, intramuscular needles placed around infraorbital foramen
                    </li>
                    <li>
                      <strong style={{ color: "var(--ink)" }}>V3: Mandibular:</strong> Mental nerve
                      and masseter muscle, intramuscular needles placed around mental foramen
                      (sensory branch) and in masseter muscle (motor branch)
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-subtitle mb-3">Facial (VII) nerve</h3>
                <div className="grid md:grid-cols-[280px_1fr] gap-8">
                  <Figure src="/ionm/2.3e-cn-vii-facial.jpg" width={720} height={891} />
                  <div className="text-sm" style={{ color: "var(--ink-muted)" }}>
                    <p className="mb-2">Intramuscular needles can be placed in:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Frontalis muscle</li>
                      <li>Orbicularis Oculi muscle (Upper and lower lids may be monitored separately)</li>
                      <li>Buccal muscle</li>
                      <li>Nasalis muscle</li>
                      <li>Orbicularis Oris muscle (Upper lip and lower lip may be monitored separately)</li>
                      <li>Mentalis muscle</li>
                      <li>Platysma (not pictured)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-subtitle mb-3">Vestibulocochlear (VIII) nerve</h3>
                <div className="grid md:grid-cols-[280px_1fr] gap-8">
                  <Figure src="/ionm/2.3f-cn-viii-vestibulocochlear.jpg" width={487} height={504} />
                  <div className="text-sm space-y-3" style={{ color: "var(--ink-muted)" }}>
                    <p className="font-semibold" style={{ color: "var(--ink)" }}>
                      Brainstem Auditory Evoked Response (BAER)
                    </p>
                    <p>
                      The BAER/ABR measures the neural response of the auditory system to sound
                      stimulation. It is a test of auditory brainstem function in response to
                      auditory (click) stimuli.
                    </p>
                    <p>
                      The BAER audio stimulator is placed inside ear, reinforced with bone wax on
                      top to hold in place. The ground electrode is placed in close proximity, away
                      from the surgical incision.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-subtitle mb-3">Vagus (X) nerve</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm mb-4" style={{ color: "var(--ink-muted)" }}>
                      <strong style={{ color: "var(--ink)" }}>Vocal cords:</strong> NIM (Neural
                      Integrity Monitor) tube
                    </p>
                    <Figure src="/ionm/2.3h-cn-x-vagus-vocal-composite.jpg" width={1158} height={504} />
                  </div>
                  <div>
                    <p className="text-sm mb-4" style={{ color: "var(--ink-muted)" }}>
                      <strong style={{ color: "var(--ink)" }}>Cricothyroid muscle:</strong> Additional
                      coverage of CN X may be provided by insertion of insulated or regular needles
                      into the cricothyroid muscle. The Laryngeal Adductor Reflex (LAR) may be
                      measured with paired electrodes on the vocal cord (such as with the NIM tube)
                      and monitors the afferent and efferent pathway involved in the vagus nerve
                      function.
                    </p>
                    <Figure src="/ionm/2.3h-cn-x-vagus-cricothyroid-composite.jpg" width={1440} height={504} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-subtitle mb-3">Accessory (XI) nerve</h3>
                <p className="text-sm mb-5" style={{ color: "var(--ink-muted)" }}>
                  Trapezius muscle. Intramuscular needles.
                </p>
                <Figure src="/ionm/2.3i-cn-xi-accessory.jpg" width={740} height={504} />
              </div>

              <div>
                <h3 className="text-subtitle mb-3">Hypoglossal (XII) nerve</h3>
                <p className="text-sm mb-5" style={{ color: "var(--ink-muted)" }}>
                  Tongue. Bilateral pairs of intramuscular needles.
                </p>
                <Figure src="/ionm/2.3j-cn-xii-hypoglossal-composite.jpg" width={974} height={504} />
              </div>
            </div>
          </section>

          <section id="body">
            <h2 className="section-heading mb-6">Body Electrode Placement</h2>
            <div className="space-y-10">
              <div>
                <h3 className="text-subtitle mb-3">MEPs</h3>
                <Figure src="/ionm/2.4a-body-mep-composite.jpg" width={1168} height={756} className="mb-4" />
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                  <strong style={{ color: "var(--ink)" }}>APB:</strong> Abductor pollicis brevis
                  {"; "}
                  <strong style={{ color: "var(--ink)" }}>ADM:</strong> Abductor digiti minimi
                  {"; "}
                  <strong style={{ color: "var(--ink)" }}>ECR:</strong> Extensor carpi radialis
                  {"; "}
                  <strong style={{ color: "var(--ink)" }}>EHL:</strong> Extensor hallucis longus
                  {"; "}
                  *high-density coverage
                </p>
              </div>
              <div>
                <h3 className="text-subtitle mb-3">SSEPs</h3>
                <Figure src="/ionm/2.4b-body-ssep-composite.jpg" width={1188} height={756} className="mb-4" />
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>*high-density coverage</p>
              </div>
            </div>
          </section>

          <section id="clinical-scenarios">
            <h2 className="section-heading mb-6">Clinical Scenarios</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-subtitle mb-3">Stimulation Spread</h3>
                <InProgress />
              </div>
              <div>
                <h3 className="text-subtitle mb-3">Crossovers</h3>
                <InProgress />
              </div>
              <div>
                <h3 className="text-subtitle mb-3">
                  Neuromonitoring Patterns Associated with Brain Shift
                </h3>
                <InProgress />
              </div>
            </div>
          </section>

          <section id="references">
            <h2 className="section-heading mb-6">Select References</h2>
            <ol className="list-decimal pl-5 text-sm space-y-2" style={{ color: "var(--ink-muted)" }}>
              {REFERENCES.map((ref) => (
                <li key={ref}>{ref}</li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
