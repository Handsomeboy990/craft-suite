# Audit dimensions

The full set of checks an audit walks, split by the line in `SKILL.md` section
1. Passive checks run on any public URL. Active checks run only once the
section 2 authorization gate is satisfied. Each names the skill that owns its
depth.

## Passive: front end and product

| Check | Observed by | Owner |
|---|---|---|
| Pages reachable from the entry URL | crawling links in the rendered DOM | `playwright-automation` |
| Forms and interactive controls present | enumerating the rendered elements | `playwright-automation` |
| Console errors | reading the browser console during navigation | `playwright-automation` |
| Network errors and failed requests | reading the network log | `playwright-automation` |
| Broken internal and outbound links | requesting each link target and reading the status | `playwright-automation` |
| Custom 404 present | requesting an unknown path and rendering the result | `launch-readiness` |
| Legal pages present and linked | finding the privacy and terms links and loading them | `launch-readiness` |
| Real content, not placeholder | reading the rendered copy | `design-authenticity` |
| Design authenticity cluster | reading the rendered visuals, type, motion and content | `design-authenticity` |

## Passive: performance and accessibility

| Check | Observed by | Owner |
|---|---|---|
| Load time against a budget | measuring navigation timing | `performance-engineering` |
| Transfer sizes and image weight | reading the network log | `performance-engineering` |
| Render-blocking resources | reading the load waterfall | `performance-engineering` |
| Colour contrast | measuring rendered colours | `accessibility-testing` |
| Keyboard operability and focus order | driving the page by keyboard | `accessibility-testing` |
| Labels and names | reading the accessibility tree | `accessibility-testing` |
| Reduced motion respected | toggling the preference and observing | `accessibility-testing` |

## Passive: discoverability

| Check | Observed by | Owner |
|---|---|---|
| Title and meta description per page | reading the document head | `seo-engineering` |
| Social preview image | reading the metadata and unfurling | `seo-engineering` |
| Favicon | requesting the icon | `seo-engineering` |
| sitemap.xml and robots.txt | requesting both | `seo-engineering` |
| Canonical URLs | reading the head | `seo-engineering` |

## Passive: observable security posture

Observed because the server volunteered them in a normal response. Probing what
they allow is active.

| Check | Observed by | Owner |
|---|---|---|
| Security response headers | reading the response headers | `security-headers` |
| TLS certificate validity and coverage | reading the certificate the browser received | `security-headers` |
| HTTPS enforcement | requesting over HTTP and reading the redirect | `security-headers` |
| Cookie flags on responses | reading Set-Cookie headers | `session-security` |
| Secrets visible in the client bundle | reading the served JavaScript | `secrets-management` |

## Active: authorized target only

Runs only after the section 2 gate. Delegated entirely; not reinvented here.

| Check | Owner |
|---|---|
| Structured non-destructive vulnerability sweep | `vulnerability-assessment` |
| Authentication and session tests | `authentication-security`, `session-security` |
| Object-level and function-level access tests | `authorization-design` |
| Injection, rendering-sink and boundary tests | `input-validation`, `security-audit` |
| Upload handling tests | `file-handling`, `security-audit` |
| Exploitation to prove impact of a confirmed finding | `authorized-pentesting` |

## Authenticated testing

Needs a session. The human holds the registration and verification step, per
`SKILL.md` section 5. The audit never invents credentials, never uses a
stranger's email, and never automates around a verification wall.
