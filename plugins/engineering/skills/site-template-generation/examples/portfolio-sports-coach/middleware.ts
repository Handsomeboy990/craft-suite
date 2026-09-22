import { NextResponse, type NextRequest } from 'next/server';

// Two jobs, both cheap enough for the edge.
//
// The first is a convenience redirect: this runtime cannot read the session
// store, so it only checks that a cookie exists. Every admin page and every
// admin endpoint verifies the session on the server, which is where access
// control actually lives.
//
// The second is the content security policy. It carries a fresh nonce on every
// request, and the layout puts that nonce on the two inline elements the site
// needs. Anything else that ends up inside a script tag, however it got there,
// does not run.
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const https = (request.headers.get('x-forwarded-proto') ?? '').split(',')[0]?.trim() === 'https';

  const policy = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self'",
    "connect-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    // The template writes custom properties into style attributes, which carry
    // values and cannot execute anything. Stylesheets stay locked.
    "style-src-attr 'unsafe-inline'",
    https ? 'upgrade-insecure-requests' : '',
  ]
    .filter(Boolean)
    .join('; ');

  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);

  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !request.cookies.get('session')) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = `?next=${encodeURIComponent(pathname)}`;
    const redirect = NextResponse.redirect(url);
    redirect.headers.set('Content-Security-Policy', policy);
    return redirect;
  }

  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', policy);
  return response;
}

export const config = {
  matcher: [
    // Everything a person navigates to, which is where a policy matters. The
    // static chunks and the uploaded media carry their own headers.
    { source: '/((?!_next/static|_next/image|favicon.ico).*)' },
  ],
};
