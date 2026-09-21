---
name: site-template-generation
description: Builds a client website as a fixed template driven by an external content file: the content contract per template kind, design tokens chosen by trade instead of literals in components, the no-code fields the client edits after delivery, legal pages generated from the company's real facts and never invented, the accessibility and mobile-first rules, and the ten point gate a template passes before it counts as finished. Use when building a portfolio or a showcase site, a reusable site template, or any site whose content must stay editable without touching the code.
license: MIT
metadata:
  category: dev-skills
  version: 1.0.0
  depends_on: [engineering-core]
  outputs: [content-contract, token-profile, admin-field-map, legal-fact-sheet, completion-gate-report]
---

# Site Template Generation

A site built for a client is delivered twice: once as a page, and once as
something the client can still change a year later. This skill builds the
second. The template is fixed and written by hand; the site is an instance of
it, produced by injecting a content file. What a person would ever want to
change lives in that file, and what the file does not hold is a defect rather
than a shortcut.

## 1. Three artefacts, kept apart

```
template    components, layout, routing, behaviour. Written once, reused for
            every instance. Contains no client fact and no visual literal.
content     one structured file holding every string, image, colour, hour and
            contact detail a human would want to change. One instance of the
            site is one content file.
tokens      the visual vocabulary: palette, type scale, spacing, radius,
            motion. Declared as data in the content file, consumed by the
            template as variables.
```

The separation is testable: a value found in a component and not in the content
file fails the gate in section 10, whatever it is. The reverse is equally firm:
logic never moves into the content file, because the client edits that file and
must not be able to break the build by editing text.

## 2. Two kinds, and what actually differs

| | portfolio | showcase |
|---|---|---|
| Owner | one person trading under their own name | a company with a legal identity |
| Shape | one page, anchored sections, one scroll | several pages, one per intent |
| Voice | first person, personal | third person, institutional |
| Proof | gallery, results, testimonials | services, references, credentials |
| Action | a message, a booking | a quotation request |
| Legal | the pages the person's activity requires | legal notice, terms, privacy, cookies, all of them |

The kind is decided before anything is written, because it changes the content
contract, the navigation, the number of routes and the legal surface. A
portfolio with six routes is a showcase that was not planned, and a showcase
squeezed onto one page loses the pages a company is required to publish.

## 3. The content contract

The contract is fixed per kind, not improvised per project. One fixed contract
is what allows a single administration surface, a single validation function and
a single handover document to serve every instance.

```
root        site, brand, theme, nav, sections, contact, forms, legal, seo
required    refused at build with a named field, never silently defaulted
optional    absent means the section does not render at all, not that it
            renders empty
arrays      ordered, may be empty, and the template renders the empty case
            without a broken frame
alt text    a content field on every image, never a constant in a component
```

Field by field, both kinds: `resources/content-contract.md`. A project that
needs a field the contract does not have extends the contract, once, for every
instance, rather than adding a literal to one component.

## 4. Tokens are chosen by trade, never by taste of the day

The trade decides the token values; the component only reads them. Three axes
carry almost all of the difference between a coach and an electrician: palette,
typography and how much the page is allowed to move.

```
palette     a surface, a foreground, one accent with a hover and a contrast
            checked pair, plus the semantic states. Stated as tokens, never as
            a hex value inside a component
type        one display family and one text family, a scale with a ratio, and
            weights that exist in the loaded faces
motion      an intensity scalar between 0 and 1 that multiplies every duration
            and every travel distance in the template
```

An energetic trade and a technical trade differ by the value of those tokens,
not by a second version of the template. The profiles, with their intensities
and their reasoning, are in `resources/trade-profiles.md`.

Breakpoints are the one visual value that cannot be a token: a CSS media query
cannot read a custom property. They are declared once in the stylesheet and
listed in the handover as not client-editable, rather than pretended to be
configurable.

Motion intensity is a number in the content file because it is a business
decision, not a code decision: a personal trainer wants the page to move, an
electrician quoting on a rewiring job wants it to sit still. Zero is a legal
value of that field, and `prefers-reduced-motion` forces zero regardless of it.

## 5. The no-code administration contract

What the client may change without a developer is decided at build time and
written down, not discovered later.

```
editable    every visitor-facing string, every image and its alt text, the
            palette and the motion intensity, opening hours, contact details,
            the order and visibility of optional sections, the legal facts,
            the form endpoint
not editable structure, routing, components, validation rules, the shape of the
            contract itself
shape       flat enough that a form editor can render it: values and lists of
            values, no expression, no conditional, no markup beyond a declared
            inline subset
```

Every editable field is listed in the handover with its type, its limits and
what it visibly changes. A field that appears in the handover and is not wired
to the template is a promise the client discovers is false, which is the single
most expensive defect this skill exists to prevent. The field map lives in
`resources/admin-contract.md`.

## 6. Legal pages are built from facts, and never invented

A legal page is a statement about a real company. The template assembles it from
the facts that company has actually provided.

```
provided     rendered
missing      rendered as a visible, unmistakable marker naming the missing
             fact, never as a plausible invention
structural   the headings and the connective sentences of a notice may be
             templated, because they carry no claim
obligation   any clause that binds, a warranty, a withdrawal period, a
             jurisdiction, a mediator, is taken from the company's own document
             or left marked for its counsel
```

