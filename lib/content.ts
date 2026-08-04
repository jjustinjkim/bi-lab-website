// Public-site copy, sourced from the lab's existing BWH-hosted site
// (skullbase.bwh.harvard.edu) as of 2026-08-04. Plain data, no CMS.

export interface ResearchArea {
  slug: string;
  name: string;
  summary: string;
  description: string;
}

export const RESEARCH_AREAS: ResearchArea[] = [
  {
    slug: "immunogenomics",
    name: "Immunogenomics",
    summary: "Genomic and immune profiling of the skull base tumor microenvironment.",
    description:
      "The lab applies genomic and immune profiling approaches to understand how skull base and brain tumors interact with, and are shaped by, the immune system. This work aims to identify molecular features of the tumor microenvironment that inform prognosis and open new avenues for immune-based treatment.",
  },
  {
    slug: "imaging",
    name: "Imaging",
    summary: "Advanced imaging modalities to improve the safety of skull base surgery.",
    description:
      "The lab develops and evaluates advanced imaging modalities aimed at improving the safety and precision of skull base surgery, helping surgeons better visualize critical anatomy before and during an operation.",
  },
  {
    slug: "intraoperative-neuromonitoring",
    name: "Intraoperative Neuromonitoring",
    summary: "Real-time neurophysiological monitoring and training during neurosurgery.",
    description:
      "The lab studies intraoperative neuromonitoring, including the development of interactive training modules, to support real-time detection of neurological risk during neurosurgical procedures and improve how monitoring teams and surgeons are trained.",
  },
  {
    slug: "outcomes",
    name: "Outcomes",
    summary: "Clinical outcomes research across meningiomas, pituitary tumors, schwannomas, and brain metastases.",
    description:
      "The lab conducts outcomes research across the major tumor types treated at the skull base, including meningiomas, pituitary tumors, schwannomas, and brain metastases, to better understand what drives long-term results for patients and how care can be improved.",
  },
];

export interface TeamMember {
  name: string;
  title: string;
}

export const PRINCIPAL_INVESTIGATOR: TeamMember = {
  name: "Wenya Linda Bi, MD, PhD",
  title: "Associate Professor of Neurosurgery, Brigham and Women's Hospital, Harvard Medical School",
};

export const CURRENT_MEMBERS: TeamMember[] = [
  { name: "Mitali Bose, MS, CNIM", title: "Senior Surgical Neurophysiologist" },
  { name: "Matthew Toczylowski, BS, CNIM", title: "Surgical Neurophysiologist, Clinical Manager, SpecialtyCare Boston" },
  { name: "Gabrielle Luiselli, MD", title: "Neurosurgery Resident" },
  { name: "Ruchit Patel, BS", title: "Neurosurgery Resident" },
  { name: "Junpeng Ma, MD, PhD", title: "Lab Member" },
  { name: "Erickson Torio, MD", title: "Lab Member" },
  { name: "Andrew Dunbar, BS", title: "MD Candidate" },
  { name: "Zach Moynihan, BS", title: "Research Assistant" },
];

export const ALUMNI: string[] = [
  "Sally Al Abdulmohsen",
  "Noah Greenwald",
  "Xiaopeng Guo",
  "Saksham Gupta, MD (Neurosurgery Resident)",
  "Adwaid Prakash",
  "Addy Vettel",
  "Eleanor Woodward, BS (Research Assistant)",
  "Kyle Wu, MD (Post-doctoral Fellow / Neurosurgery Resident)",
  "Shun Yao, MD, PhD (Research Fellow)",
  "Samantha Hoffman, BS (MD Candidate)",
  "Greg Cello, BS (Master's Candidate & Research Coordinator)",
  "Pinky Langat, PhD (MD Candidate)",
  "Joseph Driver, MD (Post-doctoral Fellow / Neurosurgery Resident)",
  "Xian Marie Boles, BFA (MFA Candidate)",
  "Lilin Tong, MD (Medical Intern)",
  "Hia Ghosh, BS (Research Assistant)",
];

export interface Publication {
  title: string;
  authors: string;
  journal: string;
  date: string;
  pmid?: string;
}

// A representative recent-years slice, not the full historical archive.
// The original site links out to a "Full list on PubMed" for anything
// older; this site does the same rather than trying to mirror decades of
// entries by hand.
export const PUBLICATIONS: Publication[] = [
  {
    title: "Skull Base Tumors: Neuropathology and Clinical Implications",
    authors: "Bi WL, Santagata S",
    journal: "Neurosurgery",
    date: "2021 Jun",
  },
];

export const PUBMED_URL = "https://pubmed.ncbi.nlm.nih.gov/?term=Bi+WL%5Bauthor%5D";

export const CONTACT = {
  labName: "Bi Lab, Skull Base Tumor Laboratory",
  address: "60 Fenwood Road, Boston, MA 02115",
  phones: ["617-525-8319", "617-713-3050"],
  email: "wbi@bwh.harvard.edu",
};
