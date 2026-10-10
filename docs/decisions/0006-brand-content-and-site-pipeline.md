# ADR 0006: brand, editorial and social skills, one community manager agent

Date: 2026-10-10
Status: accepted (by the owner, 2026-10-10)
Supersedes: none

Roadmap phase 9, first item. It runs the `technology-selection` order,
question 1 first (is anything new required at all, or does something existing
already do this). This record builds nothing: each skill and the agent it
accepts land later, one count-changing pull request at a time, each with its
own review.

## Context

The owner's goal, stated 2026-10-04 and recorded in `docs/ROADMAP.md` phase 9:
describe what is wanted as a community manager, a designer and similar roles,
agree a brief (an editorial line, a branding, a portfolio), have it turned into
a visual identity, a moodboard and a prototype on the Claude Design canvas, then
have the agents build the real site from that prototype.

What the suite has today, read in this session:

- The brief: `project-brief`, `requirements-analysis`, `clarification-gate`
  and `delivery-orchestrator`, with its approval gates.
- The design: `design-authenticity` (the intentionality standard),
  `design-system` (tokens and components), `ui-ux-engineering`, and the agents
  `design-director` (design authority and sign-off), `design-research`,
  `ui-ux-engineer` and `design-verification`.
- The build: `site-template-generation` with its three examples, now built in
  CI, `libraries/ui` under MIT, `frontend-engineering`, and the agents
  `site-template-engineer` and `frontend-engineer`.
- The documents tree: `document-core`, with its evidence rule (no invented fact)
  and its eight-point gate, for anything delivered to a reader.

What is missing:

- A procedure for a brand identity. `design-system` takes tokens as given; no
  skill derives them from a positioning, writes the usage rules or assembles a
  sourced moodboard and the charter document.
- A procedure for an editorial line.
- A procedure for social content and community management.
- A role that owns the last two.
- A written path from a Claude Design canvas to code.

Facts the plan rests on, checked 2026-10-04 and recorded in the roadmap:

- An agent can create and fill a Design artifact from a brief.
- A Claude Design prototype is a self-contained HTML bundle an agent can read
  back.
- The `DesignSync` tool keeps a claude.ai/design design-system project and
  `libraries/ui` in step. The owner starts it through `/design-sync`.
- No tool hands a brief to Claude Design and returns its generation unattended.

Forces:

- **Cost of a skill.** Each new skill changes the counts in `AGENTS.md`,
  `README.md` and `tests/validate-counts.sh`. It also touches a tree index, the
  routing tables, a plugin bundle and at least one agent's skill list.
- **Cost of an agent.** It adds rows in `agent-tiers.md`, `team-routing.md` and
  `agent-dispatch.md` (orchestration check 14), the `agents/` index, and the
  domain mapping in `install.sh`.
- **Design authority stays single.** `design-director` signs off the design.
  A second design lead for brands would split the authority
  `design-authenticity` depends on.
- **Publishing is outward-facing.** A post on a social network is public and
  hard to withdraw. It is a delegation question, never a default.

## Options

1. **A new top-level tree for brand and marketing**, with its own constitution.
   - Cost: a ninth tree, a constitution, a plugin bundle, a count row, routing,
     all for three skills.
   - Rejected: the work fits two existing constitutions.
2. **Everything as resources inside existing skills, nothing new.**
   - Cost: none in counts.
   - Rejected: the routing tables find procedures by skill. A brand method
     buried in `design-system`, or an editorial method in `technical-writing`,
     is never loaded for "write me an editorial line". The roadmap's gap would
     stay an unrouted improvisation.
3. **Three skills, one agent, split across the two existing constitutions.**
   - Cost: three skill count changes, one agent count change, routing rows.
4. **Three skills and two agents**, a brand designer beside the community
   manager.
   - Rejected for the second agent: it duplicates `design-director`, which
     already owns identity and sign-off.

## Decision

Option 3. Deciding criterion: each new piece goes where its constitution
already holds the standard it must meet, and authority stays where it already
is.

- **`brand-identity`** in `engineering/dev-skills/`, beside `design-system` and
  `design-authenticity`.
  - Covers positioning and personality, the logo brief and usage rules, and a
    palette with measured contrast pairs in both themes.
  - Covers the type scale, the imagery and iconography direction, and the
    tone of voice.
  - The moodboard cites every reference with its source and licence.
  - Produces the charter document.
  - Governed by `design-authenticity`. Its tokens hand off to `design-system`.
  - Owned by `design-director`; no new design agent.
- **`editorial-line`** in `documents/`, under a new category `communication/`,
  governed by `document-core`.
  - Covers the audience, the promise, the pillars, tone and vocabulary, what is
    never said, the formats and the review rule.
  - It feeds site copy and `social-content`.
- **`social-content`** in `documents/communication/`, governed by
  `document-core`.
  - A calendar per channel, formats and sizes per network, and captions held
    to the editorial line.
  - A moderation and reply policy.
  - Measurement that states what it can and cannot attribute. No reach,
    engagement or market figure is invented; `document-core`'s evidence rule
    applies.
  - Visual posts are drafted on the Design canvas.
- **`community-manager` agent** in a new `agents/communication/` folder.
  - Owns `editorial-line` and `social-content`.
  - Hands visual work to `design-director`, and site work to
    `site-template-engineer` through `delivery-orchestrator`.
  - Drafts posts but never publishes them. Publishing to a network, a
    scheduler or an account follows the `delegation` section of the
    configuration and is handed over by default.
- **The design-to-code handoff** is a resource of `design-system`, referenced
  from `site-template-generation`. It is not count-changing. The steps:
  1. The brief is validated.
  2. The Design canvas is created and filled by the agent, or the owner's
     claude.ai/design link is read back.
  3. The owner signs off.
  4. The tokens are synced to `libraries/ui` through `/design-sync`.
  5. The site is built from the prototype.
  6. `design-verification` compares the build to the canvas.
  7. `production-verification` passes before anything is called delivered.

The later changes must hold to these rules, so that a yes does not weaken a
gate:

- **No required vendor tool.** The skills name the canvas, `/design-sync` and
  any import tool as options. Each skill states the path when that tool is
  absent.
- **Sources and licences.** Every moodboard image and every reference is
  sourced and licence-noted. Nothing is copied from a reference brand.
- **Measured contrast.** Contrast pairs are measured, never asserted, in both
  themes.
- **Build order**, each landing separately with the six scripts and
  `bash plugins/build.sh`:
  1. `brand-identity`
  2. `editorial-line`
  3. `social-content`
  4. `community-manager`
  5. the handoff resource
  6. a worked run of one real brief, end to end, every gate observed

Counts once all four count-changing pull requests have landed: 173 skills, 34
agents.

Reopening triggers:

- Brand work becomes a service with its own lead. That reopens the second
  agent.
- Social publishing is fully delegated by the owner. That reopens the publish
  boundary.

Either trigger reopens the question through a record that supersedes this one.

## Consequences

Positive:

- The brief-to-brand-to-site path gets routed, gated procedures.
- Design authority stays single.
- Outward publishing stays a handover.

Negative:

- Three skills and one agent to maintain.
- A new documents category and a new agents folder, each with its index and
  mapping.

Operational: each piece is its own count-changing change. Only one is in
flight at a time, so counts and routing never conflict.

## Reversal cost

Low until the first skill lands. Afterwards, each piece can be removed alone:
one count change and its routing rows. Removing `community-manager` returns its
two skills to `delivery-orchestrator`'s routing without an owner.
