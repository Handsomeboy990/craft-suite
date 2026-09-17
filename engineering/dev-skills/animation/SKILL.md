---
name: animation
description: Decides whether an interface should move at all, then builds motion that is intended rather than defaulted: the right technique from a CSS transition to a scroll-driven animation to a JS library to a WebGL shader, animating only what the compositor animates cheaply, easing on chosen curves, and honouring prefers-reduced-motion as a hard requirement. Use for any reveal, transition, hover, parallax, scroll effect or signature hero motion.
license: MIT
metadata:
  category: dev-skills
  version: 1.0.0
  depends_on: [engineering-core]
  outputs: [motion-decisions, animation-implementation, reduced-motion-fallbacks]
---

# Animation

Motion is a design decision, not a default. A page that animates everything on
hover is not designed, it is generated, and `design-authenticity` flags exactly
that. This skill builds the other kind: motion that means something, on the
lightest technique that achieves it, with a chosen easing curve, that a
visitor who asked their system for less motion never sees.

It is taught in part from a reference analysis of a real, well-made site
(`resources/reference-analysis-pear.md`): the principles are extracted, never
the code or the assets.

## 1. First, should it move at all

```
yes   motion communicates state (a control responding), guides attention (a
      reveal that sequences reading), or gives a signature moment (one hero
      effect that is the brand)
no    motion that decorates without meaning, that fires on every element, or
      that the content would read better without
```

The default answer for a given element is no. A skill that adds motion because
it can is the vibe-coded default this skill exists to avoid.

## 2. The technique ladder, cheapest first

Pick the lowest rung that achieves the intent. Climbing a rung buys power and
costs weight and risk.

| Rung | Technique | Reach for it when |
|---|---|---|
| 1 | CSS `transition` on `transform` and `opacity` | a state change: hover, focus, open, close |
| 2 | CSS `@keyframes` animation | a looping or multi-step motion with no input: a pulse, a marquee, a load spinner |
| 3 | Scroll-driven, with `IntersectionObserver` for triggers or a scroll position mapped to `transform` | a reveal on entry, a parallax, a sticky-section transition |
| 4 | A JS animation library (`motion`, GSAP) | orchestrated sequences, staggered timelines, physics, interruption and reversal that hand-written rAF would make brittle |
| 5 | WebGL through a minimal library such as OGL, with GLSL shaders | one signature effect a DOM technique cannot do: a shader hero, a fluid or particle field, an image transition in a fragment shader |

Rungs 4 and 5 are for the few moments that justify them. A whole site on rung 5
is as thoughtless as a whole site on rung 1 with a transition on everything.

## 3. Animate only what is cheap to animate

The compositor animates two things without laying out or painting the page:
`transform` and `opacity`. Everything else can animate, and most of it costs a
layout or a paint every frame.

```
cheap      transform (translate, scale, rotate), opacity
expensive  top, left, width, height, margin, and anything that reflows
paint      color, box-shadow, background, and anything that repaints a large area
```

Move with `transform`, not `top`/`left`. Fade with `opacity`. Use `will-change`
only on the element about to move and remove it after, because a standing
`will-change` holds a layer and costs memory. Drive JS motion from a single
`requestAnimationFrame` loop, and smooth scroll-linked values with a lerp
toward the target rather than snapping.

## 4. Easing is a choice, not a default

Linear motion reads as mechanical, and the browser default `ease` reads as
generic. Choose a curve for the feeling: a fast start that settles for an
entrance, a gentle start for something leaving, an overshoot for a playful
pop. Author it as a `cubic-bezier`, name why it was chosen, and reuse a small
set across the interface rather than a different curve per element.

## 5. The patterns that read as designed

Extracted as principles from the reference analysis, to implement originally,
never to copy.

| Pattern | What it is | The honest way to do it |
|---|---|---|
| Reveal on scroll | content enters as it comes into view | `IntersectionObserver` toggles a class; the motion is a `transform` and `opacity`, optionally masked with `clip-path` or a CSS `mask` for a wipe; staggered by a small per-item delay |
| Parallax | layers move at different rates with scroll | map scroll position to a bounded `transform`, clamped, never unbounded, and disabled under reduced motion |
| Sticky-section transition | a section pins while its content changes | `position: sticky` plus a scroll-mapped `transform`, with `perspective` for depth where it earns it |
| Hover micro-interaction | a control acknowledges the pointer | one rung-1 transition, on the control that was hovered, not on everything |
| Page or view transition | continuity between states | an orchestrated rung-4 sequence, or the native view-transition where it fits, kept short |
| Signature hero | one bespoke moment that is the brand | a rung-5 shader, built once, behind a reduced-motion fallback that is a still image or a calm gradient |

## 6. prefers-reduced-motion is a hard requirement

Every motion has a reduced-motion answer, decided at build time, not omitted.

```
respect it in CSS    wrap non-essential motion so it is off under
                     @media (prefers-reduced-motion: reduce), or reduce it to a
                     cross-fade
respect it in JS     read matchMedia('(prefers-reduced-motion: reduce)'),
                     react to its changes, and take the still path: no scroll
                     effect, no autoplaying shader, a static frame instead
never                a page that animates everywhere and honours the preference
                     nowhere ships; it fails on accessibility regardless of taste
```

A reduced-motion fallback is not a lesser version bolted on. It is the version
a real fraction of visitors get, and it is designed, not empty.

## 7. What this skill refuses

- Motion with no meaning, and motion on every element.
- Animating layout properties where a `transform` would do.
- A standing `will-change` on many elements, or on everything.
- The browser default easing as the whole easing vocabulary.
- Reaching rung 4 or 5 for what a lower rung achieves.
- Any motion with no reduced-motion path.
- Copying a reference's code or assets; the principle is extracted, the result
  is original.

## 8. Protocol

1. For each proposed motion, apply section 1: does it communicate, guide, or
   give a signature moment. If not, it does not ship.
2. Choose the lowest rung in section 2 that achieves the intent, and state why
   a higher rung was needed if one was.
3. Animate `transform` and `opacity`; move layout only when there is no
   alternative, and say so.
4. Author the easing as a chosen `cubic-bezier`, reused across the interface.
5. Build the reduced-motion path for every motion, in CSS and in JS, at the
   same time as the motion itself.
6. Verify in a browser: the motion runs at frame rate, the reduced-motion
   preference removes or calms it, and no standing `will-change` was left
   behind.

## 9. Auto-critique

Score from 0 to 5: each motion earns its place by meaning, the lowest
sufficient rung was chosen, only compositor-cheap properties animate in the hot
path, the easing is a deliberate curve rather than the default, every motion
has a reduced-motion path built at the same time, and no reference code or
asset was copied.

Threshold: no axis below 3, average at least 4. Any motion shipped without a
reduced-motion path scores 0 overall, because it excludes the visitors the
preference exists to serve.

## 10. Interfaces

- Upstream: `engineering-core`.
- Lateral: `ui-ux-engineering` for the rendered experience the motion serves,
  `frontend-engineering` for the implementation, `design-system` for the
  motion tokens (durations, easings) a system defines, `design-authenticity`
  so motion stays intentional rather than the hover-everywhere default,
  `accessibility-testing` for the reduced-motion and performance overlap,
  `performance-engineering` when a motion costs frames.
- Reference data: `resources/technique-ladder.md`,
  `resources/reference-analysis-pear.md`.
