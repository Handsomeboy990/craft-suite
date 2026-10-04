import { NextResponse, type NextRequest } from 'next/server';

// The request proxy of both site examples, the Next 16 convention that replaces
// middleware. Each app's `proxy.ts` re-exports this function and declares its
// own `config`, because Next reads the matcher statically from that file and
// ignores one that is re-exported. Proxy always runs on the Node.js runtime.
//
// Two jobs.
//
// The first is a convenience redirect: it only checks that a session cookie
// exists, without reading the session store. Every admin page and every admin
// endpoint verifies the session on the server, which is where access control
// actually lives.
//
// The second is the content security policy. It carries a fresh nonce on every
// request, and the layout puts that nonce on the two inline elements the site
// needs. Anything else that ends up inside a script tag, however it got there,
// does not run.
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
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self'",
    "connect-src 'self'",
    // React's development build calls eval, and its refresh runtime injects
    // stylesheets without a nonce. Neither happens in the build a client is
    // served, so the relaxation is tied to the development server and cannot
    // reach production: NODE_ENV is fixed to production by `next build`.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'nonce-${nonce}'${dev ? " 'unsafe-inline'" : ''}`,
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
  const openToAnyone = pathname === '/admin/login' || pathname === '/admin/reset';
  if (pathname.startsWith('/admin') && !openToAnyone && !request.cookies.get('session')) {
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
