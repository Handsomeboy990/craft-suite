# Launch checklist

Every deliverable a user-facing web product carries, grouped by the eight
domains of `SKILL.md` section 2. Each row states when the item applies, the
skill that owns its depth, and how the item is verified by observation rather
than by reading the source. The `compliance-verifier` agent walks this grid
and records a status per row.

Stack agnostic. The concrete failure each item maps to on a Supabase and
Next.js project is in `supabase-next-appendix.md`.

## Legal and compliance

| Item | Applies when | Owner | Verified by |
|---|---|---|---|
| Privacy policy page | any personal data is collected | `data-privacy`, `administrative-writing` | the page loads at a stable URL and is linked from the footer; its clause checklist is complete for the data actually held; the wording is the owner's, never generated here |
| Terms of use page | accounts, payments or a contract of use exist | `administrative-writing` | loads, is linked, structure present, wording supplied by the owner |
| Legal notice | the jurisdiction requires a publisher identity | `administrative-writing` | loads, is linked, required identity fields present |
| Cookie policy page | any non essential cookie or third party is set | `data-privacy` | loads, is linked, lists the categories actually set |
| Cookie consent banner | a non essential cookie or tracker loads before consent | `data-privacy` | with consent withheld, no non essential cookie and no tracker network request fires; the choice persists |

The legal text is never written by this gate. The deliverable is the page, its
required clauses, its links and its reachability.

## Discoverability

| Item | Applies when | Owner | Verified by |
|---|---|---|---|
| Page title | always | `seo-engineering` | each route returns a distinct, meaningful title tag |
| Meta description | always | `seo-engineering` | present and specific per route, not one string site wide |
| Social preview image | any page will be shared | this gate | a link unfurls to a card in a preview tool; the image URL returns an image of the right dimensions |
| Favicon | always | this gate | the browser request for the icon returns one, at every declared size, not a 404 |
| sitemap.xml | the site has more than a handful of routes | `seo-engineering` | fetched, well formed, lists the real public routes |
| robots.txt | always | `seo-engineering` | fetched, and its allow and disallow match the real indexing intent, not a framework default that blocks everything |
| Canonical URLs | duplicate paths can reach the same content | `seo-engineering` | each page declares its canonical, no self conflicting tags |

## Content and media

| Item | Applies when | Owner | Verified by |
|---|---|---|---|
| Real copy | always | this gate | no placeholder or lorem text on any shipped page |
| Real images | always | this gate | no framework stock or broken image on a shipped page |
| Compressed images | any image is served | `performance-engineering` | image transfer sizes are within budget; a modern format is served where supported |
| Alt text | any meaningful image | `accessibility-testing` | every content image has alt text, decorative images are marked empty |

## Performance

| Item | Applies when | Owner | Verified by |
|---|---|---|---|
| Page load budget | always | `performance-engineering` | a measured load against a stated budget, on a representative page, not a guess |
| Lazy loading below the fold | pages carry many images or heavy media | `performance-engineering` | offscreen media is deferred, verified in the network trace |
| Caching correctness | any response is cached | `caching-strategy` | a cached response never carries one user's data to another; cache keys and lifetimes are stated |

## Accessibility

| Item | Applies when | Owner | Verified by |
|---|---|---|---|
| Colour contrast | always | `accessibility-testing` | text and interactive elements meet the required ratio, measured |
| Keyboard operability | any interactive element exists | `accessibility-testing` | every control is reachable and operable by keyboard, focus is visible |
| Responsive layout | always | `accessibility-testing` | the layout holds from a narrow phone width to a wide screen with no horizontal overflow or clipped content |

## UX integrity

| Item | Applies when | Owner | Verified by |
|---|---|---|---|
| Custom 404 page | always | this gate | an unknown URL returns a 404 styled to the project, with a way back, not the framework default |
| No broken links | always | this gate | a crawl of internal and outbound links reports no dead target |
| Form validation | any form exists | `input-validation` | invalid input is rejected with a clear, specific message, on the server as well as the client |
| Anti-spam | any public form exists | `input-validation` | a bot filling the form is resisted, by honeypot, challenge or rate limit; the method is stated |
| One primary call to action | any page asks the user to act | this gate | each page has a single clear primary action, not several competing ones |
| No dead functionality | always | `implementation-integrity` | every button, link and form reachable by a user does something real; no stub, no fake success |

