# Stagger

Brings a group of items into place one after another the first time the group
scrolls into view: a row of features, a short list of steps. Original to this
library.

## Visible without JavaScript

Every item is visible by default, on the same contract as `Reveal`, through
the shared `useEntrance` hook. The server HTML, a page whose JavaScript never
runs, a crawler and the first client render get every item plainly, with no
opacity, transform, transition or delay. The items are hidden until the group
is seen only once a client layout effect has confirmed `IntersectionObserver`,
no reduced motion, and that the group is not already in the viewport. A group
on screen at mount is never hidden and faded back, so there is no flash, and
arming touches opacity and transform alone, so it shifts no layout.
`data-armed` on the group says which path was taken. `Reveal`'s README gives
the reasoning against an `html.js` class or a `<noscript>` style.

## Reduced motion is the floor

`Stagger` is `Reveal`'s motion applied per item, and it shares `Reveal`'s
in-view and arming logic through the `useInViewOnce` and `useEntrance` hooks
rather than repeating it. It never hides an item it might fail to reveal.
Every item is shown at once, with no transition and no delay, when:

- the viewer asked for reduced motion (`useReducedMotion`);
- `IntersectionObserver` is absent (old browser);
- the motion tokens are zero, which the same preference makes them.

## Accessibility

The items stay in source order, so reading order and focus order are the order
the author wrote; only their opacity and position change, never their place in
the document. Rendered `as="ul"` or `as="ol"`, the group is a real list and
each item a list item, with the list role restated because Safari drops it
when list markers are removed.

## API

| Prop | Purpose |
|---|---|
| `children` | the items; each direct child becomes one staggered item |
| `stepMs` | delay between one item and the next, in milliseconds (default 60) |
| `delayMs` | delay before the first item starts, in milliseconds (default 0) |
| `as` | `"div"` (default), `"ul"` or `"ol"`; a list renders each item as an `li` |
| `className` | passed to the group |
| `itemClassName` | passed to every item wrapper |

```tsx
import { Stagger } from "@craft-suite/ui";

<Stagger as="ul" stepMs={70}>
  <FeatureCard title="Fast" />
  <FeatureCard title="Private" />
  <FeatureCard title="Owned" />
</Stagger>;
```

## Performance

One `IntersectionObserver` watches the group, not one per item, and
disconnects after the first sighting. Each item animates `opacity` and
`transform` only, through CSS transitions driven by the `--cu-motion-*`
tokens: rung 1 of the `animation` skill's ladder, compositor only, no layout
or paint per frame, no animation library. The delay stops growing after the
tenth item (`STAGGER_MAX_STEPS`), so a long group never keeps the reader
waiting; budget: the last item settles within `delayMs + 10 * stepMs` plus
one `--cu-motion-base`. Verified by `stagger.test.tsx`: source order, the
server render (`renderToString`) with no hiding style, the
no-IntersectionObserver fallback, the reduced-motion path with no transition
or delay, one observer per group, a group on screen at mount never hidden, the
delay cap, and list semantics.
