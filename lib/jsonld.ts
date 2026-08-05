import { CONTACT, PRINCIPAL_INVESTIGATOR, type FeaturedPublication, type TeamMember } from "./content";

const BASE_URL = "https://wlbilab.org";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: CONTACT.labName,
    alternateName: "Bi Lab",
    url: BASE_URL,
    logo: `${BASE_URL}/icon.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.address[0],
      addressLocality: "Boston",
      addressRegion: "MA",
      postalCode: "02115",
      addressCountry: "US",
    },
    telephone: CONTACT.phone,
    email: `mailto:${CONTACT.email}`,
    parentOrganization: {
      "@type": "Hospital",
      name: "Brigham and Women's Hospital",
    },
    founder: {
      "@type": "Person",
      name: PRINCIPAL_INVESTIGATOR.name,
      jobTitle: PRINCIPAL_INVESTIGATOR.titles[0],
      url: `${BASE_URL}/team`,
    },
  };
}

export function scholarlyArticleJsonLd(pub: FeaturedPublication) {
  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: pub.title,
    abstract: pub.excerpt,
    datePublished: pub.date,
    url: `${BASE_URL}/publications/${pub.slug}`,
    image: `${BASE_URL}${pub.image}`,
    isPartOf: {
      "@type": "Periodical",
      name: pub.journal,
    },
    sameAs: pub.journalUrl,
    author: {
      "@type": "Person",
      name: PRINCIPAL_INVESTIGATOR.name,
      url: `${BASE_URL}/team`,
    },
    publisher: organizationJsonLd(),
  };
}

export function personJsonLd(member: TeamMember) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    ...(member.role ? { jobTitle: member.role } : {}),
    ...(member.image ? { image: `${BASE_URL}${member.image}` } : {}),
    ...(member.bio ? { description: member.bio.join(" ") } : {}),
    url: `${BASE_URL}/team/${member.slug}`,
    affiliation: {
      "@type": "Organization",
      name: CONTACT.labName,
      url: BASE_URL,
    },
  };
}

export function jsonLdScriptProps(data: object) {
  return { dangerouslySetInnerHTML: { __html: JSON.stringify(data) } };
}
