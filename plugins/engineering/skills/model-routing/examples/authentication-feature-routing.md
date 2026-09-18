# Example: routing an authentication feature end to end

A request: "add a forgot password flow." `engineering-orchestrator`
classifies it AUTHENTICATION and composes a plan of
`architecture-design -> security-audit -> backend-engineering ->
input-validation -> testing-quality -> code-review-protocol ->
technical-documentation -> project-continuity -> git-workflow`. Each step is
routed independently, because each carries a different signal.

```
Step: architecture-design, deciding the token and expiry scheme
Complexity: MEDIUM, driving signal: security sensitivity (authentication)
  overridden by section 5: security driving signal -> route to strongest
Model: strongest
Effort: max

Step: backend-engineering, the reset endpoint and the token table
Complexity: HIGH, driving signal: security sensitivity (authentication)
Model: strongest
Effort: high

Step: input-validation, the email and token format checks
Complexity: LOW, driving signal: none beyond the endpoint it serves
Model: fast
Effort: low

Step: technical-documentation, the API reference entry
Complexity: TRIVIAL, driving signal: none
Model: fast
Effort: low
```

The same feature request produces four different routing decisions, because
`model-routing` reads the classification of each step, not of the request as
a whole. Routing the entire feature at strongest tier would waste budget on
the documentation step; routing it entirely at fast tier would under-power
the endpoint that handles the reset token.

## Mid task escalation

While implementing `backend-engineering`, the agent discovers the reset token
is compared with a non constant time string comparison, a timing side
channel. `task-complexity` reclassifies this specific fix from HIGH to
CRITICAL (driving signal moves from generic authentication sensitivity to an
active timing vulnerability), and `model-routing` produces:

```
Escalation record:
  Task: fix the reset token comparison
  Prior:  complexity HIGH, model strongest, effort high
  New:    complexity CRITICAL, model strongest, effort max
  Reason: a timing side channel was found in the token comparison
  Expected benefit: an independent verification pass on the fix before merge
```

The model tier does not change, since it was already strongest; the effort
and the verification requirement do. This is a legitimate escalation: it
carries a reason and a piece of evidence discovered during the work, not a
switch for its own sake.
