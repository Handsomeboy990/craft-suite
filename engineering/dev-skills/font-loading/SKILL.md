---
name: font-loading
description: Self-hosts and loads web fonts so text is readable at once and never jumps: an inventory of the faces actually used, woff2 only, subsets split by unicode-range, a font-display value chosen per role, a preload for the one critical face, a metric-matched fallback built with size-adjust and the ascent, descent and line-gap overrides, variable fonts where they save bytes, immutable caching, the font's own licence honoured, no third-party font request, and CLS, LCP and bytes measured before and after. Use whenever a site adds, changes or audits a custom typeface.
license: MIT
metadata:
  category: dev-skills
  version: 1.0.0
  depends_on: [engineering-core, frontend-engineering]
  outputs: [font-inventory, font-face-declarations, fallback-metrics, preload-plan, font-budget-report]
---

# Font Loading

A custom typeface is the heaviest piece of a page that most teams never
measure. Loaded carelessly it hides text, shifts the layout when it arrives,
costs several requests to another company's server and leaks every visitor's
address to it. Loaded well it costs one small file from the site's own origin,
and the swap is invisible.

This skill owns the delivery of fonts: which files exist, how they are
declared, discovered, cached and replaced by a fallback. The choice of the
typeface itself belongs to `design-system` and `ui-ux-engineering`; the
licence decision to `dependency-selection`, here applied to a font.

## 1. Inventory before files

Nothing is downloaded, subset or preloaded before the inventory exists.

```
family         each family the design actually uses, not the one it imported
faces          weight and style pairs that appear in rendered pages, found by
               reading the computed styles, not the design file
roles          body, heading, interface, logo, code, icon
scripts        the writing systems the content and the locales contain
critical       the one face that renders text inside the first viewport,
               usually the body regular or the main heading
source         where the font came from, its version, and its licence
```

The most common waste is a family loaded at nine weights for a page that
renders three. The most common defect is an italic or bold that was never
loaded, so the browser synthesises it; set `font-synthesis: none` once the
inventory is complete so a missing face shows up in review instead of in
production.

## 2. Format

```
woff2 only, for every browser the project supports in practice
no eot, no svg fonts, no ttf or woff fallback unless the support matrix names
  a browser that needs it, recorded with the reason
src lists url() with format("woff2"); add tech(variations) only when serving
  variable and static files side by side
no local() for the primary face: an installed copy may be a different version
  with different metrics, and probing installed fonts is a fingerprinting
  surface
```

A font converted to woff2 from a desktop file is still the desktop file:
hinting tables and unused features ride along. Strip what the web build does
not use when subsetting (section 3).

## 3. Subsetting by unicode-range

A font file carries every glyph the foundry drew. A page needs the glyphs its
languages use.

```
split the font into subsets by script: latin, latin extended, cyrillic,
  greek, vietnamese, and so on, one file per subset per face
declare each subset in its own @font-face with the same family, weight and
  style, and a unicode-range that matches exactly what the file contains
the browser then downloads only the subsets whose characters appear on the
  page, which is the whole point of unicode-range
derive the ranges from the content and the locales in scope, then keep a
  margin: punctuation, currency signs, the typographic quotes and dashes the
  copy uses, the non breaking space
keep the layout features the text needs (kerning, ligatures, the locale's
  forms) and drop the rest
```

A unicode-range that claims characters the file does not contain renders
those characters in the fallback with no warning. Verify every subset against
the real text of every locale, including user generated content and names.

Never subset to the exact characters of one page for a site whose content
changes. That is a font that breaks on the next article.

## 4. font-display, per role

The display timeline has three periods: block (text drawn invisible), swap
(fallback drawn, replaced when the font arrives) and failure (fallback kept).

| Value | Block | Swap | Fits |
|---|---|---|---|
| `block` | short | infinite | almost nothing; icon fonts, which should be SVG instead |
| `swap` | extremely small | infinite | headings and logos, where the face matters and the text is short |
| `fallback` | extremely small | short | body text without a metric-matched fallback |
| `optional` | extremely small | none | body text where any shift is unacceptable; the face may only appear from the second view |

