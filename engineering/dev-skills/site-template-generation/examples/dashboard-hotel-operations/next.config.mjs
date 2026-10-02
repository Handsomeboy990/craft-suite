/** @type {import('next').NextConfig} */
const nextConfig = {
  // This example lives inside a repository whose agent entry point is its own
  // AGENTS.md, and rule 6 forbids tracking local agent configuration.
  agentRules: false,
  // A server process, not a static export: every record is read from the
  // database behind a session and a grant. `npm run build` then `npm start`.
  experimental: {
    // forbidden() answers a denied page with HTTP 403 rather than a redirect
    // that hides the refusal.
    authInterrupts: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
          },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
      {
        // Every response that can carry a record is no-store, in the browser
        // and in anything between. The pages are rendered per request.
        source: '/((?!_next/static|sw.js|brand-icon).*)',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
    ];
  },
};

export default nextConfig;
