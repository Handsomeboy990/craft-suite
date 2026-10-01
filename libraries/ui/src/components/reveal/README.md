# Reveal

Fades and lifts its children into place the first time they scroll into view.
The start of the motion layer, and the original of the `Reveal` component the
two site examples each copy today.

## Reduced motion is the floor

`Reveal` never hides content it might fail to reveal. It shows its children at
once, with no transition, in three cases:

- the viewer asked for reduced motion (`useReducedMotion`);
- `IntersectionObserver` is absent (server render, old browser);
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
No animation library, no WebGL. Verified by `reveal.test.tsx`: children always
render, the no-IntersectionObserver fallback shows content, and the
reduced-motion path applies no transition.
