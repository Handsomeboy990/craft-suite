import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import PageHeader from '@/components/site/PageHeader';
import QuoteForm from '@/components/site/QuoteForm';
import Reveal from '@/components/site/Reveal';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const content = getContent();
  return { title: content.quote.heading, description: content.quote.body ?? content.company.activity };
}

export default function QuotePage() {
  const content = getContent();
  const { quote, contact, forms, ui, company } = content;

  return (
    <>
      <PageHeader title={quote.heading} intro={quote.body} />

      <section className="section" aria-labelledby="quote-title">
        <Reveal className="page contact">
          <div>
            <h2 id="quote-title" className="section__title">
              {ui.contactHeading}
            </h2>
            <ul className="contact__details">
              <li>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              {contact.phone ? (
                <li>
                  <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
                </li>
              ) : null}
              {contact.address ? (
                <li>
                  <address style={{ fontStyle: 'normal' }}>
                    {contact.address.street}
                    <br />
                    {contact.address.postalCode} {contact.address.city}
                  </address>
                </li>
              ) : null}
            </ul>

            {company.serviceArea && company.serviceArea.length > 0 ? (
              <>
                <h3>{ui.serviceAreaHeading}</h3>
                <ul className="contact__details">
                  {company.serviceArea.map((area) => (
                    <li key={area}>{area}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
          <QuoteForm fields={quote.fields} forms={forms} ui={ui} />
        </Reveal>
      </section>
    </>
  );
}
