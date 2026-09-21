# Trade profiles

The token set a trade gets, and why. The template never changes between trades;
only these values do. A profile is a starting point that the client's own brand
overrides, not a rule about what a trade is allowed to look like.

## The token set

Every profile fills the same keys, twice: once for the light theme and once for
the dark one. The template reads them as custom properties and holds no literal
of its own.

```
theme.palettes.light   the palette below
theme.palettes.dark    the same keys, authored separately

palette           surface, surfaceAlt, foreground, muted, accent, accentHover,
                  accentForeground, border, borderStrong, success, danger
theme.type        displayFamily, textFamily, scaleRatio, displayWeight,
                  textWeight
theme.radius      sm, md, lg, pill
theme.spacing     unit, sectionY
theme.motion      intensity, baseDuration, easing
theme.spacing     unit, section, pageWidth, proseWidth
theme.density     compact | regular | airy
```

`pageWidth` is wide, because a client site is not a document: cards, galleries
and figure bands use it. `proseWidth` caps long text and legal pages only.

`motion.intensity` is a scalar between 0 and 1. Every duration in the template
is `baseDuration * intensity`, every travel distance is scaled by it, and 0
disables motion entirely. `prefers-reduced-motion: reduce` forces 0 whatever the
content file says.

## Profiles

| Profile | Trades | Palette | Type | Motion intensity |
|---|---|---|---|---|
| energetic | sports coaching, fitness, dance, personal training | one saturated accent; light theme bright and high contrast, dark theme near black | a wide display face, heavy weight, ratio around 1.333 | 0.8 to 1.0 |
| technical | building trades, electrical, plumbing, industrial services | a restrained accent, strong control borders, both themes sober | one grotesque for both roles, ratio around 1.2 | 0.2 to 0.35 |
| clinical | medical, legal, accounting, insurance | near neutral with a single cool accent | a serif display with a neutral text face, ratio around 1.25 | 0.1 to 0.2 |
| crafted | artisan food, ceramics, florists, hospitality | warm surface, earth accent, a dark theme that stays warm | a humanist or display serif, ratio around 1.414 | 0.3 to 0.5 |
| creative | photography, design, architecture | near monochrome, the work carries the colour | a narrow display face, generous scale, ratio around 1.5 | 0.5 to 0.7 |

## Dark is authored, not derived

A dark palette produced by inverting the light one gives grey text on charcoal,
an accent that glows and a border that disappears. Each theme is authored and
measured on its own. The accent often differs between themes: a colour that
reaches 4.5:1 against white rarely does against near black, and the fix is a
lighter accent in the dark theme, not a compromise that fails in both.

## Why motion is a business decision

A coach sells energy: movement on the page is an argument. An electrician sells
reliability on a quotation that may run into thousands: movement on the page is
noise in front of a decision. That is why intensity is a field in the content
file rather than a choice inside a component, and why a client may lower it
after delivery without a developer.

## Contrast is measured, not assumed, in both themes

A profile is not delivered until every pair below has been measured in the light
theme and in the dark theme.

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
