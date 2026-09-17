# animation

Decides whether an interface should move at all, then builds motion that is
intended rather than defaulted: the right technique from a CSS transition to a
scroll-driven animation to a JS library to a WebGL shader, animating only what
the compositor animates cheaply, easing on chosen curves, and honouring
prefers-reduced-motion as a hard requirement.

- Inputs: the interface and the intent behind each proposed motion.
- Outputs: the motion decisions with their chosen technique and easing, the
  implementation, and a reduced-motion path for every motion.
- Depends on: engineering-core.

Motion is a design decision, not a default. A page that animates everything on
hover is generated, not designed, and `design-authenticity` flags exactly that.
This skill builds the other kind: motion that communicates state, guides
attention, or gives one signature moment, on the lightest technique that
achieves it, with a deliberate easing curve, that a visitor who asked their
system for less motion never sees.

It is taught in part from a reference analysis of a real, well-made site
(`resources/reference-analysis-pear.md`): a bespoke shader for one signature
moment, scroll-linked transform motion on cheap properties, masked reveals,
custom easing, and reduced motion honoured in both CSS and JS. The principles
are extracted, never the code or the assets; the result built from them is
original.

The technique ladder and the reduced-motion rule are in
`resources/technique-ladder.md`.
