---
name: motion-design
description: Composes the animated layer of a project video in code so it is intended, consistent and safe: titles, lower thirds, callouts, animated architecture diagrams, code highlights, zooms that follow the capture's zoom map, and transitions, built as Remotion compositions driven by the timing sheet, styled from the project's own identity tokens, on a small set of easing curves and durations, with motion that explains rather than decorates, nothing that flashes, text held long enough to read, and every frame rendered from source. Use for the titles, diagrams, emphasis and transitions of a demo, presentation, short or tutorial video.
license: MIT
metadata:
  category: media
  version: 1.0.0
  depends_on: [video-core]
  outputs: [motion-system, compositions, diagram-animations, zoom-and-callout-layer, motion-render]
---

# Motion Design

Motion in a project video has one job: to make the viewer look at the right
thing at the right time and understand how the parts fit. Everything that
moves is decided, styled from the project's identity, and rendered from code,
per `video-core` section 4. Motion that only decorates is cut.

## 1. The motion system, decided once

```
identity    colours, type and logo come from the project's own identity or
            design tokens, with the owner's agreement; absent one, a neutral,
            readable system is chosen and stated, never an invented brand
type        one display face and one text face at most, licensed, sizes set
            for the smallest target screen of the format
easing      two or three curves, named and reused: one for entrances, one
            for exits, one for emphasis; no default linear slide
durations   a short scale (for example 200, 400 and 800 ms) used everywhere,
            so the video has one rhythm
safe area   text and key graphics stay inside a safe area of the frame, with
            the 9:16 safe area of the platform's interface overlays respected
            for shorts
```

## 2. Compositions in code

```
reference   Remotion compositions in React, one per kind of element (title,
            lower third, callout, diagram, code highlight, end card) and one
            master composition per cut
timing      every composition reads its start and duration from the timing
            sheet of `video-scripting`, so a script change moves the motion
            with it
inputs      captures are placed as video layers; their zooms are animated
            from the zoom map of `screen-capture`, never re-cropped by hand
props       text, colours and assets are props, not values typed inside a
            component, so a second language or a second cut changes data only
render      one command renders each cut and each still; the command and the
            versions of the tools are recorded
```

Where the project already works in another code-driven motion tool, the same
artefacts apply in that tool.

## 3. Diagrams that build

An architecture or a flow is shown being assembled, in the order the narration
explains it: each box, arrow and label appears when it is named, and stays. A
diagram carries only the parts the narration mentions. It is drawn from what
the project actually is, read from its code or confirmed by the owner, never an
idealised picture of a system that does not exist.

## 4. Emphasis on the capture

```
zoom        follows the zoom map, eased in and out, holding while the
            narration speaks about the zoomed element
callout     an outline, a spotlight or an arrow drawn over the clean capture,
            in the identity's accent colour, appearing just before the action
code        the lines being discussed are highlighted; the rest dims; the
            highlight moves with the narration, not ahead of it
cursor      the capture's own cursor is kept; no second, animated cursor that
            does something the product did not
```

## 5. Transitions

A cut is the default. A transition is used where it says something (a move
from the problem to the product, from one chapter to the next), from the
system's curves and durations. No spin, no page curl, no transition picked
from a preset because it was there.

## 6. Safe and readable motion

```
flashing    nothing flashes more than three times in any one second, and no
            large area alternates between saturated colours
read time   every text element stays on screen long enough to be read twice
            at a calm pace
contrast    text over moving footage sits on a solid or blurred plate that
            keeps the contrast the accessibility minimum requires
calm        no decorative motion loops under narration that needs attention
```

## 7. Prohibitions

- No invented brand identity for someone else's project.
- No diagram of a system that is not the project as built.
- No animated action the product did not perform.
- No flashing beyond three per second.
- No motion element typed with a hardcoded time instead of the timing sheet.
- No frame that cannot be re-rendered from the compositions.

## 8. Protocol

1. Read the rights record, the identity or tokens the owner agreed to, the
   timing sheet and the zoom map.
2. Fix the motion system: type, colours, easing curves, duration scale, safe
   area.
3. Build one composition per element kind and a master per cut, driven by the
   timing sheet and props.
4. Animate the diagrams from the project as built, in the order of the
   narration.
5. Add zooms from the zoom map and callouts over the clean capture.
6. Check flashing, read time and contrast on every text and transition.
7. Render each cut and record the command and tool versions.

## 9. Auto-critique

Score from 0 to 5: the system comes from the project's identity or a stated
neutral choice; curves and durations are few and reused; every element is
driven by the timing sheet; diagrams match the project as built and build with
the narration; emphasis follows the zoom map and shows nothing the product did
not do; transitions are justified; no flashing, enough read time, contrast
kept; every frame renders from source.

Threshold: no axis below 3, average at least 4. An animated diagram of an
architecture the project does not have, or an animated action the product did
not perform, scores 0 overall.

## 10. Interfaces

- Upstream: `video-core`; `video-scripting` for the timing sheet;
  `screen-capture` for the takes and the zoom map.
- Lateral: `animation` for the motion principles shared with interfaces,
  `brand-identity` and `design-system` for the project's identity and tokens,
  `design-authenticity` for the intent behind each choice,
  `accessibility-testing` for contrast and flashing.
- Downstream: assembly in this tree, which places the rendered layers on the
  timeline.
