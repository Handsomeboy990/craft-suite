import { getContent } from '@/lib/content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Every page this instance actually serves, and no page it does not. Both the
// declared pages and the legal slugs come from the content file, so an instance
// that adds one is listed without anyone remembering to update a list.
export async function GET() {
  const content = getContent();
  const origin = content.site.baseUrl.replace(/\/$/, '');
  const today = new Date().toISOString().slice(0, 10);

  const routes = [
    ...content.pages.map((page) => page.href),
    ...content.legal.pages.map((page) => `/legal/${page.slug}`),
  ];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...routes.map((route) =>
      [
        '  <url>',
        `    <loc>${origin}${route === '/' ? '' : route}${route === '/' ? '/' : ''}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        `    <priority>${route === '/' ? '1.0' : route.startsWith('/legal/') ? '0.3' : '0.7'}</priority>`,
        '  </url>',
      ].join('\n'),
    ),
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
