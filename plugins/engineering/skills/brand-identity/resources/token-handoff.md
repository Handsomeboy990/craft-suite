# Sign-off and token handoff

The identity reaches `design-system` as tokens, once, after sign-off. This
file is the sign-off record and the shape of what is handed over.

## 1. Sign-off record

```
SIGN-OFF   <product>, charter v<n>, tokens v<n>, <date>

Drafted by        <agent or session that wrote the identity>
Signed off by     design-director                 (never the drafter)
Client accepts    <name and role on the client side, date> | not applicable
Charter           <path>, version
Tokens            <path>, version
Contrast output   <path to the captured script output>, command, date
Open questions    <each, marked blocking or not blocking>

Verdict           signed | refused
If refused        <section>: <the decision still owed, concretely>
```

A refusal names the section and the decision, not a mood. "The palette feels
off" is not a refusal; "the light theme's secondary accent has no stated
use and no measured pair" is.

## 2. What is handed over

Two layers, as `design-system` expects them: raw values, then the semantic
names that point at them, per theme.

```
raw         the palette by name and value, both themes
            the type families and the scale steps
            any radius, elevation or motion character the identity decided,
            with the trait it comes from
semantic    each role from the palette resource mapped to a raw value, in
            each theme
restricted  every restriction and companion colour, so the system cannot
            offer a colour for a use the charter refused
```

## 3. Mapping onto `libraries/ui`

When the product uses the suite's own `libraries/ui`, the semantic roles map
onto its existing token names. The names belong to the library; only the
values change.

| Palette role | `libraries/ui` token |
|---|---|
| ground | `--cu-color-bg` |
| ground-raised | `--cu-color-surface` |
| ink | `--cu-color-text` |
| ink-muted | `--cu-color-muted` |
| decorative divider | `--cu-color-border` |
| action | `--cu-color-accent` |
| on-action | `--cu-color-accent-text` |

A role the library has no token for, a focus colour or a control edge
distinct from the accent, is a system finding for `design-system` to add or
refuse, not a value to hardcode in a component. `--cu-color-border` is a
decorative divider; when the identity needs a control boundary at 3:1, that
is the missing token to raise.

## 4. The three routes into the code

```
repository      the token file is written in the repository and applied by
                design-system; this route always exists
design sync     the owner starts /design-sync, which keeps a claude.ai/design
                design-system project and libraries/ui in step; the agent
                never starts it, and checks afterwards that the synced values
                equal the signed token file
canvas bundle   the prototype on the canvas is read back as a reference for
                the build; its values are taken from the signed token file,
                never re-read from the prototype's CSS
```

## 5. After the handoff

- `design-system` owns the tokens. A brand value is changed only through
  this skill and a new sign-off.
- The first surface built with the tokens goes through `design-authenticity`
  and `accessibility-testing`. A rendered contrast failure there wins over the
  charter's table and comes back here as a palette change.
- The signed charter and token versions are recorded in the project's
  continuity notes.
