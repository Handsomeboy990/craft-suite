import { getConfig } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  const config = getConfig();
  const manifest = {
    name: config.site.name,
    short_name: config.site.shortName,
    lang: config.site.locale,
    start_url: '/',
    display: 'standalone',
    background_color: config.theme.palettes.light.surface,
    theme_color: config.theme.palettes.light.accent,
    icons: [{ src: '/brand-icon', sizes: 'any', type: 'image/svg+xml' }],
  };
  return new Response(JSON.stringify(manifest), { headers: { 'Content-Type': 'application/manifest+json' } });
}
