# Changelog

Every notable change to this project is recorded here. The format follows
semantic versioning.

## Unreleased

Phase 1 of the multi-agent architecture expansion: a routing core, added
without touching a single existing skill's content. Version number left for
the release step; nothing here is a breaking change to an installed suite.

### Added

- `task-complexity`: classifies a task into one of five tiers from eleven
  signals, combined by a highest-signal-wins rule, so a small change with a
  security or irreversibility signal is never under-classified by its file
  count. `engineering/dev-skills/task-complexity/`.
- `model-routing`: recommends a model tier, and where a lever exists an
  effort level, from that classification. States exactly which two switching
  mechanisms this runtime supports, an agent's own `model:` frontmatter and a
  per-dispatch override, and claims neither a session changing its own model
  mid task nor a universal per-agent effort control, because neither is
  verified to exist. `engineering/dev-skills/model-routing/`.
- `token-optimization`: the discipline for keeping context and output
  proportional to a task during a multi-step or multi-agent run, sharing one
  vocabulary of seven wasteful patterns with `control-center/advisor.py`'s
  retrospective measurement rather than defining a second one.
  `engineering/dev-skills/token-optimization/`.
- `model_routing` configuration section: three tier names, `fast`,
  `balanced`, `strongest`, resolved to real model identifiers by the project
  rather than hardcoded, because availability differs by account and changes
  over time.
- `tests/validate-model-routing.sh`: checks the routing table against eleven
  deterministic fixtures, five base tiers, four override conditions, two
  escalation and de-escalation transitions, with no live model call.
- Architecture documentation: `docs/architecture/multi-agent-assessment.md`,
  `AGENT_ARCHITECTURE.md`, `MODEL_ROUTING.md`, `TOKEN_OPTIMIZATION.md`,
  `SKILL_AGENT_MATRIX.md`, `ORCHESTRATION.md`, and `docs/agents/README.md`.

### Changed

- The sixteen agents moved from `engineering/agents/` to a repository-wide
  `agents/<group>/` tree (`core`, `development`, `design`, `security`,
  `testing`, `documentation`, `devops`, `research` reserved empty), so a
  future agent pack for a single domain does not have to live inside the
  engineering plugin. No agent's content changed; `git mv` used throughout,
  confirmed as renames rather than delete-plus-add.
- `engineering-orchestrator` now classifies and routes per plan step rather
  than once per request, and treats a reclassification and a routing
  escalation or de-escalation as the same event rather than three
  independent judgment calls.
- Skill counts corrected wherever they appear in prose: 152 to 155 skills, 47
  to 50 `dev-skills`, 70 to 73 engineering skills, four to five validation
  scripts, including in the CI workflow.

### Not changed

- No existing skill's `SKILL.md` content changed, apart from
  `engineering-orchestrator`'s protocol and anti-loop sections, which now
  reference the three new skills rather than restate them.
- No plugin's public skill set changed beyond gaining the three new
  `dev-skills`; the engineering plugin's agent bundle is unchanged in
  content.

## 3.0.0

The suite is renamed Craft Suite. The writing tree stopped being the whole of it
several versions ago, and the old name kept saying otherwise on every install
command, every plugin identifier and the front page. The README is also split:
a short entry point at the root, the long form moved under `documentation/`.

### Changed

- **Breaking.** The repository is `craft-suite`. GitHub redirects the old URL,
  so an existing clone keeps working, but the marketplace command is now
  `/plugin marketplace add Handsomeboy990/craft-suite`.
- **Breaking.** The seven plugins are renamed from `writer-suite-<domain>` to
  `craft-<domain>`. A plugin installed under the old identifier is not upgraded
  in place: remove it and install the new one.
- **Breaking.** The configuration file moves from `~/.claude/writer-suite.config.yaml`
  to `~/.claude/craft.config.yaml`, and the manual task list from
  `writer-suite-manual-tasks.md` to `craft-manual-tasks.md`. `install.sh` moves
  both on its next run, so an existing install keeps its answers and is not
  asked again. It only moves a file when the new name is absent, and does
  nothing when `CLAUDE_CONFIG_FILE` points somewhere of your own.
