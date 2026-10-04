# Reveal

Fades and lifts its children into place the first time they scroll into view.
The start of the motion layer, and the original of the `Reveal` component the
two site examples each copy today.

## Visible without JavaScript

The content is visible by default. The server HTML, a page whose JavaScript
never runs, a crawler and the first client render all get the children
plainly, with no opacity, transform or transition. The entrance is armed only
on the client, by the shared `useEntrance` hook, in a layout effect that
confirms three things before anything is hidden:

- `IntersectionObserver` exists, so something will reveal the content;
- the viewer has not asked for reduced motion;
- the wrapper is not already in the viewport.

Armed content is hidden until it scrolls into view, then fades and lifts in.
Content already on screen at mount, the top of a server-rendered page above
all, is never armed: hiding what the reader has just seen painted and fading
it back would be a flash, not an entrance. The accepted cost: an element a
client-side navigation mounts straight into the viewport simply appears, with
no entrance, since the hook cannot tell it from hydrated server HTML. So
arming only ever touches content
off screen, and since it changes opacity and transform alone, it shifts no
layout. `data-armed` on the wrapper says which path was taken. Arming hides
at once: the transition is part of the shown state only, so the server HTML
never visibly fades out before it fades back in.

Why this and not an `html.js` class or a `<noscript>` style: both need a
script or a stylesheet outside the component, which a project that copies the
component would have to remember to add, and a class set before React mounts
cannot know whether the viewer reduces motion or whether the element is on
screen. The layout effect knows all three and runs before the browser paints
a client render, so the component stays self-contained.

## Reduced motion is the floor

`Reveal` never hides content it might fail to reveal. It shows its children at
once, with no transition, in three cases:

- the viewer asked for reduced motion (`useReducedMotion`);
- `IntersectionObserver` is absent (old browser);
- the motion tokens are zero, which the same preference makes them.

Motion only ever adds to a result that is already present and readable.

## API

| Prop | Purpose |
|---|---|
| `children` | the content to reveal |
| `delayMs` | delay before the transition starts, in milliseconds (default 0) |
| `className` | passed to the wrapper |

```tsx
import { Reveal } from "@craft-suite/ui";

<Reveal delayMs={80}>
  <h2>Section title</h2>
</Reveal>;
```

## Technique

CSS opacity and transform transitions, the lightest rung of the `animation`
skill's ladder that achieves the effect, driven by the `--cu-motion-*` tokens.
No animation library, no WebGL. The in-view logic is the shared
`useInViewOnce` hook, and the arming logic the shared `useEntrance` hook, both
used by `Stagger` too. Verified by `reveal.test.tsx`: children always render,
the server render (`renderToString`) carries no hiding style, the
no-IntersectionObserver fallback shows content, the reduced-motion path applies
no transition, off-screen content is armed and revealed once seen, and content
on screen at mount is never hidden.
