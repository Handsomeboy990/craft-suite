# brand-identity

Turns a validated brief into a visual identity a product can be built from:
positioning and personality, a logo brief with usage rules, a palette whose
contrast pairs are measured in both themes against WCAG 2.2, a type scale,
imagery and iconography direction, a brief tone of voice, a moodboard with
every reference sourced and licence-noted, and the charter that holds them.

- Inputs: a validated brief from `project-brief`, `requirements-analysis` and
  `clarification-gate`, with positioning, audience and constraints. When one
  of the three is missing, the skill asks before it decides anything.
- Outputs: positioning statement, logo brief and usage rules, measured
  palette, type scale, imagery direction, voice brief, moodboard record, the
  charter, the brand tokens and the sign-off record.
- Depends on: engineering-core, design-authenticity.
- Governed by: design-authenticity.
- Downstream: design-system, which receives the tokens only after sign-off;
  font-loading; editorial-line, in the documents tree, for the full verbal
  identity.
- Owned by: the design-director agent, which signs off. The author of an
  identity never signs it off.

Every ratio in a charter is computed, never typed. `examples/contrast-run`
holds a standard library script that measures a pair table and the output it
produced for the worked example, including the pair that failed and how it was
fixed.

The identity may be drafted on a design canvas, come back as the owner's link,
or live only in the repository as a tokens file and a charter document. No
vendor tool is required, and in every case the repository holds the signed
record.

Nothing is invented: no client fact, competitor, market figure or licence. A
reference brand is direction, never a source to copy.
