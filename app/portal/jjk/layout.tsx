import { getJjkSession } from '@/lib/jjkAuth'
import JjkNav from './JjkNav'
import Toaster from '@/components/portal/Toaster'

export default async function JjkLayout({ children }: { children: React.ReactNode }) {
  const authed = await getJjkSession()

  // No session means either the login page or an expired/missing cookie --
  // either way there's nothing to gate the nav on, and the page itself
  // (via requireJjk(), inside lib/jjkQueries.ts/lib/jjkActions.ts) handles
  // the actual redirect. Same division of labor as app/portal/layout.tsx.
  if (!authed) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen">
      <JjkNav />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
      <Toaster />
    </div>
  )
}