Never assert a registration number, a VAT identifier, an insurance policy, a
professional certification, a capital amount, a mediator or a hosting provider
that was not given. Inventing one of those is not a placeholder, it is a false
legal statement published under the client's name.

A site with unresolved markers may be reviewed and may be staged; it may not be
announced as delivered. The marker is visible in the rendered page on purpose:
a missing legal fact hidden in a comment is a missing legal fact nobody fixes.
Page by page, the facts each one requires: `resources/legal-fact-sheet.md`.

## 7. Accessibility and responsive rules, applied while building

```
mobile first  designed at 360px, then widened; no horizontal scroll at any
              width the project supports
contrast      measured against the trade palette, both themes where two exist,
              4.5:1 for text and 3:1 for interface and large text
keyboard      every action reachable and operable, focus visible on every
              interactive element, order following the reading order
semantics     landmarks, one h1 per page, headings that descend without gaps,
              a skip link where the navigation is long
forms         a real label per field, errors announced and associated with
              their field, never colour alone
motion        prefers-reduced-motion removes movement rather than shortening it
targets       44px minimum for anything tapped
```

These are build-time requirements, not a later audit. `accessibility-testing`
verifies what was built this way; it does not retrofit what was not.

## 8. Static export constrains the design

A statically exported site has no server at runtime, and the template is built
knowing it.

```
forms       post to an endpoint held in the content file, with a mailto
            fallback declared, and a visible failure state
secrets     nothing secret reaches the bundle; a public form endpoint is
            public by definition and is rate limited at the provider
content     read at build time, so a content change is a rebuild, and the
            handover says so in those words
routes      every page exists as a file after export, including each legal
            page, and links are checked on the exported output
```

## 9. Prohibitions

- No demonstration content inside a component: no name, no photograph, no
  telephone number, no address, no price.
- No colour, radius, duration or font literal inside a component.
- No invented legal fact, registration number, insurance, certification,
  testimonial or client reference.
- No real person's identity, photograph or contact details used as sample data.
- No no-code field listed in the handover that is not wired to the content file.
- No optional section that renders an empty frame when its block is absent.
- No template declared finished before the gate in section 10 passes whole.

## 10. The completion gate

Ten checks. All ten pass, or the template is not finished.

```
1   every visitor-facing string, image, colour, hour and contact detail
    resolves from the content file, verified by searching the components for
    literals and finding none
2   every required field is refused at build with a message naming the field
3   every optional block absent removes its section cleanly, verified on a
    content file with all of them removed
4   changing one token changes the rendered site, verified by changing one
5   motion intensity is honoured, and prefers-reduced-motion removes motion
6   every legal page the kind requires exists, is generated from the facts,
    and marks visibly every fact not provided
7   contrast measured, keyboard path walked, 360px to the widest supported
    width with no horizontal scroll
8   every form has labels, validation, a configurable endpoint, and a visible
    failure state
9   no demonstration data and no real personal data remain anywhere
10  the handover lists every no-code field, where it lives, what it changes,
    and that a content change requires a rebuild
```

## 11. Protocol

1. Establish the kind, portfolio or showcase, the trade, and the legal identity
   of the owner. The kind decides the contract, the routes and the legal
   surface.
2. Collect the facts that only the client has: legal identity, contact details,
   hours, services, prices, images and their rights. Record what is missing
   rather than filling it.
3. Fix the content contract for the kind, and write the validation that refuses
   a missing required field by name.
4. Choose the token profile from the trade, including the motion intensity, and
   express every visual value as a token.
5. Build the template against the contract, with no client fact and no visual
   literal inside a component.
6. Generate the legal pages from the fact sheet, marking visibly every fact not
   yet provided.
7. Apply the accessibility and responsive rules while building, then verify
   them with `accessibility-testing`.
8. Produce the example content file with clearly fictional data, and render the
   site from it.
9. Run the ten point gate in section 10, whole. Fix and re-run what a fix
   touched.
10. Write the handover: the field map, what each field changes, the rebuild
    rule, and the list of legal facts still to provide.

## 12. Auto-critique

Score from 0 to 5: the content contract holds everything a human would want to
change, the tokens carry every visual value and match the trade, the no-code
field map is complete and every field in it is actually wired, the legal pages
are built from provided facts with the missing ones visibly marked, and the
accessibility and responsive rules were applied while building rather than
audited afterwards.

Threshold: no axis below 4, average at least 4.5. A component holding a client
fact, a no-code field promised and not wired, or one invented legal statement
scores 0 overall: the first two make the delivery false, and the third makes it
a liability published under the client's name.

## 13. Interfaces

- Upstream: `engineering-core`, `template-selection` when the work starts from
  an existing template rather than a blank page.
- Lateral: `design-system` for the token structure, `ui-ux-engineering` for the
  rendered experience, `frontend-engineering` for the implementation,
  `animation` for the motion the intensity scalar drives,
  `design-authenticity` so the result does not read as a generic default,
  `accessibility-testing` for the verification, `seo-engineering` for the
  metadata the content file carries, `input-validation` for the forms,
  `data-privacy` for what the privacy and cookie pages must state,
  `technical-documentation` and `client-handover` for the handover.
- Downstream: `code-review-protocol`, then `client-handover` with the field map.
- Run by: the site-template-engineer agent, and the frontend-engineer when a
  template instance is being produced.
