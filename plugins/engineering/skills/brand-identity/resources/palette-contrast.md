# Palette and contrast measurement

How the palette is built by role, how each pair is measured, and the table the
charter quotes. A ratio is the output of a computation, quoted with the
command that produced it. A typed ratio is removed.

## 1. Roles first

List the jobs before the hues. For each theme, light and dark, every role
below gets a value, or is marked not used:

```
ground            the page
ground-raised     cards, panels, the second surface
ink               body text
ink-muted         secondary text that must still be read
action            the primary interactive colour
on-action         text and icons placed on the action colour
focus             the focus indicator
control-edge      the boundary of an input or a control that has no fill
accent            the brand colours, each with its permitted uses
status            success, warning, danger, info, each with a text or shape
                  companion so colour is never the only carrier (SC 1.4.1)
```

The dark theme is designed: its ground is not black by default, its accent is
re-chosen for a dark ground rather than inverted, and its ink is not pure
white unless that was decided.

## 2. The pairs

Every pair that will carry text or a meaningful graphic, in each theme:

```
ink on ground, ink on ground-raised
ink-muted on ground, ink-muted on ground-raised
on-action on action
action on ground, when the action colour is used as link text
each accent on each ground it is permitted on, for its stated use
focus on ground, and on action if focus can land on an action control
control-edge on ground
the logo colour versions on each permitted ground (house rule, 3:1)
```

## 3. Thresholds, WCAG 2.2

| Use | Criterion | AA | AAA |
|---|---|---|---|
| text | SC 1.4.3, SC 1.4.6 | 4.5:1 | 7:1 |
| large-text, at least 24px, or 18.66px bold | SC 1.4.3, SC 1.4.6 | 3:1 | 4.5:1 |
| non-text: control boundary, focus indicator, meaningful graphic | SC 1.4.11 | 3:1 | none |

Logotypes are exempt from SC 1.4.3. The 3:1 the charter applies to the mark is
a house rule and is labelled as one.

## 4. The formula

Relative luminance of an sRGB colour, per the WCAG 2.2 definition:

```
for each channel c in R, G, B, as a value from 0 to 1:
  c_lin = c / 12.92                       if c <= 0.04045
  c_lin = ((c + 0.055) / 1.055) ^ 2.4     otherwise
L = 0.2126 * R_lin + 0.7152 * G_lin + 0.0722 * B_lin

ratio = (L_lighter + 0.05) / (L_darker + 0.05)
```

Compared unrounded. 4.499:1 fails 4.5:1. When a ratio is printed, it is
truncated to two places, never rounded up.

The formula applies to opaque colours. A translucent colour is measured as
the opaque colour it composites to on each ground it sits on, and each
composite is a separate pair.

## 5. The measurement

The reference implementation is `examples/contrast-run/contrast.py`, standard
library Python. It reads a CSV of pairs and prints a Markdown table, exiting
non zero when any pair is below the AA threshold of its use.

```
python3 contrast.py pairs.csv
```

CSV columns:

```
theme,foreground,foreground_hex,background,background_hex,use
light,ink,#1F2421,paper,#F7F4EE,text
```

Before trusting any tool, run it on two known values: black on white is
21:1, and `#767676` on white is 4.54:1. A tool that does not return both is
not used.

## 6. A failing pair

A pair below its threshold has two exits, both recorded in the charter:

```
restrict    the colour keeps its value but loses the failing use, for
            example an accent allowed for large text and graphics only
companion   a second value is added for the failing use, for example a
            darker text version of the accent, and measured in turn
```

Never a third exit: the threshold is not relabelled, and the ratio is not
rounded. After any change the whole table is measured again, because a
companion colour introduces new pairs.

## 7. The table the charter quotes

The script's output, pasted unchanged, with the command and the date:

```
Measured <date> with: python3 contrast.py pairs.csv

| Theme | Foreground | Background | Use | Ratio | AA | AAA |
|---|---|---|---|---|---|---|
| ... the rows as printed ... |

<n> pair(s) below the AA threshold of their use.
```

Then, beneath it, every restriction and companion with its reason, and the
list of pairs that were deliberately not measured because the combination is
forbidden by the charter.

## 8. What the measurement does not prove

It proves the colour values. It does not prove the rendered page: text over
an image, a gradient, a translucent layer, anti-aliasing at a thin weight.
`accessibility-testing` measures the rendered surfaces after they are built,
and its finding wins over this table.
