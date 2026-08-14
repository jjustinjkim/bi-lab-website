// Public-site copy and photos, sourced directly from the lab's existing
// BWH-hosted site (skullbase.bwh.harvard.edu) as of 2026-08-04.

export interface ResearchArea {
  anchor: string;
  name: string;
  description: string;
  image: string;
  imageSide: "left" | "right";
  extraLink?: { label: string; href: string };
  extraImages?: { src: string; label: string }[];
}

export interface ToolItem {
  name: string;
  href: string;
  description: string;
}

// Standalone tools/resources the lab maintains, surfaced from the "Tools"
// nav dropdown (see components/Header.tsx). Each links to a full page or
// sub-app, not an in-page anchor, so hrefs are plain routes.
export const TOOLS: ToolItem[] = [
  {
    name: "Meningioma Registry",
    href: "/inventory",
    description: "Every publicly discoverable meningioma molecular dataset, verified and tracked in one place.",
  },
];

// Order, anchor ids, and left/right image placement match the real site's
// nav submenu, #IM/#IMM/#IN/#OUT in-page anchors, and alternating layout
// exactly (IMM=left, IM=right, IN=left, OUT=right).
export const RESEARCH_AREAS: ResearchArea[] = [
  {
    anchor: "IMM",
    name: "Immunogenomics",
    description:
      "We apply genomic and cancer biology approaches to define the molecular taxonomy and tumor microenvironment of meningiomas, pituitary tumors, gliomas, and other skull base and brain tumors. In particular, we seek to understand tumor cell evolution and their acquisition of resistance to innate immune mechanisms as well as administered treatments. Collectively, we hope to define molecular markers with diagnostic and prognostic potential to track brain tumors across time and to develop improved therapeutic options.",
    image: "/research/immunogenomics.png",
    imageSide: "left",
  },
  {
    anchor: "IM",
    name: "Imaging",
    description:
      "Safe surgery for meningiomas, pituitary tumors, and other skull base tumors is predicated on detailed knowledge of the relevant anatomy. We aim to apply advanced imaging modalities to assess critical structures that may be encountered during the operative approach to improve preservation of neurovascular function.",
    image: "/research/imaging.jpg",
    imageSide: "right",
  },
  {
    anchor: "IN",
    name: "Intraoperative Neuromonitoring",
    description:
      "Intraoperative neuromonitoring (IONM) is a powerful adjunct to improve the safety of high-risk neurosurgical procedures for meningiomas, pituitary tumors, and other skull base and brain tumors. We present an interactive training module to help make concepts and techniques more broadly accessible to all practitioners.",
    image: "/research/ionm.png",
    imageSide: "left",
    extraLink: { label: "IONM Training Module", href: "/research/ionm" },
  },
  {
    anchor: "OUT",
    name: "Outcomes",
    description:
      "Ongoing studies focus on the impact of operative technique, perioperative routine, and adjuvant therapy regimens on outcomes of meningiomas, pituitary tumors, gliomas, schwannomas, brain metastases, and epidermoid cysts, in retrospective and prospective fashion.",
    image: "/research/outcomes.jpg",
    imageSide: "right",
    extraLink: { label: "Glioma Outcome Risk Calculators", href: "/research/glioma-outcomes" },
    extraImages: [
      { src: "/research/outcome-meningioma.jpg", label: "Meningioma" },
      { src: "/research/outcome-pituitary.jpg", label: "Pituitary Tumors" },
      { src: "/research/outcome-schwannoma.jpg", label: "Schwannoma" },
      { src: "/research/outcome-brain-met.jpg", label: "Brain Metastases" },
    ],
  },
];

export interface TeamMember {
  name: string;
  role: string;
  image?: string;
  // Only set for the members who have an individual bio page on the real
  // site (most don't -- their card is a plain photo tile, matching the
  // real site's own behavior of only some team members being clickable).
  slug?: string;
  bio?: string[];
  degrees?: string[];
  // For collaborators: an outside lab/institution link instead of an
  // internal bio page. Mutually exclusive with slug in practice.
  externalUrl?: string;
}

// This is deliberately a shorter list than CONTACT.piTitles below -- the
// real site's Team page and Contact page show genuinely different (though
// overlapping) affiliation text for the same person, not a copy-paste of
// one block in two places.
export const PRINCIPAL_INVESTIGATOR = {
  name: "Wenya Linda Bi, MD, PhD",
  titles: [
    "Associate Professor of Neurosurgery",
    "Department of Neurosurgery",
    "Mass General Brigham",
    "Harvard Medical School",
  ],
  image: "/team/wenya-linda-bi.jpg",
};

export const CURRENT_MEMBERS: TeamMember[] = [
  { name: "Gabrielle Luiselli, MD", role: "Neurosurgery Resident", image: "/team/gabrielle-luiselli.jpg" },
  { name: "MD Candidate", role: "MD Candidate", image: "/team/md-candidate.jpg" },
  { name: "Andrew Dunbar, BS", role: "MD Candidate", image: "/team/andrew-dunbar.jpg" },
  { name: "Zach Moynihan, BS", role: "Research Assistant", image: "/team/zach-moynihan.png" },
  { name: "Justin Kim", role: "Medical Student", image: "/team/justin-kim.jpg" },
  { name: "Sydney Wiredu", role: "Medical Student" },
  { name: "Sreeya Vuppala", role: "Medical Student", image: "/team/sreeya-vuppala.jpg" },
];

// Outside collaborators: not lab personnel, but active research partners
// whose own lab/institution page is the right link target (no internal
// bio page for them).
export const COLLABORATORS: TeamMember[] = [
  {
    name: "Mitali Bose, MS, CNIM",
    role: "Senior Surgical Neurophysiologist",
    image: "/team/mitali-bose.jpeg",
    slug: "mitali-bose-ms-cnim",
  },
  {
    name: "Matthew Toczylowski, BS, CNIM",
    role: "Surgical Neurophysiologist, Clinical Manager, SpecialtyCare Boston",
    image: "/team/matthew-toczylowski.jpg",
    slug: "matthew-toczylowski-bs-cnim",
  },
  {
    name: "Angelique Paulk, PhD",
    role: "Assistant Professor of Neurology, Harvard Medical School",
    image: "/team/angelique-paulk.jpg",
    externalUrl: "https://www.cntr.mgh.harvard.edu/our-team/angelique-paulk,-phd",
  },
  {
    name: "Amar Dhand, MD, DPhil",
    role: "Associate Professor of Neurology, Brigham and Women's Hospital",
    image: "/team/amar-dhand.jpg",
    externalUrl: "https://www.dhandlab.com",
  },
  {
    name: "Rameen Beroukhim, MD, PhD",
    role: "Associate Professor of Medicine, Dana-Farber Cancer Institute",
    image: "/team/rameen-beroukhim.jpg",
    externalUrl: "https://beroukhimlab.org",
  },
];

