"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { PhoneIcon, MailIcon } from "@/components/icons";
import { RESEARCH_AREAS, CONTACT } from "@/lib/content";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/research", label: "Research" },
  { href: "/team", label: "Team" },
  { href: "/publications", label: "Publications" },
  { href: "/contact", label: "Contact" },
];

function ChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className="inline-block ml-1">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SearchIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function MenuIcon({ open, color }: { open: boolean; color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [researchOpen, setResearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navTextColor = "var(--ink)";

  useEffect(() => {
    // Closes the mobile menu on navigation -- pathname is an external signal
    // (the router), not derived render state, so syncing to it here is the
    // correct use of an effect despite the lint rule's general guidance.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20" style={{ background: "var(--paper)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-1.5 flex justify-end gap-5 text-xs" style={{ color: "var(--ink-muted)", borderBottom: "1px solid var(--hairline)" }}>
        <span className="hidden sm:flex items-center gap-1.5">
          <PhoneIcon size={11} />
          617-525-8319
        </span>
        <a href={`mailto:${CONTACT.email}`} className="link-accent flex items-center gap-1.5">
          <MailIcon size={12} />
          {CONTACT.email}
        </a>
      </div>

      <div className="relative w-full" style={{ borderBottom: "1px solid var(--hairline)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-x-10">
          <Link href="/" className="flex items-center">
            <Image src="/brand/bwh-logo-header.png" alt="Bi Lab" width={280} height={32} priority />
          </Link>

          <nav className="hidden xl:flex flex-wrap items-center gap-x-5 gap-y-2 ml-auto">
            {NAV.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              if (item.href === "/research") {
                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setResearchOpen(true)}
                    onMouseLeave={() => setResearchOpen(false)}
                  >
                    <Link
                      href="/research"
                      className="site-nav-link"
                      data-active={isActive || undefined}
                      style={{ fontSize: "0.875rem", color: isActive ? "var(--accent)" : navTextColor }}
                    >
                      Research
                      <ChevronIcon />
                    </Link>
                    {researchOpen && (
                      <div className="absolute top-full left-0 pt-3" style={{ minWidth: "260px" }}>
                        <div className="panel py-2">
                          {RESEARCH_AREAS.map((area) => (
                            <Link
                              key={area.anchor}
                              href={`/research#${area.anchor}`}
                              className="block px-4 py-2 text-sm site-nav-link normal-case"
                              style={{ letterSpacing: "normal", fontWeight: 500 }}
                            >
                              {area.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="site-nav-link"
                  data-active={isActive || undefined}
                  style={{ fontSize: "0.875rem", color: isActive ? "var(--accent)" : navTextColor }}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link href="/portal" className="site-nav-link" style={{ color: "var(--accent)", fontSize: "0.875rem" }}>
              Lab Portal
            </Link>
            <Link href="/search" aria-label="Search" className="flex items-center">
              <SearchIcon color={navTextColor} />
            </Link>
            <ThemeToggle />
          </nav>

          <button
            type="button"
            className="xl:hidden ml-auto w-9 h-9 flex items-center justify-center rounded-md flex-shrink-0"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <MenuIcon open={menuOpen} color={navTextColor} />
          </button>
        </div>

        {menuOpen && (
          <div
            className="xl:hidden absolute top-full left-0 right-0 z-20"
            style={{ background: "var(--paper)", borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)", boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
          >
            <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col">
              {NAV.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      className="site-nav-link block py-2.5"
                      data-active={isActive || undefined}
                      style={{ fontSize: "0.875rem" }}
                    >
                      {item.label}
                    </Link>
                    {item.href === "/research" && (
                      <div className="pl-4 pb-1 flex flex-col">
                        {RESEARCH_AREAS.map((area) => (
                          <a key={area.anchor} href={`/research#${area.anchor}`} className="site-nav-link normal-case py-1.5 text-sm" style={{ letterSpacing: "normal", fontWeight: 500 }}>
                            {area.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <Link href="/portal" className="site-nav-link py-2.5" style={{ color: "var(--accent)", fontSize: "0.875rem" }}>
                Lab Portal
              </Link>
              <Link href="/search" className="site-nav-link py-2.5" style={{ fontSize: "0.875rem" }}>
                Search
              </Link>
              <div className="pt-2">
                <ThemeToggle />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
