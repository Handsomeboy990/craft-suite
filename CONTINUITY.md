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

## Current state

Working today:

- the five scripts pass: 155 skills, 0 errors, 1 pre-existing warning on a
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

## Remaining

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
- After moving any directory, run all five scripts: some of them resolve paths
  and fail cleanly by naming what is missing.