- The template is `config/craft.config.example.yaml`.
- The cache used by the piped installer is `~/.cache/craft-suite`.
- `README.md` and `README.fr.md` are now short entry points: what the suite is,
  how to install it, the seven plugins, what "finished" means, and where to go
  next. The previous long form is preserved unchanged at
  `documentation/overview.md` and `documentation/overview.fr.md`, with its
  relative links rewritten for the new depth.
- The Control Center window title reads Craft Suite.

### Not changed

- No skill content changed. The 152 skills and 16 agents are byte identical
  apart from the two files that named the configuration.
- The installer flags, the scoping behaviour and the four validators are
  unchanged.
- Historical entries below keep the old name, because that is what they
  describe.

## 2.3.0

Control Center evolution: a Token Optimization Advisor, richer and more honest
token analytics, session detail, filtering, English and French localization,
report export, and a UX, theme and accessibility pass. No new dependency; the
Control Center is still Python standard library and one HTML file.

### Added

- Token Optimization Advisor (`control-center/advisor.py`), a pure, deterministic
  module that analyses real session evidence and surfaces evidence-based
  opportunities: repeated file exploration, edit churn, repeated command shapes,
  low context reuse, several large outputs, an over-broad session, and a project
  re-explored across sessions. Each finding states what was observed, a
  recommendation, a concrete example and the potential benefit, with a severity.
  It never invents a finding: each detection has a documented threshold, and a
  session with no signal produces none. The optimization score is deterministic
  and explainable (each session starts at 100, findings subtract a documented
  severity penalty, the overall score is the mean), and null when there is no
  data rather than a misleading 100.
- An Optimization tab with the score ring and its method, recurring patterns, top
  opportunities diversified across categories, a per-session table, and the
  methodology with its thresholds.
- A session detail view: select a session to see its token components, evidence
  (reads, edits, commands) and its optimization findings.
- Report export in HTML, JSON, CSV and PDF. PDF uses the browser's own print
  dialog on a print-styled report, a genuine PDF with no external dependency.
  Reports state their period, sources, metrics, limitations and a privacy note,
  and carry aggregate statistics only, never raw transcript content.
- English and French localization, switched live and remembered per browser,
  English as the fallback. All user-facing strings, including advisor findings,
  are translatable; no translated string lives in analysis code.
- `control-center/test_advisor.py`, deterministic advisor tests with no
  test-framework dependency, covering empty data, clean sessions, every finding
  category, the below-threshold no-invention case, the scoring formula, the floor
  at 0, cross-session logic and determinism.
- `tests/check-app-js.py`, a page-script syntax check wired into CI, so a syntax
  error in the inline script cannot ship a blank page.
- `docs/control-center-evolution.md`, the architecture, data flow, advisor
  detection table, privacy model and the extension points for future telemetry.

### Changed

- Token analytics are more honest. The four real components (fresh input, cache
  read, cache creation, output) are shown separately; cache reads, which are the
  same context re-read cheaply each turn and sum to billions, are no longer folded
  into a single headline. Session sizes and the overview use work tokens (fresh
  input plus output), so figures are comparable. Overview adds median, largest and
  smallest sessions and a cache-reuse ratio.
- The Sessions tab gained search, project and date-range filters; the terminal
  `--report` gained an optimization summary and honest project figures.
- The theme is complete in light and dark with an explicit toggle and system
  default; localization and theme persist in the browser only.
- Accessibility: keyboard-operable tabs, rows and dialog, focus management,
  charts with a visually-hidden table alternative, and reduced-motion support.
- The CI runs the advisor tests, the page-script syntax check and the advisor
  CLI alongside the existing checks.

## 2.2.0

Four new domains, an optional local dashboard, and per-domain plugins. The
suite grows past writing without disturbing what existed: 121 skills to 152,
four trees to eight, and a second distribution path alongside the installer.
The product is repositioned as the Claude Skill Suite; the repository keeps its
name.

### Added

- `security/`, 10 defensive security skills in two categories, governed by
  `security-core`:
  - secure-development: `security-core`, `threat-modeling`,
    `security-architecture`, `authentication-security`, `authorization-design`,
    `session-security`, `dependency-security`, `security-headers`.
  - security-assurance: `vulnerability-assessment`, `authorized-pentesting`.
  - The posture is defensive; offensive technique lives only in
    `authorized-pentesting`, behind a written-authorization gate that is checked
    first and never waived by rephrasing. No audit concludes a system is secure.
  - The engineering tree's `security-audit` and `security-testing` stay where
    twelve execution plans call them; the security tree governs their posture
    and installs them with it.
