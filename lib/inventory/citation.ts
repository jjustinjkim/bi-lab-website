import { Publication } from "@/lib/inventory/data";

// PubMed-style author strings are "Surname Initials", optionally followed by
// a generational suffix ("Bayley JC 5th", "Ferreira M Jr"). Strip both the
// initials and, when present, the suffix, so the surname alone remains.
const NAME_SUFFIXES = new Set([
  "jr", "jr.", "sr", "sr.", "ii", "iii", "iv", "v", "2nd", "3rd", "4th", "5th", "6th",
]);

function surname(authorName: string): string {
  let parts = authorName.trim().split(/\s+/);
  if (parts.length <= 1) return authorName.trim();
  const last = parts[parts.length - 1].toLowerCase().replace(/\.$/, "");
  if (parts.length > 2 && NAME_SUFFIXES.has(last)) {
    parts = parts.slice(0, -1);
  }
  return parts.slice(0, -1).join(" ");
}

// A compact "Author et al., Year" style identifier for a dataset record,
// derived from its first (primary) linked publication. Used anywhere a
// dataset needs to be identified at a glance without showing the full
// publication list.
export function citationLabel(publications: Publication[]): string {
  const pub = publications[0];
  if (!pub) return "No linked publication";

  const authors = pub.authors || [];
  const year = pub.year ? String(pub.year) : null;

  let authorPart: string;
  if (authors.length === 0) {
    authorPart = pub.venue || "Unattributed";
  } else if (authors.length === 1) {
    authorPart = surname(authors[0]);
  } else if (authors.length === 2) {
    authorPart = `${surname(authors[0])} & ${surname(authors[1])}`;
  } else {
    authorPart = `${surname(authors[0])} et al.`;
  }

  return year ? `${authorPart}, ${year}` : authorPart;
}

// A single formatted citation line for a publication -- "Author, et al. Title.
// Venue, Year." -- used on the dataset detail page's Publications section so
// each entry reads as one clean sentence instead of separate title/venue/year
// lines. PMID/DOI are rendered as clickable links directly after this string
// by the caller, not embedded here.
export function fullCitation(pub: { title: string; authors: string[]; venue: string; year: number | null }): string {
  const authors = pub.authors || [];
  let authorPart: string;
  if (authors.length === 0) {
    authorPart = "";
  } else if (authors.length === 1) {
    authorPart = authors[0];
  } else {
    authorPart = `${authors[0]}, et al.`;
  }

  const parts = [authorPart, pub.title].filter(Boolean);
  let citation = parts.join(" ").trim();
  if (!citation.endsWith(".")) citation += ".";

  const venueYear = [pub.venue, pub.year ? String(pub.year) : null].filter(Boolean).join(", ");
  if (venueYear) citation += ` ${venueYear}.`;

  return citation;
}