The CSS Fonts specification recommends `fallback` for large pieces of text and
`swap` for small ones, because a late swap under a reader's eyes moves the
line they are reading. With the metric-matched fallback of section 6, a swap
moves almost nothing, and `swap` on body text becomes acceptable. Without it,
it is not.

Never leave the value to the browser default. `auto` is block-like in many
browsers, which means invisible text for up to a few seconds on a slow
network: the opposite of fast.

## 5. Discovery and preload

A font is discovered late by construction: the browser needs the HTML, then
the CSS, then a rendered element that uses the face. Shorten that chain once.

```
the @font-face rules live in the first stylesheet, or inline in the head,
  never behind an @import chain and never in a stylesheet loaded by script
preload exactly one face: the critical one from the inventory, the subset
  the first viewport actually renders
the preload URL is byte for byte the URL in the @font-face src, or the file
  downloads twice
the preload carries as="font", type="font/woff2" and crossorigin, even on the
  same origin, because fonts are fetched in anonymous CORS mode
no preconnect is needed: the font is on the site's own origin
```

Every additional preload competes with the stylesheet, the hero image and the
script for the same early bandwidth. Preloading every weight makes the first
render slower, not faster. A second preload is justified only by a
measurement that shows the second face inside the first viewport delaying LCP.

## 6. A fallback that does not shift

Layout shift on font swap comes from the fallback and the web font having
different glyph widths and vertical metrics. CSS can correct both on a local
fallback face.

```
@font-face {
  font-family: "Brand Fallback";
  src: local("Arial");
  size-adjust: <percentage>;        scales glyphs and every metric below
  ascent-override: <percentage>;
  descent-override: <percentage>;
  line-gap-override: <percentage>;
}
body { font-family: "Brand", "Brand Fallback", sans-serif; }
```

The method, with the formulas, is in `resources/fallback-metrics.md`. Its
essentials:

```
size-adjust matches the average glyph width of the web font, so lines wrap
  at the same words
the overrides take the web font's ascent, descent and line gap, divided by
  size-adjust, because size-adjust also scales the overrides
one set of numbers matches one fallback font; a stack of local() fonts with
  different metrics needs one fallback face per platform, or an accepted
  approximation recorded as such
the numbers are verified by overlay, the web font and its fallback rendered
  over each other at the real sizes, not trusted from a calculator
```

Where a browser ignores an override, the fallback simply keeps its natural
metrics, which is the situation the page was already in. The declarations are
safe to ship; their effect is measured per browser in section 10.

## 7. Variable fonts

```
count the faces the inventory needs before choosing: a variable file is
  usually heavier than one static face and lighter than several
declare the axis range in the descriptor: font-weight: 100 900, and
  font-stretch or font-style ranges where the axes exist
subset a variable font exactly like a static one, and keep only the axis
  range the design uses where the tooling allows instancing
italics: a separate file, or an ital or slnt axis, as the font ships them
use font-variation-settings only for custom axes; registered axes go through
  font-weight, font-stretch and font-style so the cascade keeps working
```

The decision and the byte counts behind it are written in the budget report.

## 8. Hosting and caching

```
font files live on the site's own origin, under a path the build controls
file names carry a content hash or the font version, so a new file is a new
  name
served with Content-Type: font/woff2
cached with Cache-Control: public, max-age=31536000, immutable, safe only
  because the name changes when the content does
compression: none on top of woff2, which is already compressed
if the files must live on another origin (a CDN under another hostname),
  that origin sends Access-Control-Allow-Origin for the site, or every font
  fails silently to the fallback
```

The cache rules belong to the project's `caching-strategy`; this skill states
what fonts need from it.

## 9. Licence and privacy

The font is a dependency with a licence, and `dependency-selection` applies to
it like to any library.

