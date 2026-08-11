import { redirect } from 'next/navigation'
import { hasJjkAccess } from '@/lib/jjkAccess'
import JjkNav from './JjkNav'

// No separate Toaster here -- this section rides on the same lab-member
// login as the rest of /portal, so app/portal/layout.tsx's Toaster already
// wraps this. JjkNav is this section's own sub-nav (Home/Big Ideas/
// Projects/Presentations), separate from the shared PortalNav one level up,
// which only carries a single link into here. Access check: bounce anyone
// who isn't Justin or Dr. Bi back to the main portal.
export default async function JjkLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasJjkAccess())) redirect('/portal')
  return (
    <>
      <JjkNav />
      {children}
    </>
  )
}
