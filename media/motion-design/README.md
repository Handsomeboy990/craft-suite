# motion-design

Composes the animated layer of a project video in code: titles, lower thirds,
callouts, animated architecture diagrams, code highlights, zooms and
transitions.

- Inputs: the rights record and the agreed identity from `video-core`, the
  timing sheet from `video-scripting`, the takes and zoom map from
  `screen-capture`.
- Outputs: the motion system, the compositions, the diagram animations, the
  zoom and callout layer, the motion render.
- Depends on: video-core.

Motion makes the viewer look at the right thing at the right time. The system
is decided once, from the project's own identity, with a few named easing
curves and a short duration scale. Every element is a Remotion composition
driven by the timing sheet and by props, so a script change moves the motion
and a second language changes data only. Diagrams build in the order the
narration explains them and draw the project as built. Zooms follow the
capture's zoom map, callouts sit over the clean capture, nothing flashes, and
text is held long enough to read twice.
