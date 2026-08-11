import { redirect } from 'next/navigation'
import { hasJjkAccess } from '@/lib/jjkAccess'

// No separate nav/Toaster here anymore -- this section now rides on the
// same lab-member login as the rest of /portal, so app/portal/layout.tsx's
// PortalNav (with the JJK tab, gated by isJjkAllowedEmail) and Toaster
// already wrap this. Only job left here is to bounce anyone who isn't
// Justin or Dr. Bi back to the main portal.
export default async function JjkLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasJjkAccess())) redirect('/portal')
  return <>{children}</>
}
