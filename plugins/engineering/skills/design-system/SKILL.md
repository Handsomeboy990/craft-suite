---
name: design-system
description: Builds and maintains the shared visual and interaction language: tokens for colour, spacing, typography, radius, elevation and motion, a component contract with variants and states, theming including dark mode, composition rules, documentation, versioning and the adoption path for existing screens. Use before a second screen repeats a pattern, and whenever a product looks assembled rather than designed.
license: MIT
metadata:
  category: dev-skills
  version: 1.2.0
  depends_on: [engineering-core, ui-ux-engineering]
  outputs: [token-set, component-contracts, theme-definition, usage-documentation, adoption-plan]
---

# Design System

A design system is not a component library. It is the set of decisions that
make independent work look like one product, and the library is how those
decisions are distributed.

Built too early it constrains a product that has not found its shape. Built
too late it becomes an archaeology project. The right moment is the third
repetition.

## 1. Tokens

Tokens are the decisions. Components consume them and never hardcode a value.

```
colour      a small palette, then semantic names on top: surface, text,
            border, accent, danger, and their states
spacing     one scale, used for every margin, padding and gap
typography  a scale of size and line height, a small set of weights, and
            the families
radius      a scale, usually three values, not one per component
elevation   a small set, each with a stated meaning
motion      durations and easings, with a reduced motion variant
breakpoints named, and used everywhere instead of raw widths
z-index     a named ladder, so nothing is 9999
```

Two layers matter: the raw value, and the semantic name that points at it.
Components use the semantic name, so a theme change is one indirection away.

## 2. Semantic naming

```
raw         blue-600, gray-100, space-4
semantic    color-action, color-surface-raised, space-inline-md
component   button-background, card-padding, only where a component genuinely
            needs its own hook
```

A component that references `blue-600` cannot be themed. A component that
references `color-action` can be themed, inverted, and rebranded without being
opened.

## 3. Component contract

Every component in the system declares:

```
purpose        what it is for, and what it is not for
anatomy        its parts
variants       the finite set, named, with no free form styling escape
sizes          from the scale, not arbitrary
states         default, hover, focus visible, active, disabled, loading,
               error, selected, and empty where it applies
content rules  what it accepts, and what happens when the content is long,
               short, absent or in another language
accessibility  role, name, keyboard behaviour, focus management
composition    what it may contain, and what it may sit inside
props          the minimum surface, with no style overrides
```

The state list is the part that separates a design system from a folder of
components. A button without a focus visible style and a loading state is not
finished, however good it looks.

## 4. Theming

```
themes are token sets, not component forks
dark mode is a theme, defined completely, not derived by inverting
contrast verified in every theme, on the rendered pairs
a theme switch has a defined behaviour for images, illustrations and shadows
system preference respected by default, user choice persisted and winning
no component reads the theme directly: it reads tokens
```

## 5. Composition and escape hatches

```
prefer composition over configuration: a component with fourteen boolean
  props is four components
provide one deliberate escape hatch, documented, for genuinely one-off needs
never accept an arbitrary style override as a prop, which turns the system
  into a suggestion
when a screen needs something the system lacks, that is a system finding, not
  a licence to improvise: record it, then either add it or refuse it
```

## 6. Documentation

```
each component: what it is for, when not to use it, examples of correct use,
  examples of incorrect use, its states rendered, its accessibility contract
the tokens, rendered, with their semantic meaning
the patterns above component level: forms, empty states, error states,
  destructive confirmations, page layouts
the contribution path: how a new component or token gets in
```

A design system with no documentation on when not to use a component produces
consistent misuse.

## 7. Versioning and change

```
the system is a dependency with a version, even inside a monorepo
a breaking visual change is a breaking change: name it, version it, note it
deprecations carry a replacement and a date
a token rename ships with a codemod or an alias, never as a search and replace
  request to every team
changes are reviewed against the existing usage, not only against the design
```

## 8. Adoption

For an existing product:

```
1 inventory what exists: every button, every input, every card, photographed
2 the count is the argument: eleven button styles is a fact, not an opinion
3 tokens first, applied to what exists, before any component is rewritten
4 then the highest traffic components, one at a time
5 migrate on contact: a screen being changed adopts the system
6 never a rewrite of every screen at once
7 measure adoption, so the effort has an end
```

## 9. Prohibitions

- Never hardcode a colour, spacing or font size in a product screen.
- Never fork a component to change one visual detail.
- Never accept arbitrary style overrides through props.
- Never ship a component without its focus visible, disabled and loading
  states.
- Never define dark mode by inverting light mode.
- Never let the system grow a component per screen.
- Never change a token's meaning while keeping its name.
- Never build the system before the third repetition of a pattern.

## 10. Protocol

1. Inventory what exists and count the variations.
2. Define the raw scales, then the semantic tokens on top.
3. Apply tokens to the existing product before writing components.
4. Define the component contract format, and write it for the first three.
5. Implement the states in full, including focus visible and loading.
6. Define themes as token sets and verify contrast in each.
7. Document purpose, misuse, states and the accessibility contract.
8. Version the system and define the deprecation path.
9. Migrate on contact, and measure adoption.
10. Review new screens against the system, and record what the system lacks.

## 11. Auto-critique

Score from 0 to 5: token layering, semantic naming, completeness of the state
inventory, theming without forks, composition over configuration, absence of
style escape hatches, documentation including misuse, versioning and
deprecation, adoption path that ends.

Threshold: no axis below 3, average at least 4. A component library whose
components accept arbitrary style overrides is not a design system, and it is
reworked before it spreads.

## 12. Resources

- `resources/component-contract.md`: the contract format of section 3, worked
  for one component.
- `resources/design-to-code-handoff.md`: the path from a validated brief to a
  delivered site, in eight gated steps, each with its owner and artefact: the
  identity signed, the design canvas in one of three modes (agent filled, the
  owner's claude.ai/design link read back, or no canvas at all), the owner's
  sign-off, the tokens synced by `/design-sync` only when the owner starts it
  or applied by hand from the signed record, the build from the prototype
  without pasting its markup, `design-verification` against the canvas, and
  `production-verification` before anything is called delivered.

## 13. Interfaces

- Upstream: `ui-ux-engineering` for the experience decisions,
  `requirements-analysis` for the brand and platform constraints,
  `brand-identity` for the palette, type and brand tokens, received only after
  its sign-off; a brand value is changed there, never here.
- Lateral: `frontend-engineering` for implementation, `accessibility-testing`
  for the contracts, `internationalization` for logical properties and text
  expansion, `dependency-selection` before adopting an external library.
- Downstream: `playwright-automation` for visual verification,
  `technical-documentation` for the published documentation,
  `technical-debt` for the unmigrated surface.
- Handoff to code: `resources/design-to-code-handoff.md`, followed by
  `site-template-generation` and `frontend-engineering` when a site is built
  from a signed prototype, with `editorial-line` for the copy, the
  design-verification agent for the comparison with the canvas and
  `production-verification` before delivery.
