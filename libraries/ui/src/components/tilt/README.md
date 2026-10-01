# Tilt

Leans one surface, a card or an image, a few degrees toward the pointer while
the pointer is over it, and lays it flat again when the pointer leaves.
Original to this library.

Use it on one surface that deserves the attention. A grid of tilting cards is
the generic default `design-authenticity` flags.

## Reduced motion is the floor

Flat is the final state. No handler is attached, and the surface stays flat,
when:

- the viewer asked for reduced motion (`useReducedMotion`);
- `requestAnimationFrame` is absent;
- before the first effect runs, which covers the server render.

## Accessibility

- Pointer only, mouse or pen. Touch is ignored.
- Keyboard focus tilts nothing; focusable content inside keeps its normal
  focus ring.
- The wrapper adds no role, no tab stop and no ARIA; the content keeps its
  own semantics. The outer wrapper receives the pointer and never moves, so
  the hit area is stable while the inner layer rotates.

## API

| Prop | Purpose |
|---|---|
| `children` | the single surface to tilt |
| `maxDeg` | largest rotation in degrees, reached at the edge (default 6) |
| `perspectivePx` | perspective distance in pixels; smaller reads as stronger (default 800) |
| `className` | passed to the wrapper |

```tsx
import { Tilt } from "@craft-suite/ui";

<Tilt maxDeg={5}>
  <article className="plan-card">...</article>
</Tilt>;
```

## Performance

Shares `usePointerFollow` with `Magnetic`: one `requestAnimationFrame` per
frame at most, one box read and one `transform` write (a `rotateX` and
`rotateY` under a `perspective()`), written straight to the inner layer's
style without a React render. No layout and no paint per frame;
`will-change: transform` only while the pointer is over it. Resets on leave
and on pointer cancel; the return to flat is a CSS transition on the
`--cu-motion-base` token. Verified by `tilt.test.tsx`: the reduced-motion path
stays flat with no frame, the tilt toward a mouse corner, reset on leave and
on cancel, touch and keyboard focus ignored, and the content's roles kept.
