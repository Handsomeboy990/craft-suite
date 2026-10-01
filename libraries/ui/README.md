# ui

`@craft-suite/ui`. Accessible, token-driven React primitives a project owns,
distributed as source to copy rather than a runtime dependency to install, per
`docs/decisions/0001-resource-library-structure.md`. The direction and the
reference analysis are in `docs/architecture/RESOURCE_LIBRARY.md` and
`docs/architecture/UI_REFERENCES.md`.

## What it is

- Design tokens as CSS variables: colour, type scale, spacing, radius,
  elevation, motion, with light and dark as the same tokens under a different
  set, and reduced motion as a hard floor. See `src/tokens/`.
- Primitives whose accessibility comes from a headless base (Radix UI, per
  `docs/decisions/0002-ui-primitive-base.md`) and whose look and API are the
  suite's own. Radix is wrapped, never exposed, so the base is swappable at
  this layer. See `src/components/`.

## Primitives so far

| Primitive | Behaviour from | What the wrapper adds |
|---|---|---|
| `Dialog` | `@radix-ui/react-dialog` | a required accessible name, token styling, a closed API over the base |
| `Reveal` | the platform (IntersectionObserver), motion tokens | a scroll-in reveal that never hides content, reduced-motion safe |
| `useReducedMotion` | `matchMedia` | the reduced-motion signal the motion layer treats as a hard floor |

This is the foundation plus the start of the motion layer. Further primitives
arrive in the phase-8.1 PRs that follow, and the duplicated site-example code
is consolidated into this library.

## Install, in this repository

```
cd libraries/ui
npm ci
npm run typecheck
npm test
```

CI runs the same. The repository's root has no Node toolchain; this library
carries its own, isolated here.

## How a project uses it

A project copies the component source and the tokens it needs into its own
tree and owns them, the shadcn ownership model. It imports the tokens once:

```css
@import "@craft-suite/ui/tokens.css";
```

and composes the primitives:

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogClose } from "@craft-suite/ui";
```

## Licence

Proprietary, under the repository's terms. See `LICENSE`. Third-party packages
it depends on keep their own licences. Whether this library is later released
under an open licence so other projects may install it is the maintainer's
decision, recorded in a decision record when made.
