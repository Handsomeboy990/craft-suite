import type { ShowcaseContent } from '@/lib/types';

// What a search engine reads about the business. Every value comes from the
// content file and a value that is not there is left out: an opening hour it
// cannot map, an award nobody entered. Structured data that states something
// the site does not is the same false claim as an invented legal fact, with a
// penalty attached.
export default function StructuredData({
  content,
  nonce,
}: {
  content: ShowcaseContent;
  nonce?: string;
}) {
  const origin = content.site.baseUrl.replace(/\/$/, '');
  const { contact, seo, site } = content;

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': seo.businessType,
    name: site.name,
    url: origin,
    description: seo.description,
  };

  if (site.tagline) data.slogan = site.tagline;
  if (contact.email) data.email = contact.email;
  if (contact.phone) data.telephone = contact.phone;
  if (seo.ogImage) data.image = `${origin}${seo.ogImage.src}`;
  if (contact.address) {
    data.address = {
      '@type': 'PostalAddress',
      streetAddress: contact.address.street,
      postalCode: contact.address.postalCode,
      addressLocality: contact.address.city,
      addressCountry: contact.address.country,
    };
  }
  if (contact.social && contact.social.length > 0) {
    data.sameAs = contact.social.map((entry) => entry.url);
  }
  // The towns the business says it covers, and the work it says it does. Both
  // are content the client wrote; nothing here is a claim the site does not
  // already make on a page a visitor can read.
  const areas = content.company.serviceArea ?? [];
  if (areas.length > 0) {
    data.areaServed = areas.map((area) => ({ '@type': 'Place', name: area }));
  }
  if (content.services.items.length > 0) {
    data.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: content.services.heading,
      itemListElement: content.services.items.map((service) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: service.title, description: service.summary },
        url: `${origin}/services#${service.slug}`,
      })),
    };
  }

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
