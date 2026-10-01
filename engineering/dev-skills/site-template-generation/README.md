# site-template-generation

Builds a client website as a template with its own back office, so the client
can still run it a year later without calling anyone.

- Inputs: the kind (portfolio, showcase or dashboard), the trade, the legal
  identity of the owner, and the facts only the client has; for a dashboard,
  the roles, what each may do, and the questions each asks every day.
- Outputs: the content contract, the token profile in both themes, the motion
  specification, the back office and its security report, the legal fact sheet,
  the completion gate report; for a dashboard, its specification and the report
  of its own gate.
- Depends on: engineering-core.
- Run by: the site-template-engineer agent, and the frontend-engineer when an
  instance is produced.

A site is delivered twice: once as a page, and once as something the client can
still edit. Four artefacts stay apart: the template, which holds no client fact
and no visual literal; the content file, which holds every string, image,
colour, hour and contact detail; the tokens, two palettes authored separately
and both measured, plus one motion intensity that separates an energetic trade
from a technical one without a second template; and the back office, which
writes all of it and is part of the delivery rather than a developer tool the
client is told to avoid.

The back office is the highest value target on the deployment and is built as
one: a hashed password set out of band, server side sessions, a CSRF token on
every write, rate limits on the login and on the public form, uploads checked by
type and by content, and a server side check on every admin route, because
hiding a link is not access control. The contact form reaches an inbox that the
client reads, with a push notification when they asked for one, and the message
is stored before anything is announced so a failing notification never loses it.

Legal pages are assembled from the company's real facts, with a visible marker
for every fact not provided and no clause the template drafted itself. The page
uses its width instead of centring one narrow column, both themes ship, the 404
and the offline page are designed, the site is installable and works offline,
and a twenty nine point gate decides whether the template is finished.

The third kind, `dashboard`, is the back office grown into the product: an
operations application for an organisation's own staff, several accounts, each
with a role. Modules follow the work rather than the tables, a role matrix held
by the server is the one source of what each role may see and do, and every
route, action and record is checked there, because a hidden menu entry is
presentation. The overview carries a handful of KPIs, each a definition with a
formula computed on the server and a drill down to exactly the records it
counts. Tables page on the server, keep their filters in the URL, sort from a
real button and name every row action; every chart has a text twin; every
state, from first use to permission denied, is designed. Nothing decorative
moves. Its contract and its twenty six point gate are in
`resources/dashboard-contract.md`.

Reference implementations in `examples/`: a one page portfolio for an independent
sports coach and a four page showcase for a building trade company, both with
fictional content, both run and verified end to end; and the specification of a
hotel operations dashboard, with the acceptance checklist an implementation
must pass.
