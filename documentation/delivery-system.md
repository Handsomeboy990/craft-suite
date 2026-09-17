# The project delivery system

Technical documentation of `engineering/delivery-skills`,
`engineering/devops-skills` and the agents in `agents/`.

## 1. Purpose

Take a specification, a brief, a PRD, a feature list or a client request, and
deliver a system that is implemented, tested, documented, deployed and
verified in production.

The engineering layer, `engineering/dev-skills`, answers one question: how a
change is made correctly. This system answers three others: what to build, in
what order and with what approval; how the system runs, deploys and restores;
and who owns each part of the work.

## 2. The three layers

```
delivery-skills   what to build, in what order, with what approval
dev-skills        how each change is made correctly
devops-skills     how the system runs, deploys and restores
agents            who owns what, and what is handed on
```

No layer copies the content of another. `delivery-orchestrator` delegates each
implementation task to `engineering-orchestrator` and each operational task to
`devops-core`.

`shared/project-brief` sits before phase 01: it frames the request and
produces the working agreement that `requirements-analysis` then turns into an
engineering specification.

## 3. The fourteen phases

Defined in
`engineering/delivery-skills/delivery-orchestrator/resources/delivery-phases.md`,
in a machine-readable format.

| # | Phase | Gate |
|---|---|---|
| 01 | requirements-analysis | none |
| 02 | clarification | approval |
| 03 | technology-selection | none |
| 04 | architecture-proposal | none |
| 05 | validation | approval, firm stop |
| 06 | delivery-planning | none |
| 07 | implementation | verification |
| 08 | integration-verification | verification |
| 09 | devops | verification |
| 10 | deployment | approval |
| 11 | production-verification | verification |
| 12 | documentation | none |
| 13 | handover | none |
| 14 | release | approval |

The depth of each phase adapts to the project. No phase is removed without a
written reason, and phase 05 is never removed.

## 4. The three kinds of gate

**Approval.** The system stops and waits for a human answer. Four occurrences:
clarification, architecture validation, first deployment, release. Plus any
irreversible action.

**Verification.** No human required; the gate opens on evidence: integration
exercised, security audit passed, test suite executed, a deployed system
having answered a real request.

**Quality.** Delegated to the engineering layer: `code-review-protocol`,
`testing-quality`, `performance-engineering`, `ui-ux-engineering`.

The `delegation` section of the configuration sits on top of all three. A user
who kept deployments does not receive a deployment at phase 10; they receive
the artefact, the migrations and the variable list, plus the step named in
`craft-manual-tasks.md`.

## 5. The two structural rules

**No production code before the validation gate.** Project scaffolding
included. Everything before the gate is cheap to change; everything after is
not.

**No permission requests after it.** Once the architecture is approved, the
system executes and reports at phase boundaries. Interrupting the user for a
filename or a test layout turns one considered decision into a stream of small
ones, which is exactly what the gate exists to prevent.

## 6. delivery-skills, eleven skills

| Skill | Responsibility |
|---|---|
| `delivery-orchestrator` | phases, gates, parallelisation, checklist, verdict |
| `requirements-analysis` | raw input into an engineering specification |
| `clarification-gate` | what must be asked, what can be assumed |
| `technology-selection` | the stack, with alternatives and trade-offs |
| `architecture-proposal` | the nine-section proposal, the technical contract |
| `validation-gate` | the firm stop before implementation |
| `delivery-planning` | milestones and ordered atomic tasks |
| `implementation-integrity` | no fake functionality on a reachable path |
| `scope-and-change-control` | neither scope drift nor architecture drift |
| `launch-readiness` | the completeness gate for a user-facing web product |
| `client-handover` | the package another team can take over |

## 7. devops-skills, fourteen skills

| Skill | Responsibility |
|---|---|
| `devops-core` | environment ladder, configuration, blast radius |
| `environment-management` | the variable inventory and drift checks |
| `secrets-management` | credential lifecycle, rotation, leak handling |
| `infrastructure-as-code` | infrastructure in code: state, plans, drift, imports |
| `containerization` | whether a container is warranted, and how to build it |
| `ci-cd-pipelines` | a pipeline that fails for the right reasons |
| `deployment-engineering` | getting a verified artefact running |
| `database-operations` | migrations, locks, backfills, data safety |
| `observability` | logs, health, metrics, alerts, redaction |
| `backup-recovery` | an unrestored backup is a hypothesis |
| `production-verification` | proving the deployed system works |
| `release-engineering` | versions, tags, changelog, progressive rollout |
| `incident-response` | declaration to postmortem, mitigation before diagnosis |
| `workflow-automation` | opt-in workflows through an external engine like n8n |

