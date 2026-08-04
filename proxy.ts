import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const memberToken = request.cookies.get('bilab_portal_session')?.value

  // Lightweight presence check only -- the actual token is validated against
  // member_sessions server-side by getSessionMember()/requireMember() on
  // every page and server action that touches the database.
  if (pathname.startsWith('/portal') && pathname !== '/portal/login') {
    if (!memberToken) {
      return NextResponse.redirect(new URL('/portal/login', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/portal/:path*'],
}
