# GradientBackdrop

A soft field of colour that drifts very slowly behind a section, with an
optional fine grain over it. The one background of the motion layer. Original
to this library.

One per page at most, behind one section. A page where every section has a
moving gradient reads as the aurora default `design-authenticity` flags.

## Reduced motion is the floor

The still gradient is the result; the drift is an addition. The server render,
the first render, a browser without the Web Animations API and a viewer who
asked for reduced motion (`useReducedMotion`) all get the same gradient at
rest, with no animation started. `durationMs={0}` gives the same still result
on purpose.

## Accessibility

Decorative, and only that. The root is `aria-hidden`, holds no text and no
focusable element, and takes no pointer events, so it can never intercept a
click meant for the content in front of it. It carries no information, so
nothing is lost when a viewer cannot see it. Contrast is still the page's
responsibility: check text against the brightest point of the gradient, in
light and dark.

## API

| Prop | Purpose |
|---|---|
| `background` | CSS background layers of the field (default: two soft blooms from `--cu-color-accent` and `--cu-color-muted`) |
| `durationMs` | time for one drift in milliseconds; it eases out and back (default 40000) |
| `grain` | lay a static grain over the gradient (default `true`) |
| `grainOpacity` | opacity of the grain, 0 to 1 (default 0.06) |
| `className` | passed to the root |

Place it as the first child of a positioned container; the content after it
sits in front.

```tsx
import { GradientBackdrop } from "@craft-suite/ui";

<section style={{ position: "relative", isolation: "isolate" }}>
  <GradientBackdrop />
  <h1 style={{ position: "relative" }}>Owned, not rented</h1>
</section>;
```

## Performance

It costs no layout. The root is absolutely positioned over its container and
`contain: strict`, so nothing inside it lays out or paints the page around it.
The drift is one Web Animations API animation of `transform` alone on one
oversized layer, which the compositor runs without layout or paint, and it
pauses while the backdrop is off screen. The grain is a static SVG noise tile,
painted once and tiled, never animated. No WebGL, no canvas, no library: the
`animation` skill's calm-gradient fallback used as the effect itself. The
default blooms use `color-mix()`; a browser without it draws no gradient,
which for decoration is an acceptable floor. Verified by
`gradient-backdrop.test.tsx`: hidden from assistive technology and the
pointer, the static fallback without the API, the reduced-motion path with no
animation, transform-only keyframes, the off-screen pause, cancel on unmount,
and the grain switch.
