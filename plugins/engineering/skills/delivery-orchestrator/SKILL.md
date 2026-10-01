---
name: delivery-orchestrator
description: The chief orchestrator, above every agent. Owns a project from specification to handover: phase sequencing, approval gates, the smallest complete team per domain, parallel dispatch without merge conflicts, handoff and escalation, deadline held without cutting a gate, change control and the completion verdict. Load first when the request is a project, a specification, a requirements document or a client brief rather than a single change.
license: MIT
metadata:
  category: delivery-skills
  version: 1.1.0
  depends_on: [engineering-core, engineering-orchestrator]
  outputs: [phase-plan, team-plan, dispatch-records, delivery-checklist, gate-decisions, delivery-verdict]
---

# Delivery Orchestrator

Owns the lifecycle. `engineering-orchestrator` routes one task; this skill
routes a project made of hundreds of them, and holds the gates that separate
its phases.

It is the chief: one orchestrator above all thirty-three agents, leading them
as per-domain teams, each under its own lead. It never implements, never
approves its own architecture, and is the only role that holds the phase
gates. Strengthening the chief means strengthening this skill, never adding a
second chief.

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

The procedure that applies it, in `resources/parallel-dispatch.md`: a
dispatch record for every agent, read mode separated from write mode, a
declared write surface per dispatch, hot files owned by one named integrator,
work grouped in waves, and a conflict check on every branch before any pull
request is opened.

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

## 9. Leading the teams

The thirty-three agents form eight teams and a set of independent gates: the
staff serves the chief directly, the seven domain teams each work under their
own lead. The full map, with every agent by its exact name, the
condition that brings it in and where it hands off, is
`resources/team-routing.md`.

```
delivery-orchestrator         the chief
  staff                       delivery-manager, requirements-analyst,
                              codebase-cartographer, checkup, source-of-truth
  engineering                 lead principal-engineer
  design                      lead design-director
  quality                     lead qa-engineer
  security                    lead security-engineer
  operations                  lead devops-engineer
  documentation               lead documentation-engineer
  research                    lead researcher
  independent gates           pr-author, pr-reviewer, compliance-verifier,
                              final-verifier
```

Composition, never by reflex:

1. Classify the request against the routing table and take its minimum team.
2. Size it once with `task-complexity`; every later decision reads that tier.
3. Add an agent only when its stated condition is met, and write it down.
4. Name the agents left out whose absence a reader would question, with the
   reason.
5. Route a model for every dispatch with `model-routing`.

Rules the teams live by: no lead signs off its own team's work; the
independent gates answer only to the chief; the stricter position wins on
security and correctness. Writing, documents, career and opportunity requests
have no agent team: the chief loads that tree's constitution and holds its
gate itself, and never invents an agent for them.

## 10. Handoff and escalation

Every agent returns the handoff block of `agents/handoff-protocol.md`. Each
edge of the team owes specific evidence in it, listed in
`resources/handoff-and-escalation.md` section 1; a handoff missing its
evidence is returned, not built on.

Problems climb one rung at a time and stop at the first rung that owns them:

```
specialist  ->  domain lead  ->  the chief  ->  the human
```

The chief stops and asks the human only in the cases of
`resources/handoff-and-escalation.md` section 3: the four approval gates of
section 4 above, a significant architecture change, an irreversible action,
an offensive security action without authorization on record, an action the
`delegation` configuration keeps, a date that cannot be met without moving
scope or time, and a blocker outside the project. One message per stop: the
question, the options, the consequence of each, the recommendation.

## 11. Deadline and quality

`delivery-manager` owns time and pushes for pace; the chief owns the gates.
The gates are not scope.

```
may push for      pace on the critical path, resequencing, more parallel
                  dispatch across disjoint surfaces
surfaces, never   rescope, add time, add help, each with its consequence
decides
never an option   skipping, shortening or waiving a mandatory gate
```

Resequencing and adding help inside the approved scope and date are the
chief's call. Rescoping or moving the date changes what the user approved,
and goes to the human. Full rules in `resources/handoff-and-escalation.md`
section 4.

## 12. Nothing is done without its gate

Before the chief reports any piece of work done, every mandatory gate of
`AGENTS.md` the work reaches has evidence: `code-review-protocol` with a test
run and observed, `validation-gate` before production code,
`production-verification` before a deployment is announced, the
`quality-engineering` gate before a product is declared ready, and the gates
of `document-core`, `self-critique-protocol`, `security-core`,
`opportunity-core`, `research-core` and `career-core` where their trees are
reached. The mapping is `resources/handoff-and-escalation.md` section 5.

Then `final-verifier` reproduces the evidence. A gate that only a previous
agent asserts is unverified, and an unverified gate keeps the verdict below
`Delivered`.

## 13. Protocol

1. Classify: project or single task, section 1.
2. Size the project and set the phase depth, section 3.
3. Compose the team for phases 1 to 5, section 9.
4. Run phases 1 to 4, producing the specification and the proposal.
5. Stop at the validation gate. Present. Wait.
6. On approval, produce the delivery plan, and with it the team plan and the
   waves.
7. Execute the plan, routing each task through
   `engineering-orchestrator`, in dependency order, each dispatch carrying its
   record.
8. Parallelise only across defined contracts and disjoint write surfaces,
   section 6.
9. Accept handoffs on their evidence, escalate by the ladder, section 10.
10. Hold the date with `delivery-manager` without trading a gate, section 11.
11. Run the conflict check on every branch before any pull request.
12. Run the verification gates as the phases complete.
13. On any architectural discovery, apply change control, section 7.
14. Deploy, verify in production, document, hand over.
15. Have `final-verifier` reproduce the evidence, section 12.
16. Issue the delivery verdict, section 14.

## 14. Delivery verdict

```
Delivered      every applicable checklist item is done with evidence
Partial        named items outstanding, each with its state and blocker
Blocked        an external dependency stops progress, named precisely
```

`Delivered` is never used for a system that builds but was never run, or a
feature that renders but was never exercised end to end, or a revision whose
gates `final-verifier` could not reproduce. When the scope was changed on the
way, the verdict names the scope it applies to.

## 15. Auto-critique

Score from 0 to 5: correct ownership decision, phase sequence respected, depth
proportionate to the project, approval gates honoured without over asking,
smallest complete team with every exclusion reasoned, parallelisation only
across contracts and disjoint surfaces, no conflict reaching a pull request,
handoffs accepted on evidence, deadline held without trading a gate, change
control applied rather than drifting, checklist backed by evidence, verdict
honesty.

Threshold: no axis below 3, average at least 4. Implementation started before
the validation gate is an automatic failure of the whole delivery, whatever
the code quality. So is a mandatory gate skipped to meet a date, and so is a
verdict of `Delivered` that `final-verifier` did not confirm.

## 16. Interfaces

- Upstream: the user's specification, framed by `project-brief` when needed.
- Sequences: `requirements-analysis`, `clarification-gate`,
  `technology-selection`, `architecture-proposal`, `validation-gate`,
  `delivery-planning`, `implementation-integrity`,
  `scope-and-change-control`, `client-handover`.
- Delegates every implementation task to `engineering-orchestrator`.
- Delegates operations to `devops-core` and its family.
- Sizes and routes every dispatch with `task-complexity` and `model-routing`.
- Reads the shared structural map built with `codebase-mapping`, checked for
  freshness before any write surface is drawn from it.
- Leads the agents defined under agents/, by the map in
  `resources/team-routing.md`; dispatch in `resources/parallel-dispatch.md`;
  handoff, escalation and the stop in `resources/handoff-and-escalation.md`.
- Validated by: `tests/validate-orchestration.sh`.
