# Magnetic

Draws one element a few pixels toward the pointer while the pointer is over it,
and lets it settle back when the pointer leaves: a call to action that
acknowledges the cursor. Original to this library.

Use it on a single element. A page where everything leans toward the cursor
reads as a template.

## Reduced motion is the floor

The element's place in the layout is its final state; the pull is an addition
on top of it. No handler is attached at all, and the element never moves,
when:

- the viewer asked for reduced motion (`useReducedMotion`);
- `requestAnimationFrame` is absent;
- before the first effect runs, which covers the server render.

## Accessibility

- Pointer only. Touch input is ignored, so a tap never shifts a target under
  the finger.
- Keyboard focus moves nothing. The child keeps its own role, name and normal
  focus ring; the wrapper adds no role, no tab stop and no ARIA.
- The pull is a few pixels and never moves the hit area: the outer wrapper,
  which receives the pointer, stays still, and only an inner layer moves.

## API

| Prop | Purpose |
|---|---|
| `children` | the single element to draw toward the pointer, typically a link or a button |
| `strength` | largest offset in pixels, reached at the element's edge (default 8) |
| `className` | passed to the wrapper |

```tsx
import { Magnetic } from "@craft-suite/ui";

<Magnetic strength={10}>
  <a href="/start">Start a project</a>
</Magnetic>;
```

## Performance

Shares `usePointerFollow` with `Tilt`. Pointer moves only record the latest
coordinates; at most one `requestAnimationFrame` per frame reads the wrapper's
box once and writes one `transform` on the inner layer, directly on its style,
so a move never re-renders React. Transform only: no layout, no paint.
`will-change: transform` is set while the pointer is over the element and
removed on leave, never left standing. The transform resets on leave and on
pointer cancel, and a pending frame is cancelled on unmount. The settle back
is a CSS transition on the `--cu-motion-base` token. Verified by
`magnetic.test.tsx`: the child stays an ordinary focusable link, the
reduced-motion and no-rAF paths attach nothing, one frame per burst of moves
with the latest point, transform only, reset on leave, touch and focus
ignored, and frame cleanup on unmount.
