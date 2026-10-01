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
- [x] **`site-template-generation` skill and its agent** (L). Requested by the
  user after Phase 7. Builds a client site as a template driven by a content
  file: the contract per kind, portfolio for a person and showcase for a
  company; tokens chosen by trade, with a motion intensity scalar rather than a
  second template; a no-code field map verified to be wired; legal pages
  assembled from the company's real facts, with a visible marker for every fact
  not provided and no clause the template drafted itself; a ten point gate.
  `site-template-engineer` scaffolds from a trade and a kind. Two reference
  implementations under the skill's `examples/`, a coach portfolio and an
  electrician showcase, both built and exported for real.
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
- [x] **Advisor agent-level waste** (M). `advisor.py` gained three
  agent-dispatch detections: `agent-fan-out` (the same agent dispatched four or
  more times in a session), `agent-on-light-session` (a dispatch in a session
  that produced under fifteen thousand work tokens), and
  `dispatch-without-recorded-work` (informational, since a missing subagent
  transcript can mean the records are not on this disk). Honest limit, written
  into the code: the telemetry records which agent ran under which model, never
  the task's complexity nor what a direct action would have cost, so the advisor
  cannot prove an agent was unnecessary or a model tier too strong. These report
  measurable patterns and, like every finding here, assert no waste. EN and FR
  interface templates added; eleven new tests, and the detections stay silent on
  the real data because it shows none of these patterns.

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

## Phase 7: the documentation a user actually needs

- [x] **Usage guide** (M). `documentation/usage.md` and `usage.fr.md`. The
  suite described what it contained in eleven documents and never described
  what to do with it. The guide covers the host requirement, the install, how a
  skill is selected (the frontmatter `description`, which nothing else here
  explained), the routing table, what the gates demand, when not to use an
  agent, and what to verify. `docs/README.md` states the boundary between
  `documentation/` (usage) and `docs/` (design reasoning and history).
- [x] **The claims the audit falsified** (M). Roughly 25 files out of 204
  READMEs and 30 documents. Six agents named a shipped, a table titled "The
  seventeen" over sixteen rows for twenty-five agents, a transitive-resolution
  example that was false, post-install counters of 75, 155 and 16 against 84,
  166 and 25, and the security tree written as 10 in six places.
- [x] **The bugs behind the claims** (M). Four in `install.sh`, each reproduced
  before the fix: `--configure` deleting `model_routing`, `career` and any
  managed field its scope did not ask about; `depends_on` resolved for
  `--skill` only, so `--security` shipped `vulnerability-assessment` without
  `security-audit`; the cross domain pair double counted on a trailing slash;
  an empty agents directory for `--research`.
- [x] **Close the drifting zone** (S). `validate-counts.sh` now covers the
  plugin tables, the per-scope table, the `AGENTS.md` tree table, counts
  written in words, and an agent named as unbuilt while its file exists.
  `validate-structure.sh` fails on a skill missing from its category index.
  Each check was mutation-tested.
- [ ] **Deflate `overview.md`** (S). 54 lines are duplicated verbatim from
  `installation.md`, plus the plugin table and the configuration block. Replace
  the installation section with a paragraph and a link. Deferred: it is a
  future-drift problem, not a reader problem, and the guide came first.
- [ ] **Translate `installation.md` and `configuration.md`** (M). Today
  `usage.fr.md` and `overview.fr.md` are the only French documents, and
  `usage.fr.md` says so rather than leaving the reader to discover it.

## Phase 8: resources by domain, studied from real projects

The suite becomes a library of resources, not only of knowledge: code a project
installs and runs, built per domain, each domain led by an agent under the one
chief orchestrator. Every resource is an original implementation drawn from the
patterns of real projects, never a copy, and passes the gates before it ships.
The direction, the target shape and the reference projects are in
`docs/architecture/RESOURCE_LIBRARY.md`. Sequenced by leverage: structure
first, then the UI library, then the agent and operations layers.

### 8.0 Structure and hygiene, do first

- [x] **The resource-library decision record** (S). Done:
  `docs/decisions/0001-resource-library-structure.md`, accepted. An immutable
  `decision-records` entry capturing the target shape, why the skill trees stay
  at root, and the originality-from-reference rule. This file is the proposal;
  the record is its ratification once approved.
- [x] **Changelog versus continuity** (S). Done: `CHANGELOG.md` rebuilt as
  the version history, newest first, with an Unreleased section. `CHANGELOG.md` is a stale second
  copy of `CONTINUITY.md`, same title, diverged session numbering. Make it a
  real changelog, one entry per released version rebuilt from history;
  `CONTINUITY.md` stays the running state. Removes a standing source of
  contradiction.
- [x] **The `libraries/` home** (S). Done: `libraries/README.md` and the CI
  guard. Create `libraries/` with its README and
  the contract a library obeys: own licence, own tests, a documentation page
  per component, a build or validation step wired into CI. No code yet, just
  the shape and the gate.

### 8.1 The UI library

- [x] **Analyse the UI references** (M). Done:
  `docs/architecture/UI_REFERENCES.md`. First-hand read of `shark-ui`,
  `neonblade-ui`, `start-theme-demo`, and React Bits for patterns only, each
  with its licence confirmed and recorded. Output: the pattern and principle
  notes `design-research` produces, not code.
- [x] **`libraries/ui` foundation** (M). Done: tokens, `Dialog`, Radix chosen
  in `docs/decisions/0002-ui-primitive-base.md`, typecheck and tests in CI. Design tokens as CSS variables
  (colour, type scale, spacing, radius, elevation, motion), then the accessible
  primitives, on the shadcn ownership model: code a project owns, not a
  dependency. Governed by `design-system`, built to pass `accessibility-testing`
  and `frontend-engineering`. `dependency-selection` decides Radix or Base UI
  for the hard primitives before any is added.
