import { notFound } from 'next/navigation';
import { content } from '@/lib/content';
import { buildLegalPages } from '@/lib/legal';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import LegalDocument from '@/components/LegalDocument';

// The legal routes are data: their slugs come from the content file, so a site
// in another language or another jurisdiction changes its legal pages without
// touching the template.
const pages = buildLegalPages(content.legal, content.site.name, content.contactSection.fields);

type RouteParams = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: RouteParams) {
  const { slug } = await params;
  const page = pages.find((candidate) => candidate.slug === slug);
  return { title: page ? page.title : content.seo.title };
}

export default async function LegalRoute({ params }: RouteParams) {
  const { slug } = await params;
  const page = pages.find((candidate) => candidate.slug === slug);
  if (!page) notFound();

  return (
    <>
      <SiteHeader site={content.site} nav={content.nav} ui={content.ui} />
      <main id="main">
        <LegalDocument page={page} pendingNotice={content.ui.legalPendingNotice} />
      </main>
      <SiteFooter
        site={content.site}
        contact={content.contact}
        legal={content.legal}
        ui={content.ui}
      />
    </>
  );
}
