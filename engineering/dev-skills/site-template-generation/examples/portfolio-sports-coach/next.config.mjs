/** @type {import('next').NextConfig} */
const nextConfig = {
  // This example lives inside a repository whose agent entry point is its own
  // AGENTS.md. A generated one per template would contradict it, and rule 6
  // forbids tracking local agent configuration at all.
  agentRules: false,
  // Not a static export. The back office writes the content file, stores the
  // uploads and holds the messages, so the site needs a server process:
  // `npm run build` then `npm start`.
  //
  // For a container, add `output: 'standalone'` and copy `.next/static` and
  // `public` next to `.next/standalone/server.js`, which is the deployment note
  // in the README. It is left out here so that `npm start` works as it reads.
  // The headers that do not change per request. The content security policy is
  // not here: it carries a nonce and is set by the middleware.
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
          {
            // Only meaningful over https, and harmless otherwise. A deployment
            // that terminates TLS in front must not strip it.
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
      {
        // The back office is never cached, by a browser or by anything between.
        source: '/admin/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
    ];
  },
  images: {
    // Uploaded media is served by the /media route from the data directory,
    // which is a stream the optimizer has no advantage over here.
    unoptimized: true,
  },
};

export default nextConfig;
