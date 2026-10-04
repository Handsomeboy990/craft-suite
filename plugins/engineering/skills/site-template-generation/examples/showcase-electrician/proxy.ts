// Shared proxy: ../_shared/lib/proxy.ts, the nonce content security policy and
// the convenience redirect to the login. Next reads the matcher statically from
// this file and ignores a re-exported one, so `config` is written out here.
export { proxy } from 'site-template-shared/lib/proxy';

export const config = {
  matcher: [
    // Everything a person navigates to, which is where a policy matters. The
    // static chunks and the uploaded media carry their own headers.
    { source: '/((?!_next/static|_next/image|favicon.ico).*)' },
  ],
};
