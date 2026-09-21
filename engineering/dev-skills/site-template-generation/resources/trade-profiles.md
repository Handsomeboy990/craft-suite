# Trade profiles

The token set a trade gets, and why. The template never changes between trades;
only these values do. A profile is a starting point that the client's own brand
overrides, not a rule about what a trade is allowed to look like.

## The token set

Every profile fills the same keys. The template reads them as custom properties
and holds no literal of its own.

```
theme.palette     surface, surfaceAlt, foreground, muted, accent, accentHover,
                  accentForeground, border, borderStrong, success, danger
theme.type        displayFamily, textFamily, scaleRatio, displayWeight,
                  textWeight
theme.radius      sm, md, lg, pill
theme.spacing     unit, sectionY
theme.motion      intensity, baseDuration, easing
theme.density     compact | regular | airy
```

`motion.intensity` is a scalar between 0 and 1. Every duration in the template
is `baseDuration * intensity`, every travel distance is scaled by it, and 0
disables motion entirely. `prefers-reduced-motion: reduce` forces 0 whatever the
content file says.

## Profiles

| Profile | Trades | Palette | Type | Motion intensity |
|---|---|---|---|---|
| energetic | sports coaching, fitness, dance, personal training | one saturated accent on a dark or high contrast surface | a wide display face, heavy weight, ratio around 1.333 | 0.8 to 1.0 |
| technical | building trades, electrical, plumbing, industrial services | a restrained accent, light surface, strong borders | one grotesque for both roles, ratio around 1.2 | 0.2 to 0.35 |
| clinical | medical, legal, accounting, insurance | near neutral with a single cool accent | a serif display with a neutral text face, ratio around 1.25 | 0.1 to 0.2 |
| crafted | artisan food, ceramics, florists, hospitality | warm surface, earth accent | a humanist or display serif, ratio around 1.414 | 0.3 to 0.5 |
| creative | photography, design, architecture | near monochrome, the work carries the colour | a narrow display face, generous scale, ratio around 1.5 | 0.5 to 0.7 |

## Why motion is a business decision

A coach sells energy: movement on the page is an argument. An electrician sells
reliability on a quotation that may run into thousands: movement on the page is
noise in front of a decision. That is why intensity is a field in the content
file rather than a choice inside a component, and why a client may lower it
after delivery without a developer.

## Contrast is measured, not assumed

A profile is not delivered until the pair it actually renders has been measured.

```
foreground on surface          4.5:1 minimum
accentForeground on accent      4.5:1 minimum
muted on surface and surfaceAlt 4.5:1 for body text, 3:1 only for non text
borderStrong on both surfaces   3:1, because it draws the boundary of a control
border on both surfaces         no minimum: it is decorative, and a decorative
                                separator raised to 3:1 turns a quiet layout
                                loud for no accessibility gain
focus ring on every surface     3:1 against the adjacent colour
danger and success on surfaces  4.5:1, since they carry text
```

A saturated accent that fails against its own foreground is not made acceptable
by the trade it belongs to. Change the accent or the foreground on it, and
measure again.

Two border tokens rather than one is the resolution of a real conflict: the
boundary of an input or of a bordered button must reach 3:1 or the control is
not identifiable, while a separator between two cards at 3:1 makes a restrained
page look boxed in. Splitting them lets both be right. Both reference
implementations carry the split, with the measured figures in their READMEs.

## Fonts

Both families are declared in the content file, self hosted or loaded from a
source the project accepts, with the weights the profile uses actually present.
A weight referenced and not loaded renders as a synthesised face, which is one
of the clearest signs of a template that was never looked at.
