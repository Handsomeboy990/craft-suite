# font-loading

Self-hosts and loads web fonts so text renders at once and the swap does not
move the layout: an inventory of the faces actually rendered, woff2 subsets
split by unicode-range, font-display per role, one preload for the critical
face, a metric-matched fallback with size-adjust and the ascent, descent and
line-gap overrides, variable fonts where they save bytes, immutable caching,
the font's own licence, no third-party font request, and CLS, LCP and bytes
measured before and after.

- Inputs: the typeface and its licence, the type scale and roles, the locales
  and scripts, the pages and their first viewport.
- Outputs: font inventory, font-face declarations, fallback metrics, preload
  plan, font budget report.
- Depends on: engineering-core, frontend-engineering.
- Lateral: design-system, internationalization, caching-strategy,
  data-privacy, dependency-selection.
- Downstream: performance-engineering, seo-engineering,
  playwright-automation, code-review-protocol.

Resources: `resources/fallback-metrics.md` holds the formulas and the overlay
check, `resources/font-face-checklist.md` the audit run against deployed
pages. The example moves a site off a third-party font service.

A font is a dependency with a licence, and a font request to another company's
server is a disclosure of every visitor's address. Both are settled before any
performance work begins.
