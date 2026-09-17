# Roadmap

What is left to build, as a checklist, ordered by leverage rather than by wish.
Tick an item when it lands on `dev`. Each carries its rough size and, where it
matters, what it waits on. This complements `CONTINUITY.md`, which records what
was done and the live constraints; this file records what comes next.

Sizes are relative: S is a sitting, M is a focused session, L is several
sessions or a precondition outside the repository.

## Phase 0: foundation hygiene, do first

- [ ] **Count-consistency check** (S). A `tests/validate-counts.sh` that
  compares the counts written in the key docs against the real directory
  counts and fails on drift. This session chased count drift by hand and found
  `delivery-system` had undercounted devops at eleven for a long time. A check
  removes that whole class of error and pays back on every item after it.

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

- [ ] **`llm-integration` skill** (M). Building features driven by a language
  model: prompt design, evaluations, retrieval-augmented generation, cost and
  latency, guardrails, handling refusals and truncated output. Written against
  the real API constraints.
- [ ] **`email-deliverability` skill** (S). SPF, DKIM, DMARC, sending-domain
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
- [ ] **`design-research` agent** (M). Searches and inspects legitimate
  references, identifies useful layout, typography, interaction and animation
  patterns, and distinguishes reference from inspiration from pattern from
  implementation. The original section 11, deferred until now.
- [ ] **Exercise the frontend agents on a motion task** (M). Run
  `ui-ux-engineer` and `frontend-engineer` with the new `animation` skill on a
  small real interface, and `design-verification` to check the result reads as
  intended and honours reduced motion. Tests the frontend agents on real work.

## Phase 4: harden verification

- [ ] **`source-of-truth` agent** (M). Maintains canonical project knowledge
  and reconciles stale documentation against the code. Original section 5.2.
- [ ] **`checkup` agent** (M). Inspects a project before intervention:
  architecture, debt, risks, safe boundaries. Original section 5.3.
- [ ] **`final-verifier` agent** (M). The independent, evidence-only final
  verification that trusts no previous agent. Original section 32.
- [ ] **Exercise the full agent layer** (M). The new agents
  (`compliance-verifier`, `design-verification`, `web-auditor`, `pr-author`,
  `pr-reviewer`) have not run on a real task. Run them, capture the telemetry,
  confirm the routing and the handoffs hold.

## Phase 5: distribution and telemetry

- [ ] **Per-domain agent packs** (M). Today every agent is bundled in the
  engineering plugin, so `--security` installs the `website-audit` skill but
  not the `web-auditor` agent. Split the agents so each domain's pack carries
  its own, which the suite's own domain-independence rule asks for.
- [ ] **Control Center agent panel** (M). The agent-dispatch telemetry is
  collected and reachable through the report and the JSON, but the browser
  dashboard has no panel for it. Add the panel and its EN and FR strings.
- [ ] **Advisor agent-level waste** (M, blocked). Extend `advisor.py` with a
  detection for an agent invoked where a lighter skill would have done, or a
  model tier stronger than the classification justified. Needs the panel or the
  agent layer exercised for real data.

## Phase 6: proof

- [ ] **Delivery demonstration project** (L). No worked example exists for the
  fourteen delivery phases, unlike the writing tree's saga. Run the phases on a
  small real application and keep the artefacts.
- [ ] **Documents demonstration set** (M). No worked example for the documents
  tree either. Produce a three-document set for one subject, exercising the
  reader split and the PDF render verification.

## Parked and external

Not waiting on work in this repository.

- [ ] **n8n end to end** (parked). The `workflow-automation` skill is
  delivered, but the n8n MCP server must be configured and authorized
  interactively by the user, and no workflow has been built or run against a
  live instance. The user parked this on 2026-09-17.
- [ ] **Release to `main`** (parked). `dev` carries everything from 3.1.0
  onward. Promoting to `main` is a release decision for the user; the merge
  back into `dev` must be a merge commit, not a squash, per
  `release-branch-and-push-constraints`.
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
- Counts in prose are maintained by hand until Phase 0 lands.
