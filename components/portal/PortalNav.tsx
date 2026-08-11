'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { logout } from '@/lib/actions'
import { isStaleServerActionError } from '@/lib/callAction'
import { TOOLS } from '@/lib/content'

const BASE_NAV_LINKS = [
  { href: '/portal', label: 'Dashboard', exact: true },
  { href: '/portal/ideation', label: 'Ideation', exact: true },
  { href: '/portal/projects', label: 'Projects' },
  { href: '/portal/grants', label: 'Grants', exact: true },
]

const ADMIN_NAV_LINKS = [{ href: '/portal/members', label: 'Members', exact: true }]

function ChevronIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className="inline-block ml-1">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  )
}

export default function PortalNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const navLinks = isAdmin ? [...BASE_NAV_LINKS, ...ADMIN_NAV_LINKS] : BASE_NAV_LINKS
  const [toolsOpen, setToolsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const toolsRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  const toolsActive = TOOLS.some((t) => isActive(t.href))

  useEffect(() => {
    // Closes on an outside click/tap -- a hover-only dropdown (the pattern
    // the main site header uses) doesn't work on touch devices, so this is
    // a click-toggle instead, which needs its own dismissal.
    function handleClick(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    // Route change (including a click on a tool link itself) always closes
    // both menus -- pathname is an external signal (the router), not
    // derived render state, so syncing to it here is the correct use of an
    // effect despite the lint rule's general guidance (same pattern as
    // Header.tsx).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToolsOpen(false)
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    // Both this nav and the main site header are `position: sticky`, and
    // this one used a hardcoded `top-0` -- which doesn't stack it below the
    // header the way normal document flow does, it makes both of them
    // independently pin to the literal top of the viewport once scrolled
    // past, so they overlap and the header (higher z-index) hides this nav
    // entirely. Measuring the header's real height and using it as this
    // nav's own sticky offset fixes that. --portal-sticky-stack (header +
    // this nav, combined) is published too, for anything that needs to
    // stick below both (e.g. the Projects page's group legend) -- a
    // hardcoded guess for that combined height is exactly what broke the
    // legend previously. Re-measures on resize and whenever either bar's
    // own size changes (e.g. the header wrapping to a second line, or this
    // nav's mobile menu opening).
    function updateOffset() {
      const headerEl = document.querySelector('header')
      const headerHeight = headerEl?.getBoundingClientRect().height ?? 0
      const navHeight = navRef.current?.getBoundingClientRect().height ?? 0
      const root = document.documentElement.style
      root.setProperty('--site-header-height', `${headerHeight}px`)
      root.setProperty('--portal-sticky-stack', `${headerHeight + navHeight}px`)
    }
    updateOffset()
    window.addEventListener('resize', updateOffset)
    const ro = new ResizeObserver(updateOffset)
    if (navRef.current) ro.observe(navRef.current)
    const headerEl = document.querySelector('header')
    if (headerEl) ro.observe(headerEl)
    return () => {
      window.removeEventListener('resize', updateOffset)
      ro.disconnect()
    }
  }, [mobileOpen])

  async function handleLogout(e: React.FormEvent) {
    e.preventDefault()
    try {
      await logout()
    } catch (err) {
      if (isStaleServerActionError(err)) {
        // A real hard navigation on purpose, not router.push() -- the
        // problem this is recovering from is a stale JS bundle still
        // referencing a Server Action ID the new deploy doesn't recognize
        // (see lib/callAction.ts), and a client-side route change would
        // keep running that same stale bundle instead of fetching fresh.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = '/portal/login'
        return
      }
      throw err
    }
  }

  return (
    <nav
      ref={navRef}
      style={{ background: 'var(--portal-nav-bg)', top: 'var(--site-header-height, 6.9rem)' }}
      className="sticky z-30"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-2">
          <Link href="/portal" className="text-sm font-semibold text-white whitespace-nowrap">
            Bi Lab Portal
          </Link>

          {/* Desktop: full horizontal bar. Below md, this can't fit even
              scrolled -- 6 nav links plus Tools/Account/Sign out squeezed
              the scrollable region down to ~50px on a phone width, hiding
              nearly all of it behind an undiscoverable horizontal scroll
              (found by actually testing at 375px, not just verifying the
              Tools dropdown fix at desktop width). Collapses to a hamburger
              menu below instead, same pattern as the main site Header. */}
          <div className="hidden md:flex items-center gap-2 min-w-0 flex-1">
            {/* Only the variable-length link list scrolls -- Tools (with
                its dropdown), Account, and Sign out stay outside this
                container. An absolutely-positioned dropdown inside an
                overflow-x-auto ancestor gets its overflow-y silently forced
                to "auto" too (browsers can't do overflow-x:auto/
                overflow-y:visible independently) and was clipping/hiding
                the panel. */}
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors"
                  style={{
                    background: isActive(link.href, link.exact) ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color: isActive(link.href, link.exact) ? 'white' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="relative flex-shrink-0" ref={toolsRef}>
              <button
                type="button"
                onClick={() => setToolsOpen((o) => !o)}
                aria-expanded={toolsOpen}
                className="px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors"
                style={{
                  background: toolsActive || toolsOpen ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: toolsActive || toolsOpen ? 'white' : 'rgba(255,255,255,0.7)',
                }}
              >
                Tools
                <ChevronIcon />
              </button>
              {toolsOpen && (
                // right-0, not left-0: Tools sits near the right end of the
                // nav bar (right before Sign out), so a left-anchored panel
                // runs off the right edge of the viewport on narrow screens.
                <div className="absolute top-full right-0 pt-2 z-40" style={{ minWidth: '220px' }}>
                  <div className="panel py-2">
                    {TOOLS.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className="block px-4 py-2 text-sm site-nav-link normal-case"
                        style={{ letterSpacing: 'normal', fontWeight: 500 }}
                      >
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-5 ml-auto flex-shrink-0">
              <Link href="/portal/account" className="text-sm whitespace-nowrap portal-nav-link">
                Account
              </Link>
              <form onSubmit={handleLogout}>
                <button type="submit" className="text-sm whitespace-nowrap portal-nav-link">
                  Sign out
                </button>
              </form>
            </div>
          </div>

          <button
            type="button"
            className="md:hidden ml-auto w-9 h-9 flex items-center justify-center rounded-md flex-shrink-0"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close portal menu' : 'Open portal menu'}
            aria-expanded={mobileOpen}
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2.5 text-sm font-medium"
                style={{ color: isActive(link.href, link.exact) ? 'white' : 'rgba(255,255,255,0.7)' }}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="text-xs uppercase tracking-wide py-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Tools</div>
              {TOOLS.map((tool) => (
                <Link key={tool.href} href={tool.href} className="block py-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {tool.name}
                </Link>
              ))}
            </div>

            <div className="mt-2 pt-2 flex flex-col" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <Link href="/portal/account" className="py-2.5 text-sm portal-nav-link">
                Account
              </Link>
              <form onSubmit={handleLogout}>
                <button type="submit" className="py-2.5 text-sm text-left w-full portal-nav-link">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
