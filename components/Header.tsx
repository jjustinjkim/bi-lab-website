"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/research", label: "Research" },
  { href: "/team", label: "Team" },
  { href: "/publications", label: "Publications" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-20 backdrop-blur"
      style={{ borderBottom: "1px solid var(--hairline-strong)", background: "color-mix(in srgb, var(--background) 92%, transparent)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center gap-x-8 gap-y-2">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>
            BI LAB
          </span>
          <span className="text-caption" style={{ fontSize: "0.6875rem" }}>
            Skull Base Tumor Laboratory
          </span>
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm ml-auto" style={{ color: "var(--ink-muted)" }}>
          {NAV.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="hover:opacity-100 transition-opacity"
                style={{
                  opacity: isActive ? 1 : 0.85,
                  color: isActive ? "var(--accent-ink)" : undefined,
                  fontWeight: isActive ? 600 : undefined,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/portal"
          className="text-sm font-semibold"
          style={{ color: "var(--accent-ink)" }}
        >
          Lab Portal
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
