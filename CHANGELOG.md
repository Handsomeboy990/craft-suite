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

Phase 8 of `docs/ROADMAP.md`, the turn from a library of knowledge into a
library of resources. Not yet version-bumped.

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
