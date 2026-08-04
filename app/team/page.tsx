import type { Metadata } from "next";
import Image from "next/image";
import { PRINCIPAL_INVESTIGATOR, CURRENT_MEMBERS, ALUMNI, type TeamMember } from "@/lib/content";

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the Bi Lab: principal investigator Wenya Linda Bi, current personnel, and lab alumni.",
};

function initials(name: string): string {
  return name
    .split(",")[0]
    .split(" ")
    .filter((w) => w.length && /[A-Za-z]/.test(w[0]))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function PhotoTile({ member }: { member: TeamMember }) {
  return (
    <div className="group relative aspect-square overflow-hidden" style={{ background: "var(--paper-raised)" }}>
      {member.image ? (
        <Image src={member.image} alt={member.name} fill sizes="200px" className="object-cover" />
      ) : (
        <div className="avatar-placeholder w-full h-full text-2xl" style={{ borderRadius: 0 }}>
          {initials(member.name)}
        </div>
      )}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "rgba(0,0,0,0.75)" }}
      >
        <div className="text-white text-sm font-semibold">{member.name}</div>
        {member.role && <div className="text-white text-xs mt-1 opacity-80 italic">{member.role}</div>}
      </div>
    </div>
  );
}

export default function TeamPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 space-y-16">
      <h1 className="text-display">Team</h1>

      <section>
        <h2 className="section-heading mb-6">Principal Investigator</h2>
        <div className="flex flex-col sm:flex-row gap-8 items-start">
          <Image
            src={PRINCIPAL_INVESTIGATOR.image}
            alt={PRINCIPAL_INVESTIGATOR.name}
            width={220}
            height={220}
            className="rounded-full"
            style={{ border: "1px solid var(--hairline)" }}
          />
          <div>
            <h3 className="text-title">{PRINCIPAL_INVESTIGATOR.name}</h3>
            <ul className="mt-3 space-y-1" style={{ color: "var(--ink-muted)" }}>
              {PRINCIPAL_INVESTIGATOR.titles.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-heading mb-6">Personnel</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
          {CURRENT_MEMBERS.map((m) => (
            <PhotoTile key={m.name} member={m} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-heading mb-6">Alumni</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-1">
          {ALUMNI.map((m) => (
            <PhotoTile key={m.name} member={m} />
          ))}
        </div>
      </section>
    </div>
  );
}
