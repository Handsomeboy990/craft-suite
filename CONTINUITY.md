# Continuity, 2026-09-17

State of the repository for whoever takes it over, human or agent. Written to
`engineering/dev-skills/project-continuity/resources/continuity-template.md`.

## Completed

Session 1, engineering system: 20 `dev-skills`,
`tests/validate-orchestration.sh`, `documentation/engineering-system.md`.

Session 2, delivery and operations: 10 `delivery-skills`, 11 `devops-skills`,
14 agents plus the handoff protocol, `delivery-phases.md`,
`documentation/delivery-system.md`. Validation from nine checks to twelve.

Session 3, reorganisation: two trees, `writing/` and `engineering/`. 392 files
moved as pure renames. Six indexes created.

Session 4, this one:

- `shared/`: `self-critique` and `project-brief`, depending on nothing.
- `documents/`: 7 skills in three categories, governed by `document-core`.
- `config/`: the configuration contract, template and field reference.
- `install.sh`: rewritten. `--documents`, `--shared`, `--configure`,
  `--help`, recommendation-first numbered prompts, validation, and generation
  of `craft-manual-tasks.md`.
- `delegation` section: eight fields deciding what the agent does and what it
  hands over. `git-workflow` section 2 carries the contract.
- All 42 writing skills rewritten in English, `SKILL.md` and `README.md`.
- `README.md` rewritten in English, `README.fr.md` created as the complete
  French equivalent.
- Four new documentation files: `installation.md`, `configuration.md`,
  `agents.md`, `documents-system.md`.
- Tree and category indexes, `architecture.md`, `skills-guide.md`,
  `documentation/README.md`, `tests/README.md`, `CONTRIBUTING.md`,
  `CLAUDE.md`: rewritten in English.
- Three validation scripts rewritten and extended: 13 orchestration checks, 6
  rule checks, duplicate name detection.
- Repository governance: `dev` as the integration branch, `main` as the
  release branch, `.github/CODEOWNERS`, a pull request template, a `validate`
  workflow, and a `pre-push` hook. Setup and its limits in
  `documentation/branch-protection.md`.
- Branch protection applied to `main` and `dev` through the GitHub API: pull
  request required, one approving review, code owner review required, stale
  approvals dismissed, `structure, rules, orchestration` as a required check,
  branch up to date, conversations resolved, linear history, no force pushes,
  no deletions. Read back and verified by attempting a direct push to each.
- `LICENSE` names the copyright holder, and both READMEs carry an Author
  section.
- Selective installation at three levels: tree, category and named skill.
  The installer asks rather than installing everything, supports `--group`,
  `--skill` with transitive dependency resolution, `--list`, `--all`, freely
  combined and deduplicated scopes, and bootstraps itself from a clone when
  run through a pipe.

Session 5, quality and lifecycle coverage:

- Quality subsystem in `dev-skills`, 9 skills: `quality-engineering`,
  `exploratory-testing`, `bug-hunting`, `api-testing`, `regression-testing`,
  `accessibility-testing`, `security-testing`, `reliability-testing`,
  `test-reporting`.
- Domain surfaces, 13 skills: `api-design`, `database-design`,
  `caching-strategy`, `background-jobs`, `realtime-systems`, `file-handling`,
  `payment-engineering`, `internationalization`, `seo-engineering`,
  `design-system`, `data-privacy`, `analytics-instrumentation`,
  `feature-flags`.
- Change and continuity, 5 skills: `refactoring`, `legacy-code`,
  `migration-engineering`, `technical-debt`, `decision-records`.
- Operations, 2 skills: `infrastructure-as-code`, `incident-response`.
- Two agents: `principal-engineer`, `incident-responder`.
- `testing-quality` and `playwright-automation` extended, the second with an
  interactive browser CLI protocol whose commands are verified against the
  installed tool rather than reproduced from memory.
- Eighteen new task categories with their plans, routing rows and gate
  triggers.
- `CLAUDE.md` untracked, `AGENTS.md` created as the vendor neutral entry
  point, and check 7 added to `validate-rules.sh` to keep it that way.
- Counts updated everywhere: 121 skills, 16 agents, 38 categories.

Session 6, domain expansion, plugins and the Control Center:

- Four new trees, 31 skills, each with a constitution that depends on nothing:
  - `security/` 10: `security-core`, `threat-modeling`,
    `security-architecture`, `authentication-security`, `authorization-design`,
    `session-security`, `dependency-security`, `security-headers`,
    `vulnerability-assessment`, `authorized-pentesting`.
  - `research/` 5: `research-core`, `source-research`, `source-verification`,
    `competitive-analysis`, `synthesis-reporting`.
  - `career/` 7: `career-core`, `career-profile`, `job-search`,
    `cv-engineering`, `cover-letter`, `interview-preparation`,
    `company-research`.
  - `opportunity/` 9: `opportunity-core`, `ideation-engine`, `idea-evaluation`,
    `hackathon-discovery`, `hackathon-strategy`, `pitch-and-demo`,
    `client-discovery`, `lead-research`, `market-research`.
