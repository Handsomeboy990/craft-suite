import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { has } from '@/lib/motion';
import PageHeader from '@/components/site/PageHeader';
import ServiceList from '@/components/site/ServiceList';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const content = getContent();
  return { title: content.services.heading, description: content.company.activity };
}

export default function ServicesPage() {
  const content = getContent();
  return (
    <>
      <PageHeader title={content.services.heading} intro={content.company.activity} />
      <ServiceList
        heading={content.services.heading}
        intro={content.services.intro}
        items={content.services.items}
        stagger={has(content.theme.motion.signature, 'stagger')}
        detailed
      />
    </>
  );
}
