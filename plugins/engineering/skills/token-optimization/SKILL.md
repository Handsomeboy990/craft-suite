---
name: token-optimization
description: Reusable discipline for keeping context and token use proportional to the task during orchestration, not after the fact: incremental reads instead of full-repository sweeps, decomposition instead of one oversized dispatch, canonical project documents instead of re-exploration, and structured handoffs instead of full context transfer. Never trades this for skipped verification. Use throughout any multi-step or multi-agent task.
license: MIT
metadata:
  category: dev-skills
  version: 1.0.0
  depends_on: [engineering-core]
  outputs: [context-budget, decomposition-notes, reuse-notes]
---

# Token Optimization

The Control Center's advisor reads a transcript after the work is done and
finds what was wasted. This skill is the discipline applied while the work
happens, so that transcript has less to find. Same seven wasteful patterns,
defined once, in one place: this skill names them, the advisor measures them.
Neither restates the other's definition.

## 1. Relationship to the Control Center advisor

```
this skill        the discipline followed during the work
the advisor       the retrospective measurement of a finished transcript
```

The advisor cannot instruct an agent mid task; it reads what already
happened. This skill cannot measure anything; it has no access to token
counts. Together they close the loop: this skill's section 2 names the same
seven patterns `control-center/advisor.py` detects, so a finding in the
advisor and a rule here are one vocabulary, not two.

| Pattern | This skill's rule | The advisor's signal |
|---|---|---|
| repeated exploration | section 3, read once, reuse the note | a file read three times or more in a session |
| edit churn | section 3, decompose before dispatching | a file edited four times or more |
| command repetition | section 3, batch before running | a command shape repeated five times or more |
| low cache reuse | section 4, keep context stable across steps | cache reuse ratio under 0.5 with meaningful cache created |
| large output | section 5, proportional output | three or more outputs above the large-output threshold |
| broad scope | section 3, decompose | one session with many messages, tool types and files together |
| missing project context | section 4, read the canonical note first | a project explored from scratch three or more sessions running |

## 2. What this skill never sacrifices

Stated first, because an optimization skill is the one most likely to be
misread as permission to cut corners.

- A mandatory gate from `engineering-orchestrator` section 4 is never skipped
  to save tokens.
- A security or correctness finding is never left unverified to save a
  re-read.
- Context is never hidden from a reviewer or a handoff to shorten it; it is
  summarized, with the summary naming what it dropped.
- Verification is never replaced by a shorter but less certain check.

Optimization here means proportion, not omission.

## 3. During exploration and implementation

- **Read once, reuse the note.** A file read during exploration is not
  re-read to confirm what a decision record, a continuity note or an earlier
  message in the same session already established. Point to the earlier
  finding instead.
- **Incremental over exhaustive.** Read the function, then its immediate
  callers, before reading the whole file; read the whole file before reading
  the whole directory. Escalate breadth only when the narrower read left a
  real question unanswered.
- **Decompose before dispatching.** A task classified HIGH by breadth alone,
  per `task-complexity` section 6, is split before it is handed to an agent,
  not handed over whole and hoped to fit.
- **Batch mechanical commands.** A search repeated with small variations is
  restated as one command covering all variations, not run once per
  variation.
- **One pass per finding.** A rejected finding is not re-litigated in the
  same form, per `engineering-orchestrator` section 6 rule 2. Re-raising it
  costs the same tokens twice for the same answer.

## 4. Across steps and across agents

- **Canonical documents over re-exploration.** `project-continuity`'s note,
  a `decision-records` entry, or the architecture document already answers
  what a fresh exploration would re-derive at cost. Read the canonical
  document first; explore only what it does not cover.
- **Structured handoffs over context dumps.** `agents/handoff-protocol.md`
  exists precisely so the next agent receives what it needs, not everything
  the previous one saw. A handoff padded with full file contents the next
  agent can read itself has not saved anything; it has moved the cost and
  added a copy that can go stale.
- **Stable context across a sequence.** Reordering steps so that adjacent
  steps share more of their context costs nothing and reduces how much must
  be re-established at each boundary.

## 5. Proportional output

- An answer sized to the question. A one-line question does not receive a
  restated plan, a summary of context already shared, and a conclusion; it
  receives the answer.
- A generated artefact (a report, a document, a bulk file set) is sized to
  what was asked for, not padded to demonstrate thoroughness.
- A finding is stated once, with its evidence, not restated in a summary that
  repeats the same evidence a second time.

## 6. What this skill does not do

- It does not set a token budget number; no reliable per-task token
  measurement exists at authoring time, and inventing one would be exactly
  the fabricated metric `engineering-core` section 2 forbids.
- It does not override a mandatory gate, a verification requirement, or a
  security finding, per section 2.
- It does not replace `model-routing`'s job of choosing a model tier; the two
  are read together, since a wrong model choice and a wasteful context both
  cost tokens for different reasons.

## 7. Protocol

1. Before reading anything, check whether a canonical document already
   answers the question: `project-continuity`'s note, a decision record, the
   architecture document.
2. Read incrementally, narrowest scope first, escalating only on a real
   unanswered question.
3. Before dispatching a task to an agent, apply `task-complexity` section 6:
   decompose a breadth-driven HIGH or CRITICAL task before dispatch.
4. Write the handoff per `agents/handoff-protocol.md`, referencing canonical
   documents rather than repeating their content.
5. Size the output to the question, per section 5.
6. Never apply steps 1 through 5 in a way that skips a gate from
   `engineering-orchestrator` section 4 or a finding that needs verification.

## 8. Auto-critique

Score from 0 to 5: no file was re-read that an existing note already covered,
no oversized dispatch was sent where decomposition applied, the handoff
referenced canonical documents instead of repeating them, the output was
sized to the question, no gate or verification was skipped in the name of
this skill.

Threshold: no axis below 3, average at least 4. Skipping a gate or a
verification step to save tokens scores 0 on that axis regardless of the
rest, because section 2 makes that trade categorically wrong, not merely
costly.

## 9. Interfaces

- Upstream: `engineering-core`.
- Lateral: `task-complexity` for decomposition triggers, `model-routing` for
  the escalation events both skills read, `project-continuity` and
  `decision-records` for the canonical documents section 4 reuses,
  `agents/handoff-protocol.md` for the handoff format.
- Downstream: `engineering-orchestrator` anti-loop rules, which this skill
  supports rather than restates.
- Measured, retrospectively, by: `control-center/advisor.py`, per the
  correspondence table in section 1.
