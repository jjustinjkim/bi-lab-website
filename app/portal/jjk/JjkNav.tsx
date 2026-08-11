'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const JJK_TABS = [
  { href: '/portal/jjk', label: 'Home', exact: true },
  { href: '/portal/jjk/ideas', label: 'Big Ideas' },
  { href: '/portal/jjk/projects', label: 'Projects' },
  { href: '/portal/jjk/presentations', label: 'Presentations' },
]

// This section's own sub-nav, separate from the shared PortalNav one level
// up (which only carries a single "JJK Research Progress" link into here).
// Sticky under the same --portal-sticky-stack offset PortalNav publishes,
// so it stacks below the site header + portal nav instead of overlapping.
export default function JjkNav() {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav
      className="sticky z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-6"
      style={{ top: 'var(--portal-sticky-stack, 10.4rem)', background: 'var(--paper)', borderBottom: '1px solid var(--hairline)' }}
    >
      <div className="flex items-center h-14 gap-2 overflow-x-auto">
        <span className="text-sm font-bold whitespace-nowrap mr-2">JJK</span>
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
    </nav>
  )
}
