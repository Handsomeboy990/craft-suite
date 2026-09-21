import { getContent } from '@/lib/content';
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
// removes its section entirely rather than rendering an empty frame.
export default function HomePage() {
  const content = getContent();
  const { offers, gallery, results, testimonials } = content;

  return (
    <>
      <SiteHeader content={content} />
      <main id="main">
        <Hero hero={content.hero} />
        <About about={content.about} />
        {offers && offers.items.length > 0 ? <Offers offers={offers} /> : null}
        {results && results.items.length > 0 ? <Results results={results} /> : null}
        {gallery && gallery.items.length > 0 ? <Gallery gallery={gallery} /> : null}
        {testimonials && testimonials.items.length > 0 ? (
          <Testimonials testimonials={testimonials} />
        ) : null}
        <ContactSection content={content} />
      </main>
      <SiteFooter content={content} />
      <AppShell enabled={content.pwa.enabled} ui={content.ui} />
    </>
  );
}
