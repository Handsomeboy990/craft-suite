# tokens

The design tokens, as CSS custom properties, in `tokens.css`. One source of
truth for colour, type, spacing, radius, elevation and motion.

## Principles

- A theme is a token set, never a forked component. Light is the default; dark
  is the same tokens under a different set.
- Dark applies two ways, in the suite's artifact convention: by system
  preference (`@media (prefers-color-scheme: dark)`, which an explicit
  `data-theme="light"` root opts out of) and by an explicit `data-theme="dark"`
  root, which always wins.
- Reduced motion is a hard floor: under `prefers-reduced-motion: reduce` the
  motion durations are zero, and no component may animate around that.
- The colour values are brand-free placeholders. A project overrides the
  `--cu-color-*` tokens with its own identity; the component code never changes.

## Use

```css
@import "@craft-suite/ui/tokens.css";
```

Then reference the variables: `var(--cu-color-accent)`, `var(--cu-space-4)`,
`var(--cu-radius-md)`, and so on. The names are the contract; `tokens.test.ts`
fails if a relied-on token is renamed or a dark override or the reduced-motion
floor goes missing.
