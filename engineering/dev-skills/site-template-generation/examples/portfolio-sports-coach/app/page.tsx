import { content } from '@/lib/content';
import SiteHeader from '@/components/SiteHeader';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Offers from '@/components/Offers';
import Results from '@/components/Results';
import Gallery from '@/components/Gallery';
import Testimonials from '@/components/Testimonials';
import ContactSection from '@/components/ContactSection';
import SiteFooter from '@/components/SiteFooter';

// One page, anchored sections. An optional block absent from the content file
// removes its section entirely rather than rendering an empty frame.
export default function HomePage() {
  const { offers, gallery, results, testimonials } = content;

  return (
    <>
      <SiteHeader site={content.site} nav={content.nav} ui={content.ui} />
      <main id="main">
        <Hero hero={content.hero} />
        <About about={content.about} />
        {offers && offers.items.length > 0 ? <Offers offers={offers} /> : null}
        {results && results.items.length > 0 ? <Results results={results} /> : null}
        {gallery && gallery.items.length > 0 ? <Gallery gallery={gallery} /> : null}
        {testimonials && testimonials.items.length > 0 ? (
          <Testimonials testimonials={testimonials} />
        ) : null}
        <ContactSection
          section={content.contactSection}
          contact={content.contact}
          forms={content.forms}
          ui={content.ui}
        />
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
