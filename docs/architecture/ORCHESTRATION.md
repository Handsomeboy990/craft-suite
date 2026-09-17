# Orchestration architecture

Three orchestrators, three distinct scopes, none of them a duplicate of
another. This document is the map between them; each one's actual protocol
is in its own `SKILL.md`, referenced rather than restated.

## The three scopes

| Orchestrator | Owns | Loads when |
|---|---|---|
| `delivery-orchestrator` | a project's whole lifecycle, fourteen phases | the input is a specification, a brief, a client request, or a project built from nothing |
| `principal-engineer` (agent) | a request spanning several surfaces, not a full delivery | the right sequence of specialists is unclear, or they disagree |
| `engineering-orchestrator` | one task | a feature, a defect, a review, a refactor |

`delivery-orchestrator` delegates each implementation task inside its phase
07 to `engineering-orchestrator`, and each operational task to
`devops-core`. Neither of the other two re-derives the fourteen phases or the
thirty-seven task categories; each reads the one it needs and stops.

## What every orchestration workflow declares

The source material for this work required eight explicit properties on
every orchestration workflow. Column by column, where each already lives:

| Property | Where it is declared |
|---|---|
| Responsibilities | `SKILL.md` section "When this skill owns the work" (delivery) or the classification table (engineering) |
| Inputs | the request, plus `project-exploration`'s output at the depth its own section 2 sets |
| Outputs | `delivery-orchestrator`: phase plan, checklist, gate decisions, verdict. `engineering-orchestrator`: classification, execution plan, gates, verdict |
| Dependencies | `depends_on` in each skill's metadata block, resolved and checked by `tests/validate-orchestration.sh` check 8 |
| Authority | `delivery-orchestrator` holds the four approval gates; `engineering-orchestrator` holds the mandatory gates of its section 4; neither an agent nor a skill overrides these unilaterally |
| Validation criteria | `delivery-orchestrator` section 8, the delivery checklist; `engineering-orchestrator` section 7, the completion verdict |
| Escalation conditions | `delivery-orchestrator` section 7, change control; `engineering-orchestrator` section 1 step 8, re-planning; both now also trigger a `model-routing` escalation per the same event, see `MODEL_ROUTING.md` |
| Retry and termination | `engineering-orchestrator` section 6, anti-loop rules, detailed below |

## Gates, by kind

`delivery-orchestrator` section 4 names three kinds, and they are not
interchangeable:

```
Approval        stops, presents, waits for a human answer
                clarification (phase 02), validation (phase 05, firm stop),
                change (any phase), irreversible action (any phase)

Verification    no human needed, passes on evidence
                integration exercised, security audit passed and fixed,
                test suite executed and passing, a deployed system having
                actually answered a real request

Quality         delegated to the engineering layer
                code-review-protocol, testing-quality,
                performance-engineering, ui-ux-engineering
```

`engineering-orchestrator` section 4 adds eight mandatory gates that are
never dropped to save time: exploration before decision, validation before
persistence, authorization before exposure, security review before merge,
test before done, review before delivery, continuity before handoff, author
check before commit. Dropping one is treated as a defect in the plan, not an
optimisation, in both orchestrators alike.

## Safety against runaway orchestration

All five properties the source material asked for exist today, in
`engineering-orchestrator` section 6, and are not restated with different
numbers here:

```
max repetition       a skill runs at most twice per task; the second run
                     states what changed since the first
no re-litigation     a finding rejected once is not re-raised in the same
                     form
conflict resolution  the stricter skill wins for security and correctness,
                     the project convention wins for style
no redundant work    verification is not repeated when its inputs are
                     unchanged
termination          a plan producing no progress twice in a row stops and
                     reports the exact blocker rather than cycling
```

`token-optimization` supports these rules during execution; it does not
replace them, and does not loosen them for the sake of using fewer tokens,
per its own section 2.

Circular delegation is prevented structurally rather than by a runtime
check: `engineering-orchestrator` section 5 explicitly excludes itself,
recursively, from its own plan, one orchestration per request, re-planned in
place rather than nested. `delivery-orchestrator` delegates downward only,
to `engineering-orchestrator` and `devops-core`, never the reverse.

## Parallel dispatch, and the write surface

Concurrency between agents is governed by `delivery-orchestrator` section 6,
whose rule is that parallel work requires a contract between the parallel
parts. The contract for two agents that may both write is their file
surface, declared in the dispatch rather than assumed:

```
safe     parallel agents that only read, reporting findings for one writer
safe     parallel agents whose writable files are disjoint and named
unsafe   parallel agents that may write the same file, in any arrangement
```

This rule is in the architecture because it was broken the first time the
agent layer ran a real task, by the orchestrator, not by an agent. Two
reviewers were dispatched at once onto the same two files, each told to fix
what it found. Nothing was lost, but only because one of them noticed the
concurrent edits, isolated its own work, and disclosed the episode instead of
reporting a clean review. The rule existed then, in the same section 6, and
was still violated, because it named contracts without saying what a contract
is between two reviewers. Full account in
`multi-agent-assessment.md` section 9.

## Completion, stated honestly

Three explicit states, at both scopes, and a fourth value does not exist at
either:

```
engineering-orchestrator     Complete | Partial (named remainder) |
                             Blocked (named external blocker)

delivery-orchestrator        Delivered | Partial (named items, each with
                             its state and blocker) | Blocked
```

`Complete` and `Delivered` are never used to mean almost complete.
`engineering-orchestrator` section 7 states this explicitly: the verdict
requires every applicable mandatory gate satisfied with evidence, the
`engineering-core` section 8 definition of done passed, and the user-visible
outcome matching the literal request, not the inferred one.

## Verification independence

No agent is the sole judge of its own critical work, per
`agents/README.md`'s review gates: `frontend-engineer` is reviewed by
`qa-engineer` and `ui-ux-engineer`; `backend-engineer` by `security-engineer`
and `qa-engineer`; `database-engineer` by `backend-engineer`,
`performance-engineer` and `release-engineer`; `devops-engineer` by
`security-engineer` and `release-engineer`; `security-engineer`'s fixes are
reviewed by `qa-engineer`, specifically for the tests that encode each fix.
A dedicated, evidence-only `final-verifier` role, able to independently
re-check every one of these gates in one pass rather than relying on the
per-pair review structure above, is named as deferred work in
`multi-agent-assessment.md` section 3, not assumed to already exist.

## Escalation to the user

Both orchestrators escalate the same way: stop, state what was attempted,
state the evidence gathered, state the exact blocker, and ask one targeted
question rather than a menu of options the repository could have answered
itself. `clarification-gate` is the delivery-level version of this rule;
`engineering-orchestrator`'s single-question discipline is the task-level
version. Neither orchestrator asks a second round of small questions once
the first has been answered, per the source material's own instruction not
to interrogate the user with a chain of minor questions.