- `research/`, 5 general research skills governed by `research-core`:
  `source-research`, `source-verification`, `competitive-analysis`,
  `synthesis-reporting`. A source is cited only if it was consulted; a gap is
  stated, not invented. Distinct from the writing tree's `research-director`.
- `career/`, 7 job search and application skills governed by `career-core`:
  `career-profile`, `job-search`, `cv-engineering`, `cover-letter`,
  `interview-preparation`, `company-research`. Nothing about the outside world
  is invented; nothing about the candidate is claimed that they cannot support.
  A new `career` configuration section carries the candidate's real situation.
- `opportunity/`, 9 skills in three categories governed by `opportunity-core`:
  ideation (`ideation-engine`, `idea-evaluation`), hackathons
  (`hackathon-discovery`, `hackathon-strategy`, `pitch-and-demo`), business
  (`client-discovery`, `lead-research`, `market-research`). One method: discover,
  evaluate, recommend a ranked few. Every opportunity is grounded or marked a
  hypothesis, never fabricated.
- `control-center/`, an optional zero-dependency local dashboard: a Python
  standard-library server and a single self-contained HTML page that read the
  real local session data, installed skills and configuration and show usage,
  tokens, models, tools, projects and system health. It binds to loopback only,
  keeps nothing of its own, and marks any metric it cannot establish as
  unavailable rather than inventing it. `bash install.sh --control-center`, and
  `bash install.sh --report` for the same figures in the terminal.
- Per-domain Claude Code plugins: `.claude-plugin/marketplace.json` and a
  manifest per domain, with bundles under `plugins/` generated from the trees by
  `plugins/build.sh`. `/plugin marketplace add Handsomeboy990/claude-writer-suite`
  then installs only the domains wanted.
- `tests/validate-plugins.sh`, a fourth validator that keeps the plugin bundles
  in sync with the canonical trees and checks the manifests.

### Changed

- The installer gained `--security`, `--research`, `--career`, `--opportunity`
  scopes, `--control-center` and `--report` modes, and a ten-option interactive
  menu. All scopes combine and deduplicate, and each pulls its cross-tree
  dependencies and the shared pair, exactly as before.
- The three existing validators learned the four new trees. Counts updated
  across `README.md`, `README.fr.md`, `AGENTS.md` and the documentation.
- Product name presented as Claude Skill Suite in the documentation and plugin
  manifests. The git remote and directory keep `claude-writer-suite`, so no
  clone URL, install command or existing link breaks.

## 2.1.0

Quality engineering as a system rather than a single skill, and the lifecycle
gaps closed: contracts, schemas, change management, asynchronous work, money,
files, locales, search, design language, privacy, infrastructure and
incidents. 92 skills to 121, 14 agents to 16, 20 task categories to 38.

### Added

- Quality subsystem, 9 skills in `dev-skills`:
  - `quality-engineering`: discovery, one batch of questions, the testing
    contract, strategy by product type, discipline selection, campaign order,
    the twelve point quality gate and one verdict.
  - `exploratory-testing`: charters, time boxes, nine tours, usability
    findings attached to reproducible behaviour.
  - `bug-hunting`: nine families of adversarial interaction, minimal
    reproductions with a stated frequency.
  - `api-testing`: the contract past the first 200, forty five endpoint cases,
    error shape coherence, idempotency and concurrency.
  - `regression-testing`: impact analysis from the diff, five selection tiers,
    baseline comparison, honest exclusion.
  - `accessibility-testing`: keyboard first, scanner last, criteria map,
    findings mapped to a barrier and a person.
  - `security-testing`: authorized dynamic verification inside a written
    boundary, role matrix, object level access, tenant isolation.
  - `reliability-testing`: nine failure modes per dependency, four properties
    per injection, injection at more than one point per operation.
  - `test-reporting`: finding records, severity scale, defect lifecycle,
    evidence and redaction, campaign report in Markdown or self contained HTML.
