# Example: two requests, one URL

The requester gives a URL and says "audit this site, find everything wrong."
The audit's first job is to establish which side of the line the request is on,
because that decides what it may do.

## Case A: the requester owns the site

The requester confirms they own the target and authorizes active testing of it,
in scope, in writing. The section 2 record is created. The audit runs both
halves.

```
Passive, on the rendered site:
  performance   the landing page transfers 4.2 MB, an uncompressed hero image
                is 3.1 MB of it; render-blocking font from a third party adds
                600 ms. PASSIVE, performance.
  accessibility the primary call to action fails contrast at 3.1 to 1; the
                mobile menu is not reachable by keyboard. PASSIVE, accessibility.
  security      the response carries no content security policy and no HSTS
                header; a session cookie is set without the secure flag.
                PASSIVE, security, observed from the response.
  design        seven generic-default tells cluster with no stated intent, and
                three testimonials name people with no resolving source.
                PASSIVE, design, the testimonials handed on as a truthfulness
                concern.

Active, authorization on record:
  access control  a confirmed finding from vulnerability-assessment: the
                  invoice endpoint returns any invoice by id with no ownership
                  check. authorized-pentesting proves impact by fetching a
                  second test account's invoice with a forged id, then stops.
                  ACTIVE, security, critical, with the request and response.

Authenticated area:
  the admin panel needs a login. The audit asks the requester which email to
  use for a test account and whether verification is required. The requester
  creates the account, verifies it in their own inbox, and confirms. The audit
  then tests the authenticated surface.
```

## Case B: the requester does not own the site

The requester gives a competitor's URL and asks for the same. There is no
authorization record, and none is obtainable. The audit runs the passive half
only, and says so plainly.

```
Passive audit only, no authorization for active testing on this target.
  performance, accessibility, discoverability, design, and the observable
  security posture (headers, TLS, cookie flags, visibly exposed secrets) are
  reported from what a normal visit reveals.

Not tested, and why:
  authentication, access control, injection, upload handling, and any
  authenticated area are active tests that require authorization for this
  target, which is not held. They are named as not tested, never as passed.
  No account was created, because the requester does not own the target.
```

The same URL and the same words produced two different audits, because the
authorization record, not the request, decides what the audit may touch.
