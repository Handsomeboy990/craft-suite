import type { PortfolioContent } from '@/lib/types';

// What a search engine reads about the business. Every value comes from the
// content file and a value that is not there is left out: an opening hour it
// cannot map, an award nobody entered. Structured data that states something
// the site does not is the same false claim as an invented legal fact, with a
// penalty attached.
export default function StructuredData({
  content,
  nonce,
}: {
  content: PortfolioContent;
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

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
