# engineering

Software engineering and project delivery. 82 skills in three categories, plus
16 specialised agents defined at the repository root in `agents/`.

## Categories

| Category | Skills | Question it answers |
|---|---|---|
| [dev-skills](dev-skills/) | 55 | how a change is made correctly |
| [delivery-skills](delivery-skills/) | 10 | what to build, in what order, with what approval |
| [devops-skills](devops-skills/) | 16 | how the system runs, deploys and restores |

Each has its own index. The agents are not a category of this tree: they are
a repository wide layer, defined once and available to every domain that
needs subagent execution. See [agents](../agents/).

## The two constitutions

```
dev-skills/engineering-core     the eight laws, the evidence rule, the
                                certainty vocabulary, the definition of done
devops-skills/devops-core       the environment ladder, configuration, blast
                                radius, the destructive action protocol
```

No skill restates its constitution: it refers to it. No agent restates a
skill: it cites it.

## Three orchestrators, three scopes

| Orchestrator | Owns | Loads when |
|---|---|---|
| `delivery-skills/delivery-orchestrator` | a whole project | the input is a specification, a brief, a client request |
| `dev-skills/engineering-orchestrator` | one task | the input is a feature, a defect, a review |
| `devops-skills/devops-core` | anything that runs | any operation on an environment |

The first delegates to the second for each implementation task, and to the
third for each operation.

## Chain of one task

```
engineering-core  ->  engineering-orchestrator  ->  project-exploration
        ->  the selected skills, in order
        ->  the mandatory gates
        ->  completion verdict
```

The orchestrator composes the smallest complete plan: a typo fix takes four
steps, a payment endpoint takes eleven. The canonical plans are in
`dev-skills/engineering-orchestrator/resources/execution-plans.md`.

## Chain of one project

```
requirements-analysis  ->  clarification-gate          APPROVAL
        ->  technology-selection  ->  architecture-proposal
        ->  validation-gate                            APPROVAL, firm stop
        ->  delivery-planning  ->  implementation
        ->  integration-verification  ->  devops
        ->  deployment                                 APPROVAL
        ->  production-verification  ->  documentation
        ->  handover  ->  release                      APPROVAL
```

Fourteen phases, defined in
`delivery-skills/delivery-orchestrator/resources/delivery-phases.md`.

Two structural rules: no production code before the validation gate,
scaffolding included; and no further permission requests after it, for work
inside the approved scope.

## Mandatory gates

Never abandoned to save time.

| Gate | Applies when |
|---|---|
| exploration before decision | unread code is touched |
| validation before persistence | an external input reaches storage or an effect |
| authorization before exposure | a route or a query returns a user's data |
| security review before merge | auth, payments, uploads, user content, permissions, secrets, dependencies |
| test before done | any behaviour change |
| review before delivery | any code written by the agent |
| continuity before handover | any session that changed the repository |
| author check before commit | every commit |

## Delegation

What the agent does on its own is set by the `delegation` section of the
configuration: commits, branches, push, pull requests, release tags,
deployments, database operations, dependency changes.

Anything the user keeps is handed over rather than performed, with its
command, and listed in `craft-manual-tasks.md` next to the
configuration file. `git-workflow` section 2 carries the contract.

Two rules are never delegated: a destructive operation is counted and
confirmed before it runs, and a leaked secret is reported for rotation rather
than quietly removed.

## What the system refuses

One line per category, because these refusals are what distinguishes this
system from a code assistant.

```
guessing anything the repository can establish
asserting without having run it
leaving fake functionality on a reachable path
writing production code before the architecture is approved
weakening a test to obtain a green pipeline
hardcoding a value that varies by environment
running a destructive statement without counting the rows first
declaring a deployment successful without exercising a journey
announcing backups without saying whether a restore was tested
attributing a commit to a tool
```

## Agnosticism

No skill assumes a framework, a database, an authentication mechanism, a
directory layout or a hosting platform. Each reads the project it is given.

## Installation

```bash
bash install.sh --dev         the 82 engineering skills and the 22 agents
bash install.sh --agents      the 22 agents only
bash install.sh --no-agents   skills without agents
```

Skills go to `~/.claude/skills`, agents to `~/.claude/agents`.

## Documentation

- `documentation/engineering-system.md`: the `dev-skills` layer in detail.
- `documentation/delivery-system.md`: `delivery-skills`, `devops-skills` and
  the agents.
- `documentation/agents.md`: skill against agent against orchestration.
- `documentation/configuration.md`: the configuration contract.

## Relation to the other trees

None, beyond the two typographic prohibitions and the shared Git rules. No
engineering skill depends on a writing or a documents skill.

The two cross domain skills apply here as everywhere: `shared/project-brief`
frames a project before `requirements-analysis` deepens it, and
`shared/self-critique` delegates to `code-review-protocol` and
`security-audit` while keeping the one check no domain reviewer performs,
whether the user was actually answered.
