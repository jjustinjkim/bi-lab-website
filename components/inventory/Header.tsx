"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/inventory", label: "Overview" },
  { href: "/inventory/matched-cohorts", label: "Matched Cohorts" },
  { href: "/inventory/search", label: "Search" },
  { href: "/inventory/institutions", label: "Institutions" },
  { href: "/inventory/methodology", label: "Methodology" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [quickQuery, setQuickQuery] = useState("");

  const submitQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = quickQuery.trim();
    router.push(q ? `/inventory/search?q=${encodeURIComponent(q)}` : "/inventory/search");
  };

  return (
    <header
      className="sticky top-0 z-10 backdrop-blur"
      style={{ borderBottom: "1px solid var(--hairline-strong)", background: "color-mix(in srgb, var(--background) 92%, transparent)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-8 gap-y-2">
        <Link href="/inventory" className="text-mono text-sm font-semibold whitespace-nowrap tracking-tight">
          MENINGIOMA&nbsp;REGISTRY
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm" style={{ color: "var(--ink-muted)" }}>
          {NAV.map((item) => {
            const isActive = item.href === "/inventory" ? pathname === "/inventory" : pathname.startsWith(item.href);
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
        <form onSubmit={submitQuickSearch} className="ml-auto min-w-[160px] flex-1 max-w-[240px]">
          <input
            type="search"
            placeholder="Quick search…"
            value={quickQuery}
            onChange={(e) => setQuickQuery(e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm bg-transparent"
            style={{ border: "1px solid var(--hairline-strong)", borderRadius: 3 }}
          />
        </form>
        <Link href="/" className="text-xs whitespace-nowrap" style={{ color: "var(--ink-faint)" }}>
          &larr; Bi Lab
        </Link>
      </div>
    </header>
  );
}
