---
name: launch-readiness
description: The completeness gate for a user-facing web product before it is announced: legal pages, discoverability, content, performance, accessibility, UX integrity, analytics, the full security posture, and the infrastructure a real launch needs. Each item is a deliverable with a verification, delegating depth to the skill that owns it and adding the web-launch items no other skill covers. Use before calling a website live, and to audit whether a built site is actually launch ready.
license: MIT
metadata:
  category: delivery-skills
  version: 1.0.0
  depends_on: [engineering-core, implementation-integrity]
  outputs: [launch-checklist-result, launch-blockers, deliverable-gaps]
---

# Launch Readiness

A site that builds and deploys is not a site that is ready to launch. A real
user-facing product carries deliverables that no test suite checks: a privacy
policy the law requires, a favicon and a social preview so it does not look
broken when shared, a custom error page instead of the framework's, a cookie
banner where tracking demands one, and a security posture that holds when a
stranger, not the developer, is the one making requests.

This skill is the consolidated checklist of those deliverables and, for each,
how to verify it is genuinely present rather than assumed. It owns none of the
depth: where a skill already covers an item, this gate delegates to it and
records the result. What it adds is the web-launch items that fall between the
engineering skills, and the discipline that no item is marked done without
evidence.

## 1. What this gate is, and what it is not

Three skills sit near this one and are not it:

```
release-readiness        is this revision safe to ship: tests, security
                         review, migrations, rollback. Gates the code.
production-verification   does the deployed system answer a real request.
                         Gates the deployment.
launch-readiness          is the product complete as a deliverable: legal,
                         discoverability, content, the visible and invisible
                         things a real launch needs. Gates the product.
```

They compose. `release-readiness` clears the code, `production-verification`
proves it runs, and this gate confirms the product a user meets is whole.
Running one is not running the others.

## 2. The eight domains

Every item names the skill that owns its depth. This gate does not restate
that skill; it confirms the item is delivered and verified. The full itemised
grid, with a verification for every line, is in
`resources/launch-checklist.md`. The concrete mapping for a Supabase and
Next.js project, the stack these items are most often written against, is in
`resources/supabase-next-appendix.md`; the domains below stay stack agnostic.

### Legal and compliance

Privacy policy, terms of use, legal notice where the jurisdiction requires
one, a cookie policy, and a cookie consent banner when the site sets any
non-essential cookie or loads any third party that does. The substance of what
personal data is held and why is owned by `data-privacy`; the document rigor is
owned by `administrative-writing`.

**This gate never writes the legal text.** A privacy policy or a terms
document carries legal liability, and inventing its wording is the same defect
as inventing a legal reference, which the repository forbids. The deliverable
here is the page, its structure, the checklist of clauses the site actually
needs given the data it handles, the placeholders, and the verification that
the page exists, is reachable and is linked. The wording is the owner's, or a
lawyer's.

### Discoverability

A meaningful title and meta description per page, a social preview image so a
shared link renders as a card rather than a bare URL, a favicon, a
`sitemap.xml`, a `robots.txt` that matches the site's real indexing intent, and
canonical URLs. Depth owned by `seo-engineering`; the favicon and the social
preview image are web-launch items this gate owns directly.

### Content and media

Real copy, not placeholder text left in a shipped page. Real images, not
framework stock. Every image compressed and sized for the web, and carrying
alt text, which is also an accessibility item.

### Performance

Page load within a stated budget, images compressed and lazy loaded below the
fold, and a caching strategy that does not serve one user another user's data.
Depth owned by `performance-engineering` and `caching-strategy`.

### Accessibility

Colour contrast at the required ratio, keyboard operability, and layout that
holds from a phone to a wide screen. Depth owned by `accessibility-testing`.
Verified by operation, not by a scanner's score alone.

### UX integrity

A custom 404 page styled to the project rather than the framework default, no
broken internal or outbound links, forms that validate and report errors
clearly, anti-spam on every public form, one clear primary call to action per
page rather than several competing ones, and no dead button, stub handler or
fake success anywhere a user can reach. The last is owned by
`implementation-integrity`; the rest this gate owns directly.

### Analytics and measurement

An analytics tool actually installed and recording, gated behind consent where
the law requires it, measuring events defined from the questions they answer
rather than everything. Depth owned by `analytics-instrumentation`, with
`data-privacy` for the consent boundary.

### Security posture