## 8. The agents

Twenty-one roles, defined in `agents/`, grouped by kind of work: `core`,
`development`, `design`, `security`, `testing`, `documentation`, `devops`. An
agent is thin by design:
the expertise lives in the skills, the agent decides which apply, executes
within its boundary, and hands off through a durable artefact.

```
                       delivery-orchestrator
                                |
        +---------------+-------+-------+---------------+
        |               |               |               |
   requirements-    software-       security-       devops-
     analyst        architect       engineer        engineer
        |               |               |               |
        +-------+-------+       +-------+-------+       |
                |               |               |       |
          frontend-        backend-        database-    |
          engineer         engineer        engineer     |
                |               |               |       |
          ui-ux-           performance-    playwright-  |
          engineer         engineer        engineer     |
                |               |               |       |
                +-------+-------+-------+-------+-------+
                        |
                   qa-engineer
                        |
              documentation-engineer
                        |
                 release-engineer
```

The lines are handoff paths, not a chain of command. Every agent reports to
the orchestrator, which holds the gates.

### Review gates

No agent is the sole judge of its own critical work.

```
frontend-engineer   -> qa-engineer, ui-ux-engineer, code review
backend-engineer    -> security-engineer, qa-engineer, code review
database-engineer   -> backend-engineer, performance-engineer, release-engineer
devops-engineer     -> security-engineer, release-engineer
security-engineer   -> qa-engineer, for the tests encoding each fix
```

### Handoff

Every agent finishes with the block from
`agents/handoff-protocol.md`: Completed, Changed, Decisions,
Verified, Known issues, Next action, For. Nothing important travels through
conversational context alone, because the next agent may start with none.

### Location and installation

The definitions live in `agents/<group>/`, tracked, rather than in
`.claude/agents/`, because `.claude/` is local machine configuration and is
never tracked. The installer copies them where the runtime expects them.

```bash
bash install.sh --agents      copies the agents to ~/.claude/agents
bash install.sh               skills and agents together
bash install.sh --no-agents   skills only
```

Per-agent public contracts: `agents.md`.

## 9. Parallelisation

Parallel work requires a defined contract between the parallel parts.

| Safe | Why |
|---|---|
| frontend and backend once the API contract is fixed | the contract is the synchronisation point |
| several independent feature modules | no shared file or schema |
| documenting a stabilised area while implementing elsewhere | one reads, the other writes elsewhere |

| Risky | Why |
|---|---|
| frontend before the data contract exists | the interface encodes a guess |
| two tasks touching the same migration | the order is undefined |
| a feature and the refactor of the module it uses | guaranteed conflict |
| a security audit of code still being written | the target moves |

Rule: parallelise across a contract, never across an unknown.

## 10. Validation

```bash
bash tests/validate-structure.sh      structure and metadata of the 160 skills
bash tests/validate-rules.sh          the repository-wide prohibitions
bash tests/validate-orchestration.sh  thirteen coherence checks
bash tests/validate-plugins.sh        plugin bundles in sync with the trees
bash tests/validate-model-routing.sh  routing fixtures against the tier table
```

The third script covers:

1. the system files, including the category indexes and the handoff protocol;
2. one classification and one plan per task category;
3. every plan step naming a real skill, in any tree;
4. mandatory gates and plan ordering;
5. the five reference routing scenarios;
6. the fourteen delivery phases: sequential numbering, existing skills,
   approval gates at phases 02, 05, 10 and 14;
7. no orphan engineering skill, absent from every plan and phase;
8. every `depends_on` naming an existing skill, in every tree;
9. every `Interfaces` cross reference existing, in every procedural tree;
10. the twenty-one agents, with their metadata and eight mandatory sections;
11. every skill cited by an agent existing;
12. the document pipeline: `document-core` declared as a dependency, design
    before production;
13. `shared/` depending on nothing, so every tree can call it.

## 11. Extending

Adding a delivery or operations skill:

1. create the directory in `engineering/delivery-skills/` or
   `engineering/devops-skills/` with its four mandatory elements;
2. declare the matching category in the metadata;
3. refer to its constitution without copying it: `engineering-core` for all,
   `devops-core` additionally for operations;
4. include a numbered `Protocol` section, an `Auto-critique` section and an
   `Interfaces` section;
5. add it to at least one execution plan or delivery phase, or check 7 reports
   it as an orphan;
6. update its category index, `skills-guide.md` and this file;
7. run the five validation scripts.

Adding an agent: the file in `agents/<group>/`, the eight mandatory
sections, an entry in `agents/README.md`, and its name added to
the expected list in `tests/validate-orchestration.sh`.
