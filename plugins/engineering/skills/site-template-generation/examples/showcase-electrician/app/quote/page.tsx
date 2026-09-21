import type { Metadata } from 'next';
import { content } from '@/lib/content';
import PageHeader from '@/components/PageHeader';
import QuoteForm from '@/components/QuoteForm';

export const metadata: Metadata = {
  title: content.quote.heading,
  description: content.quote.body ?? content.company.activity,
};

export default function QuotePage() {
  const { quote, contact, forms, ui, company } = content;

  return (
    <>
      <PageHeader title={quote.heading} intro={quote.body} />

      <section className="section" aria-labelledby="quote-title">
        <div className="container quote__grid">
          <div className="quote__aside">
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
                  <address>
                    {contact.address.street}
                    <br />
                    {contact.address.postalCode} {contact.address.city}
                  </address>
                </li>
              ) : null}
            </ul>

            {company.serviceArea && company.serviceArea.length > 0 ? (
              <>
                <h3 className="quote__subtitle">{ui.serviceAreaHeading}</h3>
                <ul className="quote__areas">
                  {company.serviceArea.map((area) => (
                    <li key={area}>{area}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <QuoteForm
            fields={quote.fields}
            forms={forms}
            ui={ui}
            fallbackEmail={contact.email}
          />
        </div>
      </section>
    </>
  );
}