- Domain surfaces, 13 skills in `dev-skills`: `api-design`,
  `database-design`, `caching-strategy`, `background-jobs`,
  `realtime-systems`, `file-handling`, `payment-engineering`,
  `internationalization`, `seo-engineering`, `design-system`, `data-privacy`,
  `analytics-instrumentation`, `feature-flags`.
  - `analytics-instrumentation`: the questions before the events, a typed
    schema, identity without personal data, definitions in one register,
    consent, validation and deprecation.
  - `feature-flags`: flag types and their lifespans, fail safe evaluation,
    gradual rollout against a written threshold, both sides tested, stale
    detection, and the removal that closes the loop. An entitlement is
    authorization, not a flag.
- Change and continuity, 5 skills in `dev-skills`: `refactoring`,
  `legacy-code`, `migration-engineering`, `technical-debt`,
  `decision-records`.
- Operations, 2 skills in `devops-skills`: `infrastructure-as-code`,
  `incident-response`.
- Agents: `principal-engineer` for a multi surface request and its gates,
  `incident-responder` for a degraded production system and its postmortem.
- Eighteen task categories: QUALITY_CAMPAIGN, ACCESSIBILITY, REGRESSION,
  MIGRATION, LEGACY, INCIDENT, INFRASTRUCTURE, PAYMENTS, JOBS, REALTIME,
  FILES, I18N, SEO, DESIGN_SYSTEM, PRIVACY, CACHING, ANALYTICS,
  FEATURE_FLAGS, each with a canonical plan and routing rows.
- `AGENTS.md`, the vendor neutral entry point an agent reads first.

### Changed

- `testing-quality`: a requirement to case section before the mandatory cases,
  and a suite review section with `resources/test-suite-review.md`. Sections
  renumbered.
- `playwright-automation`: interactive browser CLI mode, console and network
  audits, recording and evidence rules, a failure diagnosis order, and
  `resources/playwright-cli-protocol.md`. Command surfaces are verified
  against the installed tool rather than reproduced from memory.
- Execution plans: `ARCHITECTURE`, `FRONTEND`, `FULLSTACK`, `DATABASE`, `API`,
  `SECURITY`, `PERFORMANCE`, `UI_UX`, `TESTING`, `BROWSER_AUTOMATION`,
  `RELEASE`, `REFACTORING` and `DEPENDENCY` extended with the new skills.
- Delivery phases 04, 08, 09 and 11 extended.
- Nine agent definitions now cite the skills that cover their new surfaces.
- `tests/validate-orchestration.sh`: 38 categories, 16 agents, and check 4
  encodes the one deliberate exception to the exploration first rule, since
  an INCIDENT plan restores service before it explores.
- `tests/validate-rules.sh`: check 7 fails the build if a runtime specific
  agent file, a local agent directory or a secret file is ever tracked, and if
  `AGENTS.md` is absent.
- `tests/validate-structure.sh`: `AGENTS.md` added to the required root files.

### Removed

- `CLAUDE.md` is no longer tracked. A file named after an agent runtime is
  machine local configuration; the entry point moved to `AGENTS.md` with the
  same purpose and a neutral name. `.gitignore` now covers `CLAUDE.md`,
  `.cursor/`, `.cursorrules`, `.windsurfrules` and `.aider*` alongside
  `.claude/`.

## 2.0.0

Two new trees, an English-first skill language, and a configuration system
with explicit delegation boundaries. The engineering tree keeps its content;
the writing tree keeps its expertise and changes its instruction language.

Breaking: skills are now written in English, `README.fr.md` is the French
entry point rather than `README.md`, and skills that read user specific values
now require the configuration file instead of embedded defaults.

### Added

- `shared/`: 2 cross domain skills, depending on nothing and callable from
  every tree.
  - `self-critique`: selects the professional roles that will receive the
    work, runs one pass per role, checks the result against what was actually
    requested, ranks findings by severity, fixes them, re-reviews what the
    fixes touched. Delegates depth to the domain reviewers and keeps the one
    check none of them performs.
  - `project-brief`: inspects what exists, asks the decision-critical
    questions once in a single batch, records an assumption for everything it
    did not ask, and produces the working agreement that becomes the
    operational source of truth. Covers taking over existing work.
- `documents/`: 7 skills for documents delivered to someone, in three
  categories.
  - `document-core`: the constitution. Audience model, the three languages,
    the evidence rule, the shared style standard, an eight-point quality gate,
    eleven when paginated.
  - `technical-writing`, `user-documentation`, `report-writing`: separated by
    reader, not by subject.
  - `administrative-writing`: letters, notices, attestations, minutes,
    applications, with country conventions and the evidence rule at its
    strictest.
  - `document-design`, `pdf-production`: layout, then rendering and its
    verification.
