# social-content

The community manager's method for a brand's social channels: a calendar per
channel at a cadence the client can sustain, formats and sizes per network
checked at the network's own source on a stated date, captions held to the
editorial line, visual posts under the signed identity, a moderation and
reply policy with its escalation matrix, a measurement plan that says what it
cannot attribute, and a handover record for every post.

- Inputs: an editorial line from `editorial-line`, signed or explicitly
  provisional; the charter of `brand-identity` and its state; the channels,
  the client's capacity and who may reply in the brand's name. When the line
  is missing, the skill routes to `editorial-line`; when channels, capacity or
  reply authority are missing, it asks once before it draws a calendar.
- Outputs: intake record, channel plan, calendar, format sheet, post briefs,
  caption drafts, visual drafts, moderation policy and escalation matrix,
  measurement plan, handover records, and the quality gate record.
- Depends on: `document-core`, `editorial-line`.
- Governed by: `document-core`, its evidence rule and its eight-point gate.
- Visual questions: the design-director agent.

## When to use

A brand will post on one or more social networks and someone other than the
client will plan or draft the posts: a content calendar, a set of posts or
captions, a moderation or reply policy, a plan for what to measure.

## When not to use

No editorial line yet: `editorial-line` first. The visual identity:
`brand-identity`. Paid campaigns, budgets and targeting are not planned here
beyond a handover. A single formal reply to a complaint by letter:
`administrative-writing`.

## What it enforces

Nothing invented: no audience, offer, testimonial, reach, engagement,
follower or market figure, and no network specification that was not read at
the network's own source on a stated date. The cadence comes from the
client's stated capacity. Captions never leave the line, and a conflict the
line left open holds the posts it touches. Legitimate criticism is never
deleted, a reply never argues or discloses personal data, and complaints,
legal, safety and press are escalated. Vanity metrics are named as such. The
agent drafts and never publishes, schedules or replies from a real account:
every item is handed over with its exact content and the owner's action.

## Configuration

| Field | Effect |
|---|---|
| `language.document_output` | default output language of the plan and the posts, overridden by the recipient's |
| `identity.organization` | cover and metadata when the plan is paginated |
| `delegation` | read to confirm that publishing is not delegated; no field covers it, so it is handed over |
