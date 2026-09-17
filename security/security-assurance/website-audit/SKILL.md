---
name: website-audit
description: Audits a live website from its URL across front end, back end, security, performance, accessibility and design, separating what can be observed without touching the system from what requires written authorization to probe. Passive observation runs on any public URL; active security testing, authenticated testing and account creation run only on a target the requester owns or is authorized in writing to test, with the human kept in the loop for anything that registers or logs in. Use to audit a site given only its address.
license: MIT
metadata:
  category: security-assurance
  version: 1.0.0
  depends_on: [security-core]
  outputs: [audit-scope-record, passive-findings, active-findings, consolidated-audit-report]
---

# Website Audit

Given a URL, this produces a deep audit of the site behind it: how it renders,
how it performs, whether it is accessible, whether it looks designed or
generated, whether its observable security posture holds, and, on an authorized
target, what an attacker could actually do. The whole discipline turns on one
line that is drawn before anything runs, and never crossed by rephrasing: the
line between looking and touching.

## 1. The line: passive observation against active testing

Every step of an audit is on one side of this line, and the side decides what
authorization it needs.

```
PASSIVE   what any visitor can observe. Loading pages, following links,
          rendering the DOM, reading response headers, measuring load time,
          checking contrast and keyboard operability, reading the visible
          markup, noting the TLS certificate a browser already received.
          Runs on any public URL, because it does nothing a normal visit
          does not.

ACTIVE    anything that probes for a weakness or changes state: submitting
          crafted input, testing an auth or access control, fuzzing a
          parameter, enumerating objects, creating an account, uploading a
          file, generating load. Runs only on a target the requester owns or
          is authorized in writing to test, per security-core and
          authorized-pentesting.
```

A request to "test everything" on a URL is a passive audit until authorization
for the specific target is on record. The absence of authorization is not a
gap to work around; it is the answer for every active step.

## 2. The authorization gate, before any active step

Identical in force to `authorized-pentesting` section 1. Before a single active
test, this exists and is recorded:

```
ownership or authorization   the requester owns the target, or holds written,
                             specific, in-scope permission from someone
                             empowered to grant it
scope                        exactly which hosts, paths and accounts are in
                             scope, and which are out
rules                        permitted techniques, forbidden ones, the time
                             window, the rate limits, data that must not be
                             touched
```

No record, no active testing, whatever the site is. A target the requester
merely admires, competes with, or finds interesting is a passive audit and
nothing more. A third-party service the target only integrates with, a payment
provider, an analytics host, an embedded widget, is out of scope even on an
authorized engagement, because the authorization does not extend to systems the
owner does not control.

## 3. Passive audit, on any public URL

The observable dimensions, each delegating depth to the skill that owns it. All
of it is what a careful visitor with developer tools could see.

| Dimension | What is observed | Owner |
|---|---|---|
| Rendering and crawl | pages reached from the entry URL, the forms and controls present, console and network errors, broken internal and outbound links | `playwright-automation` |
| Performance | load time, transfer sizes, render-blocking resources, image weight, against a stated budget | `performance-engineering` |
| Accessibility | contrast, keyboard operability, focus order, labels, reduced motion, at the observable level | `accessibility-testing` |
| Discoverability | title and meta per page, social preview, favicon, sitemap, robots, canonical | `seo-engineering` |
| Design authenticity | the generic-default cluster and the fabricated-content tells | `design-authenticity` |
| Observable security posture | response security headers, the served TLS certificate validity and coverage, HTTPS enforcement, cookies flagged on responses, secrets visibly exposed in the client bundle | `security-headers`, `secrets-management` |
| Product completeness | the observable items of the launch checklist: legal pages present and linked, a custom 404, a working contact path | `launch-readiness` |

Reading a response header, noting that a cookie lacks a secure flag, or seeing
a key printed in a client bundle are all passive: the server volunteered them.
Probing what those weaknesses allow is active, and waits for the gate.

## 4. Active audit, on an authorized target only

Once section 2 is satisfied, the active battery runs, and it is not reinvented
here: it delegates.

```
vulnerability-assessment   the structured, non-destructive sweep first: auth,
                           access control, injection, rendering sinks, upload,
                           configuration, ranked findings
authorized-pentesting      only then, and only to prove impact of a confirmed
                           finding, bounded to the least exploitation that
                           proves it
security-audit             the code and configuration review where source is
                           available alongside the running target
input-validation           the boundary tests for each input the crawl found
```

