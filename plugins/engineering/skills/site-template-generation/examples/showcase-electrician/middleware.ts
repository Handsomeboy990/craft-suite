import { NextResponse, type NextRequest } from 'next/server';

// A convenience redirect only. The middleware runs on the edge runtime and
// cannot read the session store, so it checks nothing more than the presence of
// a cookie. Every admin page and every admin endpoint verifies the session on
// the server, which is where access control actually lives.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/admin/login') return NextResponse.next();

  if (!request.cookies.get('session')) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
