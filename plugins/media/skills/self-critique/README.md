# self-critique

Reviews finished work from the professional roles that will actually receive
it. Selects a panel appropriate to the artefact, runs one pass per role,
checks the result against what the user asked for, ranks findings by severity,
fixes them, and re-reviews what the fixes touched.

- Inputs: a produced artefact, and the request it answers.
- Outputs: review record, corrected output, list of what was not fixed and why.
- Depends on: nothing. Usable alone, in any domain.
- Delegates to: `code-review-protocol`, `security-audit`, `release-readiness`,
  `self-critique-protocol`, `document-core`, `pdf-production`.

## When to use

Before presenting any meaningful output as complete: a change, a document, a
plan, a deployment, a chapter, a handover.

## When not to use

For a trivial, already verified action. Also not as a substitute for the deep
domain reviews: this skill chooses who looks and enforces the loop, it does
not replace a security audit or a code review.

## Why it is separate from the domain reviewers

The domain reviewers answer whether the work is good. None of them answers
whether it is the work that was requested. Section 4, the vision check, is the
part that belongs to no domain and is therefore always run here.

## Configuration

None.