- `control-center/`: a zero-dependency local dashboard, `server.py` (stdlib
  HTTP, loopback only, free-port detection), `reader.py` (reads the transcripts,
  installed skills and configuration, invents nothing), `app.html` (one
  self-contained page, inline CSS and hand-authored SVG). `install.sh
  --control-center` and `--report`.
- Per-domain plugins: `.claude-plugin/marketplace.json`, seven `plugin.json`
  manifests, and `plugins/build.sh` that generates each bundle from the trees by
  running the installer into the plugin's `skills/`. `tests/validate-plugins.sh`
  keeps them in sync.
- Installer extended with `--security --research --career --opportunity`,
  `--control-center`, `--report`, and a ten-option menu, all combining and
  deduplicating as before.
- `career` configuration section added to the template and `config/README.md`.
- Counts updated everywhere: 152 skills, 16 agents, eight trees, four
  validators. Product repositioned as the Craft Suite; the repository
  kept the name `claude-writer-suite` at that point.

Session 7, the rename and the front page, version 3.0.0:

- The suite is Craft Suite and the repository is `craft-suite`. GitHub
  redirects the old URL. The seven plugins go from `writer-suite-<domain>` to
  `craft-<domain>`, the configuration from `~/.claude/writer-suite.config.yaml`
  to `~/.claude/craft.config.yaml`, and the manual task list to
  `craft-manual-tasks.md`. Every manifest is at 3.0.0.
- `install.sh` migrates an existing configuration and manual task list on its
  next run, once, only when the new name is absent and only when the config
  path has not been overridden. Skipped for `--help`.
- The root READMEs become short entry points, 137 and 139 lines against 630.
  The previous long form is preserved unchanged at `documentation/overview.md`
  and `documentation/overview.fr.md`, relative links rewritten for the depth.
- GitHub repository description and twelve topics set, for discovery.
- No skill content changed.

Session 8, agent routing core (phase 1 of the multi-agent architecture
expansion):

- The sixteen agents moved from `engineering/agents/` to a repository-wide
  `agents/<group>/` tree: `core`, `development`, `design`, `security`,
  `testing`, `documentation`, `devops`, with `research` reserved empty for a
  future agent. No agent content changed; every cross reference in
  `install.sh`, the validation scripts and the documentation updated to the
  new path.
- Three new `dev-skills`: `task-complexity` (five tiers from eleven signals,
  highest-signal-wins), `model-routing` (model tier and, where a lever
  exists, effort, from the classification), `token-optimization` (the
  during-the-work discipline paired with `control-center/advisor.py`'s
  after-the-fact measurement, one shared vocabulary of seven patterns).
  `engineering-orchestrator` now classifies and routes per plan step rather
  than once per request, and treats a reclassification and a routing
  escalation as one event.
- A fifth validation script, `tests/validate-model-routing.sh`: checks the
  routing table against eleven deterministic fixtures, no live model call.
- Version 3.1.0, minor: additive, no breaking change to an installed suite.
  `marketplace.json` and all seven `plugin.json` manifests bumped together,
  the established lockstep convention, even though only the engineering
  plugin's skill set changed this time.
- `model_routing` configuration section added, three tier names resolved to
  real model identifiers by the project rather than hardcoded here, because
  availability differs by account and changes over time.
- Verified against this runtime's own tool schemas, not a secondary source,
  before writing anything: an agent's `model:` frontmatter is real and a
  per-dispatch override exists; a per-agent `effort:` frontmatter field is
  not verified to exist and is not claimed. See the Decisions entry below.
- Deferred to the next phase, by design, not by oversight: the missing core
  agents (source of truth, checkup, final verifier, and a dedicated
  model-router agent distinct from the skill of the same name), the missing
  domain agents (pentester, design research, design verification,
  reproduction, research, compliance), the installer's per-agent-group
  selection, and the Control Center's agent-orchestration and
  model-and-token telemetry sections.

Session 8b, agent-dispatch telemetry (the first real run of the agent layer):

- `control-center/reader.py` gained an agent-dispatch collector, reviewed by
  security-engineer and qa-engineer before commit. Two review findings that
  mattered: a non-string `subagent_type` passed through `str()` re-imported
  the prompt field the collector exists never to read, and the sidechain scan
  used a two-level glob that structurally could not see the deeper directory
  where a dispatched agent writes, so it reported an unlooked-for zero as a
  measurement. Both fixed, both regression-tested.
