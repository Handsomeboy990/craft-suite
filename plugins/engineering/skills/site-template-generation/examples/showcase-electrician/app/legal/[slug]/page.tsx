import { notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { buildLegalPages } from '@/lib/legal';
import LegalDocument from '@/components/site/LegalDocument';

export const dynamic = 'force-dynamic';

type RouteParams = { params: Promise<{ slug: string }> };

// The legal routes are data: their slugs come from the content file, so an
// instance in another language or another jurisdiction changes its legal pages
// without touching the template.
function pagesOf() {
  const content = getContent();
  return buildLegalPages(
    content.legal,
    content.site.name,
    content.quote.fields,
    content.services.items,
  );
}

export async function generateMetadata({ params }: RouteParams) {
  const { slug } = await params;
  const page = pagesOf().find((candidate) => candidate.slug === slug);
  return { title: page ? page.label : getContent().seo.title };
}

export default async function LegalRoute({ params }: RouteParams) {
  const { slug } = await params;
  const page = pagesOf().find((candidate) => candidate.slug === slug);
  if (!page) notFound();
  return <LegalDocument page={page} pendingNotice={getContent().ui.legalPendingNotice} />;
}
