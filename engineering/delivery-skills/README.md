# delivery-skills

Project delivery system. Eleven skills that take a specification, brief, PRD or
client requirement to a delivered, verified, documented system.

Where `dev-skills` answers how a change is made correctly, this category
answers what gets built, in what order, with whose approval, and when it is
genuinely finished.

## Language

English, for the reason stated in `dev-skills/README.md`: these skills produce
architecture documents, commit messages and technical documentation that are
English by the rule in `engineering-core` section 6. The repository
constitution still applies to every file: no emoji, no em dash.

## The skills

### Lifecycle

| Skill | Responsibility |
|---|---|
| `delivery-orchestrator` | phases, gates, parallelisation, delivery checklist, verdict |

### Understanding

| Skill | Responsibility |
|---|---|
| `requirements-analysis` | raw input into an engineering specification |
| `clarification-gate` | what must be asked, what may be assumed |

### Deciding

| Skill | Responsibility |
|---|---|
| `technology-selection` | the stack, with alternatives and trade-offs |
| `architecture-proposal` | the nine section proposal, the technical contract |
| `validation-gate` | the hard stop before implementation |

### Executing

| Skill | Responsibility |
|---|---|
| `delivery-planning` | milestones and atomic tasks in dependency order |
| `implementation-integrity` | no fake functionality on any reachable path |
| `scope-and-change-control` | no silent scope growth, no silent architecture drift |

### Launching

| Skill | Responsibility |
|---|---|
| `launch-readiness` | the completeness gate for a user-facing web product |

### Delivering

| Skill | Responsibility |
|---|---|
| `client-handover` | the package another team can take over |

## The phase sequence

```
requirements-analysis
  -> clarification-gate                 APPROVAL
  -> technology-selection
  -> architecture-proposal
  -> validation-gate                    APPROVAL, hard stop
  -> delivery-planning
  -> implementation                     via engineering-orchestrator
  -> integration-verification
  -> devops                             via devops-skills
  -> deployment                         APPROVAL
  -> production-verification
  -> documentation
  -> handover
  -> release                            APPROVAL
```

Fourteen phases, defined in
`delivery-orchestrator/resources/delivery-phases.md` in a machine checkable
format. Depth is sized to the project; no phase is skipped without a written
reason, and phase 5 never is.

## The two rules that shape everything

**No production code before the validation gate.** Scaffolding included.
Everything before the gate is cheap to change; everything after it is not.

**No permission asking after it.** Once the architecture is approved, the
system executes and reports at phase boundaries. Interrupting for file names
and test structure converts one considered decision into a stream of small
ones.

## Interaction with the other categories

```
delivery-skills     what gets built, in what order, with whose approval
dev-skills          how each change is made correctly
devops-skills       how it runs, deploys and recovers
```

The delivery orchestrator routes every implementation task through
`engineering-orchestrator` and every operational task through `devops-core`.
It does not duplicate their content.

## Validation

```
bash tests/validate-structure.sh
bash tests/validate-rules.sh
bash tests/validate-orchestration.sh
```

The third script checks the phase sequence, the gate placement, the skill
references in each phase, and that no phase names a skill that does not exist.
