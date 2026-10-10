# communication

Two skills. What a brand says, to whom, in which words, who approves it
before it goes out, and how it is carried onto social channels and answered
there.

| Skill | Owns |
|---|---|
| [editorial-line](editorial-line/) | audience, promise, pillars, tone and vocabulary, what is never said, formats, the review rule |
| [social-content](social-content/) | channels and the calendar per channel, formats and sizes per network, captions held to the line, moderation and replies, measurement and its limits, the publishing handover |

The category exists because of ADR 0006
(`docs/decisions/0006-brand-content-and-site-pipeline.md`). `editorial-line`
comes first: `social-content` applies a line, signed or explicitly
provisional, and never edits it.

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

## social-content

The reader of a social content plan is whoever runs the brand's accounts. The
plan is structured for them and every post in it is a draft handed to them.

- **Nothing invented.** No audience, offer, testimonial, reach, engagement,
  follower or market figure, and no network specification that was not read
  at the network's own source on a stated date.
- **The line holds the posts.** Captions never leave it, and a conflict the
  line left open holds every post it touches as provisional.
- **The agent drafts and never publishes, schedules or replies** from a real
  account. Every item is handed over with its exact content and the owner's
  action.

## Boundary with the rest of the suite

| Work | Owner |
|---|---|
| The visual identity and its brief voice | `brand-identity`, engineering tree |
| The site copy itself | `site-template-generation`, `frontend-engineering`, held to the line |
| Keywords for search | `seo-engineering`, held to the line's vocabulary |
| A single document for one known reader | the writing skill for that reader, `documentation/` or `administrative/` |
| Visual posts: palette, type, imagery, a mark on a photograph | `brand-identity`, decided by the design-director agent |
| Tracked links, pixels, consent for measurement | `analytics-instrumentation`, `data-privacy` |
| Layout and render of the line or the plan as a deliverable | `document-design`, `pdf-production` |

## Routing

The community-manager agent, `agents/communication/community-manager.md`,
owns both skills. The chief, `delivery-orchestrator`, dispatches a request for
an editorial line or for social content to it, per the communication team of
its `resources/team-routing.md`, and holds the eight-point gate of
`document-core` on what comes back. The agent drafts and never publishes;
visual work goes to the design-director agent, site copy to the team that
builds the site.

## Configuration

| Field | Used by |
|---|---|
| `language.document_output` | both skills, the default output language |
| `identity.organization` | cover and metadata when the line or the plan is paginated |
| `delegation` | read by both to confirm that publishing is not delegated; no field covers it |
