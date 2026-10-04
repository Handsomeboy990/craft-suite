import { NextResponse, type NextRequest } from 'next/server';

// The request proxy, the Next 16 convention that replaces middleware. It always
// runs on the Node.js runtime, and its matcher below is read statically.
//
// Three jobs, none of them access control.
//
// The content security policy, with a nonce issued per request: a script that
// reaches the page some other way does not run.
//
// The full URL of the request, passed to the server components in x-url, so a
// page whose session has expired can send the user to sign in and back to the
// same list, filters intact.
//
// A convenience redirect when no session cookie exists at all. Every page and
// every endpoint checks the session and the grant on the server; this only
// saves a round trip.
const OPEN = ['/login', '/setup', '/offline', '/privacy'];

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const https = (request.headers.get('x-forwarded-proto') ?? '').split(',')[0]?.trim() === 'https';
  const dev = process.env.NODE_ENV !== 'production';

  const policy = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self'",
    "connect-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'nonce-${nonce}'${dev ? " 'unsafe-inline'" : ''}`,
    // Custom properties written into style attributes carry values and execute
    // nothing; stylesheets stay locked.
    "style-src-attr 'unsafe-inline'",
    https ? 'upgrade-insecure-requests' : '',
  ]
    .filter(Boolean)
    .join('; ');

  const { pathname, search } = request.nextUrl;
  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('x-url', `${pathname}${search}`);

  const isPage = !pathname.startsWith('/api/');
  if (isPage && !OPEN.includes(pathname) && !request.cookies.get('session')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;
    const redirect = NextResponse.redirect(url);
    redirect.headers.set('Content-Security-Policy', policy);
    return redirect;
  }

  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', policy);
  return response;
}

export const config = {
  matcher: [{ source: '/((?!_next/static|_next/image|sw.js|brand-icon|manifest.webmanifest).*)' }],
};
