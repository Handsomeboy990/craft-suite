# ADR 0002: the headless primitive base for libraries/ui

Date: 2026-10-01
Status: proposed
Supersedes: none

Ratified by merging this record. A different base is chosen by editing the
Decision below before merge. This runs the `dependency-selection` gate for the
one dependency `libraries/ui` is worth not reimplementing; the measured size
and lockfile figures (points 6 and 7) are taken at install, in the PR that
actually adds the package, per that skill's protocol.

## Context

`libraries/ui` is built primitives first, per
`docs/architecture/UI_REFERENCES.md`. The primitives are the interactive
controls whose accessibility is hard and unforgiving: dialog, popover, menu,
listbox and select, tabs, tooltip, accordion, switch, radio group. Their
behaviour, focus management, keyboard interaction, ARIA wiring, focus trapping,
typeahead, is a large surface that is wrong in subtle ways when hand-built, and
is the floor the suite refuses to trade (`accessibility-testing`).

The three questions of `dependency-selection` section 1:

1. Does the project already solve this? No. The two site examples implement a
   few bespoke controls; none is a general, audited primitive set.
2. Does the platform solve this? Partly and not enough. Native `<dialog>`,
   `<details>`, popover API and `<selectlist>` cover some cases, but not the
   full set, not consistently across supported browsers, and not the composite
   widgets (menu, listbox, combobox) that need managed focus and typeahead.
3. Is it small enough to own? No. A correct, audited set of these primitives is
   thousands of lines and a permanent accessibility maintenance burden. This is
   the canonical case for a dependency, not against one.

So a headless primitive base is evaluated. Headless means it supplies
behaviour and accessibility with no styling, so the suite's own tokens and the
original look sit on top. This keeps the reference rule intact: the look is
ours, only the unstyled behaviour is shared.

## Options

The twelve points, answered per candidate. Version numbers and measured bundle
sizes are marked to-confirm because they are taken at install, not guessed
here.

### 1. Radix UI (`@radix-ui/react-*`)

- Solves the need: yes, per primitive, imported one at a time, so no superset
  excess (point 1).
- Framework and runtime: React only, which matches the UI library (point 2).
- Maintenance: actively maintained, widely depended on; it is the base
  `shadcn/ui` ships on (point 3, to-confirm latest release at install).
- Security: no known class of unfixed advisory; confirm with the audit command
  at install (point 4).
- Licence: MIT (point 5).
- Size: per-primitive packages keep the footprint to what is used; measured at
  install (point 6).
- Transitive tree: small, mostly its own scoped packages (point 7, read the
  lockfile diff at install).
- Types: shipped, first-class in a typed project (point 8).
- Accessibility: its reason to exist; keyboard and ARIA are the product
  (point 9).
- Documentation: per-primitive docs that answer the normal questions without
  reading source (point 10).
- Escape cost: moderate; the primitives are composed behind the suite's own
  component API, so a later swap touches that adapter layer, not every screen
  (point 11).
- Alternatives: the two below (point 12).

### 2. Ark UI (`@ark-ui/react`)

- Solves the need: yes, on Zag.js state machines; a broad component set
  (point 1).
- Framework and runtime: framework-agnostic (React, Vue, Solid). The suite
  needs only React, so part of its generality is excess the project will not
  use (points 1 and 2).
- Maintenance: actively maintained; the base `shark-ui` ships on and the
  engine behind Chakra's recent generation (point 3, to-confirm at install).
- Security, licence: MIT; audit at install (points 4, 5).
- Size and transitive tree: pulls the Zag.js state-machine runtime; measured
  at install (points 6, 7).
- Types, accessibility, documentation: typed, accessibility-focused, documented
  (points 8, 9, 10).
- Escape cost: moderate, same adapter-layer argument as Radix (point 11).

### 3. Base UI (`@base-ui-components/react`)

- Solves the need: yes, React unstyled primitives, from the teams behind Radix
  and MUI Base (point 1).
- Framework and runtime: React only (point 2).
- Maintenance: actively developed but the youngest of the three, still
  stabilising its API as of this date; a moving surface is a cost for a library
  meant to be stable (points 3, 11, to-confirm maturity at install).
- Security, licence: MIT; audit at install (points 4, 5).
- Types, accessibility, documentation: typed, accessibility-focused;
  documentation maturing with the library (points 8, 9, 10).

### 4. Own it, no dependency

Rejected at section 1 question 3: the audited primitive set is too large and
too unforgiving to own, and reimplementing it is exactly the bug-prone surface
a dependency exists to remove.

## Decision

Radix UI, imported per primitive. Deciding criterion: maturity and ecosystem
fit at an equal licence. All three are MIT, React-capable, typed and
accessibility-first, so points 4, 5, 8 and 9 do not separate them. Radix wins
on three grounds: it is the most mature and most depended-on of the three, so
point 3 is strongest; it is the base of the `shadcn/ui` ownership model the
suite is adopting, so the copied-code components compose against a base the
wider ecosystem documents; and its per-primitive packages mean the suite
installs only what it uses, so point 1 carries no superset excess. Ark UI's
multi-framework generality is capability the React-only library would not use,
and Base UI's younger, still-moving API is a poor fit for a library meant to be
stable. Neither is wrong; Radix is the safest fit for what is being built.

## Consequences

Positive: an audited accessibility floor the suite does not maintain itself;
alignment with the shadcn ownership model already chosen; a footprint bounded
to the primitives actually used.

Negative: a real external dependency enters `libraries/ui`, with its upgrade
and audit duty. Mitigated by composing every primitive behind the suite's own
component API, so Radix is never imported directly by a consumer and the
dependency is swappable at one adapter layer.

Operational: the install PR runs `dependency-selection` protocol steps 6 to 8,
the lockfile diff read and the audit and test run, and records the measured
bundle delta and package count here as a short follow-up note.

## Reversal cost

Moderate, and deliberately bounded. Because consumers use the suite's component
API and never Radix directly, swapping the base to Ark UI or Base UI later
rewrites the adapter layer inside `libraries/ui`, not the screens that use it.
The escape cost is one library's internals, not a product-wide rewrite, which
is the reason the adapter layer exists.
