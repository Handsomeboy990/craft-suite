# UI reference analysis

Phase 8.1, first task. What the UI references do well, and the principles the
`libraries/ui` work takes from them. This is a `design-research` output: it
records patterns and principles, names the source and its licence, and copies
no code, no asset, no exact token. The result the suite ships is original.

The four levels are kept apart, per `design-research`:

```
reference       the real project, its code and assets, owned by its authors
inspiration     the direction it gives, free to take
pattern         the reusable technique, stated in the abstract
implementation  the original result libraries/ui ships, the only thing committed
```

## The references, with licence

Licence governs method. A permissive licence is not permission to paste: even
under MIT the result is written here from the pattern, so the suite owns every
line. A restrictive clause is a wall.

| Project | Licence (read) | Model | Stack |
|---|---|---|---|
| `shadcn/ui` | MIT | copy into your codebase, via a registry CLI | Radix primitives, Tailwind |
| `shark-ui` | MIT | copy into your codebase, registry CLI | Ark UI primitives, Tailwind, tailwind-variants |
| `magicuidesign/magicui` | MIT | shadcn registry | React, Tailwind, Framer Motion |
| `vprix21/neonblade-ui` | MIT | CLI `npx neonblade add <name>` | React, TypeScript, Tailwind v4, Framer Motion, Lucide |
| `DavidHDev/react-bits` | MIT with Commons Clause | shadcn or jsrepo CLI, four JS/TS and CSS/Tailwind variants | GSAP, motion, three.js and react-three, ogl, lenis |
| `Balastrong/start-theme-demo` | not stated on the repo; confirm before any reuse | demo application | TanStack Start, theme switching |

The Commons Clause on React Bits forbids selling its code or a product whose
value derives from it. React Bits is studied for its patterns only and never
reused, licence or not. `start-theme-demo` states no licence on its page, so
nothing is reused from it until a licence is confirmed; only its approach is
noted.

## The pattern worth taking from all of them: owned code, not a dependency

Every current library here, `shadcn/ui`, `shark-ui`, `magicui`, `neonblade`,
and React Bits itself, ships by copying code into the consumer's repository
through a registry CLI, rather than as a versioned npm dependency. The consumer
owns and edits the result.

Principle for `libraries/ui`: distribute components as code a project owns, on
the suite's own install path, not as a runtime dependency a project cannot
change. This is already the model the two site examples follow by hand; the
library makes it deliberate.

## The split that decides the library's shape

The references fall into two groups, and the split is the single most useful
thing this analysis found.

```
accessible primitives     shadcn (Radix), shark-ui (Ark UI)
                          behaviour and accessibility of dialogs, menus,
                          listboxes, tabs: focus, keyboard, ARIA, done right
decorative effects        magicui, neonblade, react-bits
                          motion and visual spectacle: reveals, marquees,
                          cyberpunk and WebGL backgrounds
```

Principle: `libraries/ui` is built in that order. The primitives come first,
because their accessibility is hard to get right and is the floor the suite
refuses to trade (`accessibility-testing`). The effects come second, chosen for
a project's identity, never piled on. The two reference clusters map onto the
two phase-8.1 deliverables, the foundation then the motion layer.

A headless-primitive base (Radix, Ark UI, or Base UI) is the one dependency
worth evaluating rather than reimplementing, because an accessible dialog or
listbox rebuilt from scratch is a large, bug-prone surface. That evaluation is
`dependency-selection`'s to make before the foundation is built; this analysis
only records that all three references that offer primitives lean on such a
base.

## The tell to avoid: the generic-default cluster

React Bits, neonblade and magicui are, between them, the catalogue of effects
that `design-authenticity` flags as the look nobody chose: the aurora or WebGL
background, the shiny or glitch text, the spotlight or glow card, the bento
grid, the infinite logo marquee. Piled together they read as machine-generated,
the opposite of the goal.

Principle: the motion layer takes the technique behind an effect, not the
effect as a default. Each effect ships only when a project's identity calls for
it, and `design-director` signs off that the set reads as intended. React Bits'
breadth is a menu of techniques to learn from, not a palette to apply.

## Performance and the reduced-motion floor

React Bits' most striking pieces are WebGL backgrounds on three.js, ogl and
postprocessing, and smooth-scroll on lenis: heavy on a phone, and most ship no
reduced-motion path. neonblade and magicui lean on Framer Motion throughout.

Principle, from the `animation` skill's technique ladder: the lightest
technique that achieves the effect, CSS first, then a motion library, then GSAP,
and WebGL only when it is genuinely justified. Every effect in `libraries/ui`
carries a reduced-motion variant and a performance budget. This is a hard
requirement, not a finish.

## Theming

`start-theme-demo` and shark-ui's `tailwind-variants` both point the same way:
themes expressed as tokens, switched by a single attribute, not forked
components.

Principle: `libraries/ui` tokens are CSS variables (colour, type scale,
spacing, radius, elevation, motion), with light and dark as the same component
under a different token set, per the suite's own artifact and design-system
conventions. A second theme is a token set, never a second component.

## What libraries/ui takes, in one list

- Distribute owned code through the suite's install path, not an npm runtime
  dependency.
- Build primitives first on an evaluated headless base, effects second.
- Hold accessibility as the floor: keyboard, focus, ARIA, contrast,
  reduced-motion, never traded for spectacle.
- Take the technique behind an effect, never the effect as a default; refuse
  the generic-default cluster.
- Climb the lightest rung of the animation ladder that works; budget
  performance; ship a reduced-motion variant for every effect.
- Theme by tokens switched on one attribute, light and dark as one component.

Nothing above reuses a reference's code or assets. The implementations arrive
in the phase-8.1 PRs that follow, each passing the suite's gates.
