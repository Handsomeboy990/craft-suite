---
name: delivery-orchestrator
description: Owns a project from specification to handover: phase sequencing, approval gates, delivery checklist, parallelisation decisions, change control and completion verdict. Load first when the request is a project, a specification, a requirements document or a client brief rather than a single change.
license: MIT
metadata:
  category: delivery-skills
  version: 1.0.0
  depends_on: [engineering-core, engineering-orchestrator]
  outputs: [phase-plan, delivery-checklist, gate-decisions, delivery-verdict]
---

# Delivery Orchestrator

Owns the lifecycle. `engineering-orchestrator` routes one task; this skill
routes a project made of hundreds of them, and holds the gates that separate
its phases.

Two failure modes define the job: starting to code before the architecture is
approved, and asking the user to approve every file after it is.

## 1. When this skill owns the work

| Input | Owner |
|---|---|
| a specification, brief, PRD, feature list, client requirements | this skill |
| a project to build from nothing | this skill |
| an existing project plus a substantial feature set | this skill |
| one feature, one bug, one review, one refactor | `engineering-orchestrator` |

When in doubt, count the approval gates. Work that needs an architecture
decision the user must accept belongs here.

## 2. The phases

Canonical sequence in `resources/delivery-phases.md`, machine checkable. Depth
adapts to the project; the sequence does not reorder.

```
1  requirements-analysis      raw input becomes an engineering specification
2  clarification-gate         blockers resolved, assumptions recorded
3  technology-selection       stack decided with alternatives and trade-offs
4  architecture-proposal      the formal proposal, nine sections
5  validation-gate            USER APPROVAL, hard stop
6  delivery-planning          work breakdown into atomic tasks
7  implementation             the engineering suite, task by task
8  integration-verification   the layers actually work together
9  devops                     environments, pipeline, deployment path
10 deployment                 the system runs where it is meant to run
11 production-verification    the deployed system is tested, not assumed
12 documentation              matches what was built
13 handover                   another team can take it over
14 release                    the go or no go verdict
```

Phases 1 to 5 are sequential and cheap. Phase 7 is where the time goes. Phases
8 to 14 are where projects that looked finished turn out not to be.

## 3. Phase depth

Depth adapts, presence does not. A phase is never skipped; it is sized.

| Project size | Signal | Phase 1 to 6 budget |
|---|---|---|
| small | one surface, no new integration, under a week | a page total |
| medium | several modules, one or two integrations | three to five pages |
| large | multiple surfaces, external systems, migrations | a document per architecture section |

A small project still passes the validation gate. The proposal is one page,
and it is still approved before code is written.

## 4. Gates

Three kinds. They are not the same and are not treated the same.

**Approval gates.** Stop, present, wait for a human answer.

| Gate | Phase | What is approved |
|---|---|---|
| clarification | 2 | answers to blocking questions, or the stated assumptions |
| validation | 5 | architecture, stack, scope, risks |
| change | any | a departure from the approved architecture |
| irreversible action | any | destructive migration, production data operation, recurring cost |

**Verification gates.** No human needed. The gate passes on evidence.

| Gate | Passes when |
|---|---|
| integration | every layer of every feature was exercised together |
| security | `security-audit` ran on the applicable surfaces, findings fixed |
| test | the suite runs and passes, negative cases included |
| production | the deployed system answered a real request |

**Quality gates.** Delegated to the engineering suite: `code-review-protocol`,
`testing-quality`, `performance-engineering`, `ui-ux-engineering`.

## 5. What never requires approval

Asking about these wastes the user's attention and slows delivery:

file creation, function naming, test creation, obvious bug fixes, formatting,
standard refactoring, documentation updates, atomic commits, dependency
updates already covered by the approved stack, running the test suite,
running a linter, fixing a failure the agent caused.

After phase 5, the agent executes. It reports at phase boundaries, not at
every step.

## 6. Parallelisation

