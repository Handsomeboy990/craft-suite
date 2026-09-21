import type { PortfolioContent } from '@/lib/types';
import ContactForm from './ContactForm';

type Props = {
  section: PortfolioContent['contactSection'];
  contact: PortfolioContent['contact'];
  forms: PortfolioContent['forms'];
  ui: PortfolioContent['ui'];
};

export default function ContactSection({ section, contact, forms, ui }: Props) {
  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="container contact__grid">
        <div className="contact__intro reveal">
          <h2 id="contact-title" className="section__title">
            {section.heading}
          </h2>
          {section.body ? <p>{section.body}</p> : null}
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
          {contact.hours && contact.hours.length > 0 ? (
            <>
              <h3 className="contact__subtitle">{ui.hoursHeading}</h3>
              <ul className="contact__hours">
                {contact.hours.map((slot) => (
                  <li key={slot.days}>
                    <span>{slot.days}</span>
                    <span>
                      {slot.opens} {slot.closes}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
        <ContactForm
          fields={section.fields}
          forms={forms}
          ui={ui}
          fallbackEmail={contact.email}
        />
      </div>
    </section>
  );
}
