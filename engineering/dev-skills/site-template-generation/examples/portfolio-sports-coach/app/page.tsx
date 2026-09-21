import { getContent } from '@/lib/content';
import { has } from '@/lib/motion';
import AppShell from '@/components/site/AppShell';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import Hero from '@/components/site/Hero';
import About from '@/components/site/About';
import Offers from '@/components/site/Offers';
import Results from '@/components/site/Results';
import Gallery from '@/components/site/Gallery';
import Testimonials from '@/components/site/Testimonials';
import ContactSection from '@/components/site/ContactSection';

export const dynamic = 'force-dynamic';

// One page, anchored sections. An optional block absent from the content file
// removes its section entirely rather than rendering an empty frame. Which
// effects run is the trade's signature, read once here and passed down.
export default function HomePage() {
  const content = getContent();
  const { offers, gallery, results, testimonials } = content;
  const signature = content.theme.motion.signature;
  const stagger = has(signature, 'stagger');

  return (
    <>
      <SiteHeader content={content} />
      <main id="main">
        <Hero
          hero={content.hero}
          entrance={has(signature, 'entrance')}
          parallax={has(signature, 'parallax')}
        />
        <About about={content.about} />
        {offers && offers.items.length > 0 ? <Offers offers={offers} stagger={stagger} /> : null}
        {results && results.items.length > 0 ? (
          <Results results={results} stagger={stagger} counters={has(signature, 'counters')} />
        ) : null}
        {gallery && gallery.items.length > 0 ? <Gallery gallery={gallery} stagger={stagger} /> : null}
        {testimonials && testimonials.items.length > 0 ? (
          <Testimonials testimonials={testimonials} stagger={stagger} />
        ) : null}
        <ContactSection content={content} />
      </main>
      <SiteFooter content={content} />
      <AppShell enabled={content.pwa.enabled} ui={content.ui} />
    </>
  );
}
