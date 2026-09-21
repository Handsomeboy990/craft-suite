import type { Metadata } from 'next';
import { content } from '@/lib/content';
import PageHeader from '@/components/PageHeader';
import ServiceList from '@/components/ServiceList';

export const metadata: Metadata = {
  title: content.services.heading,
  description: content.company.activity,
};

export default function ServicesPage() {
  const { services, company } = content;

  return (
    <>
      <PageHeader title={services.heading} intro={company.activity} />
      <ServiceList heading={services.heading} intro={services.intro} items={services.items} detailed />
    </>
  );
}
