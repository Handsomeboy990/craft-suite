# Roadmap

What is left to build, as a checklist, ordered by leverage rather than by wish.
Tick an item when it lands on `dev`. Each carries its rough size and, where it
matters, what it waits on. This complements `CONTINUITY.md`, which records what
was done and the live constraints; this file records what comes next.

Sizes are relative: S is a sitting, M is a focused session, L is several
sessions or a precondition outside the repository.

## Phase 0: foundation hygiene, do first

- [x] **Count-consistency check** (S). `tests/validate-counts.sh` compares the
  counts written in the key docs against the real directory counts and fails on
  drift, wired into the CI job as a sixth check. On landing it caught live
  drift: `delivery-skills` at 10, the security tree at 10, `security-assurance`
  at 2, the core agents at 6, and the agent total at 16, all stale; every one
  was corrected. It checks the tree diagrams, category tables, installer menus
  and totals; it does not parse free prose or plugin bundle sizes.

## Phase 1: close the original specification

- [x] **`rate-limiting` skill** (M). Per-endpoint limits by sensitivity: login,
  one-time codes, password reset, uploads, search, public forms, keyed by IP,
  user and resource cost. Today scattered across `input-validation` and
  `authentication-security`.
- [x] **`tls-certificates` skill** (M). Certificate lifecycle: installation,
  renewal, HSTS, HTTPS enforcement, expiry monitoring, reverse proxy,
  development versus production certificates.
- [x] **`admin-console` skill** (M). Back-office architecture: role-based
  access, permissions, audit logs, user management, operational controls, with
  no secret exposed to the browser. The original section 22, never built.

## Phase 2: the highest-value new capability

- [x] **`llm-integration` skill** (M). Building features driven by a language
  model: prompt design, evaluations, retrieval-augmented generation, cost and
  latency, guardrails, handling refusals and truncated output. Written against
  the real API constraints.
- [x] **`email-deliverability` skill** (S). SPF, DKIM, DMARC, sending-domain
  configuration, reputation.

## Phase 3: design and animation

The reference-analysis capability and the animation skill, so the frontend
agents can build motion that is intended rather than defaulted, and prove it on
a real reference.

- [x] **`animation` skill** (M). When to use a CSS transition, a CSS
  animation, a scroll-driven animation, or a JS library such as GSAP or Motion,
  and when to use none; the patterns that read as designed (reveal on scroll,
  staggered entrance, parallax, smooth-scroll, hover micro-interaction, page
  transition); performance, the compositor-only properties, and
  `prefers-reduced-motion` as a hard requirement. Informed by the reference
  analysis below, and paired with `design-authenticity` so motion is a choice,
  not the hover-everywhere default.
- [x] **Reference analysis of a real site** (S). Analyse a site such as
  `pear.no` for its animation, rendering and interaction patterns, extract the
  principles rather than the code, and record them as reference material the
  `animation` skill teaches from. Reference, inspiration, pattern and
  implementation are kept distinct; no protected code or asset is copied.
- [x] **`design-research` agent** (M). Searches and inspects legitimate
  references, identifies useful layout, typography, interaction and animation
  patterns, and distinguishes reference from inspiration from pattern from
  implementation. The original section 11, deferred until now.
- [x] **`template-selection` skill** (M). Finds clean, licence-clear templates
  that fit the project, shortlists a few with their trade-offs for the user to
  choose, confirms the chosen template's licence before use, and hands it to
  customisation. It understands the project first, judges each candidate for fit
  and cleanliness with `design-authenticity` rather than the screenshot, never
  picks for the user, never uses a template against its licence, and never ships
  one unchanged. Wired into the FRONTEND and UI_UX plans as a conditional step,
  run by `design-research` and `ui-ux-engineer` before building.
- [x] **Exercise the frontend agents on a motion task** (M). Done on a real
  target: the `lauret-chacha` portfolio. A read-only audit dispatched
  `ui-ux-engineer` on its design and motion, then the `animation` skill drove a
  full motion pass (terminal typewriter, scroll-reveal, a contact terminal,
  section tags), reduced motion honoured throughout via `MotionConfig` and a
  global CSS guard. The redesign shipped to the portfolio's `main`.

## Phase 4: harden verification

- [x] **`source-of-truth` agent** (M). Maintains canonical project knowledge
  and reconciles stale documentation against the code. Original section 5.2.
- [x] **`checkup` agent** (M). Inspects a project before intervention:
  architecture, debt, risks, safe boundaries. Original section 5.3.
- [x] **`final-verifier` agent** (M). The independent, evidence-only final
  verification that trusts no previous agent. Original section 32.
