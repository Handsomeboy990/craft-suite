# StackedCards

As the page scrolls, each card pins near the top of the viewport and the next
one slides up over it, leaving a sliver of every earlier card showing. A short
sequence of steps or case studies, not a whole page. Original to this library.

## Reduced motion is the floor

Under reduced motion (`useReducedMotion`) the cards are an ordinary list:
nothing pinned, nothing sliding over anything, every card fully visible in
turn. Where `position: sticky` is unsupported the browser gives the same
ordinary list. Neither path hides a card.

## Accessibility

- The cards stay in source order, so reading order, focus order and the list a
  screen reader announces ("list, 3 items") are the order the author wrote.
  The stacking is visual only.
- The root is a `ul` with an optional accessible name (`label`); the list role
  is restated because Safari drops it when list markers are removed.
- A card that takes keyboard focus is raised above the cards that would cover
  it, so the focused control is never hidden behind a later card (WCAG 2.4.11,
  focus not obscured). It drops back when focus leaves the card.

## API

| Prop | Purpose |
|---|---|
| `children` | the cards; each direct child becomes one card |
| `label` | accessible name of the list |
| `top` | where the first card pins, a CSS length (default `var(--cu-space-8)`) |
| `step` | extra offset per card, so earlier edges stay visible (default `var(--cu-space-4)`) |
| `gap` | space between cards while they scroll in (default `var(--cu-space-8)`) |
| `className` | passed to the list |
| `cardClassName` | passed to every card wrapper |

```tsx
import { StackedCards } from "@craft-suite/ui";

<StackedCards label="How it works">
  <section className="card">Plan</section>
  <section className="card">Build</section>
  <section className="card">Ship</section>
</StackedCards>;
```

Each card should be shorter than the viewport minus its pinning point, or its
end is never seen before the next card covers it. Give each card an opaque
background, or the stack shows through. `position: sticky` stops working
under an ancestor with `overflow: hidden`, `auto` or `scroll` between the list
and the scrolling container; keep that ancestor out of the way.

## Performance

CSS alone: `position: sticky` with a top that grows by one `step` per card and
a z-index that grows with it. The browser scrolls the pinned cards on the
compositor; there is no scroll listener, no `IntersectionObserver` and no
script at all while scrolling, the lowest rung of the `animation` skill's
ladder that achieves the effect. A React render happens only when keyboard
focus enters or leaves a card. Verified by `stacked-cards.test.tsx`: a named
list in source order, sticky pinning with growing top and z-index and no
scroll listener, the reduced-motion path with nothing pinned, and the raise
of a focused card.