```
record the licence of every family before the file enters the repository
SIL Open Font License: self-hosting and modification are permitted; keep the
  licence text next to the files; when the font declares a Reserved Font
  Name, read the licence and its FAQ on subsets before renaming or shipping a
  modified file
Apache 2.0 and other permissive licences: keep the notice
commercial fonts: the web licence decides everything: page view or domain
  limits, whether self-hosting is allowed, whether subsetting or conversion is
  allowed. When the licence is unclear, the font is not shipped
a font extracted from a design tool, an operating system or another site is
  not licensed for the web because it was available
```

Self-hosting is also the privacy rule. A font requested from a third-party
server sends that server every visitor's IP address, user agent and the page
they are reading, before any consent can be asked. Under this skill no page
requests a font from another company's origin; `data-privacy` holds the wider
inventory.

## 10. Measurement

Before and after, on the same pages, the same throttled profile, and in the
field when the project has field data.

```
CLS       the layout shift entries attributed to the font swap, which should
          drop to near zero with the fallback of section 6
LCP       when the LCP element is text, its render time; a block period or a
          late discovered font shows up here
bytes     total font bytes transferred on first view, per page template
requests  font requests count, and their origins: none outside the site
FOIT      the time text is invisible, read from a filmstrip, target zero
```

Use the browser performance panel, the layout shift and LCP entries from the
Performance API, and `document.fonts` to confirm which faces loaded. Record
the numbers in the budget report with the conditions. A claim of improvement
without the before measurement is not a claim; `performance-engineering`
holds that rule.

## 11. Prohibitions

- Never request a font from a third-party origin on a production page.
- Never ship a font whose licence has not been read and recorded.
- Never leave `font-display` unset.
- Never preload more than the critical face without a measurement that
  justifies the second.
- Never let a preload URL differ from the @font-face URL.
- Never declare a unicode-range wider than what the subset file contains.
- Never subset a font to the characters of one page on a site whose content
  changes.
- Never cache a font file as immutable under a name that does not change with
  its content.
- Never claim a CLS, LCP or byte improvement without the before measurement.

## 12. Protocol

1. Build the inventory from rendered pages: families, faces, roles, scripts,
   the critical face, and the licence of each source.
2. Record the licence decision through `dependency-selection`; stop on any
   font whose web use is not clearly permitted.
3. Measure the current state: CLS, LCP, font bytes, requests and their
   origins.
4. Produce woff2 subsets per script per face, or a variable file where the
   byte count favours it.
5. Write the @font-face rules with exact unicode-ranges and a font-display
   value per role.
6. Compute the fallback metrics, declare the fallback face, verify by overlay.
7. Preload the critical face only, with the exact URL and crossorigin.
8. Serve with hashed names, the right content type and immutable caching.
9. Remove every third-party font request, including in templates, emails
   rendered as pages and embedded widgets the project controls.
10. Measure again under the same conditions and write the budget report.
11. Hand the diff to `code-review-protocol`.

## 13. Auto-critique

Score from 0 to 5: inventory matches rendered usage, licence recorded per
family, woff2 subsets with exact unicode-ranges, font-display justified per
role, single preload matching the src URL, fallback metrics computed and
verified by overlay, variable or static decision backed by byte counts,
caching and content type correct, no third-party font request, before and
after measurements under the same conditions.

Threshold: no axis below 3, average at least 4. A font shipped without a
recorded licence, a production page requesting a font from a third-party
origin, or an improvement claimed without a before measurement is an
automatic failure.

## 14. Interfaces

- Upstream: `design-system` and `ui-ux-engineering` for the typeface, the
  type scale and the roles; `dependency-selection` for the licence decision.
- Lateral: `frontend-engineering` for the templates and the build,
  `internationalization` for the scripts and locales the subsets must cover,
  `caching-strategy` for the cache rules, `data-privacy` for the third-party
  request inventory, `design-authenticity` when the default font is the
  generic choice.
- Downstream: `performance-engineering` for the measured delta,
  `seo-engineering` for the page experience signals, `playwright-automation`
  for visual checks of the swap, `code-review-protocol` before the work is
  called done.