- `config/`: the configuration contract. Template, field reference, and the
  rule that identity values have no default and never will.
  - `delegation` section: commits, branches, push, pull requests, release
    tags, deployments, database operations, dependency changes. Anything the
    user keeps is prepared and handed over rather than performed.
  - `install.sh --configure`: recommendation-first numbered prompts, scoped to
    what was installed, with validation that refuses an author name resembling
    a tool.
  - Selective installation. `bash install.sh` with no argument now asks what
    to install instead of installing all 92 skills. A developer is not given a
    novelist's toolkit, and the reverse. Scopes combine, `--all` restores the
    old behaviour explicitly, and with no terminal and no scope the installer
    refuses rather than guessing.
  - `--skill <name>` installs one skill with its dependencies resolved
    transitively across trees, so a named skill is never installed broken. An
    unknown name stops the run instead of silently shortening it. A named
    removal takes only what was named, since dependencies are shared.
  - `--group <category>` installs one or more of the ten categories, so a
    thriller writer takes `genres` without the prosody skills. Trees,
    categories and named skills combine freely and the result is
    deduplicated.
  - `--list` prints every skill with its purpose.
  - The script bootstraps itself: with no skills beside it, it clones the
    repository into `~/.cache/claude-writer-suite`, which makes
    `curl ... | bash -s -- --writing` work. It opens the terminal directly for
    its questions, since its own stdin is the pipe.
  - `writer-suite-manual-tasks.md`, generated next to the configuration:
    every step the user kept, with its command.
- `README.fr.md`: complete French entry point, equivalent to `README.md`.
- `documentation/installation.md`, `configuration.md`, `agents.md`,
  `documents-system.md`, `branch-protection.md`.
- Repository governance. `dev` becomes the integration branch every
  contribution targets; `main` becomes the release branch, receiving only pull
  requests from `dev`.
  - `.github/CODEOWNERS`: the maintainer owns everything by default, with
    commented lines for adding authorized reviewers and per-area owners.
  - `.github/pull_request_template.md`: base branch check, the three
    validation results, and the attribution prohibition.
  - `.github/workflows/validate.yml`: runs the three scripts plus a shell
    syntax check on every pull request, and fails a pull request whose commits
    attribute the work to a tool. Meant to be a required status check.
  - `.githooks/pre-push`: refuses a direct push to `main` or `dev`, refuses
    their deletion, refuses a commit attributed to a tool, refuses a commit
    with an empty author. Enabled with
    `git config core.hooksPath .githooks`, with a documented maintainer
    override for a deliberate release push.
  - Branch protection applied to both branches through the GitHub API: pull
    request required, one approving review, code owner review required, stale
    approvals dismissed, `structure, rules, orchestration` as a required
    status check, branch up to date, conversations resolved, linear history,
    no force pushes, no deletions. `enforce_admins` deliberately off, so the
    owner keeps a release path while contributors are blocked.
- An Author section in both READMEs, and the copyright holder named in
  `LICENSE`.
- `validate-orchestration.sh` checks 12 and 13: the document pipeline, and the
  independence of `shared/`.
- `validate-rules.sh` checks 3 and 4: credential-shaped strings anywhere, and
  hardcoded personal identity in any skill tree.
- `validate-structure.sh`: duplicate skill name detection, since installation
  is flat.

### Changed

- Skill language is English for all 92 skills. The 42 writing skills were
  rewritten rather than translated: the structural expertise is unchanged, the
  French craft rules are retained and marked as French, and each skill states
  what happens when the output language is not French.
- Output language is now a configuration decision.
  `language.creative_output` defaults to French for `writing/`;
  `language.document_output` is set per recipient for `documents/`. The
  reference material in `writing/resources/` and the writing skills'
  `examples/` stays French, being output rather than instruction.
- `git-workflow`: the author identity is read from `identity.author_name` and
  `identity.author_email` instead of being hardcoded, and the skill stops and
  names the missing field rather than inventing one. New section 2 carries the
  delegation contract; the protocol reports every step stopped at.
