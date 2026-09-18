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

Agent-level usage is collected as of the phase that followed this document's
first draft: `reader.py` counts agent dispatches by agent and by requested
model, plus the sidechain records that are the evidence dispatched work
actually produced messages. `collect()` exposes it, and the text report shows
it; the browser dashboard does not render it yet, so it is reachable through
`--json`, `/api/data` and `install.sh --report` only.

**A correction worth keeping, because the mistake is instructive.** This
document first stated that the transcripts held "zero `Task` or `Agent` tool
invocations, zero sidechains", from a direct scan of 254 files and 31,606
records. The first half was true at the time. The second half was not a
measurement at all: the scan used a two-level glob, `projects/*/*.jsonl`, and
a dispatched agent writes its own transcript one level deeper, under
`projects/<project>/<sessionId>/subagents/`. The glob could not see a single
one of those files. A security review of the collector found the same blind
spot in the collector's own scan, where it mattered more: the report printed
`Sidechain records  none recorded` while hundreds of records sat on disk
unread. An unlooked-for zero is not a measured zero, and presenting one as
the other is the fabricated statistic this suite's rules forbid. The
collector now scans both locations; this document no longer states a figure
it did not actually measure.

Still not built, and named as such: the browser dashboard panel, and an
`advisor.py` detection function for agent-level waste (an agent invoked where
a lighter skill would have done, a model tier stronger than the
classification justified). Both are now buildable, because the data behind
them exists.

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
