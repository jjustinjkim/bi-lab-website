import type { Metadata } from "next";
import Image from "next/image";
import { PhoneIcon, MailIcon, FaxIcon } from "@/components/icons";
import { CONTACT } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the Bi Lab: address, phone, fax, email, and how to support our research.",
};

function HomeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.75" aria-hidden="true">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
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
            <PhoneIcon size={24} color="var(--accent)" />
            <div className="text-sm">{CONTACT.phone}</div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <FaxIcon size={26} color="var(--accent)" />
            <div className="text-sm">{CONTACT.fax}</div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <MailIcon size={26} color="var(--accent)" />
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