- The orchestrator, me, broke the parallelisation rule: two review-and-fix
  agents dispatched onto the same files at once. No work was lost, owed to one
  agent's discipline, not to the orchestration. `delivery-orchestrator`
  section 6 and `docs/architecture/ORCHESTRATION.md` now make the rule
  operational: parallel agents sharing a write surface are read-only or
  sequenced. Full account in `multi-agent-assessment.md` section 9.

Session 9, launch readiness (cluster A of the delivery expansion), version
3.2.0:

- `launch-readiness` skill and `compliance-verifier` agent: the completeness
  gate for a user-facing web product, consolidating legal, discoverability,
  content, performance, accessibility, UX integrity, analytics, the security
  posture and infrastructure into one checklist that delegates to the owning
  skills and adds the web-launch items no skill covered (legal page scaffold,
  cookie banner, social preview, favicon, custom 404, broken links, anti-spam,
  single CTA). Stack agnostic body, Supabase and Next appendix.
- The gate never writes legal text: it scaffolds and verifies the page, the
  wording stays the owner's. This was a user decision, recorded.
- Wired into delivery phase 11. Counts moved 155 to 156 skills, 10 to 11
  delivery-skills, 16 to 17 agents.
- This branch is stacked on `feat/agent-routing-core` (PR #15, 3.1.0) because
  the `compliance-verifier` agent needs the `agents/` tree that PR relocates.
  It merges after #15.

Session 10, design authenticity (cluster C), version 3.3.0:

- `design-authenticity` skill and `design-verification` agent: the detector
  for the generic-default cluster that makes an interface look machine
  generated (gradients, glass, bento, default fonts, hover-everywhere motion),
  read as signals not verdicts, with the intentionality test. Fabricated
  testimonials and invented metrics are raised as truthfulness defects handed
  to `implementation-integrity`, not softened into taste. Wired into the
  UI_UX and DESIGN_SYSTEM plans; the agent joins the `design` group.
- The skill deliberately refuses to condemn a single element or prescribe a
  replacement: it names where intent is missing, the identity that fills the
  gap is the project's. This was the design decision that keeps it from being
  dogmatic, and it is in the Decisions section below.
- Counts 156 to 157 skills, 50 to 51 dev-skills, 17 to 18 agents.
- Stacked on `feat/launch-readiness` (PR #16), giving a linear stack
  #15 <- #16 <- #C, so the count files never conflict. Merges after #16.

Stack landing, PRs #15 through #18: the stacked merges tangled. #15 merged to
`dev`, but #16 closed instead of merging and #17 merged into the branch rather
than `dev`, so `dev` briefly held only #15. Recovered with one PR (#18) from
the consolidated `feat/launch-readiness` branch into `dev`, which carried all
of A and C at once. Lesson recorded: merge a stack as one PR from the head
branch, not PR by PR. Also fixed here: the validate CI job name, which #15 had
renamed, breaking `dev`'s required status check; reverted to the pinned name
`structure, rules, orchestration, plugins`, see [[release-branch-and-push-constraints]].
The old stale branches (chore/*, release/*, backup/*, feat/domain-*) were
deleted; only `main` and `dev` remain.

Session 11, the website auditor (cluster D), version 3.4.0:

- `website-audit` skill (`security/security-assurance/`) and `web-auditor`
  agent (`agents/security/`): a URL-driven audit across front, back, security,
  performance, accessibility and design. The defining rule is the line between
  passive observation (any public URL) and active testing (owned or authorized
  target only), the same authorization gate as `authorized-pentesting`.
  Registration and email verification are handed to the human, never
  automated, because defeating verification is abuse.
- Counts 157 to 158 skills, 10 to 11 security, 2 to 3 security-assurance, 18
  to 19 agents. Branched fresh from `dev` (clean base, no more stacking).

Session 12, workflow automation (cluster B, the last of the original list),
version 3.5.0:

- `workflow-automation` skill (`engineering/devops-skills/`): builds
  automation workflows through an external engine reached over a connector,
  n8n over its MCP server the concrete target. Two refusals define it: it does
  not assume a project wants automation (opt-in per project, recorded), and it
  does not pretend to have a connection it was not given. The n8n MCP server
  is configured and authorized interactively by the user, outside the skill,
  which detects the connector, explains its absence, guides the user, and
  never simulates access. No agent added: a capability, not a role.
- Wired into delivery phase 09. Counts 158 to 159 skills, 13 to 14
  devops-skills, 75 to 76 engineering. The delivery-system devops table,
  which had undercounted at eleven and omitted infrastructure-as-code and
  incident-response, was corrected to fourteen.
- All four original clusters (A, C, D, B) now delivered. The stale branches
  were cleaned; only `main` and `dev` remain.

Session 13, the pull request roles, version 3.6.0:

- `pr-author` and `pr-reviewer` agents (`agents/core/`): the two ends of a
  pull request as distinct roles, so the one who packages a change is never
  the one who passes it. `pr-author` composes atomic commits and opens the
  request with evidence-backed description; `pr-reviewer` reviews the diff and
  the repository merge criteria and issues a verdict, never merging and never
  reviewing a request it authored. No new skill: both cite existing skills.
- Counts 19 to 21 agents (core group 4 to 6). Branched fresh from `dev`.

Session 14, the roadmap and the animation skill, version 3.7.0:

- `docs/ROADMAP.md` written, then turned into a tickable checklist, with a
  design-and-animation phase added.
- `animation` skill (`engineering/dev-skills/`): the technique ladder from a
  CSS transition to a WebGL shader, compositor-cheap properties, chosen
  easing, and `prefers-reduced-motion` as a hard requirement. Taught in part
  from a real reference analysis of `pear.no`, read from its public page and
  bundle: React and Vite, a bespoke OGL shader layer, scroll-linked transform
  motion, masked reveals, custom easing, reduced motion in both CSS and JS,
  on a Flecha and GT Standard typographic foundation, the opposite of the
  generic defaults `design-authenticity` flags. Principles extracted, never
  the code. Wired into the FRONTEND, UI_UX and DESIGN_SYSTEM plans.
- Counts 159 to 160 skills, 51 to 52 dev-skills, 76 to 77 engineering. Fixed
  the architecture tree's devops subtree, still reading thirteen since
  workflow-automation, to fourteen.
- Still to do from the roadmap's animation phase: the `design-research` agent,
  and exercising the frontend agents on a real motion task (needs a target
  web project).

Session 15, roadmap Phase 1, version 3.8.0:

- The three skills the original brief named and never got built in their own
  right, each previously only in pieces inside other skills:
  `rate-limiting` (`security/secure-development/`), a limit per endpoint by the
  cost of abuse, keyed unforgeably, over the real control, with a shared store
  for multi-instance; `tls-certificates` (`engineering/devops-skills/`), the
  certificate over its whole life with renewal proven and expiry watched from
  outside, key never leaked, wired into phase 09; `admin-console`
  (`engineering/dev-skills/`), least-privilege roles, server-side object-level
  authorization, an append-only audit log, no secret in the interface, wired
  into the FULLSTACK plan.
- Counts 160 to 163 skills, 11 to 12 security, 8 to 9 secure-development, 14 to
  15 devops, 52 to 53 dev-skills, 77 to 79 engineering. The three Phase 1
  roadmap boxes are ticked. Branched fresh from `dev`.

Session 16, roadmap Phase 2, version 3.9.0:

- `llm-integration` (`engineering/dev-skills/`): a feature on a language model
  engineered around its non-determinism, cost and confident-wrongness. The
  prompt and structured output as a contract, an evaluation set that gates
  every change, retrieval for grounding, cost and latency budgeted, guardrails
  against injection, a leaked prompt, hallucination and truncation, privileged
  actions gated outside the model, and the provider's real API read rather than
  a model or price from memory. Wired into the BACKEND plan.
- `email-deliverability` (`engineering/devops-skills/`): SPF, DKIM and DMARC
  aligned to the From domain, DMARC monitor to reject on report evidence,
  transactional separated from marketing, sender warmed, bounces and complaints
  suppressed, unsubscribe honoured. The reason a confirmation email never
  arrives is usually here, not in the code. Wired into phase 09.
- Counts 163 to 165 skills, 53 to 54 dev-skills, 15 to 16 devops, 79 to 81
  engineering. Both Phase 2 roadmap boxes ticked. Branched fresh from `dev`.

Session 17, roadmap Phase 3, the design-research role, version 3.10.0:

- `design-research` agent (`agents/design/`): turns real references into
  principles without turning them into stolen code, keeping reference,
  inspiration, pattern and implementation apart. It reads a page and its bundle
  to learn a technique, states the principle, never copies the code or assets,
  judges the reference with `design-authenticity`, and hands direction to the
  implementing agents. No new skill: it cites `design-authenticity` and
  `animation`.
- Counts 21 to 22 agents, design group 2 to 3. The design-research roadmap box
  is ticked. Branched fresh from `dev`.
- Phase 3 still has one open box: exercise the frontend agents on a real motion
  task, which needs a target web project to build in. The `animation` skill and
  the reference analysis are done.

Session 18, the template-selection skill, version 3.11.0:

- `template-selection` skill (`engineering/dev-skills/`): finds clean,
  licence-clear templates that fit a project, shortlists a few with their
  trade-offs for the user to choose, confirms the chosen template's licence
  before use, and hands it to customisation. It understands the project first,
  judges candidates on fit and cleanliness with `design-authenticity` rather
  than the screenshot, never picks for the user, never uses a template against
  its licence, and never ships one unchanged. Requested by the user before
  Phase 4.
- Wired into the FRONTEND and UI_UX execution plans as a conditional step
  (runs only when the build starts from a template), so the orphan check passes.
  Run by the `design-research` agent and `ui-ux-engineer`.
- Counts 165 to 166 skills, dev-skills 54 to 55, engineering 81 to 82. Agents
  unchanged at 22. Its roadmap box is ticked, under Phase 3. Branched fresh
  from `dev`.

Session 19, roadmap Phase 4, the verification layer, version 3.12.0:

- `source-of-truth` agent (`agents/core/`): the authority on what is true about
  a project. Ground truth is the code, the schema and the configuration; it
  reconciles the documentation against them, names drift with evidence, records
  the canonical answer, and hands the prose to `documentation-engineer` rather
  than rewriting it. Cites `project-exploration`, `project-continuity`,
  `technical-documentation`.
- `checkup` agent (`agents/core/`): the pre-intervention inspection. Reports the
  architecture as built, the debt and fragility, the risks, and the safe versus
  load-bearing boundaries, before a change is made. Changes nothing. Cites
  `project-exploration`, `architecture-design`, `dependency-selection`,
  `security-audit`.
- `final-verifier` agent (`agents/core/`): the independent, evidence-only final
  gate that trusts no previous agent. Re-runs the proof rather than reading a
  claim of it, issues one verdict, treats an unreproducible gate as unverified.
  Cites `code-review-protocol`, `testing-quality`, `validation-gate`,
  `production-verification`.
- Counts 22 to 25 agents, the `core` group 6 to 9. Skills unchanged at 166.
  All three roadmap boxes ticked, under Phase 4. The engineering plugin bundle
  carries the three new agents. Branched fresh from `dev`.
- Phase 4 still has one open box: exercise the full agent layer on a real task,
  the same target-project gap as the open Phase 3 motion task.

Session 20, roadmap Phase 5 first item, per-domain agent packs, version 3.13.0:

- Agents install with the domain that owns them, so a domain's plugin is
  self-contained. `install.sh` gained `agent_domains` (web-auditor to security;
  security-engineer to engineering and security, shared because delivery
  dispatches it; every other agent to engineering) and a domain-filtered
  `agents` function. `--agents` still installs all 25.
- `plugins/build.sh` builds each domain's own agents and drops an empty
  `agents/` dir. Result: engineering 24 agents (web-auditor moved out), security
  2 (security-engineer, web-auditor). `--security` now installs both the
  website-audit skill and the web-auditor agent, the concrete gap the roadmap
  named.
- `validate-plugins.sh` check 4 rewritten: it regenerates and compares each
  domain's agents against its bundle, not just a floor on the engineering count.
  Verified it fails on a planted mismatch, then restored.
- Stale installer help/menu agent counts fixed (were 16). Engineering-scoped
  figures now 24, full roster 25, across README, installation, overview,
  plugins, engineering README, tests README and the agent architecture.
- Phase 5 has two boxes left: the Control Center agent panel, and advisor
  agent-level waste (blocked on real telemetry). Branched fresh from `dev`.

Session 21, roadmap Phase 5 second item, the Control Center agent panel,
version 3.14.0:

- Added an Agents tab to `control-center/app.html`: dispatch total, dispatched-
  work records, and breakdowns by agent and by model, from `DATA.usage.agent_dispatches`
  (which `reader.py` already produced). EN and FR strings for every label, a
  measured-zero empty state when the layer was not exercised. Backend untouched.
- Updated the report data-limitation note (EN and FR) to point at the Agents
  tab instead of saying the telemetry is undisplayed; the evolution doc and
  control-center.md tab table match.
- Verified end to end: 100 backend tests pass, the embedded JS parses
  (node --check), the server serves the page 200 with the tab present, and
  /api/data returns the agent_dispatches object with real data on this machine.
- Phase 5 has one box left: advisor agent-level waste, blocked on the agent
  layer being exercised for real. Branched fresh from `dev`.

Session 22, roadmap Phase 0, the count-consistency check, version 3.15.0:

- Added `tests/validate-counts.sh`: it computes the real skill and agent counts
  from the filesystem and checks the structured doc locations (tree diagrams,
  category tables, installer menus, totals) against them, failing on drift.
  Wired into the CI job as a sixth check (the job keeps its name, a stable
  label). Uses GNU grep -P; present on the CI runner.
- The check caught live drift on landing, all fixed: delivery-skills 10 in
  engineering/README (real 11), security tree 10 in three menus (real 12),
  security-assurance 2 in three tables (real 3), core agents 6 in the
  architecture diagram (real 9), agent total 16 in engineering/README and in the
  French overview diagram (real 25), dev-skills section titled "fifty four"
  (real 55).
- Also swept the test-suite references from five to six scripts across the docs,
  and set the engineering plugin description to 24 role agents (its post-split
  count). The script does not check free prose or plugin bundle sizes, by design.
- Phase 0 box ticked. This closes every non-parked, non-"exercise" roadmap item;
  what remains needs a real target project or is deliberately parked. Branched
  fresh from `dev`.

Session 23, the portfolio redesign and roadmap Phase 6, version 3.16.0:

- Off-repo: exercised the frontend agents and skills on a real target, the
  `lauret-chacha` portfolio (separate repo at ~/Importants/portfolioo). A
  read-only audit dispatched ui-ux-engineer, security-engineer and
  performance-engineer, then a full redesign: amber terminal identity, clean
  reduced-motion-safe animations across every page, a terminal multi-step
  contact form, SEO and legal scaffolding, DB resilience and backend security
  hardening. Shipped to that project's `main`. Its own audit checklist lives in
  its gitignored `rapport-audit.local.md`. This ticks the Phase 3 motion item
  and partly the Phase 4 agent-layer item.
- In-repo: `engineering/examples/delivery-link-shortener/`, a worked example of
  the fourteen delivery phases on a small link shortener, sized small, all four
  approval gates shown. `engineering/examples/README.md` indexes it,
  `delivery-system.md` section 12 points at it. Phase 6 delivery-demo box ticked.
- No skill or agent count change (the example is not a skill). Manifests 3.16.0.
  Branched fresh from `dev`.

Session 24, roadmap Phase 6 documents demonstration, version 3.17.0:

- `documents/examples/jeu-conges/`: one fictional subject (an internal time-off
  system, CongesPro) written for three readers, a user guide, a technical manual
  and a deployment report, each passed through the eight-point gate; a fourth
  file keeps the gate reports, the reader-split critique and a PDF render
  verification. `documents/examples/README.md` indexes it, `documents-system.md`
  section 10 points at it. Phase 6 documents-demo box ticked; Phase 6 now fully
  done.
- Produced with the Workflow tool (ultracode on): a three-item pipeline, one
  writer per reader following its skill plus document-core, a gate reviewer per
  document, then a cross-set critique agent that returned split_lecteur_ok true.
  Seven agents, no errors. The result was parsed from the run output file into
  the five files; a forbidden-char and email scan ran clean before commit.
- No skill or agent count change. Manifests 3.17.0. Branched fresh from `dev`.

## Current state

Working today:

- the six scripts pass: 166 skills, 0 errors, 1 pre-existing warning on a
  deliberate typographic counter-example;
- `install.sh` works in every mode, including the four new scopes, verified
  against a sandbox target through `CLAUDE_SKILLS_DIR`;
- the Control Center serves its page and `/api/data` with real local figures;
  a headless Playwright pass across desktop, mobile, light and dark reported
  zero console errors and no horizontal overflow (not re-verified this
  session; no change touched the Control Center);
- the plugin bundles match what each scope installs, verified by
  `validate-plugins.sh`;
- no skill contains a hardcoded personal identity, verified by check 4;
- every declared dependency and every `Interfaces` cross reference resolves
  across all eight trees;
- the eleven `model-routing` fixtures match its own tier table, verified by
  `validate-model-routing.sh`, no live model call.

Looks finished and is not:

- `documentation/writing-rules.md`, `workflow.md`, `engineering-system.md` and
  `delivery-system.md` are still in French. Their content is correct and
  current; only the language has not been converted. They are deep reference
  documents, not entry points, so nothing is broken by this, but it is
  inconsistent with the rest.

## Decisions

- **English skill language, configurable output language.** The alternative
  was keeping the writing tree French throughout. Rejected: it made the system
  unusable to anyone outside French. The resolution is the three-layer model in
  `documentation/configuration.md`: instructions in English, output in the
  recipient's language, French reference data kept French because it is output
  rather than instruction.
- **The writing skills were rewritten, not translated.** Each one states what
  survives a change of output language and what does not. `proofreader` and
  `poet` are explicitly French-specific and say so.
- **French filenames kept under `writing/resources/` and the writing skills'
  `examples/` and `resources/`.** Renaming roughly eighty files would have
  produced churn and a risk of broken references for no gain: the content is
  French reference material. Recorded so it reads as a decision rather than an
  oversight.
- **A fourth tree, `shared/`, rather than placing the cross domain skills in
  an existing one.** They are called by all three others; putting them in one
  would have made the other two depend on it. Check 13 enforces that they
  depend on nothing.
- **`documents/` split by reader, not by document type.** Seven skills cover
  the whole surface because the split is by audience. A skill per document type
  would have produced thirty skills sharing one method, which would then drift.
- **Delegation is explicit and defaults to caution.** `push` defaults to
  `branch-only`, `deployments` and `database_operations` to `no`. The reason is
  that a wrong default here is expensive and silent, whereas an over-cautious
  one costs one prompt.
- **`CLAUDE.md` was untracked and replaced by `AGENTS.md`.** Earlier sessions
  kept it tracked as a documented exception. That exception is withdrawn: a
  file named after an agent runtime is machine local configuration, and the
  repository now carries a vendor neutral `AGENTS.md` instead. The content is
  identical in purpose. `tests/validate-rules.sh` check 7 fails the build if
  `CLAUDE.md`, `.claude/` or any equivalent is ever tracked again, and
  `tests/validate-structure.sh` now requires `AGENTS.md` to exist. A local
  `CLAUDE.md` may still exist on a contributor's machine, ignored, containing
  a pointer to `AGENTS.md`.
- **The quality system is nine skills, not seventeen.** The brief listed
  exploratory testing, bug hunting and UX testing as three; usability findings
  live inside `exploratory-testing` because they are produced by the same
  session and the same evidence rule. Performance testing stayed inside
  `performance-engineering` rather than becoming a second skill with the same
  method. Browser CLI work extended `playwright-automation` instead of
  creating a second browser skill that would have drifted from it.
- **INCIDENT is the one plan that does not begin with exploration.** Mitigation
  precedes understanding during an outage. The exception is encoded in check 4
  of `tests/validate-orchestration.sh` rather than tolerated informally.
- **Sixteen surface categories rather than one generic one.** Each names a
  domain with distinct failure modes and a distinct plan. The alternative,
  routing everything through BACKEND or FULLSTACK, produced plans that were
  either too wide for a small change or silent about the risk that mattered.
- Earlier decisions stand: agents tracked in the repository rather than in
  `.claude/`, engineering content in English, `code-review-protocol` suffixed
  to avoid a name collision.
- **Model routing claims a model override and an agent's own `model:`
  frontmatter, and nothing else.** A subagent search initially reported a
  per-agent `effort:` frontmatter field as an existing capability, sourced to
  a GitHub feature-request issue rather than to shipped documentation.
  Rejected: a feature request is evidence that something does not exist yet,
  not that it does. Verified instead against this runtime's own tool
  definitions, which confirm the `model:` override and say nothing about
  effort. `model-routing` routes model with confidence and states effort as a
  recommendation, never as an enforced parameter, except where a specific
  skill or command already defines its own effort argument.
- **Agents moved to a repository-wide `agents/` tree instead of staying inside
  `engineering/`.** The alternative was adding every new domain agent under
  `engineering/agents/` regardless of domain. Rejected: a security or design
  agent pack should install independently of the engineering plugin, per the
  suite's own domain-independence rule. The move is a rename, not a rewrite;
  no agent's content changed.
- **`task-complexity`, `model-routing` and `token-optimization` are declared
  implicit in every execution plan, the same way `engineering-core` is,
  rather than listed as a step in each of the twenty-plus plans.** The
  alternative, adding a line to every plan, was rejected as exactly the
  duplicated business rule the suite's own conventions forbid: these three
  are consulted by the orchestrator before and during dispatch, not steps a
  plan chooses to include or drop.
- **`design-authenticity` reads tells as signals, never as a banned list.**
  The alternative was a prohibition: no gradients, no rounded corners, no
  Space Grotesk. Rejected as wrong on its face, since every one of those can
  be the right choice; a rule that condemns a single rounded corner mistakes a
  signal for a verdict and is useless to a designer who had a reason. The
  skill judges the cluster and tests intentionality instead, and it refuses to
  prescribe a specific replacement because the identity that fills the gap is
  the project's, not the reviewer's. The one place it is absolute is the
  content tells: a fabricated testimonial is a truthfulness defect, not a
  matter of taste, and it is raised regardless of how good the rest looks.

## Remaining

- n8n, end to end. The `workflow-automation` skill is delivered, but the n8n
  MCP server has to be configured and authorized interactively by the user,
  and no workflow has been built or run against a real n8n instance yet.
  Exercising it end to end, and confirming the connector-detection and the
  opt-in behave against a live server, is a follow-up the user parked for
  later on 2026-09-17.
- `enforce_admins` is off on both branches, so the owner is not blocked from
  pushing directly; contributors are. Turn it on the day
  `.github/CODEOWNERS` names a second reviewer, and not before: GitHub does
  not allow approving your own pull request, so enabling it with one
  maintainer removes every path to a merge. Command in
  `documentation/branch-protection.md`.
- No demonstration project for the delivery system, equivalent to
  `writing/examples/saga-les-cendres-de-kivu/`. First step: run the fourteen
  phases on a small real application repository.
- No demonstration project for the `documents/` tree either. First step: a
  three-document set for one subject, exercising the reader split and the PDF
  render verification.
- `validate-orchestration.sh` does not check that each skill's examples are
  consistent with its `SKILL.md`. First step: verify the skill names cited
  inside `examples/`.
- Execution plans do not cover pure infrastructure tasks. First step: decide
  whether that justifies a twenty-first task category.
- Nothing verifies at runtime that the review gates between agents were
  respected. That remains a documented discipline.

## Risks

- A skill added without being listed in a plan or a phase is reported as an
  orphan by check 7.
- An agent added without being added to the expected list is reported by check
  10, and the reverse.
- Check 9 covers only the `Interfaces` section. A broken reference elsewhere in
  a `SKILL.md` is not detected automatically.
- Installation is flat. Two skills sharing a name would overwrite one another;
  `validate-structure.sh` now refuses that, verified across the 92 names.
- Internal cross references between skills stay relative to their tree: a
  writing skill cites `core/writing-constitution`, an engineering skill cites
  `dev-skills/engineering-core`. That is deliberate and consistent with flat
  installation. Only the root documents carry the tree prefix.
- The `delegation` contract is a documented discipline, not an enforced one. A
  runtime that grants full write access does not prevent an agent from pushing
  when the configuration says otherwise. `git-workflow` makes it an automatic
  failure in its auto-critique, which is the strongest available lever.

## Verification

- `bash tests/validate-structure.sh`: 92 skills, 0 errors.
- `bash tests/validate-rules.sh`: 0 errors, 1 pre-existing warning.
- `bash tests/validate-orchestration.sh`: 0 errors, thirteen checks.
- `bash -n` on the four shell scripts.
- `install.sh` exercised against a sandbox target in every mode: full 92
  skills and 14 agents, `--writing` 44, `--documents` 9, `--dev` 43 plus
  agents, `--shared` 2, scoped removal keeping the cross domain pair, full
  removal, and `--zip` producing 92 archives.
- `install.sh --configure` exercised under a pseudo-terminal: prompts,
  defaults, validation refusals, configuration file and manual task list all
  produced and inspected.
- `install.sh --configure` without a terminal: fails cleanly, points at the
  template, exit 1.
- Grep for hardcoded identity across the four skill trees: none.
- Links in the root documents and the tree indexes: resolve.

## Context

- Git identity is read from the configuration, not imposed by the repository.
  `git-workflow` stops and names the missing field rather than inventing one.
  No automatic signature, no `Co-authored-by`, no mention of a tool.
- Four trees, four scopes in the installer. The two cross domain skills install
  with every scope and survive a scoped removal, so removing one tree never
  breaks another.
- The arrow block, `U+2190` to `U+21FF`, is rejected by check 2 of
  `validate-rules.sh` alongside emoji. Diagrams are written with `->`.
- Phase numbering in `delivery-phases.md` is read with `10#` to avoid octal
  interpretation of `08` and `09`. Keep the `phase: NN` format.
- Helper functions in the validation scripts use their own loop variables. A
  shared name silently rewrites the caller's loop; that bug was introduced and
  fixed during this session in `is_procedural`.
- Never name a shell variable `GROUPS`. It is a bash built-in array of the
  current user's group ids, and assigning to it fails silently rather than
  erroring. That cost the installer every skill it was meant to copy, and the
  scripts passed `bash -n` throughout. The lesson generalises: these scripts
  are verified by running them against a sandbox target, not by reading them.
- The installer is verified by running every mode against a sandbox target
  through `CLAUDE_SKILLS_DIR`, never against `~/.claude`. Three defects were
  found that way in the selection work alone: a bare `--skill NAME` rejected
  by the argument parser, an `exec 3</dev/tty` whose failure message escaped
  its own `2>/dev/null`, and a `die` inside a process substitution that killed
  only the subshell and let the install continue with a shorter list.
- Validate a name after the prompt as well as before it. Moving
  `validate_selected_groups` to run only before `interactive_select` meant a
  category typed at the menu was never checked, and a typo installed just the
  cross domain pair instead of failing.
- The Bash tool runs zsh, which does not word-split an unquoted expansion.
  A sweep loop calling `bash install.sh $flags` passes `--group genres` as one
  argument and reports a failure the installer did not have. Split explicitly,
  or run the sweep under `bash -c`.
- `/dev/tty` can exist as a path and still refuse to open. Test it by
  attempting the open, never with `[ -r /dev/tty ]`: the path test passes in a
  sandbox, the read then fails, and the caller silently takes the default.
  That bug installed the writing tree for a user who had chosen nothing.
- Do not test branch protection by pushing to the protected branch. With
  `enforce_admins` off the push succeeds, and undoing it needs a force push,
  which the protection then refuses. It happened during setup: a probe commit
  reached `main` and `dev` and had to be removed by a revert, which is why
  `4c6f7bd` and `be42bb7` sit in the history. Test from an account without
  admin rights, or trust the read-back of the rule.
- After moving any directory, run all six scripts: some of them resolve paths
  and fail cleanly by naming what is missing.