export const ALUMNI: TeamMember[] = [
  { name: "Sally Al Abdulmohsen", role: "Student", image: "/team/sally-al-abdulmohsen.jpg" },
  {
    name: "Noah Greenwald",
    role: "Student",
    image: "/team/noah-greenwald.jpg",
    slug: "noah-greenwald",
    bio: [
      "Noah was the inaugural member of the Bi lab, who joined after graduating from Harvard with a BA in biophysics. Through his work in the lab, Noah developed an interest in computational biology and cancer genomics. Noah is currently a PhD candidate in the Cancer Biology program at Stanford University, where he splits his time between developing novel algorithms for image analysis and salsa dancing.",
    ],
  },
  {
    name: "Xiaopeng Guo",
    role: "",
    image: "/team/xiaopeng-guo.png",
    slug: "xiaopeng-guo-md",
    bio: [
      "Xiaopeng Guo is a neurosurgery resident at Peking Union Medical College Hospital, Beijing, China, with an interest in skull base tumors, especially pituitary adenomas and meningiomas. He spent 6 months in the Bi Lab at the Brigham and Women's Hospital as a joint PhD student with Peking Union Medical College, where he investigated the immune landscape of human meningiomas and the natural history of recurrent meningiomas.",
    ],
  },
  { name: "Saksham Gupta, MD", role: "Neurosurgery Resident", image: "/team/saksham-gupta.png" },
  {
    name: "Adwaid Prakash",
    role: "Student",
    image: "/team/adwaid-prakash.png",
    slug: "adwaid-prakash",
    bio: [
      "Adwaid is a rising senior at Natick High School. He has a long-standing interest in Biology and Statistics. In the lab, he is interested in learning how skull base tumors impact patients and can how they can be monitored over time. Adwaid aspires to go to college with a career in medicine in the future.",
    ],
  },
  {
    name: "Addy Vettel",
    role: "Student",
    image: "/team/addy-vettel.png",
    slug: "addy-vettel",
    bio: [
      "I am a rising senior at Rivers, a private school in Weston, Massachusetts. I have taken a special interest in Biology, Chemistry, and Physics at school and look forward to learning new concepts and material associated with these subjects. I am passionate about pursuing medicine in the future.",
      "Throughout the year, I run track and cross country competitively. Outside of school and running, I also enjoy baking and playing with my two dogs.",
    ],
  },
  {
    name: "Eleanor Woodward, BS",
    role: "Research Assistant",
    image: "/team/eleanor-woodward.jpg",
    slug: "eleanor-woodward",
    bio: [
      "I am a research assistant in the Bi lab, where I use computational methods to study the genomics of glioma and other CNS tumors. As an undergraduate at Yale University, I studied both experimental particle and astrophysics. I worked with Charles Baltay to map supernovae to investigate the mechanics of dark energy and gravitational waves, and with Sarah Demers of the ATLAS experiment to develop the software to discover new elementary interactions. I then continued my work in developing and testing particle detection algorithms with John Huth of Harvard University before joining the Bi lab in 2018.",
      "In my free time I enjoy singing in the MIT Women's Chorale and working my way through the novels of Jane Austen.",
    ],
    degrees: ["Yale University, B.S. Physics and the Humanities, 2017"],
  },
  { name: "Kyle Wu, MD", role: "Post-doctoral Fellow / Neurosurgery Resident", image: "/team/kyle-wu.jpg" },
  {
    name: "Shun Yao, MD, PhD",
    role: "Research Fellow",
    image: "/team/shun-yao.jpg",
    slug: "shun-yao-md-phd",
    bio: [
      "Dr. Shun Yao is a Postdoctoral Research Fellow whose research interests include the translational applications of artificial intelligence (AI), radiomics, and multimodal functional magnetic resonance image (fMRI) of pituitary and skull base tumors. With a background in clinical research and fMRI-based neuroscience, Shun is also a Postdoctoral Clinical Fellow in the Department of Neurosurgery and Pituitary Tumor Center, The First Affiliated Hospital, Sun Yat-sen University, China.",
      "Outside of research, Dr. Yao enjoys exploring nature and food adventures in the Greater Boston, Massachusetts area.",
    ],
  },
  {
    name: "Samantha Hoffman, BS",
    role: "MD Candidate",
    image: "/team/samantha-hoffman.jpg",
    slug: "samantha-hoffman-bs",
    bio: [
      "I am a medical student in the Harvard-MIT Health Sciences and Technology (HST) program at Harvard Medical School. My background is in Molecular and Cellular Neuroscience. As an undergraduate at Stanford University, I investigated the role of the neurexin cell adhesion protein family in synaptic formation and axonal tract development in the visual system as a member of the Thomas C. Südhof Laboratory. In the Bi Lab, I am currently characterizing the immune landscape of skull base tumors using expansion microscopy (ExPath) and mass-cytometery time-of-flight (CyTOF) techniques. When I am not in lab or in class, I enjoy running along the Charles, learning new Chinese baking recipes, and trying my hand at graphic design.",
    ],
    degrees: ["Harvard Medical School/HST, Expected May 2023", "Stanford University, B.S. Biology with Distinction and with Honors, June 2017"],
  },
  { name: "Greg Cello, BS", role: "Master's Candidate & Research Coordinator", image: "/team/greg-cello.jpeg" },
  { name: "Pinky Langat, PhD", role: "MD Candidate", image: "/team/pinky-langat.jpg" },
  {
    name: "Joseph Driver, MD",
    role: "Post-doctoral Fellow / Neurosurgery Resident",
    image: "/team/joseph-driver.jpg",
    slug: "joseph-driver-md",
    bio: [
      "Joe is a resident in the Brigham and Women's Neurosurgery residency program. He obtained his undergraduate degree in biochemistry at Gonzaga University, and later his MD at Loyola University Chicago. He spent his two-year post doctorate research in the Bi lab where he characterized transcriptional and immune landscapes of skull base tumors, using novel techniques including single cell RNA sequencing, mass cytometry by time of flight, and multiplex ion beam imaging.",
    ],
  },
  { name: "Xian Marie Boles, BFA", role: "MFA Candidate", image: "/team/xian-marie-boles.png" },
  {
    name: "Lilin Tong, MD",
    role: "Medical Intern",
    image: "/team/lilin-tong.jpg",
    slug: "lilin-tong-md-candidate",
  },
  { name: "Hia Ghosh, BS", role: "Research Assistant", image: "/team/hia-ghosh.jpg" },
  { name: "Ruchit Patel, BS", role: "Neurosurgery Resident", image: "/team/ruchit-patel.jpeg" },
  { name: "Junpeng Ma, MD, PhD", role: "", image: "/team/junpeng-ma.png" },
  { name: "Erickson Torio, MD", role: "Lab Member", image: "/team/erickson-torio.png" },
];

export interface FeaturedPublication {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  journal: string;
  journalUrl: string;
  date: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
}

// The 3 currently featured studies on the real site's Publications page.
// body/journal/journalUrl/date sourced from each study's real article page.
export const FEATURED_PUBLICATIONS: FeaturedPublication[] = [
  {
    slug: "ki-67-in-meningioma-distribution-and-implications",
    title: "Ki-67 in meningioma: distribution and implications",
    excerpt:
      "In a groundbreaking study published in the Journal of Neurosurgery, we unraveled the true biological meaning of Ki-67, one of the most widely used markers of tumor proliferation in meningioma.",
    body:
      "In a groundbreaking study published in the Journal of Neurosurgery, we unraveled the true biological meaning of Ki-67, one of the most widely used markers of tumor proliferation in meningioma. Using single-cell mass cytometry and RNA sequencing across more than 120,000 cells, our team discovered that Ki-67 is not expressed solely by tumor cells, as long assumed, but also by immune populations, particularly myeloid cells in low-grade tumors. We further showed that the cellular sources of Ki-67 shift with tumor grade, radiation exposure, and patient age, revealing how immune activity can confound traditional proliferation indices. By integrating molecular data from nearly 500 additional meningiomas, we established dynamic Ki-67 thresholds that more accurately predict recurrence over time. Together, these findings redefine how proliferation is measured in meningioma and lay the groundwork for a new, microenvironment-aware framework for interpreting tumor biology and guiding clinical decisions.",
    journal: "Journal of Neurosurgery",
    journalUrl: "https://thejns.org/view/journals/j-neurosurg/aop/article-10.3171-2025.4.JNS25438/article-10.3171-2025.4.JNS25438.xml",
    // The article's own citation line: "Published online July 25, 2025."
    date: "2025-07-25",
    image: "/publications/ki-67-in-meningioma.png",
    imageWidth: 799,
    imageHeight: 1024,
  },
  {
    slug: "a-molecularly-integrated-grade-for-meningioma",
    title: "A Molecularly Integrated Grade for Meningioma",
    excerpt:
      "Published in Neuro-Oncology, our team developed a molecularly integrated grading system that redefines how meningiomas, the most common primary brain tumors, are classified and managed.",
    body:
      "Published in Neuro-Oncology, our team developed a molecularly integrated grading system that redefines how meningiomas, the most common primary brain tumors, are classified and managed. By combining traditional histopathologic features with chromosomal copy-number alterations (CNAs) across more than 700 tumors, we discovered that genomic instability, particularly loss of 1p, 3p, 4, 6, 10, 14q, 18, 19, or CDKN2A, drives recurrence risk far more precisely than the current WHO system. This new three-tier \"Integrated Grade\" reclassified nearly one-third of meningiomas, uncovering hidden high-risk biology in tumors that appeared benign and identifying lower-risk tumors previously labeled aggressive. The Integrated Grade achieved markedly stronger predictive performance than WHO grade (5-year AUC = 0.82 vs 0.63) and was validated across independent cohorts and genomic platforms. Because CNAs can be profiled using widely available technologies, this framework is immediately applicable in both academic and community settings. Together, these findings establish a simple, scalable, and genomically informed grading model that advances precision diagnostics and enables more personalized surveillance, treatment, and clinical trial design for patients with meningioma.",
    journal: "Neuro-Oncology",
    journalUrl: "https://academic.oup.com/neuro-oncology/article/24/5/796/6368844",
    // The article's own header: "24(5), 796-808, 2022 ... Advance Access
    // date 11 September 2021" -- this paper is from 2021/2022, not 2025;
    // using its actual first-online (Advance Access) date.
    date: "2021-09-11",
    image: "/publications/molecularly-integrated-grade.png",
    imageWidth: 815,
    imageHeight: 1024,
  },
  {
    slug: "new-study-reveals-how-genomic-thresholds-shape-meningioma-classification-and-recurrence-risk",
    title: "New Study Reveals How Genomic Thresholds Shape Meningioma Classification and Recurrence Risk",
    excerpt:
      "In a landmark study published in Nature Communications, we mapped chromosomal copy number alterations (CNAs) across more than 1,000 meningiomas, the most common primary brain tumor in adults.",
    body:
      "In a landmark study published in Nature Communications, we mapped chromosomal copy number alterations (CNAs) across more than 1,000 meningiomas, the most common primary brain tumor in adults. The team found that the threshold used to define when a chromosomal arm is \"lost\" or \"gained\" dramatically influences how tumors are molecularly graded and how well recurrence can be predicted. By systematically varying these thresholds, the study showed that up to 21% of meningiomas shift between low- and high-grade classifications, with optimal predictive accuracy emerging around a 40% arm-length threshold. We also discovered that CNAs tend to cluster into distinct \"small\" and \"large\" genomic events, and that recurrent meningiomas acquire progressively larger alterations over time. Together, these findings highlight the critical importance of standardizing genomic thresholds to ensure robust, reproducible molecular classification, a necessary step toward precision diagnostics, better prognostication, and ultimately more tailored therapies for patients with meningioma.",
    journal: "Nature Communications",
    journalUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12222709/pdf/41467_2025_Article_60734.pdf",
    // The article's own header: "Received: 24 February 2024. Accepted: 3
    // June 2025. Published online: 02 July 2025."
    date: "2025-07-02",
    image: "/publications/genomic-thresholds.png",
    imageWidth: 767,
    imageHeight: 1024,
  },
];

export interface PublicationEntry {
  title: string;
  authors: string;
  citation: string;
}

export interface PublicationYear {
  year: string;
  entries: PublicationEntry[];
}


