import { getContent } from '@/lib/content';
import Hero from '@/components/site/Hero';
import Highlights from '@/components/site/Highlights';
import Proof from '@/components/site/Proof';
import ServiceList from '@/components/site/ServiceList';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const content = getContent();
  const { home, services } = content;

  return (
    <>
      <Hero hero={home.hero} />
      {home.highlights && home.highlights.items.length > 0 ? (
        <Highlights highlights={home.highlights} />
      ) : null}
      <ServiceList heading={services.heading} intro={services.intro} items={services.items} />
      {home.proof && home.proof.items.length > 0 ? <Proof proof={home.proof} /> : null}
    </>
  );
}
