'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/actions'
import { isStaleServerActionError } from '@/lib/callAction'

const BASE_NAV_LINKS = [
  { href: '/portal', label: 'Dashboard', exact: true },
  { href: '/portal/projects', label: 'Projects' },
  { href: '/portal/tasks', label: 'Tasks', exact: true },
  { href: '/portal/deadlines', label: 'Deadlines', exact: true },
  { href: '/portal/datasets', label: 'Datasets', exact: true },
]

const ADMIN_NAV_LINKS = [{ href: '/portal/members', label: 'Members', exact: true }]

export default function PortalNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const navLinks = isAdmin ? [...BASE_NAV_LINKS, ...ADMIN_NAV_LINKS] : BASE_NAV_LINKS

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  async function handleLogout(e: React.FormEvent) {
    e.preventDefault()
    try {
      await logout()
    } catch (err) {
      if (isStaleServerActionError(err)) {
        window.location.href = '/portal/login'
        return
      }
      throw err
    }
  }

  return (
    <nav style={{ background: 'var(--accent-ink)' }} className="sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-1 sm:gap-2 overflow-x-auto">
          <Link href="/portal" className="text-sm font-semibold text-white mr-4 whitespace-nowrap">
            Bi Lab Portal
          </Link>
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
          <form onSubmit={handleLogout} className="ml-auto">
            <button type="submit" className="text-sm whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
