# Example: two requests that look similar and are not

A user reports two things in the same message: "the button says 'recieve'
instead of 'receive', and also sometimes I get charged twice when I click
checkout on a slow connection."

Read literally, both are "a small user-visible problem in an existing
screen." Classified separately, they are not the same task at all.

## The typo

```
files: 1, systems: 1, architecture: none, security: none, ambiguity: none,
dependencies: 0, testing: none, reasoning: mechanical, rollback: revert,
user_impact: none beyond cosmetic, production_impact: prod, no behaviour change
Classification: TRIVIAL
```

Fixed directly, no plan needed beyond the fix itself.

## The double charge

```
security: payments, money moves -> CRITICAL
testing: full regression plus an independent QA pass -> CRITICAL
user_impact: most, anyone on a slow connection -> HIGH
production_impact: prod, high traffic path, checkout -> HIGH
Classification: CRITICAL
Driving signal: security sensitivity, payments.
```

`model-routing` reads this classification and routes the double-charge
investigation to the strongest available reasoning configuration with an
independent verification pass before merge, per its section 3. The typo is
routed to the fastest tier with a single pass. The two requests arrived in one
message; they do not get one answer.
