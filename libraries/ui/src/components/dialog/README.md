# Dialog

A modal dialog. The behaviour, focus trap, Escape to close, scroll lock and
aria wiring, comes from `@radix-ui/react-dialog`; the look and the API are the
suite's own, per `docs/decisions/0002-ui-primitive-base.md`. Radix is wrapped,
never exposed to the consumer, so the base can be swapped at this file alone.

## Why the wrapper exists

It enforces the one thing a dialog must never ship without: an accessible
name. `DialogContent` requires a `title`, so there is no way to render an
unlabelled dialog. It also applies the design tokens, and presents a small,
closed API instead of the full Radix surface.

## API

| Export | Purpose |
|---|---|
| `Dialog` | the root; holds open state |
| `DialogTrigger` | the control that opens it; `asChild` supported |
| `DialogContent` | the panel; requires `title`, takes optional `description`, renders children |
| `DialogClose` | a control that closes it; `asChild` supported |

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogClose } from "@craft-suite/ui";

<Dialog>
  <DialogTrigger>Delete project</DialogTrigger>
  <DialogContent title="Delete project" description="This cannot be undone.">
    <DialogClose>Cancel</DialogClose>
  </DialogContent>
</Dialog>;
```

## Accessibility

Verified by `dialog.test.tsx`: it is closed until triggered, opens with an
accessible name and description, moves focus into the panel, and closes on
Escape and on a `DialogClose` control. These are the floor, not the finish;
the automated test does not replace a screen-reader pass before a release that
depends on it.
