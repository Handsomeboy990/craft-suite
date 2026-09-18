# Reference analysis: pear.no

A worked analysis of a real, well-made site, kept as reference material the
`animation` skill teaches from. The purpose is to extract the principles, never
the code or the assets. Reference, inspiration, pattern and implementation are
distinct: what follows is pattern and principle, to be implemented originally.

Observed by fetching the public page and its published bundle and reading the
technique signatures in them, on 2026-09-17. No source was copied, and nothing
here reproduces their implementation.

## What the site is built with

| Layer | Observed | Principle to take |
|---|---|---|
| Framework and build | React, built with Vite (hashed single JS and CSS bundle) | a conventional stack; the motion is where the craft is, not the tooling |
| WebGL | a minimal WebGL library (OGL) with custom GLSL shaders, and a high count of shader uniforms | one bespoke shader layer for a signature moment, not a template effect dropped in |
| DOM motion | transform and translate driven by scroll, easing by clamp and lerp, a light motion helper, a single animation frame loop | scroll-linked motion on compositor-cheap properties, smoothed toward a target rather than snapped |
| Reduced motion | matchMedia for prefers-reduced-motion in the JS, and an @media block in the CSS | the preference is honoured in both layers, not one |

## The CSS techniques present

`transform` used heavily, `@keyframes`, `transition`, `will-change` applied
sparingly, `cubic-bezier` for custom easing, `clip-path` and CSS `mask` for
reveals and shaped elements, `backdrop-filter` for glassy overlays, `mix-blend`,
`position: sticky` for pinned sections, and `perspective` for depth. Read as
principles:

```
reveal        masks and clip-paths wipe content in, rather than a plain fade
easing        custom cubic-bezier curves, not the browser default
depth         sticky sections and perspective, not a flat scroll
restraint     will-change only where something is about to move
```

## The typography, which matters to motion

The titles use Flecha, a refined serif with optical sizes (L, M, S), and the
body a quality grotesque (GT Standard) with a mono companion. This is the
opposite of the Geist and Space Grotesk defaults that `design-authenticity`
flags. The lesson for motion: motion sits on top of a designed foundation. A
signature shader over generic type still reads as generic; the type and the
motion are one intentional whole.

## What to reproduce, and what not to

```
reproduce   the principles: a single bespoke shader moment, scroll-linked
            transform motion on cheap properties, masked reveals, custom
            easing, reduced-motion honoured in both CSS and JS, motion built
            on a designed typographic foundation
never       their shaders, their bundle, their assets, their exact timings or
            curves. Those are theirs. The result built from these principles is
            original, or it is theft with extra steps.
```

## How this feeds the skill

`animation/SKILL.md` section 2's technique ladder and section 5's pattern table
are the general form of what is observed here: rung 5 (a shader) reserved for
one signature moment, rungs 1 to 3 for the rest, custom easing, masked reveals,
and reduced motion as a hard requirement. The site is an existence proof that
the ladder produces motion that reads as designed.
