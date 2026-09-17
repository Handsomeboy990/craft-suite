# Worked classifications

Five tasks, classified with the section 5 template. Each shows the signal
that decided the tier, not just the tier itself.

## TRIVIAL: fix a typo in a log message

```
Task: correct "recieved" to "received" in a log line
Signals:
  files: 1                 -> TRIVIAL
  systems: 1                -> TRIVIAL
  architecture: none         -> TRIVIAL
  security: none              -> TRIVIAL
  ambiguity: none              -> TRIVIAL
  dependencies: 0                -> TRIVIAL
  testing: none                    -> TRIVIAL
  reasoning: mechanical              -> TRIVIAL
  rollback: revert                    -> TRIVIAL
  user_impact: none                    -> TRIVIAL
  production_impact: staging             -> TRIVIAL
Classification: TRIVIAL
Driving signal: none in particular; every signal agrees.
```

## LOW: add a missing index on a read-heavy column

```
Task: add an index on orders.customer_id, queried on every dashboard load
Signals:
  files: 1                 -> TRIVIAL
  systems: 1, isolated       -> LOW
  architecture: none           -> TRIVIAL
  security: none                 -> TRIVIAL
  ambiguity: none                  -> TRIVIAL
  dependencies: 0                    -> TRIVIAL
  testing: unit, existing suite        -> LOW
  reasoning: 1-step                      -> LOW
  rollback: a redeploy                     -> LOW
  user_impact: none, invisible               -> TRIVIAL
  production_impact: prod, low traffic path    -> LOW
Classification: LOW
Driving signal: production_impact and testing, both LOW; nothing pushes higher.
```

## MEDIUM: add a "resend invitation" action to an existing feature

```
Task: let a team admin resend a pending invitation, reusing the existing
invitation service
Signals:
  files: 6 to 20              -> MEDIUM
  systems: 1, isolated           -> LOW
  architecture: none               -> TRIVIAL
  security: authorization logic      -> MEDIUM
  ambiguity: one detail inferred       -> LOW
  dependencies: 1, stable                -> TRIVIAL
  testing: unit plus integration           -> MEDIUM
  reasoning: 2-3 steps                       -> MEDIUM
  rollback: a redeploy                         -> LOW
  user_impact: a feature area                    -> MEDIUM
  production_impact: prod, low traffic path        -> LOW
Classification: MEDIUM
Driving signal: several signals converge on MEDIUM; no single one dominates.
```

## HIGH driven by breadth, and its decomposition

```
Task: rename a widely used utility function across the codebase
Signals:
  files: 21 to 50            -> HIGH
  systems: 3, the function is imported by every service -> HIGH
  architecture: none            -> TRIVIAL
  security: none                  -> TRIVIAL
  ambiguity: none                   -> TRIVIAL
  dependencies: 0                     -> TRIVIAL
  testing: unit, existing suite         -> LOW
  reasoning: mechanical                   -> TRIVIAL
  rollback: revert                          -> TRIVIAL
  user_impact: none, no behaviour change      -> TRIVIAL
  production_impact: prod, but no behaviour change -> LOW
Classification: HIGH
Driving signal: files and systems touched, both HIGH; no risk signal reaches
above LOW.

Decomposition: per section 6, breadth-driven HIGH splits cleanly. Rename in
each of the three services as an independent LOW task, each reviewed and
merged on its own, rather than one HIGH-classified rename touching all three
at once.
```

## CRITICAL driven by a single signal, and why it does not decompose

```
Task: fix a bug where a discount code applies twice on a slow network,
because the submit handler is not idempotent
Signals:
  files: 2 to 5                -> LOW
  systems: 1, isolated             -> LOW
  architecture: none                  -> TRIVIAL
  security: payments, money moves        -> CRITICAL
  ambiguity: none                          -> TRIVIAL
  dependencies: 0                            -> TRIVIAL
  testing: full regression plus an independent QA pass -> CRITICAL
  reasoning: 2-3 steps                                    -> MEDIUM
  rollback: a redeploy                                      -> LOW
  user_impact: most, anyone on a slow connection              -> HIGH
  production_impact: prod, high traffic path, checkout          -> HIGH
Classification: CRITICAL
Driving signal: security sensitivity, payments. The file count and system
count would suggest LOW; the payment path overrides them per section 4.

Decomposition: does not apply. The two files that need the idempotency key
are already the minimal slice; splitting further would separate the check
from the write it protects.
```
