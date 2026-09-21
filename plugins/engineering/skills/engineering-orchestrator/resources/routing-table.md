# Routing table

From a phrase in the request to a category. Used when classification is not
obvious. When several rows match, the row with the stricter gates wins.

## Phrase to category

| The request says | Primary | Secondary |
|---|---|---|
| how does X work, where is Y | EXPLORATION | |
| add a page, add a screen | FRONTEND | UI_UX, VALIDATION |
| add an endpoint, add a route | BACKEND | API, VALIDATION, SECURITY |
| add a feature | FULLSTACK | ARCHITECTURE, VALIDATION, TESTING |
| add a field, add a table | DATABASE | BACKEND, API |
| change the response shape | API | DOCUMENTATION |
| login, signup, password, session, token | AUTHENTICATION | SECURITY, VALIDATION |
| is this secure, audit, vulnerability, CVE | SECURITY | |
| sanitise, validate, reject bad input | VALIDATION | SECURITY |
| it is broken, it fails, it crashes, wrong result | DEBUGGING | |
| slow, laggy, times out, heavy, large bundle | PERFORMANCE | |
| looks wrong, redesign, spacing, mobile, contrast | UI_UX | FRONTEND |
| add tests, coverage, flaky | TESTING | |
| screenshot, click through, user journey, visual check | BROWSER_AUTOMATION | TESTING |
| document, readme, explain in docs | DOCUMENTATION | |
| commit, branch, pull request, rebase | GIT | |
| ship it, release, deploy, version | RELEASE | TESTING, SECURITY |
| clean up, restructure, extract, rename | REFACTORING | TESTING |
| use library X, replace X, upgrade X | DEPENDENCY | SECURITY, PERFORMANCE |
| test the whole thing, QA the product, validate before launch | QUALITY_CAMPAIGN | TESTING, SECURITY |
| keyboard, screen reader, contrast, WCAG, a11y | ACCESSIBILITY | UI_UX |
| did anything else break, after the fix, before merging | REGRESSION | TESTING |
| upgrade the framework, move to X, replace provider Y | MIGRATION | DEPENDENCY, DATABASE |
| inherited project, no tests, nobody knows this code | LEGACY | EXPLORATION, REFACTORING |
| production is down, outage, incident, postmortem | INCIDENT | DEBUGGING |
| provision, terraform, cloud resources, new environment | INFRASTRUCTURE | SECURITY |
| checkout, subscription, refund, invoice, payment webhook | PAYMENTS | BACKEND, SECURITY |
| queue, worker, cron, background task, webhook consumer | JOBS | BACKEND |
| live updates, websocket, presence, collaborative editing | REALTIME | FULLSTACK |
| upload, attachment, media, import, export a file | FILES | VALIDATION, SECURITY |
| translate, locale, timezone, currency, right to left | I18N | FRONTEND |
| metadata, sitemap, canonical, ranking, indexing | SEO | FRONTEND, PERFORMANCE |
| tokens, component library, theme, dark mode, consistency | DESIGN_SYSTEM | UI_UX |
| personal data, GDPR, retention, delete my account, export my data | PRIVACY | SECURITY, DATABASE |
| cache it, invalidation, CDN, stale data | CACHING | PERFORMANCE |
| track this, events, funnel, conversion, product metrics | ANALYTICS | PRIVACY |
| feature flag, toggle, gradual rollout, kill switch, A/B test | FEATURE_FLAGS | RELEASE |
| visual regression, screenshot diff, has the layout moved | BROWSER_AUTOMATION | UI_UX |
| notification, transactional mail, push, digest | JOBS | BACKEND |
| terraform, kubernetes, helm, provision the cluster | INFRASTRUCTURE | SECURITY |
| a site for a client, portfolio, showcase site, the client must edit it himself | SITE_TEMPLATE | UI_UX, FRONTEND |

## Surface detection

The category says what kind of work. The surface says where. Both are needed
before a plan exists.

| Signal in the repository | Surface |
|---|---|
| the touched path is under a routes or pages directory | frontend |
| the touched path is under an api, handlers, controllers or services directory | backend |
| a schema, model or migration file is touched | database |
| both a page and a handler must change | fullstack |
| only config, CI or scripts change | delivery |
| only markdown changes | documentation |

When the surface cannot be named from the repository, the plan starts with
exploration and the classification is provisional.

## Gate triggers

Any one of these facts in the diff forces the corresponding gate, whatever the
category.

| Fact | Forced gate |
|---|---|
| a new request body, query or param is read | `input-validation` |
| a query filters by a user supplied identifier | `security-audit`, object level authorization |
| a price, quantity, role or state comes from the client | `security-audit` |
| a file upload is accepted | `security-audit`, `input-validation` |
| a template or DOM sink receives user content | `security-audit`, XSS |
| a URL from user input is fetched server side | `security-audit`, SSRF |
| a shell command or path is built from input | `security-audit`, injection |
| a file is accepted from a client | `file-handling`, `input-validation` |
| an amount, a plan or a discount is involved | `payment-engineering`, `security-audit` |
| personal data is collected, copied or exported | `data-privacy` |
| work is moved out of the request | `background-jobs` |
| a response is cached, at any layer | `caching-strategy` |
| a user visible string is added | `internationalization`, where locales exist |
| an event is emitted for measurement | `analytics-instrumentation`, `data-privacy` |
| a conditional ships disabled | `feature-flags`, with an owner and a date |
| an interactive element is added or changed | `accessibility-testing` |
| a public URL changes | `seo-engineering`, redirect map |
| a dependency is added or bumped | `dependency-selection`, `security-audit` |
| a migration is added | `code-review-protocol`, reversibility check |
| any behaviour changes | `testing-quality` |
| any file is written by the agent | `code-review-protocol` |

## Escalation

A plan is recomposed, not patched, when:

- exploration reveals a second application affected by the change;
- the defect turns out to be in a dependency rather than in the project;
- the requested change requires a schema migration that was not anticipated;
- a security finding of high severity appears mid task;
- the stack is not what the first read suggested.

Each recomposition is announced in one line stating what changed.
