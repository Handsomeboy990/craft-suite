# project-brief

Frames work before it starts. Inspects what already exists, asks the
decision-critical questions once in a single structured batch, records the
assumptions behind everything not asked, and produces the short agreement that
becomes the operational source of truth.

- Inputs: a request, a specification, a client brief, or an existing project.
- Outputs: working agreement, question batch, assumption register, change record.
- Depends on: nothing. Usable alone, in any domain.
- Downstream: `requirements-analysis`, `clarification-gate`,
  `delivery-orchestrator`, `engineering-orchestrator`, `document-core`,
  `novel-architect`.

## When to use

A project, a specification, a client request, a takeover of existing work, or
anything that will span more than one session.

## When not to use

A single bounded task whose outcome you can state in one sentence. A brief for
a typo fix is bureaucracy, and the skill says so.

## Relationship to the delivery skills

This skill frames; it does not analyse. For software delivery,
`requirements-analysis` separates requirements from assumptions far more
strictly, and `clarification-gate` asks the sharper architectural batch later.
The brief is their input, not their replacement.

## Configuration

None. Output language follows `language.document_output` when the agreement is
written for a client.