- `install.sh`: rewritten in English, with `--documents`, `--shared`,
  `--configure` and `--help`. Cross domain skills install with every scope and
  survive a scoped removal.
- `validate-structure.sh`: group paths replace the tree-to-category mapping,
  covering four trees and ten groups; the `Protocol` and `Interfaces`
  requirement extends to `documents/` and `shared/`; skill README titles are
  checked for every tree.
- `validate-rules.sh`: rewritten in English. The straight quote check is
  scoped to `writing/`, since the rest of the repository is English where the
  straight quote is correct. `dist/` is excluded.
- `validate-orchestration.sh`: rewritten in English. Dependency and
  `Interfaces` resolution now spans all four trees.
- `README.md`, all tree and category indexes, `documentation/architecture.md`,
  `skills-guide.md`, `documentation/README.md`, `tests/README.md`,
  `CONTRIBUTING.md`, `CLAUDE.md`: rewritten in English.
- `CLAUDE.md` reduced to an entry point that points at the canonical
  documents instead of duplicating them, and records why it is committed.

### Fixed

- `documentation/architecture.md` carried a directory tree from before the
  1.3.0 reorganisation, showing categories at the repository root.
- `CLAUDE.md` carried the same stale tree.
- `git-workflow` and its resources embedded a real name and email address in a
  reusable skill, in `SKILL.md`, `README.md`, the pre-commit checklist and the
  worked example.
- `install.sh` used `GROUPS` as its skill group variable. `GROUPS` is a bash
  built-in array holding the current user's group ids, so the assignment was
  silently overwritten and every mode installed zero skills. Found by running
  the installer rather than by reading it. Renamed to `SKILL_GROUPS`, and all
  six modes re-verified against a sandbox target.

## 1.3.0

Reorganisation into two separate trees. No skill content changed; only paths.

### Changed

- Directory layout: the four writing categories, `resources/` and `examples/`
  moved under `writing/`; the three engineering categories and `agents/` moved
  under `engineering/`. The 392 files moved are pure renames and Git history is
  preserved.
- `README.md`: rewritten around the two trees, their categories, the minimum
  chains, the shared rules and the documentation table.
- `tests/validate-structure.sh`: resolves categories per tree, and now
  requires a `README.md` for each tree and each category.
- `tests/validate-orchestration.sh` and `install.sh`: paths adapted.
- `CLAUDE.md`, `CONTRIBUTING.md`, `CONTINUITY.md`, `documentation/*`,
  `tests/README.md`: paths prefixed with their tree.

### Added

- `writing/README.md` and `engineering/README.md`: tree indexes.
- `writing/core/README.md`, `writing/genres/README.md`,
  `writing/poetry/README.md`, `writing/quality/README.md`: category indexes,
  with order of use and a table of choice by situation. The four engineering
  categories already had theirs.

## 1.2.0

Extension of the engineering system into a full project delivery system. The
writing suite is unchanged.

### Added

- `delivery-skills/`: 10 project conduct skills, from specification to
  delivery, written in English.
  - `delivery-orchestrator`: fourteen phases, approval and verification gates,
    parallelisation, delivery checklist, verdict.
  - `requirements-analysis`, `clarification-gate`: understanding.
  - `technology-selection`, `architecture-proposal`, `validation-gate`:
    decision and approval.
  - `delivery-planning`, `implementation-integrity`,
    `scope-and-change-control`: execution.
  - `client-handover`: the takeover package.
- `devops-skills/`: 11 operations skills, platform agnostic.
  - `devops-core`, `environment-management`, `secrets-management`: foundation.
  - `containerization`, `ci-cd-pipelines`, `deployment-engineering`,
    `database-operations`: build and commissioning.
  - `observability`, `backup-recovery`, `production-verification`,
    `release-engineering`: operation.
- `agents/`: 14 specialised agent definitions and the handoff protocol. An
  agent cites skills; it copies none.
- `delivery-skills/delivery-orchestrator/resources/delivery-phases.md`: the
  fourteen phases in a machine-readable format, with their gates.
- `documentation/delivery-system.md`.
- Category indexes: `delivery-skills/README.md`, `devops-skills/README.md`,
  `agents/README.md`.

### Changed

- `tests/validate-structure.sh`: covers seven categories and 83 skills, and
  requires `Protocol` and `Interfaces` in the three engineering categories.
