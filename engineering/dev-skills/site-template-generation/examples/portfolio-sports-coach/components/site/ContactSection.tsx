import type { PortfolioContent } from '@/lib/types';
import ContactForm from './ContactForm';
import Reveal from './Reveal';

export default function ContactSection({ content }: { content: PortfolioContent }) {
  const { contactSection, contact, forms, ui } = content;
  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <Reveal className="page contact">
        <div>
          <h2 id="contact-title" className="section__title">
            {contactSection.heading}
          </h2>
          {contactSection.body ? <p className="section__lead">{contactSection.body}</p> : null}
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
                  {contact.address.country ? (
                    <>
                      <br />
                      {contact.address.country}
                    </>
                  ) : null}
                </address>
              </li>
            ) : null}
          </ul>
          {contact.hours && contact.hours.length > 0 ? (
            <>
              <h3>{ui.hoursHeading}</h3>
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
        <ContactForm fields={contactSection.fields} forms={forms} ui={ui} />
      </Reveal>
    </section>
  );
}
