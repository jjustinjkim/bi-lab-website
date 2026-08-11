import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const memberToken = request.cookies.get('bilab_portal_session')?.value

  // Lightweight presence check only -- the actual token is validated against
  // member_sessions server-side by getSessionMember()/requireMember() on
  // every page and server action that touches the database. This also
  // covers /portal/jjk/* -- that section rides on the same lab-member
  // login now (see lib/jjkAccess.ts for the further email-allowlist check
  // it layers on top, done at the page/layout level, not here).
  if (pathname.startsWith('/portal') && pathname !== '/portal/login') {
    if (!memberToken) {
      return NextResponse.redirect(new URL('/portal/login', request.url))
    }
    return NextResponse.next()
  }

  // The inventory (Meningioma Dataset Registry) moved behind the portal
  // login. app/inventory/layout.tsx does the real per-request auth check
  // (isMemberSession()) for the pages themselves, same division of labor as
  // /portal above -- but /pilot-data/*.json (the gene-expression viewer's
  // raw data, served as plain static files under public/) has no page/layout
  // to run that check in at all, so it's gated here directly instead, or a
  // logged-out visitor could still fetch the underlying data straight from
  // its URL even with every /inventory page correctly redirecting to login.
  if (pathname.startsWith('/inventory') || pathname.startsWith('/pilot-data')) {
    if (!memberToken) {
      return NextResponse.redirect(new URL('/portal/login', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/portal/:path*', '/inventory/:path*', '/pilot-data/:path*'],
}
