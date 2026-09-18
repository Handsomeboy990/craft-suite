# documentation

Technical documentation of the eight trees, the plugins and the Control Center.
Written in English, the system language.

## Start here

| File | Contents |
|---|---|
| `usage.md`, `usage.fr.md` | what to do with the suite once it is installed: what runs it, how a skill is selected, what to say, what the gates demand |
| `overview.md`, `overview.fr.md` | the whole suite tree by tree, the long form of the README |
| `architecture.md` | repository organisation, skill isolation, metadata, dependency graph, how to extend |
| `skills-guide.md` | directory of the 166 skills, inputs, outputs, table of choice by situation |
| `installation.md` | full installation, per-tree installation, installing a single skill |
| `configuration.md` | the configuration contract, prompts, delegation, validation |

## Per tree

| File | Covers |
|---|---|
| `documents-system.md` | `documents/`: the constitution, the pipeline, the boundaries |
| `engineering-system.md` | `engineering/dev-skills`: execution chain, mandatory gates, task categories |
| `delivery-system.md` | `engineering/delivery-skills`, `engineering/devops-skills`, the fourteen phases and their approval gates |
| `agents.md` | skill against agent against orchestration, the twenty-five public contracts |
| `writing-rules.md` | the writing rules, operational form |
| `workflow.md` | the writing workflow, eleven phases, cadence, non-regression |

## For contributors

| File | Covers |
|---|---|
| `branch-protection.md` | who may write to main and dev, how to configure it, what is still not enforced |

## Distribution and dashboard

| File | Covers |
|---|---|
| `plugins.md` | the per-domain Claude Code plugins, the marketplace, how the bundles are generated |
| `control-center.md` | the optional local dashboard: what it reads, how it runs, its privacy model |

The security, research, career and opportunity trees carry their design in their
own `README.md` at the tree and category level, next to the skills.

## Architecture and agents

| File | Covers |
|---|---|
| `../docs/ROADMAP.md` | internal planning: what is left to build, phased and ordered by leverage |
| `../docs/agents/README.md` | entry point for the agent architecture: what exists, what is deferred, how to install only what is needed |
| `../docs/architecture/multi-agent-assessment.md` | historical record: what existed before that phase, what it added, what was deferred. Its figures are those of the moment it was written |
| `../docs/architecture/AGENT_ARCHITECTURE.md` | the layered architecture, the twenty-five agents by group, the contract, safety |
| `../docs/architecture/MODEL_ROUTING.md` | why model routing is shaped the way it is, and what capability it refuses to claim |
| `../docs/architecture/TOKEN_OPTIMIZATION.md` | the seam between the during-the-work discipline and the Control Center's after-the-fact measurement |
| `../docs/architecture/SKILL_AGENT_MATRIX.md` | which agents a given workflow uses, when it runs in multi-agent mode |
| `../docs/architecture/ORCHESTRATION.md` | the three orchestrators, gates, safety against runaway orchestration, completion verdicts |

## Elsewhere

| Location | Contents |
|---|---|
| `README.md`, `README.fr.md` | the two short entry points at the repository root |
| `config/README.md` | field reference for the configuration file |
| `CONTINUITY.md` | state of the repository for whoever takes over |
| `CONTRIBUTING.md` | contribution rules and the checklist before a pull request |
| `CHANGELOG.md` | version history |
| `tests/README.md` | what each validation script checks |

Each tree and each category also carries its own index, next to the skills it
describes.

## Where the boundary falls

`documentation/` is usage: what the suite is, how to install it, how to
configure it, how to use it. `docs/` is design reasoning and history: why the
architecture is shaped this way, what was assessed, what is planned. A reader
who wants to use the suite never needs `docs/`; a contributor changing its
shape needs both. See `../docs/README.md`.
