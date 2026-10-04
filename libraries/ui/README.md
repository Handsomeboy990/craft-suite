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
| `Tooltip`, `TooltipProvider` | `@radix-ui/react-tooltip` | a required `content`, token styling, a closed API, self-providing or grouped |
| `Reveal` | the platform (IntersectionObserver), motion tokens | a scroll-in reveal that never hides content: visible without JavaScript, armed only off screen on the client, reduced-motion safe |
| `Marquee` | the platform (Web Animations API), space tokens | a seamless loop with a named group, an `aria-hidden` inert duplicate, pause on hover, focus and a toggle; static and wrapped under reduced motion |
| `Counter` | the platform (IntersectionObserver, requestAnimationFrame) | a count-up in view whose accessible text is always the final value; final at once under reduced motion |
| `Stagger` | the platform (IntersectionObserver), motion tokens | a staggered entrance of a group's items, sharing `Reveal`'s in-view and arming logic, visible without JavaScript, one observer per group, a capped delay; all shown at once under reduced motion |
| `Magnetic` | the platform (Pointer Events, requestAnimationFrame) | a pointer-only pull of one element, transform only, one write per frame, reset on leave; nothing attached under reduced motion |
| `Tilt` | the platform (Pointer Events, requestAnimationFrame) | a pointer-only tilt of one surface, same engine as `Magnetic`; flat under reduced motion |
| `StackedCards` | CSS `position: sticky` | scroll-stacked cards with no scroll listener, a list in source order, a focused card raised above the stack; an ordinary list under reduced motion |
| `GradientBackdrop` | the platform (Web Animations API), colour tokens | a decorative, `aria-hidden` drifting gradient with a static grain, transform only, contained, paused off screen, a pause toggle beside it (WCAG 2.2.2); still under reduced motion |
| `useReducedMotion` | `matchMedia` | the reduced-motion signal the motion layer treats as a hard floor |
| `useInViewOnce` | `IntersectionObserver` | the seen-once signal `Reveal` and `Stagger` share; true at once when skipped or unsupported |

This is the foundation plus the motion layer the roadmap names: scroll reveal,
staggered entrance, magnetic and tilt hover, logo marquee, scroll-stacked
cards and one background. A real-browser pass in Chromium is recorded in
`BROWSER_PASS.md`; a screen-reader pass, other engines and the
`design-director` sign-off are still to come, and the duplicated site-example
code is consolidated into this library in a later phase-8.1 PR.

## Install, in this repository

```
cd libraries/ui
npm ci
npm run typecheck
npm test
```

CI runs the same three commands; it does not run the browser tests below.
The repository's root has no Node toolchain; this library carries its own,
isolated here.

## Browser tests

`npm test` runs the unit tests in jsdom. `npm run test:browser` runs the
Playwright tests in `e2e/` in a real Chromium, for what jsdom cannot prove:
layout, sticky positioning, focus, real pointer and touch input, running
animations, the accessibility tree, and the page with JavaScript off.

```
npx playwright install chromium   # once, where the download is allowed
npm run test:browser
```

How it is built:

- `e2e/fixtures/` holds one page per component. `e2e/serve.mjs` bundles them
  with esbuild, renders each on the server with `renderToString` and hydrates
  it in the browser, so a page is what a server-rendered site sends. Playwright
  starts that server itself (`webServer` in `playwright.config.ts`, port 4317,
  or `PORT`).
- `e2e/support.ts` fails any test whose page logs a console error or warning,
  so a hydration mismatch cannot pass behind a green assertion. It also holds
  the shared checks: focus visibility by `elementFromPoint`, running
  animations, and axe-core.
- Test files end in `.e2e.ts`, so vitest never picks them up.

Where Playwright's browser download is blocked, point `CHROMIUM_PATH` at any
Chromium executable:

```
CHROMIUM_PATH=/path/to/chromium npm run test:browser
```

The launch then adds `--no-sandbox --disable-gpu`, which a root, GPU-less
container needs. One way to get such a binary without the Playwright download
host is the `@sparticuz/chromium` npm package, installed outside this
library (it is not a dependency and nothing of it is committed):

```
mkdir -p /tmp/chromium-pkg && cd /tmp/chromium-pkg
npm init -y && npm install @sparticuz/chromium
node -e "import('@sparticuz/chromium').then(m => m.default.executablePath()).then(console.log)"
# prints the extracted binary, /tmp/chromium; pass it as CHROMIUM_PATH
```

Without `CHROMIUM_PATH`, the normally installed Playwright Chromium is used,
with no extra flags. Traces of failing tests land in `e2e/.results/`, which
is ignored.

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

MIT. See `LICENSE`. This library alone is open; the rest of the repository
stays under its own terms. Third-party packages it depends on keep their own
licences. The decision is `docs/decisions/0004-libraries-ui-mit-licence.md`.
