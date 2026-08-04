import Image from "next/image";
import { CONTACT } from "@/lib/content";

function HomeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.75" aria-hidden="true">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent)" aria-hidden="true">
      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.3 11.3 0 003.55.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.3 11.3 0 00.57 3.55 1 1 0 01-.25 1.01l-2.2 2.23z" />
    </svg>
  );
}

function FaxIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.75" aria-hidden="true">
      <path d="M6 3h9l3 3v4H6z" />
      <path d="M6 10H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
      <path d="M18 10h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2" />
      <rect x="6" y="14" width="12" height="7" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.75" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <div>
      <a
        href={CONTACT.supportUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center py-6 text-white font-semibold uppercase tracking-wide hover:opacity-90"
        style={{ background: "var(--accent)", fontSize: "1.25rem" }}
      >
        Please Support Our Research
      </a>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 space-y-14">
        <div className="grid sm:grid-cols-2 gap-10 items-start">
          <div>
            <h1 className="text-title mb-3" style={{ color: "var(--accent-ink)" }}>
              {CONTACT.piTitles[0]}
            </h1>
            <div style={{ color: "var(--ink-muted)" }}>
              {CONTACT.piTitles.slice(1).map((t) => (
                <div key={t}>{t}</div>
              ))}
            </div>
          </div>
          <Image
            src={CONTACT.buildingImage}
            alt="Brigham and Women's Hospital"
            width={1024}
            height={681}
            className="w-full h-auto rounded"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <HomeIcon />
            <div className="text-sm">
              {CONTACT.address[0]}
              <br />
              {CONTACT.address[1]}
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <PhoneIcon />
            <div className="text-sm">{CONTACT.phone}</div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <FaxIcon />
            <div className="text-sm">{CONTACT.fax}</div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <MailIcon />
            <a href={`mailto:${CONTACT.email}`} className="link-accent text-sm">
              {CONTACT.email}
            </a>
          </div>
        </div>

        <iframe
          src={CONTACT.mapEmbedUrl}
          width="100%"
          height="450"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Map to 60 Fenwood Road, Boston, MA 02115"
        />
      </div>
    </div>
  );
}