- [ ] **Consolidate the duplicated site code** (M). The twenty-nine identical
  files across the two `site-template-generation` examples are not liftable as
  they stand: each imports the per-app content model (`lib/types`,
  `lib/schema`, `lib/legal`), so a single source needs those three injected
  rather than imported, plus a build of both Next apps to prove it. Done so
  far: a canonical `examples/shared-files.txt` and a CI guard that fails if any
  shared file drifts between the two examples, so the duplication can no longer
  rot while the single-source refactor waits. Still to do: the injection
  refactor into a shared source (`libraries/ui` or an examples-local package),
  with both apps built to verify.
- [ ] **The motion layer** (M). A small set of signature effects chosen for a
  project's identity, not a catalogue: scroll reveal, staggered entrance,
  magnetic and tilt hover, logo marquee, scroll-stacked cards, one background.
  Each ships a reduced-motion variant, a performance budget, and the lightest
  technique that suffices per the `animation` ladder. `design-director` signs
  off that the set reads as intended, not as generic defaults. Done so far:
  `useReducedMotion`, `Reveal`, `Marquee`, `Counter` and the `Tooltip`
  primitive, each reduced-motion safe and tested in jsdom. Still to do:
  staggered entrance, magnetic and tilt hover, scroll-stacked cards, one
  background, a real-browser and screen-reader pass, and the
  `design-director` sign-off.

### 8.2 Fonts and front-end performance

- [ ] **Analyse `google-webfonts-helper`** (S), licence confirmed, then a font
  self-hosting resource: subsetting, `font-display`, preload, no layout shift.
  Feeds `seo-engineering` and the performance concerns, not a dependency.

### 8.3 The agent and orchestration layer

- [ ] **Analyse Graft and `opencode`** (M), first-hand, for the context-map and
  the subagent-orchestration patterns. `codebase-mapping` already carries the
  Graft idea; this pass finds what the chief and the orchestration skills still
  lack. Done so far: Graft's README and opencode's GitHub README, patterns only,
  feeding the chief's parallel-dispatch resource. Still to do: a first-hand read
  of opencode beyond its README (its site was unreachable from the build
  environment).
- [ ] **Sharpen the chief** (M). Strengthen the skills `delivery-orchestrator`
  and `engineering-orchestrator` load, and `model-routing` and `task-complexity`
  under them, so the one orchestrator over all agents dispatches, gates and
  escalates better. No second chief is added. Done so far:
  `delivery-orchestrator` 1.1.0, with every one of the thirty-three agents in a
  team (`resources/team-routing.md`), conflict-free parallel dispatch, handoff
  evidence and an escalation ladder, and the deadline held without trading a
  gate. Still to do: `engineering-orchestrator`, `model-routing` and
  `task-complexity`.

### 8.4 Security and accessibility, measured

- [ ] **Analyse OpenSec and `curb`** (M), first-hand. OpenSec's probe, validate
  by attack-path, ledger pattern feeds `security-audit` and the authorized
  testing agents. `curb`'s measured-outcome and verify-loop discipline feeds
  `accessibility-testing`.
- [ ] **Accessibility remediation capability** (L, decide first). Whether the
  suite gains a remediation skill and agent that fix a surface and verify the
  fix helped assistive-technology users, not merely silenced a scanner.
  `technology-selection` decides scope before any build.

### 8.5 PHP and templating, if warranted

- [ ] **Decide the PHP question** (M). `dependency-selection` and
  `technology-selection` judge, from `Twig`, `twig-stack-extension`,
  `webmozarts/assert` and `theseer/tokenizer`, whether a PHP or templating
  domain earns its place against what the suite builds. The recommendation is
  recorded before any PHP code lands; a no is a valid, recorded outcome.

### 8.6 Applications as worked references

- [ ] **Analyse `confhub` and `yc_directory`** (M) as full applications, not
  libraries: what they teach the delivery and full-stack skills, captured as
  reference notes, with nothing copied.
- [ ] **The gest-hotel dashboard as a template kind** (M). Done so far:
  `dashboard` is a third kind of `site-template-generation`, with
  `resources/dashboard-contract.md` and its twenty-six point gate, and the
  `dashboard-hotel-operations` specification, drawn from the principles of the
  owner's back office and correcting its gaps. Still to do: build the example
  as a runnable app with a verification script per gate line.

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
7  the usage guide, and the claims and bugs the audit found
```

The count check comes first either way; the demonstration projects come last
because they exercise everything above them. Phase 7 came after them for a bad
reason, which is worth recording: the suite was documented for its author, who
already knew how to use it, so the missing document was invisible until an
audit went looking for what a new reader could not do.

## Known limitations carried forward

Recorded so they are chosen, not stumbled into. Detail in `CONTINUITY.md` and
`docs/architecture/`.

- Model routing recommends a model and an effort but cannot enforce the effort
  on an arbitrary dispatch; only model choice is a real lever. Stated in
  `MODEL_ROUTING.md`.
- The agent layer's review gates and boundaries are a documented discipline,
  not a runtime guarantee; a runtime that grants every subagent full write
  access enforces none of them.
- Counts are enforced by `tests/validate-counts.sh`, which since Phase 7 also
  covers the plugin bundles and the one prose location that kept drifting, the
  number word at the top of a category index. Free prose elsewhere is still by
  hand, and that is the remaining exposure.