## Analytics and measurement

| Item | Applies when | Owner | Verified by |
|---|---|---|---|
| Analytics installed | measurement is wanted | `analytics-instrumentation` | a real event reaches the tool, verified end to end, not just a script tag present |
| Consent gated | analytics sets a non essential cookie or identifier | `data-privacy` | no analytics identifier is set before consent where the law requires it |
| Events designed | analytics is installed | `analytics-instrumentation` | events answer stated questions, named consistently, not a blanket capture of everything |

## Security posture

Entirely delegated. This gate runs the owning skill and records its result; it
does not re-audit. Every row is a `FAIL` that blocks launch, never a tradeable
item.

| Item | Applies when | Owner | Verified by |
|---|---|---|---|
| No secret in the repository | always | `secrets-management` | a scan of the working tree and the git history finds no key, token or credential; a found one is rotated, not just deleted |
| No secret in the client bundle | a frontend is built | `secrets-management` | the shipped bundle contains no server secret; only public, publishable keys reach the browser |
| No privileged key client side | a backend service uses a privileged key | `secrets-management`, `authorization-design` | the privileged service key is never referenced in client code or the bundle |
| Server side authorization | any protected resource exists | `authorization-design` | every access decision is made on the server; the client cannot grant itself access by changing a request |
| Row level access at the database | a multi tenant or per user database exists | `authorization-design` | row level rules are enabled and enforce that a user reads and writes only their own rows, tested with a second identity |
| Sensitive data encrypted | sensitive data is stored | `data-privacy` | data that requires it is encrypted at rest; the fields are named |
| Secure session cookies | sessions exist | `session-security` | session cookies are http only, secure and same site as the threat model requires |
| Passwords hashed | passwords are stored | `authentication-security` | passwords are stored only as a strong slow hash, never reversible |
| Login rate limited | a login exists | `input-validation`, `authentication-security` | repeated login attempts are throttled per account and per source |
| Anti-bot protection | public or abusable endpoints exist | `input-validation` | abusable endpoints resist automated abuse; the method is stated |
| Parameterised queries | a database is queried | `input-validation` | queries are parameterised; no user value is concatenated into a query |
| All inputs validated | any external input is read | `input-validation` | every body, param, header and upload is validated at the trusted boundary |
| Output escaped | user content is rendered | `input-validation` | user content is escaped or sandboxed at every sink; no injection into markup |
| Uploads restricted | file upload exists | `file-handling` | type by content, size before parsing, filename neutralised, stored outside the served tree |
| Minimal fields returned | an API returns records | `authorization-design` | responses carry only the fields the client needs, no internal or other user fields |
| Security headers set | always | `security-headers` | the response carries the content security, transport, frame and type headers the site needs |
| CORS scoped | an API is called cross origin | `security-headers` | cross origin access is limited to the origins that need it, not a wildcard with credentials |
| Errors not leaked | always | `security-audit` | production returns a single generic error to the user; stack traces and detail stay in the server log |
| Debug logging clean | always | `security-audit` | no development console logging and no secret in any log in production |
| Signed webhooks | a webhook is received | `input-validation`, `authentication-security` | every inbound webhook verifies its signature before acting |
| Dependencies scanned and current | dependencies exist | `dependency-security` | a vulnerability scan runs and its findings are resolved or accepted in writing; nothing critically outdated ships |
| HTTPS enforced | always | `deployment-engineering`, `security-headers` | plain HTTP redirects to HTTPS; the transport security header is set |

## Infrastructure and data

| Item | Applies when | Owner | Verified by |
|---|---|---|---|
| Valid TLS certificate | always | `deployment-engineering` | the certificate is valid, current, and covers every served hostname |
| Email confirmation on signup | self service accounts exist | `authentication-security` | a new account cannot act until its email is confirmed, where the design requires it |
| Automated database backup | a database holds real data | `backup-recovery` | backups run on a schedule, and a restore has actually produced the data; an unrestored backup is not counted |
