import { getContent } from '@/lib/content';
import { has } from '@/lib/motion';
import Hero from '@/components/site/Hero';
import Highlights from '@/components/site/Highlights';
import Proof from '@/components/site/Proof';
import ServiceList from '@/components/site/ServiceList';

export const dynamic = 'force-dynamic';

// Which effects run is the trade's signature, read once here and passed down.
// A technical trade carries reveal and lift, and nothing else.
export default function HomePage() {
  const content = getContent();
  const { home, services } = content;
  const signature = content.theme.motion.signature;
  const stagger = has(signature, 'stagger');

  return (
    <>
      <Hero
        hero={home.hero}
        entrance={has(signature, 'entrance')}
        parallax={has(signature, 'parallax')}
      />
      {home.highlights && home.highlights.items.length > 0 ? (
        <Highlights highlights={home.highlights} stagger={stagger} />
      ) : null}
      <ServiceList
        heading={services.heading}
        intro={services.intro}
        items={services.items}
        stagger={stagger}
      />
      {home.proof && home.proof.items.length > 0 ? (
        <Proof proof={home.proof} stagger={stagger} counters={has(signature, 'counters')} />
      ) : null}
    </>
  );
}
