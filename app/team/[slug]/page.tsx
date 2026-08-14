import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CURRENT_MEMBERS, COLLABORATORS, ALUMNI, type TeamMember } from "@/lib/content";
import { personJsonLd, jsonLdScriptProps } from "@/lib/jsonld";

const ALL_MEMBERS: TeamMember[] = [...CURRENT_MEMBERS, ...COLLABORATORS, ...ALUMNI];

function findMember(slug: string): TeamMember | undefined {
  return ALL_MEMBERS.find((m) => m.slug === slug);
}

export function generateStaticParams() {
  return ALL_MEMBERS.filter((m) => m.slug).map((m) => ({ slug: m.slug! }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = findMember(slug);
  if (!member) return {};
  const title = member.name;
  const description = member.bio?.[0] ?? member.role;
  return {
    title,
    description,
    alternates: { canonical: `/team/${slug}` },
    // Falls back to the root layout's site-wide OG image (a generic Bi Lab
    // card) without this -- a member's own headshot is a much more useful
    // preview when their profile link gets shared.
    ...(member.image && {
      openGraph: { title, description, type: "profile", images: [member.image] },
      twitter: { card: "summary", title, description, images: [member.image] },
    }),
  };
}

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = findMember(slug);
  if (!member) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 space-y-8">
      <script type="application/ld+json" {...jsonLdScriptProps(personJsonLd(member))} />

      <Link href="/team" className="link-accent text-sm">
        &larr; Team
      </Link>

      <div className="flex flex-col sm:flex-row gap-8 items-start">
        {member.image && (
          <Image
            src={member.image}
            alt={member.name}
            width={200}
            height={200}
            className="rounded-full"
            style={{ border: "1px solid var(--hairline)" }}
          />
        )}
        <div>
          <h1 className="text-title">{member.name}</h1>
          {member.role && (
            <p className="mt-1" style={{ color: "var(--ink-muted)" }}>
              {member.role}
            </p>
          )}
        </div>
      </div>

      {member.bio && member.bio.length > 0 && (
        <div className="space-y-4" style={{ color: "var(--ink-muted)" }}>
          {member.bio.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      )}

      {member.degrees && member.degrees.length > 0 && (
        <div>
          <h2 className="field-label mb-2">{member.degrees.length > 1 ? "Degrees" : "Degree"}</h2>
          <ul className="text-sm space-y-1" style={{ color: "var(--ink-muted)" }}>
            {member.degrees.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
