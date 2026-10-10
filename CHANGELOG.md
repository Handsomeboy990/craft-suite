# Changelog

What changed in the suite, one entry per released version, newest first.

This file is the version history. `CONTINUITY.md` is the running state of the
repository for whoever takes it over, and holds the detail behind each entry
here; where this changelog is terse, that file is the source. The two had
drifted into near-duplicates with diverging session numbering, so this file was
rebuilt from `CONTINUITY.md`'s own record and now keeps only the per-version
summary.

The suite has no git version tags, so these versions are the manifest versions
(`marketplace.json` and the seven `plugin.json`), bumped in lockstep on an
additive change. Per-version dates were not recorded and are not invented here.
Work before 3.0.0 predates versioning, when the project was
`claude-writer-suite`; it is summarised at the end rather than split into
versions it never had.

## Unreleased

No manifest change: no skill or agent was added. Everything since 3.35.0.

- The design-to-code handoff (#100):
  `design-system/resources/design-to-code-handoff.md`, the path ADR 0006
  decided from a validated brief to a delivered site, in eight gated steps
  each with its owner, artefact and blocking condition. The canvas has three
  modes: filled by the agent, the owner's claude.ai/design link read back, or
  no canvas at all, with the tokens, charter and static mock-ups in the
  repository. The resource states that no tool hands a brief to the canvas and
  returns its generation unattended. `/design-sync` is started only by the
  owner; the build reads the prototype as reference, never pasting its markup;
  `design-verification` keeps a drift record; `production-verification`
  comes before anything is called delivered. `design-system` 1.2.0,
  `site-template-generation` 2.2.0 and `frontend-engineering` 1.2.0 name it,
  and the last two also name `editorial-line`.

## 3.35.0 community manager

The manifests moved to 3.35.0 with the `community-manager` agent, the fourth
count-changing step of ADR 0006; the entry below is everything since 3.34.0.

- `community-manager` (agents/communication), agent 34 (#98): owner of
  `editorial-line` and `social-content`, in a ninth team of
  `team-routing.md` that replaces the chief's interim hold on both skills. It
  drafts the line and the content plan and hands everything over: it never
  publishes, schedules or replies from a real account, never invents a figure,
  a testimonial, an audience number or a client fact, and never approves its
  own draft. Visual questions and any conflict with a signed identity go to
  `design-director`, decided with the owner; site copy goes to
  `site-template-engineer` through `delivery-orchestrator`; values that must
  be read at a live source go to `researcher`. Tools: read and write only. It
  ships in the documents bundle, so `--documents` now installs 11 skills and
  1 agent. `delivery-orchestrator` 1.4.0, `model-routing` 1.4.0,
  `editorial-line` 1.2.0, `social-content` 1.1.0. `validate-counts.sh` now
  checks the documents and research bundle agent counts, and agent counts that
  had drifted in the overviews, usage, installation and plugins prose were
  corrected. 173 skills, 34 agents.

## 3.34.0 social content

The manifests moved to 3.34.0 with `social-content`, the third skill ADR 0006
decided; the entry below is everything since 3.33.0.

- `social-content` (documents/communication), skill 173 (#96): the community
  manager's method. A calendar per channel at a cadence derived from the
  client's stated capacity; network formats and sizes read at the network's
  own page on a stated date, or left as fields to check at publication;
  captions held to the editorial line and visual posts under the signed
  identity; a moderation and reply policy with an escalation matrix and a list
  of what is never done; a measurement plan stating what each number can and
  cannot attribute, with no invented reach, engagement or audience figure; and
  a handover record per post. It drafts and never publishes, schedules or
  replies from a real account: the configuration's `delegation` section has no
  publishing field, so every post is handed to the owner. Its example
  continues the fictional Tidewell co-op and holds its posts as provisional
  while the voice conflict stays open. `editorial-line` 1.1.0 names it;
  `design-director` decides the visual questions a post raises. 173 skills,
  documents 9.

## 3.33.0 editorial line

The manifests moved to 3.33.0 with `editorial-line`, the second skill ADR 0006
decided, in a new `documents/communication/` category; the entry below is
everything since 3.32.0.

- `editorial-line` (documents/communication), skill 172 (#94): the audience,
  the promise in one sentence, three to five pillars each with what it never
  covers, tone and vocabulary per output language with words kept and
  refused, what is never said, the formats, and the review rule (nobody
  approves their own draft; the agent never publishes). Governed by
  `document-core`: no invented client fact, statistic, testimonial or
  audience figure. It extends a signed `brand-identity` and never contradicts
  one; a conflict goes to `design-director` and the owner. Its example
  continues the fictional Tidewell co-op and escalates a voice conflict rather
  than settling it. The new category is registered in `install.sh`,
  `tests/validate-structure.sh` and `tests/validate-orchestration.sh`, and
  `tests/validate-counts.sh` checks its rows. Routed by `delivery-orchestrator`
  until the `community-manager` agent exists; `brand-identity` 1.1.0 names it.
  172 skills, documents 8, nineteen skill groups.

## 3.32.0 phase 9 opened, brand identity

Roadmap phase 9 opened. The manifests moved to 3.32.0 with `brand-identity`,
the first skill ADR 0006 decided; the entries below are everything since
3.31.0.

- ADR 0006, accepted by the owner (#91): `brand-identity` beside
  `design-system`, `editorial-line` and `social-content` in a new
  `documents/communication/` category, one `community-manager` agent that
  drafts and never publishes, `design-director` keeping design authority, and
  the canvas-to-code handoff as a resource of `design-system`. One
  count-changing pull request at a time.
- `brand-identity` (engineering/dev-skills), skill 171 (#92): a visual
  identity from a validated brief, with a palette measured in both themes
  against WCAG 2.2, a sourced and licence-noted moodboard, the charter, and
  sign-off by `design-director` before any token reaches `design-system`. No
  vendor tool is required. Its example, a fictional repair co-op, computes
  every ratio with a script: one pair fails in round 1 and all 20 pass in
  round 2; the sign-off is refused on purpose, glyph coverage being asserted
  rather than checked. Wired into the DESIGN_SYSTEM and SITE_TEMPLATE plans;
  `design-system` and `design-authenticity` 1.1.0. 171 skills, engineering 87,
  dev-skills 60.
- Roadmap phase 9, from brief to brand, content and site (#87): the pipeline
  from an agreed brief to a brand identity, an editorial line, social content
  and a built site, planned on the tool facts verified on 2026-10-04 and gated
  on ADR 0006. `CONTINUITY.md` gained a procedure for resuming the work from a
  local clone.
- `libraries/ui` in a real browser (#88): 45 Playwright tests beside the 73
  jsdom unit tests, `npm run test:browser`, covering focus, dialogs, tooltips,
  reduced motion and the scroll primitives in Chromium, with the observed
  pass recorded in `BROWSER_PASS.md`. A screen reader, Firefox, WebKit and
  the `design-director` sign-off remain for a person.
- Site-template examples (#89): the code the two site examples share lives
  once, in `examples/_shared` (64 files), installed as the local package
  `site-template-shared`; each example keeps its own values in
  `lib/instance.ts`. The three examples moved from `middleware.ts` to Next 16
  `proxy.ts`, and the validate job's guard checks the single source.
- CI (#90, `.github/workflows/examples.yml`): the three examples are installed,
  typechecked and built on every pull request that touches them; the
  `libraries/ui` browser tests and the dashboard gate D1 to D26 run in
  Playwright's Chromium as their own jobs, non-blocking until proved stable,
  with traces and the gate report uploaded. Observed before the change: three
  builds clean, 45 of 45 browser tests and 26 of 26 gate lines passed.

## 3.31.0 remediation, measured

Phase 8 of `docs/ROADMAP.md` continued. The manifests moved to 3.31.0 with
`accessibility-remediation`, the second skill of the phase and the build ADR
0005 decided; the entries below are everything since 3.30.0: the reference
lessons carried into the chief's, backend and security skills, the verify loop
in `accessibility-testing`, and the remediation skill that hands every fix
back to it.

- `accessibility-remediation` (engineering/dev-skills), skill 170, ADR 0005
  accepted by the owner and built: triage of an audit's findings, decision
  rules per barrier family from WCAG 2.2 and the criteria map, native elements
  before ARIA with the custom select as the reason, an explicit escalation
  list where escalation is a valid outcome, and a record in which no finding
  is called fixed; only the verify loop of `accessibility-testing` closes one.
  A measured example: one booking form, nine findings, checks proven before
  any fix; from the scanner report, scanner-clean 100 percent and fixed 22
  percent; by the rules, fixed 78 percent with two escalations, then 100
  percent once answered. Given to `frontend-engineer`, never to a verifier;
  wired into the ACCESSIBILITY and FRONTEND plans and `agent-dispatch.md`.
  `accessibility-testing` 1.2.0 and `frontend-engineering` 1.1.0 name it.
  Manifests 3.31.0.
- `libraries/ui` released under MIT (ADR 0004); ADR 0003 accepted.
- The opencode lessons in the chief's skills: `delivery-orchestrator` 1.2.0
  (permits as data, sub-dispatch inheriting denies and never allows, one level
  of nesting, a rejection cancelling the other pending requests),
  `validation-gate` 1.1.0 (plan mode until the user's explicit yes),
  `engineering-orchestrator` 1.3.0 (loop rule 6), `project-continuity` 1.1.0
  (next move and a merge rule), `token-optimization` 1.1.0 (large output by
  path), `model-routing` 1.3.0 (`text-only-transform`), `codebase-mapping`
  1.1.0 (convention files per node).
- The confhub and yc_directory lessons, each skill at 1.1.0:
  `backend-engineering`, `api-design`, `llm-integration`,
  `fullstack-engineering`, `database-operations`, `deployment-engineering`,
  `environment-management` (the server boundary declared with every handler,
  visibility and ownership decided on the server, atomic counters, no schema
  push to a shared database, build gates kept on, model output parsed against
  the input schema).
- Security and accessibility, measured: `docs/architecture/SECURITY_REFERENCES.md`
  (OpenSec and curb read first-hand), `security-audit` 1.1.0 (probe, validate
  and assess; a findings ledger), `authorized-pentesting` 1.1.0 (the attack path
  traced before exploitation), `accessibility-testing` 1.1.0 (the verify loop
  and outcome classes); ADR 0005 proposed.
- The architecture notes brought in line: six override conditions and fourteen
  fixtures in `MODEL_ROUTING.md`, the dispatch bounds in `ORCHESTRATION.md`.
- The last reference follow-ups (82): `task-complexity` 1.2.0 (text-only steps
  sized on their own), `project-exploration` 1.1.0 (root and per-directory
  instruction files read), `delivery-orchestrator` 1.3.0 (no test command or
  pipeline keeps the release at no go), `architecture-design` 1.1.0 (the
  dependency direction written down and checked), `rate-limiting` 1.1.0 (atomic
  check-and-increment), `fullstack-engineering` 1.2.0 (a worked server boundary
  example).
- `libraries/ui` (83): `Reveal` and `Stagger` visible without JavaScript through
  a shared `useEntrance` hook, and a pause control on `GradientBackdrop`
  (WCAG 2.2.2), on by default. 72 tests, jsdom only.
- Check 14 of `validate-orchestration.sh` (84): `agent-tiers.md`,
  `team-routing.md` and `agent-dispatch.md` must each list every agent; it found
  five agents missing from `agent-dispatch.md`, now added.

## 3.30.0 the library of resources begins

Phase 8 of `docs/ROADMAP.md`, the turn from a library of knowledge into a
library of resources. The manifests moved to 3.30.0 with `font-loading`, the
first skill added in this phase; the entries below are everything since 3.29.0.

- The resource-library direction and the phase 8 roadmap:
  `docs/architecture/RESOURCE_LIBRARY.md` and the phase 8 plan.
- The `libraries/` home for shippable code, its contract, and an empty-safe CI
  guard; the first architecture decision record,
  `docs/decisions/0001-resource-library-structure.md`.
- This changelog, rebuilt and separated from `CONTINUITY.md`.
- The UI reference analysis (`docs/architecture/UI_REFERENCES.md`) and the
  headless-base decision (`docs/decisions/0002-ui-primitive-base.md`, Radix).
- The `libraries/ui` foundation: design tokens as CSS variables, and the first
  accessible primitive (`Dialog`) wrapping Radix behind the suite's own API,
  with its own toolchain, tests and a tightened CI gate.
- The start of the motion layer: `useReducedMotion` and a `Reveal` component,
  CSS-driven and reduced-motion safe, the original of the Reveal the two site
  examples each copy.
- A drift guard on the site-template examples: `examples/shared-files.txt` names
  the twenty-nine files the two examples share, and a CI step fails if any
  drifts between them. The full single-source refactor is deferred because the
  shared files import the per-app content model.
- The motion layer continued in `libraries/ui`: `Tooltip`, `Marquee` and
  `Counter`, accessible and reduced-motion safe.
- A third kind for `site-template-generation`: `dashboard`, an operations
  application for an organisation's staff, with its contract, a twenty-six point
  gate and a hotel operations specification, drawn from the principles of the
  owner's back office.
- The chief sharpened: `delivery-orchestrator` 1.1.0 leads all thirty-three
  agents as teams under named leads, dispatches in parallel without merge
  conflicts, accepts handoffs on evidence, escalates by a fixed ladder, and
  never trades a gate for a date.
- The documentation brought in line: the agent count in the delivery system,
  the orchestrator agent's delegation pointing at the team map, and the
  dashboard kind in the site-template agent and the skills index.
- The motion layer completed in `libraries/ui`: `Stagger`, `Magnetic`, `Tilt`,
  `StackedCards`, `GradientBackdrop` and the shared `useInViewOnce` hook;
  `Reveal` now uses that hook, with no behaviour change. 60 tests, jsdom only.
- `font-loading` (engineering/dev-skills), skill 169: self-hosted web fonts with
  woff2 subsets by `unicode-range`, `font-display` per role, one critical
  preload, a metric-matched fallback, variable fonts on byte counts, immutable
  caching, font licence and privacy, and before and after CLS, LCP and bytes.
  Wired into the FRONTEND and UI_UX plans. Manifests 3.30.0.
- The orchestration skills under the chief aligned with its team map:
  `engineering-orchestrator` 1.2.0 (agent dispatch per category and plan step,
  a conflict check before any pull request), `task-complexity` 1.1.0 (size once,
  feed team composition and waves, re-size on scope change), `model-routing`
  1.2.0 (a tier rule for every agent, a verifier floor, one explicit model per
  parallel worker).
- `dashboard-hotel-operations` built as a runnable Next.js application, with
  `npm run gate` checking D1 to D26 by id; 26 of 26 passed on the recorded run,
  in Chromium only, with no screen reader.
- ADR 0003 (proposed): no PHP or templating domain and no PHP code; the four PHP
  references read first-hand, licences confirmed, patterns recorded.
- Reference notes: `docs/architecture/AGENT_REFERENCES.md` (opencode, read from
  source) and `docs/architecture/APP_REFERENCES.md` (confhub, yc_directory,
  neither licensed for reuse).

## 3.29.0 the codebase map

The `codebase-mapping` skill and the `codebase-cartographer` agent: a durable,
commit-stamped structural map of a codebase that agents consult instead of
re-reading the repository, never trusted while stale.

## 3.28.0 the multi-role expansion

Five agents, 27 to 32: `penetration-tester`, `ci-cd-engineer`,
`design-director`, `delivery-manager`, `data-collection-engineer`, each
composing skills that already existed.

## 3.27.0 the research agent and an authorized reproduction exception

The `researcher` agent, the output-quality escalation trigger in model
routing, and the narrowly gated reproduction exception in `design-research`.

## 3.26.0 the conventions the skill never wrote down

The site-template conventions made explicit.

## 3.25.0 the autonomy of a client who knows nothing

The back office driven by a non-technical owner.

## 3.24.0 the security and operations audit

## 3.23.0 the gate run against the two templates

The site-template gate exercised on both reference builds.

## 3.22.0 the animation that never ran

## 3.21.0 the back office behind the site template

The `admin-console` work behind `site-template-generation`.

## 3.20.0 the site-template-generation skill

The skill and its `site-template-engineer` agent, with two reference builds.

## 3.19.0 the documentation audit and what it uncovered

The audit that falsified several shipped claims and the counts behind them.

## 3.18.0 the advisor agent-level detections

Roadmap phase 5 last item: the Control Center advisor's agent-dispatch
detections.

## 3.17.0 the documents demonstration

Roadmap phase 6: the three-reader documents demonstration set. Also the release
that brought `main` up to date with `dev`.

## 3.16.0 the portfolio redesign

Roadmap phase 6: the portfolio redesign, exercising the frontend agents on a
real motion task.

## 3.15.0 the count-consistency check

Roadmap phase 0: `tests/validate-counts.sh`, which caught live count drift on
landing.

## 3.14.0 the Control Center agent panel

Roadmap phase 5 second item: the Agents tab over the dispatch telemetry.

## 3.13.0 per-domain agent packs

Roadmap phase 5 first item: each domain's plugin carries its own agents.

## 3.12.0 the verification layer

Roadmap phase 4: the `source-of-truth`, `checkup` and `final-verifier` agents.

## 3.11.0 the template-selection skill

## 3.10.0 the design-research role

Roadmap phase 3: the `design-research` agent.

## 3.9.0 roadmap phase 2

The `llm-integration` and `email-deliverability` skills.

## 3.8.0 roadmap phase 1

The `rate-limiting`, `tls-certificates` and `admin-console` skills.

## 3.7.0 the roadmap and the animation skill

## 3.6.0 the pull request roles

The `pr-author` and `pr-reviewer` agents.

## 3.5.0 workflow automation

The `workflow-automation` skill, last of the original cluster B.

## 3.4.0 the website auditor

The `web-auditor` agent (cluster D).

## 3.3.0 design authenticity

The `design-authenticity` skill and `design-verification` agent (cluster C).

## 3.0.0 the rename and the front page

`claude-writer-suite` becomes Craft Suite, when the writing tree stopped being
the whole of it. Versions 3.1.0 and 3.2.0 shipped between here and 3.3.0 and
were not recorded as distinct entries.

## Before 3.0.0

The origin, before versioning, as `claude-writer-suite`:

- Session 1: the engineering system, twenty `dev-skills` and the orchestration
  validation.
- Session 2: delivery and operations, the `delivery-skills` and
  `devops-skills` and the first agents with the handoff protocol.
- Session 3: the reorganisation into trees.
- Sessions 4 to 6: the shared, documents, security, research, career and
  opportunity trees, the plugins and the Control Center.

Detail for all of the above is in `CONTINUITY.md`.
