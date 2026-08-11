import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const memberToken = request.cookies.get('bilab_portal_session')?.value

  // The JJK research progress portal is a separate, Justin-only section
  // with its own password/session (bilab_jjk_session, see lib/jjkAuth.ts) --
  // independent of the lab-member login below. Must be checked (and return)
  // before the generic /portal check right after: without an unconditional
  // return here, /portal/jjk/login itself would fall through into that
  // branch, which only exempts the literal '/portal/login' path, and get
  // redirected there instead of being allowed to render.
  if (pathname.startsWith('/portal/jjk')) {
    if (pathname === '/portal/jjk/login') return NextResponse.next()
    const jjkToken = request.cookies.get('bilab_jjk_session')?.value
    if (!jjkToken) {
      return NextResponse.redirect(new URL('/portal/jjk/login', request.url))
    }
    return NextResponse.next()
  }

  // Lightweight presence check only -- the actual token is validated against
  // member_sessions server-side by getSessionMember()/requireMember() on
  // every page and server action that touches the database.
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
