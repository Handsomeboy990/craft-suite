import { content } from '@/lib/content';
import Hero from '@/components/Hero';
import Highlights from '@/components/Highlights';
import Proof from '@/components/Proof';
import ServiceList from '@/components/ServiceList';

// An optional block absent from the content file removes its section entirely
// rather than rendering an empty frame.
export default function HomePage() {
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
