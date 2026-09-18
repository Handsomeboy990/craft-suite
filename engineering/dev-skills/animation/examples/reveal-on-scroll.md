# Example: a reveal on scroll, decided rung by rung

A team wants section headings to "animate in nicely" as the reader reaches
them. The skill decides the motion rather than reaching for a library.

## Section 1: should it move

The reveal sequences reading: a heading that arrives as it enters view guides
attention down the page. That is guiding, not decorating, so it earns a motion.
The body paragraphs under it do not each need their own reveal; one reveal per
section, not per element.

## Section 2: the lowest sufficient rung

This is a reveal on entry: rung 3, scroll-driven, with an
`IntersectionObserver` trigger. Not rung 4: there is no orchestration, no
timeline to interrupt, so a library would be weight for nothing. The reveal is
a `transform` and an `opacity`, optionally a `clip-path` wipe for a heading that
warrants it.

## Section 3 and 4: cheap properties, chosen easing

```
from   opacity 0, translateY 12px
to     opacity 1, translateY 0
easing cubic-bezier(0.22, 1, 0.36, 1)   a fast start that settles, reused for
                                        every reveal on the site
never  animating top or height; the movement is a transform
```

`will-change: transform, opacity` is set on the heading just before it enters
and removed once the reveal is done, not left standing on every heading.

## Section 6: the reduced-motion path, built now

```
prefers-reduced-motion: reduce
    the heading appears with no translate and no wipe; at most a short
    opacity cross-fade, or instantly. No scroll-linked movement runs.
in JS
    the IntersectionObserver still reveals the heading, but the class it adds
    resolves to the still state, because matchMedia reported the preference.
```

## The result

One motion, on rung 3, on cheap properties, with a chosen curve reused across
the site, and a designed still path for the visitors who asked for less. No
library was added, nothing on rung 5 was reached for, and no heading animates
that did not earn it. That is the difference between motion that reads as
designed and the hover-everywhere default `design-authenticity` flags.
