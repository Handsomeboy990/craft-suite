# Marquee

Scrolls a row of content sideways in a seamless loop: a logo strip, a line of
short claims. Original to this library; the pattern is common, the code is
written here.

## Reduced motion is the floor

The loop is an addition, never the starting point. The server render, the
first client render, a browser without the Web Animations API and a viewer who
asked for reduced motion (`useReducedMotion`) all get the same result: the
content once, wrapped onto as many lines as it needs, every item visible,
nothing clipped and nothing moving. The loop is switched on in an effect only
when the platform and the viewer both allow it.

## Accessibility

- The root is a `group` with a required accessible name (`label`).
- The loop needs two copies of the content. The second is `aria-hidden` and
  `inert`, so screen readers and the keyboard meet every item once.
- Moving content that lasts more than five seconds must be pausable (WCAG
  2.2.2). The loop pauses while the pointer is over it or focus is inside it,
  and a toggle button pauses and resumes it for anyone who cannot hover. The
  button's name stays the same; `aria-pressed` carries its state.
- A focused item is always wholly in view (WCAG 2.4.7, 2.4.11). The loop
  pauses wherever it is, so on focus the animation is seeked to the nearest
  position that shows the whole item, and the scroll offset the browser's own
  focus scroll leaves on the clipped viewport is reset, so the seam never
  shifts. The loop resumes from there without a jump. Verified in a real
  browser by `e2e/marquee.e2e.ts`; see `BROWSER_PASS.md`.

## API

| Prop | Purpose |
|---|---|
| `children` | the items of the row |
| `label` | accessible name of the group; required |
| `durationMs` | time for one full loop, in milliseconds (default 30000) |
| `direction` | `"left"` (default) or `"right"` |
| `showControl` | render the pause toggle (default `true`); turn off only when the page offers another way to stop the motion |
| `pauseLabel` | text of the toggle (default `"Pause motion"`), for the recipient's language |
| `className` | passed to the root |

```tsx
import { Marquee } from "@craft-suite/ui";

<Marquee label="Customers" durationMs={40000}>
  <img src="/logos/a.svg" alt="Company A" />
  <img src="/logos/b.svg" alt="Company B" />
</Marquee>;
```

## Technique

One Web Animations API animation translates a track holding two identical
copies by exactly half its width, so the seam never shows. No keyframes in a
stylesheet, no animation library, and the spacing comes from the
`--cu-space-*` tokens. Give it enough items to fill the viewport at least
once; a short row leaves a visible gap before it repeats. Verified by
`marquee.test.tsx`: the static fallback without the API, the reduced-motion
path (one copy, wrapped, no animation), the hidden and inert duplicate, pause
on hover and on focus, the toggle, and cleanup on unmount.

Use one per page at most. A page of marquees reads as a template.
