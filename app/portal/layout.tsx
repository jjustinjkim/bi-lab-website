import { getSessionMember } from '@/lib/auth'
import PortalNav from '@/components/portal/PortalNav'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const member = await getSessionMember()

  // No session means either the login page or an expired/missing cookie --
  // either way there's nothing to gate the nav on, and the page itself
  // (via requireMember/requireAdmin) handles the actual redirect.
  if (!member) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen">
      <PortalNav isAdmin={member.is_admin} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  )
}
