# project-continuity

Leaves the project resumable. Eight sections: completed, current state,
decisions, remaining, next move, risks, verification, context. Every vague
statement is converted to a concrete one, every secret is referenced by name
rather than by value, stale entries are deleted rather than accumulated, and
an existing note is merged with the newest state winning and nothing open
dropped silently.

- Inputs: the session's commits and findings.
- Outputs: continuity notes, handoff report, follow up list.
- Depends on: engineering-core.
- Downstream: the next session, release-readiness, git-workflow.

Passes the resumption test: a reader with no memory of the session can answer
what state the work is in, what to run, what is finished, what is not, what to
do next, and what will surprise them.
