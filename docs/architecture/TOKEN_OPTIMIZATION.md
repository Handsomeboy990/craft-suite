# Token optimization architecture

Two mechanisms, deliberately kept separate, sharing one vocabulary.

```
engineering/dev-skills/token-optimization/SKILL.md
    the discipline followed during a multi-step or multi-agent task

control-center/advisor.py
    the retrospective, deterministic measurement of a finished transcript
```

Neither can do the other's job. The skill has no access to token counts; it
cannot measure anything, only recommend a way of working. The advisor has no
way to instruct an agent mid task; it reads what already happened after the
fact. This document is about the seam between them, not about either one
alone, which are each documented at their own location:
`token-optimization/SKILL.md` for the discipline,
`docs/control-center-evolution.md` for the advisor's data flow and scoring.

## One vocabulary, not two

Seven patterns, named once. `token-optimization/SKILL.md` section 1 is the
correspondence table; it is reproduced here only to make the point visible
at the architecture level.

| Pattern | Named by the skill as | Measured by the advisor as |
|---|---|---|
| repeated exploration | read once, reuse the note | a file read three times or more in a session |
| edit churn | decompose before dispatching | a file edited four times or more |
| command repetition | batch before running | a command shape repeated five times or more |
| low cache reuse | keep context stable across steps | cache reuse ratio under 0.5 with meaningful cache created |
| large output | proportional output | three or more outputs above the large-output threshold |
| broad scope | decompose | one session with many messages, tool types and files together |
| missing project context | read the canonical note first | a project explored from scratch three or more sessions running |

A finding in the Optimization tab and a rule in the skill describe the same
thing at two points in time. Changing a threshold happens in one place,
`advisor.py`, and the skill's table is updated to match rather than defining
its own numbers, because a second set of thresholds would drift from the
first the first time either one changed.

## Why no numeric token budget

The source material asked for a system that could set a context or token
budget per task. This architecture does not, for a stated reason:
`engineering-core` section 2 requires every claim to carry evidence, and no
reliable per-task token count exists at the point a task is being planned,
before it has run. Inventing a number here would be exactly the fabricated
metric the suite's own rules forbid, applied to itself.

What exists instead is proportionality as a rule, not a quantity:
`token-optimization/SKILL.md` sections 3 through 5 state what a proportional
read, a proportional dispatch and a proportional output look like, and
section 2 states plainly what proportionality is never allowed to sacrifice:
a mandatory gate, a security finding, or a verification step. Optimization
here means shape, not a smaller number reached by cutting a corner.

## What the Control Center already provides, and what it does not

Real today, per `docs/control-center-evolution.md`: four token components
(fresh input, cache read, cache creation, output), a deterministic
optimization score, and evidence-based findings across the seven patterns
above, all read from actual transcripts, nothing invented.

Not available today, named as such rather than estimated: agent-level usage,
which agent ran and how often. This session's own transcripts were checked
directly: 254 transcript files, 31,606 records, zero `Task` or `Agent` tool
invocations recorded, zero sidechains. The reason is observable, not a
missing feature: this suite's agents have not yet been dispatched as
subagents in a way this environment's transcripts capture. When they are,
`reader.py` gains a new collector for agent dispatch, `advisor.py` gains a
detection function for agent-level waste (an agent invoked when a lighter
skill would have done, a model tier that never should have been requested
for the classification it received), and the Control Center's Agent
Orchestration and Model and Token Optimization sections, requested
explicitly, become real rather than placeholders. Building those sections
against zero real events would violate the same rule this document has
followed throughout: never display a fabricated statistic.

## The seam, stated once

```
during the work        token-optimization is followed
                        engineering-orchestrator's anti-loop rules hold
                        model-routing avoids unnecessary escalation

after the work          advisor.py reads the transcript
                        a clean session with no qualifying signal produces
                        no findings and a full score, which is the intended
                        outcome of following the discipline, not a gap in
                        the advisor's coverage
```

A perfect Optimization tab score is not evidence the advisor missed
something. It is evidence the discipline worked.
