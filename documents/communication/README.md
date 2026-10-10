# communication

One skill. What a brand says, to whom, in which words, and who approves it
before it goes out.

| Skill | Owns |
|---|---|
| [editorial-line](editorial-line/) | audience, promise, pillars, tone and vocabulary, what is never said, formats, the review rule |

The category exists because of ADR 0006
(`docs/decisions/0006-brand-content-and-site-pipeline.md`). It is planned to
hold a second skill, social-content, for the calendar per channel, formats and
sizes per network, moderation and measurement, which is not yet written. Until
it exists, `editorial-line` holds the rules a social post must follow and
nothing about channels or schedules.

## editorial-line

The reader of an editorial line is whoever writes for the brand, not the
brand's audience. The line is structured for that writer and describes the
audience.

Three rules do most of the work:

- **Nothing invented.** No client fact, statistic, testimonial, competitor or
  audience figure. A promise is written with its conditions, from the
  client's words, or not at all.
- **The identity is not contradicted.** The line extends the voice brief of a
  signed `brand-identity`. A conflict is escalated to the design-director
  agent and the owner, and never settled by picking a side.
- **Nobody approves their own draft, and the agent never publishes.**
  Publication is the owner's act; no delegation in the configuration covers
  it.

## Boundary with the rest of the suite

| Work | Owner |
|---|---|
| The visual identity and its brief voice | `brand-identity`, engineering tree |
| The site copy itself | `site-template-generation`, `frontend-engineering`, held to the line |
| Keywords for search | `seo-engineering`, held to the line's vocabulary |
| A single document for one known reader | the writing skill for that reader, `documentation/` or `administrative/` |
| Layout and render of the line as a deliverable | `document-design`, `pdf-production` |

## Routing

No agent owns this category yet. The planned community-manager agent will own
it. Until then, a request for an editorial line is routed like any other
delivered document: the chief, `delivery-orchestrator`, loads `document-core`
and then `editorial-line`, and holds the eight-point gate itself.

## Configuration

| Field | Used by |
|---|---|
| `language.document_output` | `editorial-line`, the default output language |
| `identity.organization` | cover and metadata when the line is paginated |
| `delegation` | read to confirm that publishing is not delegated |
