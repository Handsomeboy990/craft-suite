import { getContent } from '@/lib/content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Generated from the content file like everything else, so an instance that
// changes its address does not keep pointing a crawler at the old one. The back
// office and the endpoints are not for crawlers, and saying so costs nothing.
export async function GET() {
  const content = getContent();
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api',
    'Disallow: /offline',
    '',
    `Sitemap: ${content.site.baseUrl.replace(/\/$/, '')}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
