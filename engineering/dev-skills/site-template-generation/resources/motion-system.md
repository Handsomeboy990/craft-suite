# Motion system

One scalar in the content file drives everything that moves. This file says what
that scalar controls, what it never controls, and how the motion is built so
that setting it to zero leaves a site that still works.

## The scalar

```
theme.motion.intensity     0 to 1
theme.motion.baseDuration  milliseconds at intensity 1
theme.motion.easing        a curve, not a keyword chosen at random
```

Everything derives:

```
--motion-duration   baseDuration * intensity
--motion-travel     the reveal distance * intensity
--motion-stagger    the delay between two items of a list * intensity
--motion-scale      the hover lift, 0 at intensity 0
```

`prefers-reduced-motion: reduce` forces the effective intensity to zero,
whatever the content file says. That is a hard requirement, not a courtesy.

## The ladder, by intensity

| Intensity | What moves |
|---|---|
| 0 | nothing. Interactive states change instantly, and the site is complete |
| 0.2 to 0.4 | interactive states, a short fade on reveal |
| 0.5 to 0.7 | the above, plus travel on reveal and a stagger inside a list, plus a hero entrance |
| 0.8 to 1 | the above, plus counters on figures, a longer travel, a parallax that costs nothing because it is a transform |

## Techniques, cheapest first

```
1  a CSS transition on transform or opacity. Covers every interactive state
2  a CSS animation on transform or opacity, triggered by a class
3  an IntersectionObserver that adds that class when an element enters view
4  a small amount of JavaScript for a value that must be computed, such as a
   counter, and nothing more
```

Nothing here needs an animation library. A library is a dependency decision
under `dependency-selection`, justified by an effect this ladder cannot
produce, not by convenience.

## The reveal

```
markup     the element carries the reveal class and an index for its stagger
initial    opacity 0 and a translate of --motion-travel, applied only when
           motion is enabled, so a page with motion off is never invisible
trigger    IntersectionObserver with a small root margin, fired once
           per element, then the observer stops watching it
fallback   no IntersectionObserver, or JavaScript disabled: the element is
           visible. The initial hidden state is set by the script, never by the
           stylesheet, so nothing can hide content permanently
```

That last rule is the one that matters. A reveal implemented by hiding in CSS
and showing in JavaScript turns a script failure into a blank page.

## What never moves

- The first screen beyond a fade. A hero that assembles itself delays reading.
- Anything while a form is being filled.
- Anything that shifts layout: no animated height, width, top or margin.
- A focus ring. It appears instantly or it is not an accessibility feature.
- Anything triggered by a hover on a touch device, where the hover does not
  exist.

## Verification

```
at 0     no movement anywhere, the site complete and usable
at 0.5   reveals and interactive states, no counter
at 1     the whole ladder, no layout shift, no dropped frame on a mid range
         device
reduced  the same as 0, with the content file untouched
no JS    every section visible, nothing stuck hidden
```