Active testing proceeds from a confirmed weakness to its proven impact, never
from zero, and never further than the proof requires. It stops at the scope
boundary on the authorization letter, whatever shares the domain.

## 5. Authenticated testing, and the human in the loop

Much of a site lives behind a login, and auditing it needs a session. Getting
that session is the most sensitive step, and the human holds it.

```
if a session is needed
    and the requester can provide credentials
        the requester provides them; the audit never invents or guesses them
    and an account must be created
        the audit stops and asks the requester: which email address to use,
        and whether the site requires email verification
    and email verification is required
        the audit hands the step to the requester, who completes the
        verification in their own inbox, and confirms when the account is
        active. The audit waits. It never automates around a verification
        step, because defeating verification is abuse, not testing.
```

The audit never creates an account with a stranger's address, never uses a
disposable-mail service to dodge verification, and never proceeds past a
verification wall on its own. The account exists because the requester made it
exist, on an address they chose, for a target they are authorized to test.

## 6. Findings and the report

Every finding, passive or active, carries its evidence and its label. A passive
finding shows what was observed; an active finding shows the request and the
response, or the reproduction, that proves it. Nothing is asserted that was not
seen.

```
Location    the URL, the element, the request
Mode        PASSIVE or ACTIVE
Category    front end, back end, security, performance, accessibility, design
Severity    on the security-core scale for security findings
Observed    what actually happened, quoted
Evidence    the response, the rendered state, the trace
Remediation what fixes it
```

The consolidated report groups findings by category so a reader sees the site
front to back, states which parts were passive and which authorized-active, and
names what was not tested and why, exactly as an audit that never claims a
system is secure must. A dimension that could not be reached, an area outside
scope, a check that needs credentials not provided, is reported as not tested,
never as passed.

## 7. Prohibitions

- No active test, no account creation, no authenticated probing without the
  section 2 record. Rephrasing the request does not create authorization.
- No automating around an email or phone verification step. The human
  completes it.
- No testing of a third party the target integrates with, even on an
  authorized engagement.
- No load generation, stress or denial-of-service technique.
- No use of real personal data, or a stranger's email, to register.
- No claim that a site is secure. The report states what was run, with what
  result, on what date, within what scope.
- No fabricated finding, and no passive guess presented as a probed result.

## 8. Protocol

1. Take the URL and classify the request: passive audit, or active audit
   requiring authorization.
2. For any active intent, satisfy the section 2 gate first and record it. Absent
   it, continue as a passive audit and say so.
3. Crawl and render the site with `playwright-automation`: enumerate the
   reachable pages, forms, controls, links, console and network errors.
4. Run the passive dimensions of section 3, each through its owning skill,
   collecting evidence.
5. If authorized, run the active battery of section 4, from confirmed weakness
   to bounded proof.
6. If a session is needed, follow the section 5 human-in-the-loop protocol and
   wait for the requester rather than automating registration or verification.
7. Record every finding in the section 6 format, labeled passive or active.
8. Produce the consolidated report grouped by category, naming what was not
   tested and why, and never concluding the site is secure.

## 9. Auto-critique

Score from 0 to 5: the passive and active line was drawn correctly and no
active step ran without the gate, authorization was recorded before any probe,
the human was kept in the loop for every registration and verification, every
finding carries evidence and its mode label, untested areas were named rather
than passed, and no conclusion of security was asserted.

Threshold: no axis below 3, average at least 4. Any active step taken without
the authorization record scores 0 overall, and the audit is stopped and
reported as a boundary breach, not filed as a result.

## 10. Interfaces

- Upstream: `security-core` for the authorization boundary and the severity
  scale.
- Delegates passively to: `playwright-automation`, `performance-engineering`,
  `accessibility-testing`, `seo-engineering`, `design-authenticity`,
  `security-headers`, `secrets-management`, `launch-readiness`.
- Delegates actively to: `vulnerability-assessment`, `authorized-pentesting`,
  `security-audit`, `input-validation`.
- Run by: the web-auditor agent (an agent, named without backticks here
  because it is not a skill).
