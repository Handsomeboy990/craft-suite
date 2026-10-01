# Counter

Counts a figure up to its value the first time it scrolls into view: the
"12,000 customers" line of a landing page. Original to this library.

## Reduced motion is the floor

The figure is the content, so it is never withheld. The server render and the
first render show the final value. It also stays final, with no frames
scheduled, when:

- the viewer asked for reduced motion (read before paint, so the figure never
  rewinds even for a frame);
- `IntersectionObserver` or `requestAnimationFrame` is absent;
- `durationMs` is zero or `from` equals `value`.

Only otherwise does it rewind to `from`, before paint, and count once it is
seen.

## Accessibility

The moving digits are `aria-hidden`. A visually hidden copy carries the final,
formatted value from the first render, so assistive technology reads the real
figure once and never hears the intermediate numbers. No live region is
needed, and none is used: a region announcing every frame would be noise.
Digits use tabular figures so the width does not jitter while counting.

## API

| Prop | Purpose |
|---|---|
| `value` | the figure to land on |
| `from` | where the count starts (default 0) |
| `durationMs` | length of the count, in milliseconds (default 1200) |
| `decimals` | digits after the decimal point for the default formatter (default 0) |
| `locale` | locale for the default `Intl.NumberFormat`; the runtime's when omitted |
| `format` | custom formatter for currency, units or a suffix; applied to every frame and to the final value |
| `className` | passed to the root |

```tsx
import { Counter } from "@craft-suite/ui";

<p>
  <Counter value={12000} locale="en-US" /> customers
</p>;
```

## Technique

`requestAnimationFrame` with an ease-out curve, started by an
`IntersectionObserver` that disconnects after the first sighting. The last
frame sets the exact value, so rounding never leaves it one short. Verified by
`counter.test.tsx`: the accessible final value, the no-IntersectionObserver
fallback, the reduced-motion path with no frames, the count itself, and a
custom formatter.