// 2014-2021 matches the year-by-year list on the real site (which hasn't
// been updated since). 2022-present was pulled directly from PubMed
// (Bi WL[Author], first/senior/sole-author papers only, matching the
// selectivity of the pre-2022 list rather than every co-authored paper)
// since the real site's own archive is stale. Anything older/more complete
// is on PubMed only, matching the real site's own approach.
export const PUBLICATIONS_BY_YEAR: PublicationYear[] = [
  {
    year: "2026",
    entries: [
      {
        title: "Corticobulbar Motor Evoked Potentials: A Systematic Review of Technical Variations.",
        authors: "Jarvis CA, Toczylowski M, Bose M, Patel RV, Wang J, McMahon JT, Bi WL",
        citation: "Neurosurg Pract. 2026 Jun;7(3):e000237. PMID: 42100545; PMC13148752.",
      },
      {
        title: "Meningioma microenvironment harbors a rich immune landscape that evolves with biological state.",
        authors: "Guo X, Moynihan ZA, Driver J, Patel RV, Bhave VM, Maury EA, Knelson EH, Guo H, Lin JR, Coy SM, Wang A, Gupta S, Hoffman SE, Dunn IF, Dunn GP, Petti A, Choi BD, Choudhury A, Raleigh DR, Wei K, Reardon DA, Barbie D, Lederer JA, Santagata S, Bi WL",
        citation: "Neuro Oncol. 2026 May 01;28(5):1193-1208. PMID: 41630100; PMC13186497.",
      },
      {
        title: "In Reply: Predictive Value of Neurosurgery Applicant Metrics on Resident Academic Productivity.",
        authors: "Banko L, Bi WL",
        citation: "Neurosurgery. 2026 Jan 01;98(1):e20. PMID: 41201250.",
      },
    ],
  },
  {
    year: "2025",
    entries: [
      {
        title: "The effect of TERT promoter mutation on predicting meningioma outcomes: a multi-institutional cohort analysis.",
        authors: "Groff KJ, Patel RV, Feng Y, Ghosh HS, Millares Chavez MA, O'Brien J, Chen WC, Nitturi V, Save AV, Youngblood MW, Horbinski CM, Chandler JP, Ehret F, Gui C, Wang JZ, Park K, Ajmera S, Rosenblum M, Suwala AK, Kresbach C, Mount CW, Schüller U, Santagata S, Sahm F, Bale TA, Jackson C, Richardson TE, Cai C, Nassiri F, Zadeh G, Kaul D, Capper D, Magill ST, Golfinos JG, Sen C, Patel AJ, Raleigh DR, Moliterno J, Pacione D, Snuderl M, Bi WL",
        citation: "Lancet Oncol. 2025 Sep;26(9):1178-1190. PMID: 40907515; PMC13090858.",
      },
      {
        title: "Nuances in visual rehabilitation after pituitary surgery.",
        authors: "Gupta S, Bi WL",
        citation: "Neurooncol Adv. 2025 Jul;7(Suppl 1):i40-i47. PMID: 40718391; PMC12288131.",
      },
      {
        title: "Ki-67 in meningioma: distribution and implications.",
        authors: "Guo X, Patel RV, Lederer JA, Meredith DM, Bi WL",
        citation: "J Neurosurg. 2025 Nov 01;143(5):1325-1335. PMID: 40712166.",
      },
      {
        title: "Distribution of copy number alterations and impact of chromosome arm call thresholds for meningioma.",
        authors: "Patel RV, Ghosh HS, Meredith DM, Ryall S, Claus EB, Beroukhim R, Ligon AH, Santagata S, Bi WL",
        citation: "Nat Commun. 2025 Jul 02;16(1):6025. PMID: 40603304; PMC12222709.",
      },
      {
        title: "Interpretation and Strategy to Resolve Neuromonitoring Changes Associated With Brain Sag.",
        authors: "Bose M, Toczylowski M, Guo X, Liu DD, Epplin-Zapf T, Wilent WB, Bi WL",
        citation: "Oper Neurosurg. 2025 Jun 01;28(6):841-854. PMID: 40372119; PMC12068778.",
      },
      {
        title: "In Reply: Interpretation and Strategy to Resolve Neuromonitoring Changes Associated With Brain Sag.",
        authors: "Bi WL, Toczylowski M, Guo X, Bose M",
        citation: "Oper Neurosurg. 2025 Jun 01;28(6):911. PMID: 40168524.",
      },
      {
        title: "Interhemispheric Transcallosal Approach for Resection of a Pineal Region Third Ventricular to Brainstem Tumor: 2-Dimensional Operative Video.",
        authors: "Guo X, Bose M, Toczylowski M, Fonseca A, Bi WL",
        citation: "Oper Neurosurg. 2025 Dec 01;29(6):907-908. PMID: 39982058; PMC12607916.",
      },
      {
        title: "Motor mapping-guided resection of a brainstem recurrent pilocytic astrocytoma.",
        authors: "Guo X, Bose M, Galvin CP, Bi WL",
        citation: "Neurosurg Focus Video. 2025 Jan;12(1):V2. PMID: 39845304; PMC11748952.",
      },
      {
        title: "Canonical amplifications and CDKN2A/B loss refine IDH1/2-mutant astrocytoma prognosis.",
        authors: "Ghosh HS, Patel RV, Claus EB, Gonzalez Castro LN, Wen PY, Ligon KL, Meredith DM, Bi WL",
        citation: "Neuro Oncol. 2025 May 15;27(4):993-1003. PMID: 39584448; PMC12083226.",
      },
      {
        title: "Predictive Value of Neurosurgery Applicant Metrics on Resident Academic Productivity.",
        authors: "Banko L, Riesenburger N, Patel RV, Gilligan C, Cosgrove GR, Chiocca EA, Proctor MR, Patel AJ, Bi WL",
        citation: "Neurosurgery. 2025 Jun 01;96(6):1206-1216. PMID: 39526786.",
      },
      {
        title: "Spatial Distribution of Meningiomas: A Magnetic Resonance Image Atlas.",
        authors: "Patel RV, Yao S, Aguilar Murillo E, Huang RY, Bi WL",
        citation: "Neurosurgery. 2025 Apr 01;96(4):769-778. PMID: 39194267.",
      },
      {
        title: "Contemporary prognostic signatures and refined risk stratification of gliomas: An analysis of 4400 tumors.",
        authors: "Ghosh HS, Patel RV, Woodward E, Greenwald NF, Bhave VM, Maury EA, Cello G, Hoffman SE, Li Y, Gupta H, Youssef G, Spurr LF, Vogelzang J, Touat M, Dubois F, Cherniack AD, Guo X, Tavakol S, Cioffi G, Lindeman NI, Ligon AH, Chiocca EA, Reardon DA, Wen PY, Meredith DM, Santagata S, Barnholtz-Sloan JS, Ligon KL, Beroukhim R, Bi WL",
        citation: "Neuro Oncol. 2025 Jan 12;27(1):195-208. PMID: 39164213; PMC11726335.",
      },
    ],
  },
  {
    year: "2024",
    entries: [
      {
        title: "Multimodal-Assisted Resection of Right Insular Glioblastoma: A 2-Dimensional Operative Video.",
        authors: "Guo X, Torio E, Bose M, Golby AJ, Bi WL",
        citation: "Oper Neurosurg. 2024 Dec 03;29(3):451. PMID: 39625292; PMC12333727.",
      },
      {
        title: "Applications and Integration of Radiomics for Skull Base Oncology.",
        authors: "Patel RV, Groff KJ, Bi WL",
        citation: "Adv Exp Med Biol. 2024;1462:285-305. PMID: 39523272.",
      },
      {
        title: "Role of Hospital Connectedness in Brain Metastasis Outcomes.",
        authors: "Tong L, Patel RV, Aizer AA, Dhand A, Bi WL",
        citation: "JAMA Netw Open. 2024 Sep 03;7(9):e2435051. PMID: 39312234; PMC11420690.",
      },
      {
        title: "Interhospital transfer dynamics for patients with intracranial hemorrhage in Massachusetts.",
        authors: "Patel RV, Tong L, Molyneaux BJ, Patel NJ, Aziz-Sultan MA, Dhand A, Bi WL",
        citation: "Front Neurol. 2024;15:1409713. PMID: 39144707; PMC11322084.",
      },
      {
        title: "Improved optic nerve visualization and treatment planning through a dedicated optic nerve MRI protocol.",
        authors: "Wu KC, Guenette JP, Huang RY, Al-Mefty O, Dunn IF, Bi WL",
        citation: "Neurosurg Focus. 2024 Apr;56(4):E9. PMID: 38560937.",
      },
      {
        title: "Comparing Surgery with Stereotactic Radiation Alone for Newly Diagnosed Brain Metastases.",
        authors: "Bhave VM, Bi WL",
        citation: "World Neurosurg. 2024 Jan;181:184-185. PMID: 37838534.",
      },
      {
        title: "Reduced Mortality and Radiation Necrosis After Surgery With Postoperative Stereotactic Radiation in Patients With Multiple Brain Metastases.",
        authors: "Bhave VM, Lamba N, Tjong MC, Aizer AA, Bi WL",
        citation: "Neurosurgery. 2024 Jan 01;94(1):117-128. PMID: 37489905.",
      },
      {
        title: "Dissecting patterns and predictors of interhospital transfers for patients with brain metastasis.",
        authors: "Tong L, Medeiros L, Moen EL, Dhand A, Bi WL",
        citation: "J Neurosurg. 2024 Jan 01;140(1):27-37. PMID: 37486906; PMC10787816.",
      },
    ],
  },
  {
    year: "2023",
    entries: [
      {
        title: "Strategies to improve surgical technical competency: a systematic review.",
        authors: "Banko L, Patel RV, Nawabi N, Altshuler M, Medeiros L, Cosgrove GR, Bi WL",
        citation: "Acta Neurochir (Wien). 2023 Dec;165(12):3565-3572. PMID: 37945995.",
      },
      {
        title: "Impact of H3K27 trimethylation loss in meningiomas: a meta-analysis.",
        authors: "Cello G, Patel RV, McMahon JT, Santagata S, Bi WL",
        citation: "Acta Neuropathol Commun. 2023 Jul 25;11(1):122. PMID: 37491289; PMC10369842.",
      },
      {
        title: "Minimizing Intracranial Disease Before Stereotactic Radiation in Single or Solitary Brain Metastases.",
        authors: "Bhave VM, Lamba N, Aizer AA, Bi WL",
        citation: "Neurosurgery. 2023 Oct 01;93(4):782-793. PMID: 37036442.",
      },
      {
        title: "Integrated molecular and clinical analysis of BRAF-mutant glioma in adults.",
        authors: "Schreck KC, Langat P, Bhave VM, Li T, Woodward E, Pratilas CA, Eberhart CG, Bi WL",
        citation: "NPJ Precis Oncol. 2023 Feb 28;7(1):23. PMID: 36854806; PMC9975216.",
      },
      {
        title: "Imaging of Skull Base Tumors.",
        authors: "Bi WL",
        citation: "Continuum (Minneap Minn). 2023 Feb 01;29(1):156-170. PMID: 36795876.",
      },
      {
        title: "Application of radiomics to meningiomas: A systematic review.",
        authors: "Patel RV, Yao S, Huang RY, Bi WL",
        citation: "Neuro Oncol. 2023 Jun 02;25(6):1166-1176. PMID: 36723606; PMC10237421.",
      },
    ],
  },
  {
    year: "2022",
    entries: [
      {
        title: "Salvage brachytherapy for multiply recurrent metastatic brain tumors: A matched case analysis.",
        authors: "Wu KC, Cantalino JM, Dee EC, Hsu L, Harris TC, Rawal B, Juvekar PR, Mooney MA, Dunn IF, Aizer AA, Devlin PM, Bi WL",
        citation: "Neurooncol Adv. 2022;4(1):vdac039. PMID: 35571989; PMC9092639.",
      },
      {
        title: "Biology and Treatment of Meningiomas: A Reappraisal.",
        authors: "McFaline-Figueroa JR, Kaley TJ, Dunn IF, Bi WL",
        citation: "Hematol Oncol Clin North Am. 2022 Feb;36(1):133-146. PMID: 34801160.",
      },
      {
        title: "A molecularly integrated grade for meningioma.",
        authors: "Driver J, Hoffman SE, Tavakol S, Woodward E, Maury EA, Bhave V, Greenwald NF, Nassiri F, Aldape K, Zadeh G, Choudhury A, Vasudevan HN, Magill ST, Raleigh DR, Abedalthagafi M, Aizer AA, Alexander BM, Ligon KL, Reardon DA, Wen PY, Al-Mefty O, Ligon AH, Dubuc AM, Beroukhim R, Claus EB, Dunn IF, Santagata S, Bi WL",
        citation: "Neuro Oncol. 2022 May 04;24(5):796-808. PMID: 34508644; PMC9071299.",
      },
      {
        title: "Activity of PD-1 blockade with nivolumab among patients with recurrent atypical/anaplastic meningioma: phase II trial results.",
        authors: "Bi WL, Nayak L, Meredith DM, Driver J, Du Z, Hoffman S, Li Y, Lee EQ, Beroukhim R, Rinne M, McFaline-Figueroa R, Chukwueke U, McCluskey C, Gaffey S, Cherniack AD, Stefanik J, Doherty L, Taubert C, Cifrino M, LaFrankie D, Graillon T, Wen PY, Ligon KL, Al-Mefty O, Huang RY, Muzikansky A, Chiocca EA, Santagata S, Dunn IF, Reardon DA",
        citation: "Neuro Oncol. 2022 Jan 05;24(1):101-113. PMID: 34015129; PMC8730772.",
      },
    ],
  },
  {
    year: "2021",
    entries: [
      {
        title: "Genomic Landscape of Gliosarcoma: Distinguishing Features and Targetable Alterations.",
        authors: "Zaki MM, Mashouf LA, Woodward E, Langat P, Gupta S, Dunn IF, Wen PY, Nahed BV, Bi WL",
        citation: "Sci Rep. 2021 Sep 9;11(1):18009. PMID: 34504233; PMC8429571.",
      },
      {
        title: "Skull Base Tumors: Neuropathology and Clinical Implications.",
        authors: "Bi WL, Santagata S",
        citation: "Neurosurgery. 2021 Jun 23. PMID: 34164689.",
      },
      {
        title: "Immune Profiling of Pituitary Tumors Reveals Variations in Immune Infiltration and Checkpoint Molecule Expression.",
        authors: "Mei Y, Bi WL, Agolia J, Hu C, Giantini Larsen AM, Meredith DM, Al Abdulmohsen S, Bale T, Dunn GP, Abedalthagafi M, Dunn IF",
        citation: "Pituitary. 2021 Jun;24(3):359-73. PMID: 33492612.",
      },
      {
        title: "Surgical and Peri-Operative Considerations for Brain Metastases.",
        authors: "Gupta S, Dawood H, Giantini Larsen A, Fandino L, Knelson EH, Smith TR, Lee EQ, Aizer A, Dunn IF, Bi WL",
        citation: "Front Oncol. 2021 May 5;11:662943. PMID: 34026641; PMC8131835.",
      },
      {
        title: "Predictors of Postoperative Biochemical Remission in Acromegaly.",
        authors: "Yao S, Chen WL, Tavakol S, Akter F, Catalino MP, Guo X, Luo J, Zeng AL, Zekelman L, Mao ZG, Zhu YH, Wu QZ, Laws ER Jr, Bi WL, Wang HJ",
        citation: "J Neurooncol. 2021 Jan;151(2):313-24. PMID: 33394265.",
      },
    ],
  },
  {
    year: "2020",
    entries: [
      {
        title: "Immunophenotype of Vestibular Schwannomas.",
        authors: "Bi WL, Gupta S, Mei Y, Abdulmohsen SA, Giantini Larsen A, Unadkat P, Ramkissoon S, Abedalthagafi M, Dunn IF",
        citation: "Otol Neurotol. 2020 Dec;41(10):e1290-e1296. PMID: 33492804",
      },
      {
        title: "Impact of Insurance on Hospital Course and Readmission After Resection of Benign Meningioma.",
        authors: "Hauser BM, Gupta S, Xu E, Wu K, Bernstock JD, Chua M, Khawaja AM, Smith TR, Dunn IF, Bergmark RW, Bi WL",
        citation: "J Neurooncol. 2020 Aug;149(1):131-40. PMID: 32654076; PMC7484429.",
      },
      {
        title: "Translational Windows in Chordoma: A Target Appraisal.",
        authors: "Hoffman SE, Al Abdulmohsen SA, Gupta S, Hauser BM, Meredith DM, Dunn IF, Bi WL",
        citation: "Front Neurol. 2020 Jul 8;11:657. PMID: 32733369; PMC7360834.",
      },
      {
        title: "Molecular Advances in Central Nervous System Mesenchymal Tumors.",
        authors: "Helgager J, Driver J, Hoffman S, Bi WL",
        citation: "Surg Pathol Clin. 2020 Jun;13(2):291-303. PMID: 32389268.",
      },
      {
        title: "GATA2 Regulates Constitutive PD-L1 and PD-L2 Expression in Brain Tumors.",
        authors: "Fu Y, Liu CJ, Kobayashi DK, Johanns TM, Bowman-Kirigin JA, Schaettler MO, Mao DD, Bender D, Kelley DG, Uppaluri R, Bi WL, Dunn IF, Tao Y, Luo J, Kim AH, Dunn GP",
        citation: "Sci Rep 2020 Jun 3;10(1):9027. PMID: 32493985; PMC7271235.",
      },
    ],
  },
  {
    year: "2019",
    entries: [
      {
        title: "Automatic Assessment of Glioma Burden: A Deep Learning Algorithm for Fully Automated Volumetric and Bidimensional Measurement",
        authors: "Chang K, Beers AL, Bai HX, Brown JM, Ly KI, Li X, Senders JT, Kavouridis VK, Boaro A, Su C, Bi WL, Rapalino O, Liao W, Shen Q, Zhou H, Xiao B, Wang Y, Zhang PJ, Pinho MC, Wen PY, Batchelor TT, Boxerman JL, Arnaout O, Rosen BR, Gerstner ER, Yang L, Huang RY, Kalpathy-Cramer J",
        citation: "Neuro Oncol . 2019 Nov 4;21(11):1412-22. PMID: 31190077",
      },
      {
        title: "Tentorial Venous Anatomy: Cadaveric and Radiographic Study With Discussion of Origin and Surgical Significance.",
        authors: "Rosenblum JS, Neto M, Essayed WI, Bi WL, Patel NJ, Aziz-Sultan MA, Heiss JD, Al-Mefty O",
        citation: "World Neurosurg. 2019 Nov;131:e38-e45. PMID: 31295599; PMC6819248.",
      },
      {
        title: "Frameless Stereotactic Navigation During Insular Glioma Resection Using Fusion of Three-Dimensional Rotational Angiography and Magnetic Resonance Imaging",
        authors: "Dasenbrock HH, See AP, Smalley RJ, Bi WL, Dolati P, Frerichs KU, Golby AJ, Chiocca EA, Aziz-Sultan MA",
        citation: "World Neurosurg. 2019 Jun;126:322-30. PMID: 30898738.",
      },
      {
        title: "The Epigenomics of Pituitary Adenoma",
        authors: "Hauser BM, Lau A, Gupta S, Bi WL, Dunn IF",
        citation: "Front Endocrinol . 2019 May 14;10:290. PMID: 31139150; PMC6527758.",
      },
      {
        title: "Association of Neurosurgical Resection with Development of Pachymeningeal Seeding in Patients with Brain Metastases.",
        authors: "Cagney DN, Lamba N, Sinha S, Catalano PJ, Bi WL, Alexander BM, Aizer AA",
        citation: "JAMA Oncol. 2019 May 1;5(5):703-9. PMID: 30844036; PMC6512273.",
      },
      {
        title: "Pneumatosis Intestinalis After Molecular-Targeted Therapy",
        authors: "Chaudhry NS, Bi WL, Gupta S, Keraliya A, Shimizu N, Chiocca EA. World Neurosurg. 2019 May;125:312-5. PMID: 30763745",
        citation: "",
      },
      {
        title: "Artificial Intelligence in Cancer Imaging: Clinical Challenges and Applications.",
        authors: "Bi WL, Hosny A, Schabath MB, Giger ML, Birkbak NJ, Mehrtash A, Allison T, Arnaout O, Abbosh C, Dunn IF, Mak RH, Tamimi RM, Tempany CM, Swanton C, Hoffmann U, Schwartz LH, Gillies RJ, Huang RY, Aerts HJWL",
        citation: "CA Cancer J Clin . 2019 Mar; 69(2):127-57. PMID: 30720861",
      },
      {
        title: "Efficacy of Adjuvant Radiotherapy for Atypical and Anaplastic Meningioma",
        authors: "Zhu H, Bi WL, Aizer A, Hua L, Tian M, Den J, Tang H, Chen H, Wang Y, Mao Y, Dunn IF, Xie Q, Gong Y",
        citation: "Cancer Med . 2019 Jan; 8(1):13-20. PMID: 30680963; PMC6346222.",
      },
      {
        title: "Machine Learning Reveals Multimodal MRI Patterns Predictive of Isocitrate Dehydrogenase and 1p/19q Status in Diffuse Low- And High-Grade Gliomas",
        authors: "Zhou H, Chang K, Bai HX, Xiao B, Su C, Bi WL, Zhang PJ, Senders JT, Vallières M, Kavouridis VK, Boaro A, Arnaout O, Yang L, Huang RY",
        citation: "J Neurooncol . 2019 Apr; 142(2):299-307. PMID: 30661193; PMC6510979.",
      },
      {
        title: "Imaging and Diagnostic Advances for Intracranial Meningiomas",
        authors: "Huang RY, Bi WL, Griffith B, Kaufmann TJ, la Fougère C, Schmidt NO, Tonn JC, Vogelbaum MA, Wen PY, Aldape K, Nassiri F, Zadeh G, Dunn IF; International Consortium on Meningiomas",
        citation: "Neuro Oncol . 2019 Jan; 21(Supplement_1):i44-i61. PMID: 30649491",
      },
      {
        title: "Molecular and Translational Advances in Meningiomas",
        authors: "Suppiah S, Nassiri F, Bi WL, Dunn IF, Hanemann CO, Horbinski CM, Hashizume R, James CD, Mawrin C, Noushmehr H, Perry A, Sahm F, Sloan A, Von Deimling A, Wen PY, Aldape K, Zadeh G; International Consortium on Meningiomas",
        citation: "Neuro Oncol . 2019 Jan; 21(Supplement_1):i4-i17. PMID: 30649490",
      },
      {
        title: "Advances in Multidisciplinary Therapy for Meningiomas",
        authors: "Brastianos PK, Galanis E, Butowski N, Chan JW, Dunn IF, Goldbrunner R, Herold-Mende C, Ippen FM, Mawrin C, McDermott MW, Sloan A, Snyder J, Tabatabai G, Tatagiba M, Tonn JC, Wen PY, Aldape K, Nassiri F, Zadeh G, Jenkinson MD, Raleigh DR; International Consortium on Meningiomas",
        citation: "Neuro Oncol . 2019 Jan; 21(Supplement_1):i18-i31. PMID: 30649489",
      },
      {
        title: "Life After Surgical Resection of a Meningioma: A Prospective Cross-Sectional Study Evaluating Health-Related Quality of Life",
        authors: "Nassiri F, Price B, Shehab A, Au K, Cusimano MD, Jenkinson MD, Jungk C, Mansouri A, Santarius T, Suppiah S, Teng KX, Toor GS, Zadeh G, Walbert T, Drummond KJ; International Consortium on Meningiomas",
        citation: "Neuro Oncol . 2019 Jan; 21(Supplement_1):i32-i43. PMID: 30649488.",
      },
    ],
  },
  {
    year: "2018",
    entries: [
      {
        title: "Epidermal Growth Factor Receptor Extracellular Domain Mutations in Glioblastoma Present Opportunities for Clinical Imaging and Therapeutic Development.",
        authors: "Binder ZA, Thorne AH, Bakas S, Wileyto EP, Bilello M, Akbari H, Rathore S, Ha SM, Zhang L, Ferguson CJ, Dahiya S, Bi WL, Reardon DA, Idbaih A, Felsberg J, Hentschel B, Weller M, Bagley SJ, Morrissette JJD, Nasrallah MP, Ma J, Zanca C, Scott AM, Orellana L, Davatzikos C, Furnari FB, O’Rourke DM",
        citation: "Cancer Cell . 2018. 34(1):163-77.e7. doi: 10.1016/j.ccell.2018.06.006. PMID: 29990498",
      },
      {
        title: "An updated assessment of morbidity and mortality following skull base surgical approaches.",
        authors: "Burton BN, Hu JQ, Jafari A, Urman RD, Dunn IF, Bi WL, DeConde AS, Gabriel RA",
        citation: "Clin Neurol Neurosurg. 2018 Aug;171:109-15. doi: 10.1016/j.clineuro.2018.06.015. PMID: 29906680",
      },
      {
        title: "Craniopharyngioma: a roadmap for scientific translation.",
        authors: "Gupta S, Bi WL, Giantini Larsen A, Al-Abdulmohsen S, Abedalthagafi M, Dunn IF",
        citation: "Neurosurg Focus . 2018. 44(6):E12. PMID: 29852761",
      },
      {
        title: "High-grade meningiomas: biology and implications.",
        authors: "Bi WL, Prabhu VC, Dunn IF",
        citation: "Neurosurg Focus . 2018. 44(4):E2. doi: 10.3171/2017.12.FOCUS17756. PMID: 29606053",
      },
      {
        title: "Medical management of meningioma in the era of precision medicine.",
        authors: "Gupta S, Bi WL, Dunn IF",
        citation: "Neurosurg Focus . 2018. 44(4):E3. doi: 10.3171/2018.1.FOCUS17754. PMID: 29606052",
      },
      {
        title: "Adult Tethered Cord Syndrome Following Chiari Decompression.",
        authors: "Jackson C, Yang BW, Bi WL, Chiocca EA, Groff MW",
        citation: "World Neurosurg . 2018. 112:205-8. doi: 10.1016/j.wneu.2018.01.165. PMID: 29409774",
      },
      {
        title: "Genomic Alterations in Sporadic Pituitary Tumors.",
        authors: "Bi WL, Larsen AG, Dunn IF",
        citation: "Curr Neurol Neurosci Rep . 2018;18(1):4. doi: 10.1007/s11910-018-0811-0. PMID: 29396598",
      },
      {
        title: "Clinical applications of dynamic CT angiography for intracranial lesions.",
        authors: "Gupta S, Bi WL, Mukundan S, Al-Mefty O, Dunn IF",
        citation: "Acta Neurochir . 2018. 160(4):675-80. doi: 10.1007/s00701-018-3465-4. PMID: 29353408",
      },
      {
        title: "Congress of Neurological Surgeons Systematic Review and Evidence-Based Guidelines on the Role of Imaging in the Diagnosis and Management of Patients with Vestibular Schwannomas.",
        authors: "Dunn IF, Bi WL L, Mukundan S, Delman BN, Parish J, Atkins T, Asher AL, Olson JJ",
        citation: "Neurosurgery . 2018;82(2):E32-E34. doi: 10.1093/neuros/nyx510. PMID: 29309686",
      },
      {
        title: "Residual Convolutional Neural Network for the Determination of <i>IDH</i> Status in Low- and High-Grade Gliomas from MR Imaging.",
        authors: "Chang K, Bai HX, Zhou H, Su C, Bi WL, Agbodza E, Kavouridis VK, Senders JT, Boaro A, Beers A, Zhang B, Capellini A, Liao W, Shen Q, Li X, Xiao B, Cryan J, Ramkissoon S, Ramkissoon L, Ligon K, Wen PY, Bindra RS, Woo J, Arnaout O, Gerstner ER, Zhang PJ, Rosen BR, Yang L, Huang RY, Kalpathy-Cramer J",
        citation: "Clin Cancer Res . 2018. 24(5):1073-1081. doi: 10.1158/1078-0432.CCR-17-2236. PMID: 29167275",
      },
    ],
  },
  {
    year: "2017",
    entries: [
      {
        title: "Management of intracranial melanomas in the era of precision medicine.",
        authors: "Young GJ, Bi WL, Wu WW, Johanns TM, Dunn GP, Dunn IF",
        citation: "Oncotarget . 2017. 8(51):89326-89347. doi: 10.18632/oncotarget.19223. PMID: 29179523",
      },
      {
        title: "Radiographic prediction of meningioma grade by semantic and radiomic features.",
        authors: "Coroller TP, Bi WL, Huynh E, Abedalthagafi M, Aizer AA, Greenwald NF, Parmar C, Narayan V, Wu WW, Miranda de Moura S, Gupta S, Beroukhim R, Wen PY, Al-Mefty O, Dunn IF, Santagata S, Alexander BM, Huang RY, Aerts HJWL",
        citation: "PLoS One . 2017. 12(11):e0187908. doi: 10.1371/journal.pone.0187908. PMID: 29145421",
      },
      {
        title: "Osteoglycin promotes meningioma development through downregulation of NF2 and activation of mTOR signaling.",
        authors: "Mei Y, Du Z, Hu C, Greenwald NF, Abedalthagafi M, Agar NYR, Dunn GP, Bi WL, Santagata S, Dunn IF",
        citation: "Cell Commun Signal . 2017;15(1):34. doi: 10.1186/s12964-017-0189-7. PMID: 28923059",
      },
      {
        title: "Current and emerging principles in surgery for meningioma.",
        authors: "Bi WL, Dunn IF",
        citation: "Chin Clin Oncol . 2017. 6(Suppl 1):S7. doi: 10.21037/cco.2017.06.10. PMID: 28758410",
      },
      {
        title: "Genomic landscape of high-grade meningiomas.",
        authors: "Bi WL, Greenwald NF, Abedalthagafi M, Wala J, Gibson WJ, Agarwalla PK, Horowitz P, Schumacher SE, Esaulova E, Mei Y, Chevalier A, Ducar M, Thorner AR, van Hummelen P, Stemmer-Rachamimov A, Artyomov M, Al-Mefty O, Dunn GP, Santagata S, Dunn IF, Beroukhim R",
        citation: "NPJ Genom Med . 2017. doi: 10.1038/s41525-017-0014-7. PMID: 28713588",
      },
      {
        title: "Genomic profile of human meningioma cell lines.",
        authors: "Mei Y, Bi WL, Greenwald NF, Agar NY, Beroukhim R, Dunn GP, Dunn IF",
        citation: "PLoS One . 2017. 12(5):e0178322. doi: 10.1371/journal.pone.0178322. PMID: 28552950",
      },
      {
        title: "Pediatric clival chordoma: A curable disease that conforms to Collins’ Law.",
        authors: "Rassi MS, Hulou MM, Almefty K, Bi WL, Pravdenkova S, Dunn IF, Smith TR, Al-Mefty O",
        citation: "Neurosurgery . 2018;82(5):652-60. doi: 10.1093/neuros/nyx254. PMID: 28521059",
      },
      {
        title: "Clinical Identification of Oncogenic Drivers and Copy-Number Alterations in Pituitary Tumors.",
        authors: "Bi WL, Greenwald NF, Ramkissoon SH, Abedalthagafi M, Coy SM, Ligon KL, Mei Y, MacConaill L, Ducar M, Min L, Santagata S, Kaiser UB, Beroukhim R, Laws ER Jr, Dunn IF",
        citation: "Endocrinology . 2017. 158(7):2284-91. doi: 10.1210/en.2016-1967. PMID: 28486603",
      },
      {
        title: "Phylogenetic ctDNA analysis depicts early-stage lung cancer evolution.",
        authors: "Abbosh C, Birkbak NJ, Wilson GA, Jamal-Hanjani M, Constantin T, Salari R, Le Quesne J, Moore DA, Veeriah S, Rosenthal R, Marafioti T, Kirkizlar E, Watkins TBK, McGranahan N, Ward S, Martinson L, Riley J, Fraioli F, Al Bakir M, Grönroos E, Zambrana F, Endozo R, Bi WL, Fennessy FM, Sponer N, Johnson D, Laycock J, Shafi S, Czyzewska-Khan J, Rowan A, Chambers T, Matthews N, Turajlic S, Hiley C, Lee SM, Forster MD, Ahmad T, Falzon M, Borg E, Lawrence D, Hayward M, Kolvekar S, Panagiotopoulos N, Janes SM, Thakrar R, Ahmed A, Blackhall F, Summers Y, Hafez D, Naik A, Ganguly A, Kareht S, Shah R, Joseph L, Marie Quinn A, Crosbie PA, Naidu B, Middleton G, Langman G, Trotter S, Nicolson M, Remmen H, Kerr K, Chetty M, Gomersall L, Fennell DA, Nakas A, Rathinam S, Anand G, Khan S, Russell P, Ezhil V, Ismail B, Irvin-Sellers M, Prakash V, Lester JF, Kornaszewska M, Attanoos R, Adams H, Davies H, Oukrif D, Akarca AU, Hartley JA, Lowe HL, Lock S, Iles N, Bell H, Ngai Y, Elgar G, Szallasi Z, Schwarz RF, Herrero J, Stewart A, Quezada SA, Peggs KS, Van Loo P, Dive C, Lin CJ, Rabinowitz M, Aerts HJWL, Hackshaw A, Shaw JA, Zimmermann BG; TRACERx consortium; PEACE consortium, Swanton C",
        citation: "Nature . 2017. 545(7655):446-51. doi: 10.1038/nature22364. PMID: 28445469",
      },
      {
        title: "Incidence and prognosis of patients with brain metastases at diagnosis of systemic malignancy: a population-based study.",
        authors: "Cagney DN, Martin AM, Catalano PJ, Redig AJ, Lin NU, Lee EQ, Wen PY, Dunn IF, Bi WL, Weiss SE, Haas-Kogan DA, Alexander BM, Aizer AA",
        citation: "Neuro Oncol . 2017. 19(11):1511-21. doi: 10.1093/neuonc/nox077. PMID: 28444227",
      },
      {
        title: "The impact of transsphenoidal surgery on neurocognitive function: a systematic review.",
        authors: "Alsumali A, Cote DJ, Regestein QR, Crocker E, Alzarea A, Zaidi HA, Bi WL, Dawood HY, Broekman ML, van Zandvoort MJE, Mekary RA, Smith TR",
        citation: "J Clin Neurosci . 2017. 42:1-6. doi: 10.1016/j.jocn.2017.01.015. PMID: 28215426",
      },
      {
        title: "Germline and somatic BAP1 mutations in high-grade rhabdoid meningiomas.",
        authors: "Shankar GM, Abedalthagafi M, Vaubel RA, Merrill PH, Nayyar N, Gill CM, Brewster R, Bi WL, Agarwalla PK, Thorner AR, Reardon DA, Al-Mefty O, Wen PY, Alexander BM, van Hummelen P, Batchelor TT, Ligon KL, Ligon AH, Meyerson M, Dunn IF, Beroukhim R, Louis DN, Perry A, Carter SL, Giannini C, Curry WT Jr, Cahill DP, Barker FG 2nd, Brastianos PK, Santagata S",
        citation: "Neuro Oncol . 2017;19(4):535-45. doi: 10.1093/neuonc/now235. PMID: 28170043",
      },
      {
        title: "Clinical targeted exome-based sequencing in combination with genome-wide copy number profiling: precision medicine analysis of 203 pediatric brain tumors.",
        authors: "Ramkissoon SH, Bandopadhayay P, Hwang J, Ramkissoon LA, Greenwald NF, Schumacher SE, O’Rourke R, Pinches N, Ho P, Malkin H, Sinai C, Filbin M, Plant A, Bi WL, Chang MS, Yang E, Wright KD, Manley PE, Ducar M, Alexandrescu S, Lidov H, Delalle I, Goumnerova LC, Church AJ, Janeway KA, Harris MH, MacConaill LE, Folkerth RD, Lindeman NI, Stiles CD, Kieran MW, Ligon AH, Santagata S, Dubuc AM, Chi SN, Beroukhim R, Ligon KL",
        citation: "Neuro Oncol . 2017. 19(7):986-96. doi: 10.1093/neuonc/now294. PMID: 28104717",
      },
      {
        title: "Superior semicircular canal dehiscence syndrome.",
        authors: "Bi WL, Brewster R, Poe D, Vernick D, Lee DJ, Eduardo Corrales C, Dunn IF",
        citation: "J Neurosurg . 2017. 127(6):1268-76. doi: 10.3171/2016.9.JNS16503. PMID: 28084916",
      },
    ],
  },
  {
    year: "2016",
    entries: [
      {
        title: "The genomic landscape of schwannoma.",
        authors: "Agnihotri S, Jalali S, Wilson MR, Danesh A, Li M, Klironomos G, Krieger JR, Mansouri A, Khan O, Mamatjan Y, Landon-Brace N, Tung T, Dowar M, Li T, Bruce JP, Burrell KE, Tonge PD, Alamsahebpour A, Krischek B, Agarwalla PK, Bi WL, Dunn IF, Beroukhim R, Fehlings MG, Bril V, Pagnotta SM, Iavarone A, Pugh TJ, Aldape KD, Zadeh G",
        citation: "Nat Genet . 2016. 48(11):1339-48. doi: 10.1038/ng.3688. PMID: 27723760",
      },
      {
        title: "Landscape of Genomic Alterations in Pituitary Adenomas.",
        authors: "Bi WL, Horowitz P, Greenwald NF, Abedalthagafi M, Agarwalla PK, Gibson WJ, Mei Y, Schumacher SE, Ben-David U, Chevalier A, Carter S, Tiao G, Brastianos PK, Ligon AH, Ducar M, MacConaill L, Laws ER Jr, Santagata S, Beroukhim R, Dunn IF",
        citation: "Clin Cancer Res . 2017. 23(7):1841-51. doi: 10.1158/1078-0432.CCR-16-0790. PMID: 27707790",
      },
      {
        title: "Time Course of Symptomatic Recovery After Endoscopic Transsphenoidal Surgery for Pituitary Adenoma Apoplexy in the Modern Era.",
        authors: "Zaidi HA, Cote DJ, Burke WT, Castlen JP, Bi WL, Laws ER Jr, Dunn IF",
        citation: "World Neurosurg . 2016. 96:434-9. doi: 10.1016/j.wneu.2016.09.052. PMID: 27663263",
      },
      {
        title: "Increased expression of programmed death ligand 1 (PD-L1) in human pituitary tumors.",
        authors: "Mei Y, Bi WL, Greenwald NF, Du Z, Agar NY, Kaiser UB, Woodmansee WW, Reardon DA, Freeman GJ, Fecci PE, Laws ER Jr, Santagata S, Dunn GP, Dunn IF",
        citation: "Oncotarget . 2016;7(47):76565-76. doi: 10.18632/oncotarget.12088. PMID: 27655724",
      },
      {
        title: "Applications of Ultrasound in the Resection of Brain Tumors.",
        authors: "Sastry R, Bi WL, Pieper S, Frisken S, Kapur T, Wells W 3rd, Golby AJ",
        citation: "J Neuroimaging . 2017. 27(1):5-15. doi: 10.1111/jon.12382. PMID: 27541694",
      },
      {
        title: "Meningioma Genomics: Diagnostic, Prognostic, and Therapeutic Applications.",
        authors: "Bi WL, Zhang M, Wu WW, Mei Y, Dunn IF",
        citation: "Front Surg . 2016. 3:40. doi: 10.3389/fsurg.2016.00040. PMID: 27458586",
      },
      {
        title: "Genomic characterization of recurrent high-grade astroblastoma.",
        authors: "Bale TA, Abedalthagafi M, Bi WL, Kang YJ, Merrill P, Dunn IF, Dubuc A, Charbonneau SK, Brown L, Ligon AH, Ramkissoon SH, Ligon KL",
        citation: "Cancer Genet . 2016. 209(7-8):321-30. doi: 10.1016/j.cancergen.2016.06.002. PMID: 27425854",
      },
      {
        title: "Multimodal MRI features predict isocitrate dehydrogenase genotype in high-grade gliomas.",
        authors: "Zhang B, Chang K, Ramkissoon S, Tanguturi S, Bi WL, Reardon DA, Ligon KL, Alexander BM, Wen PY, Huang RY",
        citation: "Neuro Oncol . 2017. 19(1):109-117. doi: 10.1093/neuonc/now121. PMID: 27353503",
      },
      {
        title: "Checkpoint inhibition in meningiomas.",
        authors: "Bi WL, Wu WW, Santagata S, Reardon DA, Dunn IF",
        citation: "Immunotherapy . 2016. 8(6):721-31. doi: 10.2217/imt-2016-0017. PMID: 27197540",
      },
      {
        title: "MAPK activation and HRAS mutation identified in pituitary spindle cell oncocytoma.",
        authors: "Miller MB, Bi WL, Ramkissoon LA, Kang YJ, Abedalthagafi M, Knoff DS, Agarwalla PK, Wen PY, Reardon DA, Alexander BM, Laws ER Jr, Dunn IF, Beroukhim R, Ligon KL, Ramkissoon SH",
        citation: "Oncotarget . 2016. 7(24):37054-37063. doi: 10.18632/oncotarget.9244. PMID: 27175596",
      },
      {
        title: "Genomic and Epigenomic Landscape in Meningioma.",
        authors: "Bi WL, Mei Y, Agarwalla PK, Beroukhim R, Dunn IF",
        citation: "Neurosurg Clin N Am . 2016 Apr;27(2):167-79. doi: 10.1016/j.nec.2015.11.009. PMID: 27012381",
      },
      {
        title: "The utility of high-resolution intraoperative MRI in endoscopic transsphenoidal surgery for pituitary macroadenomas: early experience in the Advanced Multimodality Image Guided Operating suite.",
        authors: "Zaidi HA, De Los Reyes K, Barkhoudarian G, Litvack ZN, Bi WL, Rincon-Torroella J, Mukundan S Jr, Dunn IF, Laws ER Jr",
        citation: "Neurosurg Focus . 2016. 40(3):E18. doi: 10.3171/2016.1.FOCUS15515. PMID: 26926058",
      },
      {
        title: "The Efficacy of Antibacterial Prophylaxis Against the Development of Meningitis After Craniotomy: A Meta-Analysis.",
        authors: "Alotaibi AF, Hulou MM, Vestal M, Alkholifi F, Asgarzadeh M, Cote DJ, Bi WL, Dunn IF, Mekary RA, Smith TR",
        citation: "World Neurosurg . 2016. 90:597-603.e1. doi: 10.1016/j.wneu.2016.02.048. PMID: 26921699",
      },
      {
        title: "Oncogenic PI3K mutations are as common as AKT1 and SMO mutations in meningioma.",
        authors: "Abedalthagafi M, Bi WL, Aizer AA, Merrill PH, Brewster R, Agarwalla PK, Listewnik ML, Dias-Santagata D, Thorner AR, Van Hummelen P, Brastianos PK, Reardon DA, Wen PY, Al-Mefty O, Ramkissoon SH, Folkerth RD, Ligon KL, Ligon AH, Alexander BM, Dunn IF, Beroukhim R, Santagata S",
        citation: "Neuro Oncol . 2016. 18(5):649-55. doi: 10.1093/neuonc/nov316. PMID: 26826201",
      },
      {
        title: "Metastatic Gastrointestinal Stromal Tumor to the Skull.",
        authors: "Gupta S, Bi WL, Dunn IF",
        citation: "World Neurosurg . 2016. 89:725.e11-6. doi: 10.1016/j.wneu.2016.01.019. PMID: 26805679",
      },
      {
        title: "Genomic landscape of intracranial meningiomas.",
        authors: "Bi WL, Abedalthagafi M, Horowitz P, Agarwalla PK, Mei Y, Aizer AA, Brewster R, Dunn GP, Al-Mefty O, Alexander BM, Santagata S, Beroukhim R, Dunn IF",
        citation: "J Neurosurg . 2016. 125(3):525-35. doi: 10.3171/2015.6.JNS15591. PMID: 26771848",
      },
      {
        title: "Functional Gonadotroph Adenomas: Case Series and Report of Literature.",
        authors: "Cote DJ, Smith TR, Sandler CN, Gupta T, Bale TA, Bi WL, Dunn IF, De Girolami U, Woodmansee WW, Kaiser UB, Laws ER Jr",
        citation: "Neurosurgery . 2016. 79(6):823-31. PMID: 26692108",
      },
      {
        title: "Myxopapillary ependymomas in children: imaging, treatment and outcomes.",
        authors: "Bandopadhayay P, Silvera VM, Ciarlini PDSC, Malkin H, Bi WL, Bergthold G, Faisal AM, Ullrich NJ, Marcus K, Scott RM, Beroukhim R, Manley PE, Chi SN, Ligon KL, Goumnerova LC, Kieran MW",
        citation: "J Neurooncol . 2016. 126(1):165-74. doi: 10.1007/s11060-015-1955-2. PMID: 26468139",
      },
      {
        title: "Evita’s lobotomy.",
        authors: "Young GJ, Bi WL, Smith TR, Brewster R, Gormley WB, Dunn IF, Laws ER, Nijensohn DE",
        citation: "J Clin Neurosci . 2015. 22(12):1883-8. doi: 10.1016/j.jocn.2015.07.005. PMID: 26463273",
      },
      {
        title: "How a Lumbar Diskectomy Influenced Medical Malpractice and the Landscape of Health Care.",
        authors: "Yang BW, Bi WL, Smith TR, Brewster R, Gormley WB, Dunn IF, Laws ER Jr",
        citation: "World Neurosurg . 2016. 86:88-92. doi: 10.1016/j.wneu.2015.09.039. PMID: 26409087",
      },
      {
        title: "The Neurocritical and Neurosurgical Care of Subdural Hematomas.",
        authors: "Huang KT, Bi WL, Abd-El-Barr M, Yan SC, Tafel IJ, Dunn IF, Gormley WB",
        citation: "Neurocrit Care . 2016. 24(2):294-307. doi: 10.1007/s12028-015-0194-x. PMID: 26399248",
      },
      {
        title: "Adult Atypical Teratoid/Rhabdoid Tumors.",
        authors: "Wu WW, Bi WL, Kang YJ, Ramkissoon SH, Prasad S, Shih HA, Reardon DA, Dunn IF",
        citation: "World Neurosurg . 2016. 85:197-204. doi: 10.1016/j.wneu.2015.08.076. PMID: 26344637",
      },
      {
        title: "A prognostic cytogenetic scoring system to guide the adjuvant management of patients with atypical meningioma.",
        authors: "Aizer AA, Abedalthagafi M, Bi WL, Horvath MC, Arvold ND, Al-Mefty O, Lee EQ, Nayak L, Rinne ML, Norden AD, Reardon DA, Wen PY, Ligon KL, Ligon AH, Beroukhim R, Dunn IF, Santagata S, Alexander BM",
        citation: "Neuro Oncol . 2016. 18(2):269-74. doi: 10.1093/neuonc/nov177. PMID: 26323607",
      },
      {
        title: "Extent of resection and overall survival for patients with atypical and malignant meningioma.",
        authors: "Aizer AA, Bi WL, Kandola MS, Lee EQ, Nayak L, Rinne ML, Norden AD, Beroukhim R, Reardon DA, Wen PY, Al-Mefty O, Arvold ND, Dunn IF, Alexander BM",
        citation: "Cancer . 2015. 121(24):4376-81. doi: 10.1002/cncr.29639. PMID: 26308667",
      },
      {
        title: "Pseudo-Cerebrospinal Fluid Rhinorrhea Resulting from Aberrant Cross-Innervation of Trigeminal and Facial Nerves following Skull Base Surgery.",
        authors: "Grannan BL, Bi WL, Dunn IF",
        citation: "J Neurol Surg Rep . 2015. 76(1):e62-4. doi: 10.1055/s-0034-1396655. PMID: 26251813",
      },
      {
        title: "Integrated Genomic Characterization of a Pineal Parenchymal Tumor of Intermediate Differentiation.",
        authors: "Kang YJ, Bi WL, Dubuc AM, Martineau L, Ligon AH, Berkowitz AL, Aizer AA, Lee EQ, Ligon KL, Ramkissoon SH, Dunn IF",
        citation: "World Neurosurg . 2016. 85:96-105. doi: 10.1016/j.wneu.2015.07.032. PMID: 26226092",
      },
    ],
  },
  {
    year: "2015",
    entries: [
      {
        title: "The neurosurgeon as baseball fan and inventor: Walter Dandy and the batter’s helmet.",
        authors: "Brewster R, Bi WL, Smith TR, Gormley WB, Dunn IF, Laws ER Jr",
        citation: "Neurosurg Focus . 2015. 39(1):E9. doi: 10.3171/2015.3.FOCUS1552. PMID: 26126408",
      },
      {
        title: "The Assassination of Abraham Lincoln and the Evolution of Neuro-Trauma Care: Would the 16th President Have Survived in the Modern Era?",
        authors: "Yan SC, Smith TR, Bi WL, Brewster R, Gormley WB, Dunn IF, Laws ER Jr",
        citation: "World Neurosurg . 2015. 84(5):1453-7. doi: 10.1016/j.wneu.2015.06.011. PMID: 2609253",
      },
      {
        title: "Multicentric Low-Grade Gliomas.",
        authors: "Sridharan V, Urbanski LM, Bi WL, Thistle K, Miller MB, Ramkissoon S, Reardon DA, Dunn IF",
        citation: "World Neurosurg . 2015. 84(4):1045-50. doi: 10.1016/j.wneu.2015.05.021. PMID: 26004698",
      },
      {
        title: "ARID1A and TERT promoter mutations in dedifferentiated meningioma.",
        authors: "Abedalthagafi MS, Bi WL, Merrill PH, Gibson WJ, Rose MF, Du Z, Francis JM, Du R, Dunn IF, Ligon AH, Beroukhim R, Santagata S",
        citation: "Cancer Genet . 2015. 208(6):345-50. doi: 10.1016/j.cancergen.2015.03.005. PMID: 25963524",
      },
      {
        title: "Extracranial growth of glioblastoma multiforme.",
        authors: "Forsyth TM, Bi WL, Abedalthagafi M, Dunn IF, Chiocca EA",
        citation: "J Clin Neurosci . 2015. 22(9):1521-3. doi: 10.1016/j.jocn.2015.03.018. PMID: 25956620",
      },
      {
        title: "The combined microscopic-endoscopic technique for radical resection of cerebellopontine angle tumors.",
        authors: "Abolfotoh M, Bi WL, Hong CK, Almefty KK, Boskovitz A, Dunn IF, Al-Mefty O",
        citation: "J Neurosurg . 2015. 123(5):1301-11. doi: 10.3171/2014.10.JNS141465. PMID: 25909571",
      },
      {
        title: "Utility of dynamic computed tomography angiography in the preoperative evaluation of skull base tumors.",
        authors: "Bi WL, Brown PA, Abolfotoh M, Al-Mefty O, Mukundan S Jr, Dunn IF",
        citation: "J Neurosurg . 2015. 123(1):1-8. doi: 10.3171/2014.10.JNS141055. PMID: 25839925",
      },
      {
        title: "Intrasellar abscess following pituitary surgery.",
        authors: "Huang KT, Bi WL, Smith TR, Zamani AA, Dunn IF, Laws ER Jr",
        citation: "Pituitary . 2015. 18(5):731-7. doi: 10.1007/s11102-015-0651-8. PMID: 25814123",
      },
      {
        title: "Clinical implementation of integrated whole-genome copy number and mutation profiling for glioblastoma.",
        authors: "Ramkissoon SH, Bi WL, Schumacher SE, Ramkissoon LA, Haidar S, Knoff D, Dubuc A, Brown L, Burns M, Cryan JB, Abedalthagafi M, Kang YJ, Schultz N, Reardon DA, Lee EQ, Rinne ML, Norden AD, Nayak L, Ruland S, Doherty LM, LaFrankie DC, Horvath M, Aizer AA, Russo A, Arvold ND, Claus EB, Al-Mefty O, Johnson MD, Golby AJ, Dunn IF, Chiocca EA, Trippa L, Santagata S, Folkerth RD, Kantoff P, Rollins BJ, Lindeman NI, Wen PY, Ligon AH, Beroukhim R, Alexander BM, Ligon KL",
        citation: "Neuro Oncol . 2015. 17(10):1344-55. doi: 10.1093/neuonc/nov015. PMID: 25754088",
      },
      {
        title: "Basilar Invagination: Case Report and Literature Review.",
        authors: "Chaudhry NS, Ozpinar A, Bi WL, Chavakula V, Chi JH, Dunn IF",
        citation: "World Neurosurg . 2015. 83(6):1180.e7-11. doi: 10.1016/j.wneu.2015.02.007. PMID: 25701769",
      },
      {
        title: "Extensive spinal epidural abscess treated with “apical laminectomies” and irrigation of the epidural space.",
        authors: "Abd-El-Barr MM, Bi WL, Bahluyen B, Rodriguez ST, Groff MW, Chi JH",
        citation: "J Neurosurg Spine . 2015. 22(3):318-23. doi: 10.3171/2014.11.SPINE131166. PMID: 25555055",
      },
      {
        title: "Pituitary apoplexy.",
        authors: "Bi WL, Dunn IF, Laws ER Jr",
        citation: "Endocrine . 2015. 48(1):69-75. doi: 10.1007/s12020-014-0359-y. PMID: 25063308",
      },
    ],
  },
  {
    year: "2014",
    entries: [
      {
        title: "Angiomatous meningiomas have a distinct genetic profile with multiple chromosomal polysomies including polysomy of chromosome 5.",
        authors: "Abedalthagafi MS, Merrill PH, Bi WL, Jones RT, Listewnik ML, Ramkissoon SH, Thorner AR, Dunn IF, Beroukhim R, Alexander BM, Brastianos PK, Francis JM, Folkerth RD, Ligon KL, Van Hummelen P, Ligon AH, Santagata S",
        citation: "Oncotarget . 2014. 5(21):10596-606. PMID: 25347344",
      },
      {
        title: "Clinical multiplexed exome sequencing distinguishes adult oligodendroglial neoplasms from astrocytic and mixed lineage gliomas.",
        authors: "Cryan JB, Haidar S, Ramkissoon LA, Bi WL, Knoff DS, Schultz N, Abedalthagafi M, Brown L, Wen PY, Reardon DA, Dunn IF, Folkerth RD, Santagata S, Lindeman NI, Ligon AH, Beroukhim R, Hornick JL, Alexander BM, Ligon KL, Ramkissoon SH",
        citation: "Oncotarget . 2014. 5(18):8083-92. PMID: 25257301",
      },
      {
        title: "Beating the odds: extreme long-term survival with glioblastoma.",
        authors: "Bi WL, Beroukhim R",
        citation: "Neuro Oncol . 2014;16(9):1159-60. doi: 10.1093/neuonc/nou166. PMID: 25096192",
      },
      {
        title: "Brevican knockdown reduces late-stage glioma tumor aggressiveness.",
        authors: "Dwyer CA, Bi WL, Viapiano MS, Matthews RT",
        citation: "J Neurooncol . 2014. 120(1):63-72. doi: 10.1007/s11060-014-1541-z. PMID: 25052349",
      },
      {
        title: "Isolated cerebral mucormycosis of the basal ganglia.",
        authors: "Malik AN, Bi WL, McCray B, Abedalthagafi M, Vaitkevicius H, Dunn IF",
        citation: "Clin Neurol Neurosurg . 2014. 124:102-5. doi: 10.1016/j.clineuro.2014.06.022. PMID: 25019460",
      },
      {
        title: "Image-guided maximal resection of intrinsic tumors.",
        authors: "Bi WL, Chiocca EA",
        citation: "World Neurosurg . 2014. 82(5):604-5. doi: 10.1016/j.wneu.2014.04.070. PMID: 24802845",
      },
      {
        title: "Metabolic imaging in the detection of growth hormone-secreting pituitary adenomas.",
        authors: "Bi WL, Laws ER Jr",
        citation: "World Neurosurg . 2014 Sep-Oct;82(3-4):329-30. doi: 10.1016/j.wneu.2014.03.014. PMID: 24631911",
      },
      {
        title: "Pediatric low-grade gliomas: how modern biology reshapes the clinical field.",
        authors: "Bergthold G, Bandopadhayay P, Bi WL, Ramkissoon L, Stiles C, Segal RA, Beroukhim R, Ligon KL, Grill J, Kieran MW",
        citation: "Biochim Biophys Acta . 2014. 1845(2):294-307. doi: 10.1016/j.bbcan.2014.02.004. PMID: 24589977",
      },
      {
        title: "Medial acoustic neuromas: clinical and surgical implications.",
        authors: "Dunn IF, Bi WL, Erkmen K, Kadri PA, Hasan D, Tang CT, Pravdenkova S, Al-Mefty O",
        citation: "J Neurosurg . 2014. 120(5):1095-104. doi: 10.3171/2014.1.JNS131701. PMID: 24527822",
      },
      {
        title: "Magnetic resonance imaging validation of pituitary gland compression and distortion by typical sellar pathology.",
        authors: "Cho CH, Barkhoudarian G, Hsu L, Bi WL, Zamani AA, Laws ER",
        citation: "J Neurosurg . 2013. 119(6):1461-6. doi: 10.3171/2013.8.JNS13496. PMID: 24032703",
      },
      {
        title: "From localization to pathways: the continuing evolution of diffusion tensor imaging.",
        authors: "Bi WL, Chiocca EA",
        citation: "World Neurosurg . 2014. 82(1-2):e47-8. doi: 10.1016/j.wneu.2013.08.059. PMID: 24017953",
      },
      {
        title: "Searching for the light: fluorescence guidance in glioma resection.",
        authors: "Bi WL, Laws ER Jr",
        citation: "World Neurosurg . 2014. 82(1-2):54-5. doi: 10.1016/j.wneu.2013.07.111. PMID: 23920301",
      },
    ],
  },
];
// Author-disambiguated: "Bi WL[Author]" alone also matches unrelated authors
// who happen to share the same surname/initials (confirmed via PubMed's own
// API -- rice chemistry, materials science, and plant pathology papers all
// surfaced). Restricting to her Brigham/Harvard affiliation filters those out
// without needing an ORCID, which she doesn't have listed on PubMed.
export const PUBMED_URL =
  "https://pubmed.ncbi.nlm.nih.gov/?term=Bi+WL%5BAuthor%5D+AND+%28Brigham%5BAffiliation%5D+OR+Harvard%5BAffiliation%5D%29&sort=pubdate&size=200";

export const CONTACT = {
  labName: "Bi Lab",
  piTitles: [
    "Wenya Linda Bi, MD, PhD",
    "Myers Family Endowed Chair in Skull Base Tumors and Cancer",
    "Mass General Brigham",
    "Associate Professor",
    "Harvard Medical School",
  ],
  address: ["60 Fenwood Road", "Boston, MA 02115"],
  phone: "617.525.8319",
  fax: "617.713.3050",
  email: "wbi@mgb.org",
  // The old /research path here 404s -- verified live: bwhgiving.org (any
  // path) redirects to give.brighamandwomens.org, which has no dedicated
  // neurosurgery/brain-tumor fund page, just this general giving homepage.
  supportUrl: "https://give.brighamandwomens.org/",
  buildingImage: "/brand/contact-building.jpg",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2949.337931643105!2d-71.11092558454449!3d42.335318079188504!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e3798e2f673c17%3A0xd7def63584c291a2!2s60+Fenwood+Rd%2C+Boston%2C+MA+02115!5e0!3m2!1sen!2sus!4v1561184506958!5m2!1sen!2sus",
};
