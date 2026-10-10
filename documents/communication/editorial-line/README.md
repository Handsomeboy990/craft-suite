# editorial-line

The editorial line of a brand: who reads, the promise in one sentence, a few
pillars with what each covers and never covers, tone and vocabulary with words
kept and refused and examples rewritten, what is never said, the formats, and
the review rule that says who approves what before publication.

- Inputs: a validated brief from `project-brief`, `requirements-analysis` and
  `clarification-gate`, with the audience, the offer and the constraints; the
  signed charter of `brand-identity` when one exists. When the audience, the
  offer or the constraints are missing, the skill asks once before it writes a
  rule.
- Outputs: intake record, audience profile, promise, pillars, vocabulary
  lists, never-said lists, format specifications, review matrix, the editorial
  line document and its quality gate record.
- Depends on: `document-core`.
- Governed by: `document-core`, its evidence rule and its eight-point gate.
- Downstream: site copy in `site-template-generation` and
  `frontend-engineering`; `social-content`, in the same category, for
  channels, calendar, moderation and measurement.

## When to use

A brand will publish more than one page, and someone other than the client
will write for it: an editorial line, a tone of voice, a content charter, a
style guide for what the brand says.

## When not to use

The visual identity and its brief voice: `brand-identity`. A single document
for a known reader: the writing skill for that reader, under `document-core`.

## What it enforces

Nothing invented: no client fact, statistic, testimonial, competitor or
audience figure. The line extends a signed identity and never contradicts it;
a conflict is escalated to the design-director agent and the owner, never
settled by picking a side. Vocabulary is built per output language, not
translated. Only the formats the client can sustain are specified. Nobody
approves their own draft, and nothing is published by the agent: publication
is the owner's act.

## Configuration

| Field | Effect |
|---|---|
| `language.document_output` | default output language of the line, overridden by the recipient's |
| `identity.organization` | cover and metadata when the line is paginated |
| `delegation` | read to confirm that publishing is not delegated; it never is by default |
