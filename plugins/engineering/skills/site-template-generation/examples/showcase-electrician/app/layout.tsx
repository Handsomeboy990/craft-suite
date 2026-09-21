import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getContent } from '@/lib/content';
import { cssVariables, themeScript } from '@/lib/tokens';
import AppShell from '@/components/site/AppShell';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import './globals.css';

// The content file is read at request time, so an edit in the back office is
// live on reload with no rebuild. The chrome lives here, so each page carries
// only its own content.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const content = getContent();
  return {
    metadataBase: new URL(content.site.baseUrl),
    title: { default: content.seo.title, template: `%s | ${content.site.name}` },
    description: content.seo.description,
    manifest: content.pwa.enabled ? '/manifest.webmanifest' : undefined,
    icons: content.site.favicon ? { icon: content.site.favicon.src } : undefined,
    openGraph: {
      title: content.seo.title,
      description: content.seo.description,
      url: content.site.baseUrl,
      siteName: content.site.name,
      locale: content.site.locale,
      type: 'website',
      images: content.seo.ogImage
        ? [{ url: content.seo.ogImage.src, alt: content.seo.ogImage.alt }]
        : undefined,
    },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const content = getContent();
  return (
    <html lang={content.site.locale} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssVariables(content.theme) }} />
        {/* Applied before first paint: the page never flashes the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <SiteHeader content={content} />
        <main id="main">{children}</main>
        <SiteFooter content={content} />
        <AppShell enabled={content.pwa.enabled} ui={content.ui} />
      </body>
    </html>
  );
}
