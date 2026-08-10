import Image from "next/image";
import Link from "next/link";
import { PhoneIcon, MailIcon, FaxIcon } from "@/components/icons";
import { CONTACT, RESEARCH_AREAS } from "@/lib/content";

const BROWSE = [
  { href: "/", label: "Home" },
  { href: "/team", label: "Team" },
  { href: "/publications", label: "Select publications" },
  { href: "/support", label: "Support" },
  { href: "/contact", label: "Contact" },
];

const PARTNERS = [
  { href: "https://www.massgeneralbrigham.org", src: "/brand/mgb-logo.png", alt: "Mass General Brigham", w: 200, h: 34 },
  { href: "https://hms.harvard.edu/research", src: "/brand/hms-logo.png", alt: "Harvard Medical School", w: 180, h: 47 },
];

function MapPinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer w-full mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-3 gap-10">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "white" }}>
            Browse
          </div>
          <ul className="text-sm">
            <li className="footer-list-item">
              <Link href="/" className="uppercase">
                Home
              </Link>
            </li>
            <li className="footer-list-item">
              <Link href="/research" className="uppercase">
                Research
              </Link>
              <ul className="mt-2 ml-4 space-y-2 mb-2">
                {RESEARCH_AREAS.map((area) => (
                  <li key={area.anchor}>
                    <a href={`/research#${area.anchor}`} className="uppercase text-xs">
                      {area.name}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
            {BROWSE.slice(1).map((item) => (
              <li key={item.href} className="footer-list-item">
                <Link href={item.href} className="uppercase">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-4 font-bold" style={{ color: "white", fontSize: "1.125rem" }}>
            {CONTACT.labName}
          </div>
          <ul className="text-sm space-y-3">
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5"><MapPinIcon /></span>
              <span>
                {CONTACT.address[0]}
                <br />
                {CONTACT.address[1]}
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <PhoneIcon size={13} />
              {CONTACT.phone}
            </li>
            <li className="flex items-center gap-2.5">
              <FaxIcon size={13} />
              {CONTACT.fax}
            </li>
            <li className="flex items-center gap-2.5">
              <MailIcon size={13} />
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-5 sm:items-end">
          {PARTNERS.map((p) => (
            <a key={p.src} href={p.href} target="_blank" rel="noopener noreferrer">
              <Image src={p.src} alt={p.alt} width={p.w} height={p.h} style={{ height: "auto", width: `${p.w}px`, maxWidth: "100%" }} />
            </a>
          ))}
        </div>
      </div>
      <div className="py-3 text-center text-xs" style={{ background: "var(--accent)", color: "white" }}>
        Copyright <strong>BI LAB</strong> {new Date().getFullYear()} &ndash; All Rights Reserved |{" "}
        <Link href="/privacy" style={{ color: "white", textDecoration: "underline" }}>
          PRIVACY POLICY
        </Link>
      </div>
    </footer>
  );
}
