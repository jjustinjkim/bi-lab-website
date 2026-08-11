'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const JJK_TABS = [
  { href: '/portal/jjk', label: 'Home', exact: true },
  { href: '/portal/jjk/ideas', label: 'Ideas' },
  { href: '/portal/jjk/projects', label: 'Projects' },
  { href: '/portal/jjk/presentations', label: 'Presentations' },
]

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  )
}

// This section's own sub-nav, separate from the shared PortalNav one level
// up (which only carries a single "JJK" link into here). Sticky under the
// same --portal-sticky-stack offset PortalNav publishes, so it stacks below
// the site header + portal nav instead of overlapping. Below md, collapses
// to a hamburger the same way PortalNav itself does -- a bare
// overflow-x-auto pill row got uncomfortably cramped at phone width with
// this many tabs, so it gets the same treatment rather than a half fix.
export default function JjkNav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false)
  }, [pathname])

  return (
    <nav
      className="sticky z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-6"
      style={{ top: 'var(--portal-sticky-stack, 10.4rem)', background: 'var(--paper)', borderBottom: '1px solid var(--hairline)' }}
    >
      <div className="flex items-center h-14 gap-2">
        <span className="text-sm font-bold whitespace-nowrap mr-2">JJK</span>

        <div className="hidden sm:flex items-center gap-2 overflow-x-auto">
          {JJK_TABS.map((tab) => {
            const active = isActive(tab.href, tab.exact)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors"
                style={{
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? 'white' : 'var(--ink-muted)',
                  border: active ? '2px solid var(--accent)' : '1px solid transparent',
                }}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        <button
          type="button"
          className="sm:hidden ml-auto w-9 h-9 flex items-center justify-center rounded-md"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close JJK menu' : 'Open JJK menu'}
          aria-expanded={mobileOpen}
          style={{ color: 'var(--ink-muted)' }}
        >
          <MenuIcon open={mobileOpen} />
        </button>
      </div>

      {mobileOpen && (
        <div className="sm:hidden pb-3 flex flex-wrap gap-2">
          {JJK_TABS.map((tab) => {
            const active = isActive(tab.href, tab.exact)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors"
                style={{
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? 'white' : 'var(--ink-muted)',
                  border: active ? '2px solid var(--accent)' : '1px solid var(--hairline-strong)',
                }}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
