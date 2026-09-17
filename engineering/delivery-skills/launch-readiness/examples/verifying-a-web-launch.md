# Example: verifying a small SaaS before launch

A Next.js and Supabase application with accounts, one public contact form,
and an analytics tool. The team believes it is ready to launch. The gate runs
against the deployed staging build.

## What the product is

```
dynamic, accounts exist, one public form, sets an analytics cookie,
holds personal data (name, email), has a database
```

This makes the account, form, cookie, personal-data and database items all
apply, per `SKILL.md` section 4. Nothing is `not applicable` on a false
condition.

## A sample of the result

```
Legal and compliance
  privacy policy page          FAIL   route /privacy returns 404; personal
                                      data is collected, so this blocks launch
  cookie consent banner        FAIL   the analytics cookie is set on first
                                      load, before any consent choice
  terms of use page            PASS   /terms loads, linked in the footer,
                                      wording supplied by the client

Discoverability
  favicon                      FAIL   GET /favicon.ico returns 404; the
                                      starter icon was removed and not replaced
  social preview image         FAIL   a link preview renders a bare URL; no
                                      metadata image declared
  sitemap.xml                  PASS   served, lists the 6 public routes
  robots.txt                   PASS   served, allows the public routes

UX integrity
  custom 404 page              FAIL   an unknown route shows the framework
                                      default, not the project style
  no dead functionality        PASS   every reachable control exercised
  anti-spam on the form        NOT VERIFIED  could not confirm a honeypot or
                                      limit from the client; needs the handler

Security posture
  row level access             FAIL   a second test user could read the first
                                      user's rows; row level security is off
                                      on the profiles table
  no privileged key client     PASS   the service role key is server only;
                                      the bundle grep is clean
  security headers             PASS   content security and transport headers
                                      observed on the response
  login rate limited           PASS   repeated failures throttled

Infrastructure and data
  automated database backup    NOT VERIFIED  a schedule exists; no restore has
                                      been rehearsed, so it is not counted
```

## The verdict

```
Verdict: blocked

Launch blockers, security and legal, not tradeable against the date:
  - row level access is off on profiles; one user reads another's data
  - the privacy policy page is absent while personal data is collected

Launch blockers, product completeness:
  - favicon, social preview image and custom 404 all absent
  - the cookie banner sets an analytics cookie before consent

Gaps to close or accept in writing:
  - anti-spam on the contact form is unverified
  - the database backup has never been restored
```

The row level access failure alone forces `blocked` regardless of everything
that passed, per `SKILL.md` section 7. The team's belief that the product was
ready was sincere and wrong: every one of these is invisible until someone
who is not the developer, and not signed in as the developer, meets the
product.
