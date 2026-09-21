import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { content } from '@/lib/content';
import { cssVariables } from '@/lib/tokens';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import './globals.css';

// Every metadata value comes from the content file. The chrome lives here, so
// each page carries only its own content.
export const metadata: Metadata = {
  metadataBase: new URL(content.site.baseUrl),
  title: { default: content.seo.title, template: `%s | ${content.site.name}` },
  description: content.seo.description,
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={content.site.locale}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssVariables(content.theme) }} />
      </head>
      <body>
        <SiteHeader
          site={content.site}
          pages={content.pages}
          ui={content.ui}
          contact={content.contact}
        />
        <main id="main">{children}</main>
        <SiteFooter
          site={content.site}
          company={content.company}
          contact={content.contact}
          legal={content.legal}
          ui={content.ui}
        />
      </body>
    </html>
  );
}
