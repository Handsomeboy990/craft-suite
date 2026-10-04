import type { InstanceContent, SiteInstance } from '../lib/instance';

// GET /manifest.webmanifest, from the instance's own content file.
export function manifestRoute<C extends InstanceContent>(instance: SiteInstance<C>) {
  // Generated from the content file. An instance whose client has not uploaded an
  // icon serves the manifest without icons rather than a logo belonging to nobody.
  async function GET() {
    const content = instance.getContent();
    if (!content.pwa.enabled) return new Response('Not found', { status: 404 });

    const palette = content.theme.palettes.light;
    return Response.json(
      {
        name: content.site.name,
        short_name: content.site.shortName ?? content.site.name.slice(0, 12),
        description: content.seo.description,
        lang: content.site.locale,
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: palette.surface,
        background_color: palette.surface,
        icons: (content.pwa.icons ?? []).map((icon) => ({
          src: icon.src,
          sizes: icon.sizes,
          type: 'image/png',
          purpose: icon.purpose ?? 'any',
        })),
      },
      { headers: { 'Content-Type': 'application/manifest+json' } },
    );
  }

  return { GET };
}
