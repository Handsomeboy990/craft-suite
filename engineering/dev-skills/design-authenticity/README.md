# design-authenticity

Detects the cluster of generic defaults that make an interface look
machine-generated rather than designed: the same gradients, glass panels,
bento grids, default fonts, hover-everything motion, and the fabricated
testimonials and empty pricing tiers that travel with them.

- Inputs: the rendered page, and the product's stated identity where one
  exists.
- Outputs: the tells present with their locations, the cluster assessment, the
  intentionality gaps, and any fabricated-content defect.
- Depends on: engineering-core.
- Run by: the design-verification agent.

It reads each tell as a signal, not a verdict. A single rounded card or violet
gradient proves nothing; a whole page of the signals with no answer to why any
of them are there is the verdict. The test it applies is intentionality:
whether the person who built it can say why this choice, for this product,
rather than the default.

Two things it does not do: condemn a single element in isolation, and prescribe
a specific replacement. It names where intent is missing; the identity that
fills the gap is the project's.

One class of tell is not aesthetic at all. A testimonial from someone who does
not exist, an invented metric, a checked feature that is not built: these are
truthfulness defects, handed to `implementation-integrity` and raised
regardless of how well the rest of the page is designed.
