'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutJjk } from '@/lib/jjkAuth'
import { isStaleServerActionError } from '@/lib/callAction'

const NAV_LINKS = [
  { href: '/portal/jjk', label: 'Home', exact: true },
  { href: '/portal/jjk/ideas', label: 'Big Ideas' },
  { href: '/portal/jjk/projects', label: 'Projects' },
  { href: '/portal/jjk/presentations', label: 'Presentations' },
]

// A local nav, not the shared PortalNav -- this section isn't shown to
// lab members at all (see lib/jjkAuth.ts), so it gets its own small bar
// rather than being folded into the member-facing nav's link list.
export default function JjkNav() {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  async function handleLogout(e: React.FormEvent) {
    e.preventDefault()
    try {
      await logoutJjk()
    } catch (err) {
      if (isStaleServerActionError(err)) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = '/portal/jjk/login'
        return
      }
      throw err
    }
  }

  return (
    <nav style={{ background: 'var(--portal-nav-bg)', top: 'var(--site-header-height, 6.9rem)' }} className="sticky z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-2">
          <Link href="/portal/jjk" className="text-sm font-semibold text-white whitespace-nowrap">
            JJK Research Progress
          </Link>
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto flex-1">
            {NAV_LINKS.map((link) => (
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
          <form onSubmit={handleLogout} className="flex-shrink-0">
            <button type="submit" className="text-sm whitespace-nowrap portal-nav-link">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