Parallel work requires a defined contract between the parallel parts.

| Safe | Why |
|---|---|
| frontend and backend after the API contract is fixed | the contract is the synchronisation point |
| several independent feature modules | no shared file, no shared schema change |
| documentation and implementation of a settled area | one reads, one writes elsewhere |
| test writing and implementation of a different module | no overlap |

| Unsafe | Why |
|---|---|
| frontend before the data contract exists | the UI encodes a guess |
| two tasks touching the same migration | ordering is undefined |
| a feature and the refactor of the module it uses | conflict guaranteed |
| security audit of code still being written | the audit target moves |
| two review-and-fix agents on the same files | both hold a write surface neither knows about |

The rule: parallelise across a contract, never across an unknown.

### Reviewers in parallel

Two reviewers reading the same diff is the most useful parallel pairing there
is, and the easiest to get wrong, because a review that may also fix what it
finds is not a read. The contract that makes it safe is the write surface,
and it is stated before dispatch, never assumed:

```
safe     both reviewers read only, and report findings for one writer to
         apply afterwards
safe     each reviewer may write, and their file surfaces are disjoint and
         named in the dispatch
unsafe   both reviewers may write to the same file, in any arrangement
```

The third line has no mitigation and no exception. A reviewer that discovers
a concurrent edit mid-review cannot tell a colleague's correct fix from a
corrupted read of its own, and the honest ones will say so in `Known issues`
rather than claim the review was clean. When two reviewers must both fix the
same files, they are sequenced: the second starts from the first's committed
or handed-off state, not from a moving one.

## 7. Change control

Implementation that contradicts the approved architecture is a stop, not an
adjustment. Protocol in `scope-and-change-control`.

Short form: stop the affected path, state the discovery, propose the change
with its consequences, ask when the change is significant, update the
architecture document, resume.

Silent drift is the failure this rule exists to prevent. Six weeks later
nobody can tell which document describes the system.

## 8. Delivery checklist

Maintained continuously, in `resources/delivery-checklist.md`. Every item is
`done` with evidence, `not applicable` with a reason, or `pending`.

A checkbox is never marked from intention. `Tests written` is not `tests
pass`. `Deployed` is not `verified in production`.

## 9. Protocol

1. Classify: project or single task, section 1.
2. Size the project and set the phase depth, section 3.
3. Run phases 1 to 4, producing the specification and the proposal.
4. Stop at the validation gate. Present. Wait.
5. On approval, produce the delivery plan.
6. Execute the plan, routing each task through
   `engineering-orchestrator`, in dependency order.
7. Parallelise only across defined contracts, section 6.
8. Run the verification gates as the phases complete.
9. On any architectural discovery, apply change control, section 7.
10. Deploy, verify in production, document, hand over.
11. Issue the delivery verdict, section 10.

## 10. Delivery verdict

```
Delivered      every applicable checklist item is done with evidence
Partial        named items outstanding, each with its state and blocker
Blocked        an external dependency stops progress, named precisely
```

`Delivered` is never used for a system that builds but was never run, or a
feature that renders but was never exercised end to end.

## 11. Auto-critique

Score from 0 to 5: correct ownership decision, phase sequence respected, depth
proportionate to the project, approval gates honoured without over asking,
parallelisation only across contracts, change control applied rather than
drifting, checklist backed by evidence, verdict honesty.

Threshold: no axis below 3, average at least 4. Implementation started before
the validation gate is an automatic failure of the whole delivery, whatever
the code quality.

## 12. Interfaces

- Upstream: the user's specification.
- Sequences: `requirements-analysis`, `clarification-gate`,
  `technology-selection`, `architecture-proposal`, `validation-gate`,
  `delivery-planning`, `implementation-integrity`,
  `scope-and-change-control`, `client-handover`.
- Delegates every implementation task to `engineering-orchestrator`.
- Delegates operations to `devops-core` and its family.
- Validated by: `tests/validate-orchestration.sh`.
