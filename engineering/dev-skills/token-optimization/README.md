# token-optimization

The discipline applied during a multi-step or multi-agent task to keep
context and token use proportional to it: read once and reuse the note,
decompose before dispatching, prefer canonical documents to re-exploration,
hand off through the structured protocol instead of a context dump, size the
output to the question. Never trades this for a skipped gate or an
unverified finding.

- Inputs: the task, the canonical documents already available
  (`project-continuity`, `decision-records`, the architecture document).
- Outputs: a context budget decision, decomposition notes when applicable,
  reuse notes pointing to what was not re-explored.
- Depends on: engineering-core.
- Lateral: task-complexity, model-routing, project-continuity,
  decision-records, agents/handoff-protocol.md.

Distinct from `control-center/advisor.py`, which reads a finished transcript
and measures the same seven wasteful patterns after the fact. This skill is
what keeps that transcript clean in the first place; the two share one
vocabulary rather than defining it twice.
