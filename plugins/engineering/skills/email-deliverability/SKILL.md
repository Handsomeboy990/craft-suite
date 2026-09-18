---
name: email-deliverability
description: Gets a sending domain's mail into the inbox instead of the spam folder or the void: SPF, DKIM and DMARC aligned and published, a warmed and separated sending reputation, transactional and marketing mail kept apart, bounces and complaints handled, unsubscribe honoured, and the authentication and reputation monitored. The reason a confirmation email never arrives is usually here, not in the code that sent it. Use when a project sends email a user must receive.
license: MIT
metadata:
  category: devops-skills
  version: 1.0.0
  depends_on: [engineering-core, devops-core]
  outputs: [dns-authentication-records, reputation-plan, bounce-complaint-handling, deliverability-monitoring]
---

# Email Deliverability

A signup confirmation that never arrives is rarely a bug in the code that sent
it. The message was sent; it was rejected, or filed as spam, because the
sending domain was not authenticated or its reputation was poor. Deliverability
is the work that gets the mail into the inbox, and it lives in DNS and
reputation, not in the application.

## 1. The three authentication records, aligned

A receiving server decides whether to trust a message by three DNS records.
All three, aligned, are the baseline; any missing one hurts.

```
SPF     a TXT record listing the servers allowed to send for the domain. A
        receiver checks the sending server is on the list.
DKIM    a signature on the message, verified against a public key in DNS. It
        proves the message was not altered and came from the domain.
DMARC   a policy that ties SPF and DKIM to the visible From address and tells
        receivers what to do when they fail: none to monitor, quarantine, or
        reject. It also asks for reports.
```

Alignment is the point often missed: DMARC passes only when the domain that
SPF or DKIM authenticated matches the visible From domain. A message that
passes SPF for a different domain than it claims to be from still fails DMARC.

## 2. Start at monitor, move to enforce

DMARC is rolled out, not switched on hard.

```
p=none        first: publish DMARC at monitor, collect the reports, and learn
              which of your real senders pass and which fail, before rejecting
              anything
fix           bring every legitimate sender into alignment using the reports
p=quarantine   then tighten to quarantine, watching the reports for collateral
p=reject       finally reject, once every legitimate stream is aligned, so a
              spoofer is refused and a real message is not
```

Jumping straight to reject before the reports are clean bounces your own
legitimate mail. The monitor phase exists precisely to prevent that.

## 3. Reputation is earned, and separated

Receivers score the sending IP and domain by history. A new or abused sender
lands in spam regardless of authentication.

```
warm        a new sending IP or domain starts at low volume and ramps up, so a
            sudden flood does not read as a spam burst
separate    transactional mail (the confirmation, the reset, the receipt a user
            expects) sends from a different stream or subdomain than marketing
            mail, so a marketing complaint does not sink the password reset
consistent   send from a stable From domain, not a rotating one, so reputation
            can accrue to it
```

## 4. Handle what comes back

Mail that is sent generates bounces and complaints, and ignoring them destroys
reputation.

```
bounces     a hard bounce (the address does not exist) is suppressed, so you
            stop sending to it; continuing to hammer dead addresses signals a
            spammer
complaints   a spam complaint, received through a feedback loop, suppresses
            that recipient; a sender that keeps mailing people who complained
            is throttled by receivers
unsubscribe  an unsubscribe is honoured immediately and includes the one-click
            header receivers now expect on bulk mail; ignoring it is both a
            reputation hit and, for marketing mail, unlawful in many places
```

## 5. Monitor the authentication and the reputation

```
DMARC reports   read them; they show who is sending as your domain, legitimate
                and spoofed, and whether alignment holds
records         monitor that SPF, DKIM and DMARC stay published and valid; a DNS
                change can silently break them
placement       watch whether mail is landing in the inbox or the spam folder,
                and whether the domain appears on a blocklist
```

## 6. What stays out of the application, and what the app still owns

```
DNS and reputation   SPF, DKIM, DMARC, warming, streams, blocklist monitoring:
                     this skill and the provider
the application      still owns the content that avoids spam triggers, the
                     honest From and subject, the unsubscribe link, and not
                     sending mail the user did not ask for
```

## 7. Prohibitions

- No DMARC at reject before the monitor phase has cleaned every legitimate
  stream.
- No shared stream for transactional and marketing mail.
- No sending to hard-bounced addresses or to recipients who complained.
- No ignored unsubscribe, and no bulk mail without the one-click header.
- No new sending IP or domain flooded at full volume without warming.
- No authentication record left unmonitored after it is published.

## 8. Protocol

1. Publish SPF, DKIM and DMARC, and confirm DMARC alignment against the visible
   From domain.
2. Start DMARC at monitor, read the reports, bring every legitimate sender into
   alignment, then tighten to quarantine and finally reject.
3. Separate transactional from marketing mail into different streams or
   subdomains, and warm a new sender by ramping volume.
4. Suppress hard bounces and complaints, honour unsubscribe immediately with
   the one-click header.
5. Monitor the DMARC reports, the record validity, and the inbox placement and
   blocklist status.
6. Keep the DNS and reputation work here; the application still owns the
   content, the honest headers and not sending unwanted mail.

## 9. Auto-critique

Score from 0 to 5: SPF, DKIM and DMARC are published and aligned to the From
domain, DMARC moved from monitor to enforce on the evidence of its reports,
transactional and marketing mail are separated, a new sender was warmed,
bounces and complaints are suppressed and unsubscribe is honoured, and the
records and placement are monitored.

Threshold: no axis below 3, average at least 4. DMARC set to reject before the
monitor phase, or transactional mail sharing a stream with marketing, scores 0
overall, because the first rejects your own legitimate mail and the second lets
a marketing complaint sink the password reset a user is waiting for.

## 10. Interfaces

- Upstream: `engineering-core`, `devops-core`.
- Lateral: `background-jobs` for the transactional mail the application sends,
  `environment-management` for the per-environment sender configuration,
  `secrets-management` for the sending provider's credentials,
  `data-privacy` for consent and the lawful basis of marketing mail.
- Downstream: `observability` for the deliverability and bounce signals,
  `launch-readiness` which checks that a confirmation email actually arrives.
