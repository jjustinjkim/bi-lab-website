import Link from "next/link";
import { PRINCIPAL_INVESTIGATOR, CURRENT_MEMBERS, ALUMNI } from "@/lib/content";

interface TeamLink {
  lastName: string;
  firstInitial: string;
  href: string;
}

function nameToLink(fullName: string, href: string): TeamLink | null {
  const namePart = fullName.split(",")[0].trim();
  const words = namePart.split(/\s+/);
  if (words.length < 2) return null;
  return { lastName: words[words.length - 1], firstInitial: words[0][0], href };
}

const TEAM_LINKS: TeamLink[] = [
  nameToLink(PRINCIPAL_INVESTIGATOR.name, "/team#pi"),
  ...[...CURRENT_MEMBERS, ...ALUMNI]
    .filter((m) => m.slug)
    .map((m) => nameToLink(m.name, `/team/${m.slug}`)),
].filter((l): l is TeamLink => l !== null);

// Citation author tokens look like "Bi WL" or "Al-Mefty O" or "Gonzalez Castro LN":
// everything but the trailing initials block is the last name.
function findLink(token: string): string | undefined {
  const parts = token.trim().split(/\s+/);
  if (parts.length < 2) return undefined;
  const initials = parts[parts.length - 1];
  const lastName = parts.slice(0, -1).join(" ");
  const match = TEAM_LINKS.find(
    (l) =>
      l.lastName.toLowerCase() === lastName.toLowerCase() &&
      initials.toUpperCase().startsWith(l.firstInitial.toUpperCase())
  );
  return match?.href;
}

// Renders a comma-separated citation author string ("Bi WL, Santagata S"),
// linking any name that matches a team member with a bio page or the PI.
export default function AuthorList({ authors }: { authors: string }) {
  const tokens = authors.split(", ");
  return (
    <>
      {tokens.map((token, i) => {
        const href = findLink(token);
        return (
          <span key={`${token}-${i}`}>
            {href ? (
              <Link href={href} className="link-accent">
                {token}
              </Link>
            ) : (
              token
            )}
            {i < tokens.length - 1 ? ", " : ""}
          </span>
        );
      })}
    </>
  );
}