The largest domain, and entirely delegated: this gate runs the security skills
and records their results, it does not re-audit. Secrets absent from the
repository and from the client bundle, no privileged key shipped to the
browser, authorization decided on the server and never trusted from the
client, row level access enforced at the database, sensitive data encrypted,
sessions and passwords handled correctly, login and public endpoints rate
limited and bot resistant, every input validated and every output escaped,
uploads restricted, responses returning only the fields they should, security
headers set, CORS scoped, detailed errors and debug logging kept out of
production, webhooks signature verified, dependencies scanned and current, and
HTTPS enforced. Owned by `security-audit`, `input-validation`,
`authentication-security`, `authorization-design`, `session-security`,
`security-headers`, `dependency-security`, `secrets-management` and
`file-handling`. The itemised grid maps each line to its owner.

### Infrastructure and data

HTTPS forced with a valid certificate, email confirmation on signup where
accounts exist, and an automated database backup whose restore has actually
been rehearsed. Owned by `deployment-engineering` and `backup-recovery`. A
backup nobody has restored is a hypothesis, not a backup.

## 3. Verification, per item

Every item resolves to exactly one status, and a status other than
`not applicable` carries its evidence.

```
PASS            delivered and verified, with the evidence quoted
FAIL            absent, or present but broken, with what was observed
NOT APPLICABLE   the item does not apply, with the reason
NOT VERIFIED    could not be checked in this pass, with what is missing to
                check it
```

`PASS` is never written from reasoning. A favicon is `PASS` when the request
for it returned one, not when the tag is in the markup. A backup is `PASS`
when a restore produced the data, not when the schedule exists. Every `PASS`
that cannot show its evidence is a `NOT VERIFIED` instead.

## 4. Proportionality

Not every site needs every item. A static brochure with no accounts, no forms
and no cookies does not need rate limiting, session security or a consent
banner, and those are `NOT APPLICABLE` with that reason, not `FAIL`. The gate
scales to what the product actually is:

```
has accounts        authentication, session, password, login rate limit,
                    email confirmation all apply
has any form        validation and anti-spam apply
sets a cookie       consent banner and cookie policy apply, unless every
                    cookie is strictly essential
holds personal data  privacy policy and data-privacy apply
has a database       row level access, backup and restore apply
```

Marking an item `NOT APPLICABLE` requires the condition above it to be false,
stated. An item is never dropped silently to make the gate pass.

## 5. Protocol

1. Establish what the product is: static or dynamic, accounts or none, forms,
   cookies, personal data, database. This decides which items apply, per
   section 4.
2. Walk `resources/launch-checklist.md` domain by domain. For each applicable
   item, delegate to the owning skill where one exists, and check the
   web-launch items this gate owns directly.
3. Assign each item a status from section 3, with evidence for anything not
   `not applicable`.
4. For a Supabase or Next.js project, cross-check against
   `resources/supabase-next-appendix.md`, which names the concrete failure
   each abstract item maps to on that stack.
5. Collect every `FAIL` as a launch blocker and every `NOT VERIFIED` as a gap
   that must be closed or accepted in writing before launch.
6. Produce the result: the status per item, the blockers, the gaps, and a
   single verdict, `ready`, `blocked` with the named blockers, or
   `not verified` when too much could not be checked to judge.
7. Never issue `ready` while a security-posture item is `FAIL` or a legally
   required page is absent. Those are not tradeable against a launch date.

## 6. What this gate refuses

- Writing the legal text of a privacy policy, terms document or cookie policy.
  It scaffolds and verifies; it does not author liability.
- Marking any item `PASS` from reasoning rather than observation.
- Issuing `ready` with an open security-posture `FAIL`.
- Restating the depth of a delegated skill instead of running it.
- Treating a scanner's green score as accessibility or security verification
  on its own.
- Silently narrowing the checklist to the items that happen to pass.

## 7. Auto-critique

Score from 0 to 5: every applicable item was actually checked rather than
assumed, each status carries its evidence or its reason, the applicability
decisions in section 4 are justified rather than convenient, no legal text was
fabricated, no security `FAIL` was waved through, the verdict matches the item
results rather than the launch pressure.

Threshold: no axis below 3, average at least 4. A verdict of `ready` with any
security-posture `FAIL` scores 0 overall regardless of the rest, and is
recomposed as `blocked`.

## 8. Interfaces

- Upstream: `engineering-core`, `implementation-integrity`,
  `production-verification`, `release-readiness`.
- Owns depth jointly with: `seo-engineering`, `accessibility-testing`,
  `performance-engineering`, `caching-strategy`, `security-audit`,
  `input-validation`, `authentication-security`, `authorization-design`,
  `session-security`, `security-headers`, `dependency-security`,
  `secrets-management`, `file-handling`, `data-privacy`,
  `analytics-instrumentation`, `deployment-engineering`, `backup-recovery`,
  `administrative-writing`.
- Downstream: `client-handover` records the result in the delivery package,
  `release-engineering` at the release phase.
- Run by: the compliance-verifier agent (an agent, named without backticks
  here because it is not a skill), and by `delivery-orchestrator` at phase 11.
