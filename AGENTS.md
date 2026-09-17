# AGENTS.md

Entry point for an agent working on this repository. Read it before any
modification.

This file is deliberately short and holds no duplicated content. It points at
the canonical documents and states only the rules an agent must know before it
touches anything.

It is named `AGENTS.md` rather than after any single vendor. No file named
after an agent runtime is tracked here: those are local configuration and they
are ignored. See `Why this file exists` at the end.

## What this repository is

Craft Suite: 158 skills and 19 agents, in eight trees. Named
`claude-writer-suite` until 3.0.0, when the writing tree stopped being the
whole of it.

| Tree | Contents | Constitution |
|---|---|---|
| `shared/` | 2 cross domain skills | none, they depend on nothing |
| `writing/` | 42 creative writing skills | `writing/core/writing-constitution` |
| `documents/` | 7 professional document skills | `documents/documentation/document-core` |
| `engineering/` | 75 software skills | `engineering/dev-skills/engineering-core` and `engineering/devops-skills/devops-core` |
| `agents/` | 19 role definitions, repository wide | none, defined once per role |
| `security/` | 11 defensive security skills | `security/secure-development/security-core` |
| `research/` | 5 general research skills | `research/research-core` |
| `career/` | 7 job search and application skills | `career/career-core` |
| `opportunity/` | 9 ideation, hackathon and business skills | `opportunity/ideation/opportunity-core` |

Full picture: `README.md`. Architecture: `documentation/architecture.md`.

## Routing

Determine the nature of the request before acting, then load the governing
skill. Never run a whole chain by reflex: compose the smallest complete plan.

| Request | Load first |
|---|---|
| Any significant project, or taking one over | `project-brief` |
| Fiction, poetry, screenplay, text revision | `writing-constitution` |
| A delivered document, report, letter, manual, PDF | `document-core` |
| A single coding task: feature, bug, review, refactor | `engineering-orchestrator` |
| A specification, brief or client request | `delivery-orchestrator` |
| Environment, pipeline, deployment, production database, secret | `devops-core` |
| Validating a whole product, or a QA campaign | `quality-engineering` |
| A degraded production system | `incident-response` |
| Threat modeling, a security audit, or hardening | `security-core` |
| Active testing under written authorization | `authorized-pentesting` |
| Researching a question with real, cited sources | `research-core` |
| A job search, CV, cover letter or interview prep | `career-core` |
| Generating and evaluating ideas | `opportunity-core` |
| Finding or winning a hackathon | `hackathon-discovery` |
| Finding clients or sizing a market | `client-discovery` |
| Anything just finished | `self-critique` |

`engineering-orchestrator` loads `engineering-core` then selects the rest.
`delivery-orchestrator` holds the approval gates of the fourteen phases.

## Mandatory gates

- Writing: no text is finished before `self-critique-protocol`, then at least
  one revision skill.
- Documents: no document is delivered before the eight-point gate of
  `document-core`, eleven when it is paginated.
- Code: no task is finished before `code-review-protocol`, with a test run and
  observed.
- Project: no production code before `validation-gate`, scaffolding included.
- Deployment: nothing is announced as delivered before
  `production-verification`.
- Campaign: no product is declared ready before the twelve point gate of
  `quality-engineering`.
- Security: no offensive action without written, specific, in-scope
  authorization on record; no audit concludes a system is secure. `security-core`.
- Opportunity: no long list is a deliverable; discover, evaluate, then
  recommend a ranked few with reasoning. `opportunity-core`.
- Research and career: a source, a listing, a deadline or a market figure is
  cited from a live source or withheld, never invented. `research-core`,
  `career-core`.

## Permanent rules

1. No emoji, in any file or any output.
2. No em dash. The en dash is for dialogue only.
3. Skill language is English, for all 158 skills and all 19 agents. Output
   language is the recipient's, set in the configuration. The three layers are
   defined in `documentation/configuration.md`.
4. Commits are atomic, in English, with no mention of an AI, an assistant or
   `Co-authored-by`. Full procedure in `git-workflow`.
5. Never commit a `.env`, a private key, a certificate or a credential.
6. Never commit local agent configuration: `.claude/`, `CLAUDE.md`, or any
   equivalent named after a runtime. `tests/validate-rules.sh` check 7
   enforces it.
7. Never hardcode a user specific value. It belongs in the configuration; the
   field reference is `config/README.md`.

## Delegation

What an agent may do on its own is set by the `delegation` section of the
configuration: commits, branches, push, pull requests, release tags,
deployments, database operations, dependency changes.

Anything the user kept is prepared and handed over with its command, never
performed anyway, and never silently skipped. `git-workflow` section 2 holds
the contract.

## Working on this repository

Before any modification:

1. Read this file.
2. Read the constitution of the tree concerned.
3. Check consistency with `documentation/architecture.md`, and with the
   system document for the tree: `documents-system.md`,
   `engineering-system.md`, `delivery-system.md`.
4. Run the five scripts in `tests/`. If you changed a skill tree, run
   `bash plugins/build.sh` so the plugin bundles stay in sync.
5. Commit atomically, in English.

Contribution rules and the pre-pull-request checklist: `CONTRIBUTING.md`.
State of the repository for whoever takes over: `CONTINUITY.md`.

## Why this file exists, and why it is not named after a runtime

An agent needs one file to read first. That file belongs in version control:
it is the public memory of the project, it contains no secret and no machine
local setting, and every contributor benefits from it.

Files named after a specific agent runtime are the opposite: they are local
configuration, they differ per machine and per user, and rule 6 forbids
tracking them. A local file of that kind may exist on a contributor's machine
and should contain nothing more than a pointer to this document.

Ignored, and never tracked: `.claude/`, `CLAUDE.md`, `*.local`, and every
secret pattern listed in `.gitignore`.
