import type { InstanceContent, SiteInstance } from '../lib/site-instance';

// GET /robots.txt, from the instance's own content file.
export function robotsRoute<C extends InstanceContent>(instance: SiteInstance<C>) {
  // Generated from the content file like everything else, so an instance that
  // changes its address does not keep pointing a crawler at the old one. The back
  // office and the endpoints are not for crawlers, and saying so costs nothing.
  async function GET() {
    const content = instance.getContent();
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

  return { GET };
}
