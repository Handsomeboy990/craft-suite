# Tooltip

A short supplementary label shown on hover and on keyboard focus. The
behaviour, delay, Escape to dismiss, collision-aware positioning and the
`aria-describedby` wiring, comes from `@radix-ui/react-tooltip`; the look and
the API are the suite's own, per `docs/decisions/0002-ui-primitive-base.md`.
Radix is wrapped, never exposed to the consumer.

## When not to use it

A tooltip describes; it never holds the only copy of information, and never an
interactive control. Touch users and many screen-reader users will not see it.
The trigger must be a real focusable element with its own accessible name; the
tooltip adds a description, it does not replace the name.

## API

| Export | Purpose |
|---|---|
| `Tooltip` | wraps one trigger element; requires `content`; takes `side`, `delayMs`, and `open`, `defaultOpen`, `onOpenChange` for control |
| `TooltipProvider` | optional group; shares the delay so the next tooltip along a toolbar opens at once |

A `Tooltip` outside any provider brings its own, so it works dropped anywhere.
Inside a `TooltipProvider` it joins the group instead of shadowing it.

```tsx
import { Tooltip, TooltipProvider } from "@craft-suite/ui";

<TooltipProvider>
  <Tooltip content="Copy the link to this page">
    <button type="button">Share</button>
  </Tooltip>
</TooltipProvider>;
```

## Motion

None. A tooltip that waits for a fade is slower to read, and under reduced
motion there would be nothing left to remove.

## Accessibility

Verified by `tooltip.test.tsx`: hidden until hovered or focused, opens on
keyboard focus and on hover, describes its trigger without replacing its name,
closes on Escape with focus left on the trigger, and shows one tooltip at a
time inside a group. These are the floor; a screen-reader pass still precedes
a release that depends on it.
