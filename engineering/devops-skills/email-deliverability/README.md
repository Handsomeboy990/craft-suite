# email-deliverability

Gets a sending domain's mail into the inbox instead of the spam folder or the
void: SPF, DKIM and DMARC aligned and published, a warmed and separated sending
reputation, transactional and marketing mail kept apart, bounces and complaints
handled, unsubscribe honoured, and the authentication and reputation monitored.

- Inputs: the sending domain, the mail the project sends, and the sending
  provider.
- Outputs: the DNS authentication records, the reputation plan, the bounce and
  complaint handling, the deliverability monitoring.
- Depends on: engineering-core, devops-core.

A confirmation email that never arrives is rarely a bug in the code that sent
it; the message was sent and then rejected or filed as spam because the domain
was not authenticated or its reputation was poor. The three DNS records must be
aligned to the visible From domain, DMARC is rolled out from monitor to reject
on the evidence of its reports rather than switched straight to reject (which
bounces your own legitimate mail), transactional mail is kept in a separate
stream from marketing so a marketing complaint does not sink the password
reset, bounces and complaints are suppressed, unsubscribe is honoured, and the
records and inbox placement are monitored. The DNS and reputation work lives
here; the application still owns honest content, honest headers, and not
sending mail the user did not ask for.