- [ ] **Exercise the full agent layer** (M). Partly done: the portfolio audit
  dispatched `ui-ux-engineer`, `security-engineer` and `performance-engineer` on
  a real target and produced real dispatch telemetry. The newer agents
  (`compliance-verifier`, `design-verification`, `web-auditor`, `pr-author`,
  `pr-reviewer`, `source-of-truth`, `checkup`, `final-verifier`) were not
  installed at dispatch time and still have not run; they are now installed, and
  the delivery demonstration is the natural place to run them end to end.

## Phase 5: distribution and telemetry

- [x] **Per-domain agent packs** (M). Agents used to be bundled only in the
  engineering plugin, so `--security` installed the `website-audit` skill but
  not the `web-auditor` agent. Each domain now carries its own agents: the
  security plugin ships `security-engineer` and `web-auditor`, the engineering
  plugin its 24-agent delivery team (which keeps `security-engineer`, since its
  flow dispatches it). The mapping lives in `install.sh` (`agent_domains`) and
  is checked per domain by `validate-plugins.sh` check 4.
- [x] **Control Center agent panel** (M). The agent-dispatch telemetry was
  collected and reachable through the report and the JSON but had no browser
  panel. Added an Agents tab: the dispatch total, the dispatched-work records,
  and the breakdowns by agent and by model, with EN and FR strings and a
  measured-zero empty state. The report's data-limitation note no longer says
  the telemetry is undisplayed.
- [ ] **Advisor agent-level waste** (M, blocked). Extend `advisor.py` with a
  detection for an agent invoked where a lighter skill would have done, or a
  model tier stronger than the classification justified. Needs the panel or the
  agent layer exercised for real data.

## Phase 6: proof

- [x] **Delivery demonstration project** (L). A worked example of the fourteen
  delivery phases now lives under `engineering/examples/delivery-link-shortener/`,
  run on one small application (a link shortener), sized small, with the four
  approval gates shown as explicit stops and every phase producing its
  deliverable, including the `not applicable` ones with a reason.
- [x] **Documents demonstration set** (M). `documents/examples/jeu-conges/`
  writes one fictional subject (an internal time-off system) for three readers,
  a user guide, a technical manual and a deployment report, each passed through
  the eight-point gate, with an artefact recording the gate reports, the
  reader-split check and a PDF render verification. Produced through a
  multi-agent workflow: one writer per reader following its skill, a gate review
  per document, and a cross-set critique of the reader split.

## Parked and external

Not waiting on work in this repository.

- [ ] **n8n end to end** (parked). The `workflow-automation` skill is
  delivered, but the n8n MCP server must be configured and authorized
  interactively by the user, and no workflow has been built or run against a
  live instance. The user parked this on 2026-09-17.
- [x] **Release to `main`** (done, 3.17.0). Everything from 3.1.0 to 3.17.0 is
  on `main`. The two branches had diverged in topology, and skills had moved
  between categories on `dev`, so a plain merge risked conflicts and resurrected
  files. The promotion went through `release/v3.17.0`, started from `dev` and
  merging `main` with the `ours` strategy: `dev`'s content stayed authoritative
  and `main` became an ancestor, so the merge applied cleanly. Verified before
  and after: `main`'s tree is identical to `dev`'s. `main` was then merged back
  into `dev` to keep the histories joined for the next promotion.
- [ ] **Second code owner** (parked). `enforce_admins` stays off until
  `.github/CODEOWNERS` names a second reviewer, because a lone owner cannot
  approve their own request and turning it on would remove every path to a
  merge.

## Recommended order

```
0  count-consistency check        cheap, pays back on everything after it
1  or 2, by preference             the original brief, or the highest-value gap
3  animation and reference analysis, then exercise the frontend agents
4  the core verification agents, then exercise the full agent layer
5  per-domain agent packs, then the Control Center panel
6  the two demonstration projects
```

The count check comes first either way; the demonstration projects come last
because they exercise everything above them.

## Known limitations carried forward

Recorded so they are chosen, not stumbled into. Detail in `CONTINUITY.md` and
`docs/architecture/`.

- Model routing recommends a model and an effort but cannot enforce the effort
  on an arbitrary dispatch; only model choice is a real lever. Stated in
  `MODEL_ROUTING.md`.
- The agent layer's review gates and boundaries are a documented discipline,
  not a runtime guarantee; a runtime that grants every subagent full write
  access enforces none of them.
- Counts in the structured docs are enforced by `tests/validate-counts.sh`
  since Phase 0 landed. Free prose and plugin bundle sizes are still by hand.
