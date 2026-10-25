# Tool registry entry

One entry per tool the assessment uses. Illustrative; the registry is the
project's.

Each entry states:

- purpose: the one legitimate purpose it serves in this assessment
- safe defaults: the flags used by default, non-destructive
- destructive flags: named, used only with authorization and a recorded reason
- bound: the target or range it may run against
- evidence: what each run must capture
- posture: timing and rate limits, identification

Before any run:

- [ ] authorization on record covers this target
- [ ] the invocation is in the tool's safe mode unless a destructive flag is
      authorized in writing
- [ ] the exact flags, target, time and authorizer will be logged
- [ ] evidence capture is scoped to the finding, collateral data minimised
