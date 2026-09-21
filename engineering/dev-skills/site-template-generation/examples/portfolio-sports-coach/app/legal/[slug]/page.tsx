import { notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { buildLegalPages } from '@/lib/legal';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import LegalDocument from '@/components/site/LegalDocument';

export const dynamic = 'force-dynamic';

type RouteParams = { params: Promise<{ slug: string }> };

// The legal routes are data: their slugs come from the content file, so an
// instance in another language or another jurisdiction changes its legal pages
// without touching the template.
export async function generateMetadata({ params }: RouteParams) {
  const content = getContent();
  const { slug } = await params;
  const page = buildLegalPages(content.legal, content.site.name, content.contactSection.fields).find(
    (candidate) => candidate.slug === slug,
  );
  return { title: page ? page.label : content.seo.title };
}

export default async function LegalRoute({ params }: RouteParams) {
  const content = getContent();
  const { slug } = await params;
  const page = buildLegalPages(content.legal, content.site.name, content.contactSection.fields).find(
    (candidate) => candidate.slug === slug,
  );
  if (!page) notFound();

  return (
    <>
      <SiteHeader content={content} />
      <main id="main">
        <LegalDocument page={page} pendingNotice={content.ui.legalPendingNotice} />
      </main>
      <SiteFooter content={content} />
    </>
  );
}