- `tests/validate-orchestration.sh`: from nine checks to twelve. Adds the
  fourteen delivery phases, the approval gates at phases 02, 05, 10 and 14, the
  fourteen agent definitions with their eight mandatory sections, and the
  skills cited by agents. Skill resolution now spans the three categories.
- `install.sh`: installs agents into `~/.claude/agents`, with `--agents` and
  `--no-agents`, and `CLAUDE_AGENTS_DIR` as a configurable target. Six modes
  verified.
- `CLAUDE.md`: three orchestrators and their scopes, the delivery workflow,
  the language of the new categories.
- `README.md`, `CONTRIBUTING.md`, `documentation/architecture.md`,
  `documentation/skills-guide.md`, `documentation/README.md`,
  `documentation/engineering-system.md`, `tests/README.md`, `CONTINUITY.md`:
  updated for the three new sets.

## 1.1.0

Addition of a second skill system, for software engineering. The writing suite
is unchanged.

### Added

- `dev-skills/`: 20 software engineering skills, stack agnostic, written in
  English.
  - Foundation: `engineering-core`, `project-exploration`,
    `engineering-orchestrator`.
  - Design: `architecture-design`, `ui-ux-engineering`,
    `dependency-selection`.
  - Implementation: `frontend-engineering`, `backend-engineering`,
    `fullstack-engineering`.
  - Verification: `input-validation`, `security-audit`, `debugging`,
    `testing-quality`, `playwright-automation`, `performance-engineering`,
    `code-review-protocol`.
  - Delivery: `technical-documentation`, `project-continuity`, `git-workflow`,
    `release-readiness`.
- `dev-skills/engineering-orchestrator/resources/execution-plans.md`: one
  machine-readable execution plan for each of the twenty task categories.
- `tests/validate-orchestration.sh`: nine coherence checks on the engineering
  system, including the five reference routing scenarios.
- `documentation/engineering-system.md`.
- `dev-skills/README.md`: index and reading order.
- `CONTINUITY.md`: state of the repository for whoever takes over.

### Changed

- `tests/validate-structure.sh`: covers the `dev-skills` category and
  requires, for it alone, a numbered `Protocol` section and an `Interfaces`
  section.
- `tests/validate-rules.sh`: the straight quote check ignores fenced code
  blocks, nested ones included. Warnings drop from three to one, the last being
  a deliberate typographic counter-example.
- `install.sh`: scope options `--writing` and `--dev`, combinable with `--zip`
  and `--remove`. Default installation of 62 skills.
- `.gitignore`: excludes local agent configuration and secret files.
  `CLAUDE.md` stays tracked, and the reason is written in the file.
- `CLAUDE.md`, `README.md`, `CONTRIBUTING.md`,
  `documentation/architecture.md`, `documentation/skills-guide.md`,
  `documentation/README.md`, `tests/README.md`: updated for the second system
  and the third validation script.

## 1.0.0

Initial version.

### Added

- `CLAUDE.md`: project memory, permanent rules, conventions, workflow, Git
  rules, philosophy.
- `core/writing-constitution`: founding document, typographic prohibitions,
  French dialogue conventions, flashback handling, style, characters, cultures,
  self-critique thresholds.
- 13 further `core` skills: novel-architect, chapter-architect, scene-builder,
  narrator, dialogue-master, character-psychologist, world-builder,
  immersion-director, research-director, continuity-manager, timeline-manager,
  saga-architect, screenwriter.
- 15 `genres` skills: thriller, mystery, detective, horror, fantasy,
  dark-fantasy, science-fiction, cyberpunk, historical-fiction, romance,
  adventure, dystopian, political-fiction, espionage, magical-realism.
- 5 `poetry` skills: poet, sonnet, haiku, free-verse, prose-poetry.
- 8 `quality` skills: self-critique-protocol, story-doctor, literary-editor,
  literary-critic, proofreader, beta-reader, rewriting-engine,
  publication-review.
- `resources/`: French typography, a catalogue of narrative structures,
  lexicons, project startup and tracking templates.
- `examples/saga-les-cendres-de-kivu/`: a complete demonstration project, from
  the bible to the validation report.
- `documentation/`: architecture, skills guide, writing rules, workflow.
- `tests/`: structure validation and constitution rule validation.
