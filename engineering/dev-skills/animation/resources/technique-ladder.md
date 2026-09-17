# The technique ladder

The five rungs of `SKILL.md` section 2, expanded with what each costs and the
reduced-motion answer each needs. Pick the lowest rung that achieves the
intent.

## Rung 1: CSS transition

```
for        a state change: hover, focus, open, close, selected
animate    transform and opacity only in the hot path
easing     a chosen cubic-bezier, reused across states
cost       negligible; the compositor handles it
reduced    usually keep it (a short state transition is not the motion the
           preference targets), or shorten to near-instant
```

## Rung 2: CSS keyframes

```
for        a looping or multi-step motion with no input: a subtle pulse, a
           marquee, a loading indicator
animate    transform and opacity; a marquee translates, it does not animate left
cost       low, if it stays on cheap properties
reduced    stop the loop, or replace with a static state, under
           prefers-reduced-motion
```

## Rung 3: scroll-driven

```
for        reveal on entry, parallax, sticky-section transitions
trigger    IntersectionObserver for enter and leave, so nothing runs offscreen;
           or a scroll position mapped to a bounded, clamped transform
animate    transform and opacity; mask or clip-path for a wipe reveal
cost       moderate; keep the per-frame work small and off the main layout
reduced    no parallax, no scroll-linked transform; reveal becomes an instant
           or a cross-fade
```

## Rung 4: a JS animation library

```
for        orchestrated sequences, staggered timelines, physics, interruptible
           and reversible motion that hand-written rAF makes brittle
libraries  motion (the small modern one), GSAP (when its timeline and plugins
           earn their weight)
cost       the library weight plus the runtime; justified by orchestration, not
           by a single fade
reduced    the library reads the preference, or the caller does, and takes the
           still path
```

## Rung 5: WebGL with shaders

```
for        one signature effect a DOM technique cannot do: a shader hero, a
           fluid or particle field, a fragment-shader image transition
libraries  a minimal WebGL library such as OGL keeps the weight down against a
           full 3D engine
cost       the highest: a canvas, a render loop, GPU work, and a real
           accessibility and battery consideration
reduced    do not autoplay under prefers-reduced-motion; show a still frame, a
           calm gradient, or a static image instead
build      once, for the one moment that is the brand, never as a background on
           every section
```

## The rule across all rungs

The reduced-motion answer is decided and built at the same time as the motion,
never bolted on afterward, and never omitted. A motion with no reduced-motion
path does not ship.
