import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { content } from '@/lib/content';
import { cssVariables } from '@/lib/tokens';
import './globals.css';

// Every metadata value comes from the content file. Nothing here is written
// into the template.
export const metadata: Metadata = {
  metadataBase: new URL(content.site.baseUrl),
  title: content.seo.title,
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
      <body>{children}</body>
    </html>
  );
}
