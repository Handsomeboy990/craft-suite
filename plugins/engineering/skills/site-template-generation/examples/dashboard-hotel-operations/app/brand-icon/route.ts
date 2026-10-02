import { getConfig } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// The tab and installed icon, drawn from the configuration: the accent of the
// light palette and the first letter of the short name. Values are validated
// on write; the letter is escaped here.
export function GET() {
  const config = getConfig();
  const palette = config.theme.palettes.light;
  const letter = (config.site.shortName.trim()[0] ?? '').replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${palette.accent}"/><text x="32" y="43" font-family="sans-serif" font-size="34" font-weight="700" text-anchor="middle" fill="${palette.accentForeground}">${letter}</text></svg>`;
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600', 'X-Content-Type-Options': 'nosniff' },
  });
}
