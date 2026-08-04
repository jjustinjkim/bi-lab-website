import { PRINCIPAL_INVESTIGATOR, CURRENT_MEMBERS, ALUMNI, type TeamMember } from "@/lib/content";

function initials(name: string): string {
  return name
    .split(",")[0]
    .split(" ")
    .filter((w) => w.length && /[A-Za-z]/.test(w[0]))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="panel p-5 flex items-start gap-4">
      <div className="avatar-placeholder w-12 h-12 text-sm">{initials(member.name)}</div>
      <div>
        <div className="text-subtitle" style={{ fontSize: "1rem" }}>
          {member.name}
        </div>
        <div className="text-sm mt-0.5" style={{ color: "var(--ink-muted)" }}>
          {member.title}
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 space-y-14">
      <div className="max-w-2xl">
        <h1 className="text-display">Team</h1>
      </div>

      <section>
        <h2 className="text-caption uppercase tracking-wide font-semibold mb-4">Principal Investigator</h2>
        <MemberCard member={PRINCIPAL_INVESTIGATOR} />
      </section>

      <section>
        <h2 className="text-caption uppercase tracking-wide font-semibold mb-4">Personnel</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {CURRENT_MEMBERS.map((m) => (
            <MemberCard key={m.name} member={m} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-caption uppercase tracking-wide font-semibold mb-4">Alumni</h2>
        <div className="panel p-5">
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            {ALUMNI.join(", ")}
          </p>
        </div>
      </section>
    </div>
  );
}
