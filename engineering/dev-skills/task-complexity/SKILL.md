---
name: task-complexity
description: Classifies a task's complexity into one of five tiers, from eleven concrete signals, before agent selection, model routing or verification depth are decided. One classification, read by every downstream decision rather than re-derived by each. Use before composing a plan, selecting agents, routing a model, or sizing a verification pass.
license: MIT
metadata:
  category: dev-skills
  version: 1.0.0
  depends_on: [engineering-core]
  outputs: [complexity-classification, classification-rationale]
---

# Task Complexity

Three decisions downstream all need the same answer to the same question: how
big is this, really. `engineering-orchestrator` needs it to size a plan.
`model-routing` needs it to pick a model and an effort level.
`delivery-orchestrator` needs it to size phase 1 through 6. Without one shared
classification, each would derive its own, disagree with the others, and drift
independently every time a threshold changed.

This skill produces that one answer.

## 1. The five tiers

| Tier | What it means | A wrong call here costs |
|---|---|---|
| TRIVIAL | mechanical, single file, no ambiguity, fully reversible | nothing but a moment's overthinking |
| LOW | small, isolated, well understood, cheap to reverse | a slightly slower fix |
| MEDIUM | normal feature work, one or two systems, some judgment required | a bug found in review instead of production |
| HIGH | crosses systems, ambiguous requirements, hard to reverse, real users affected | an incident, a rollback, a rebuild |
| CRITICAL | security, money, authentication, production data, or irreversible at scale | a breach, a loss, a leaked secret, an outage |

A tier is a decision input, not a judgement of the requester or the code. A
one-line change to a payment amount is CRITICAL; a five-hundred-line
mechanical rename is LOW.

## 2. The eleven signals

Each signal is scored independently against the tier table in section 3, then
combined by the rule in section 4.

| # | Signal | What it measures |
|---|---|---|
| 1 | Files touched | breadth of the change |
| 2 | Systems touched | how many independently deployable or independently owned parts are involved |
| 3 | Architectural impact | whether a boundary, a data model or a public contract moves |
| 4 | Security sensitivity | auth, payments, secrets, permissions, user content, PII |
| 5 | Ambiguity | how much of the requirement is stated versus inferred |
| 6 | Dependency count | libraries, services or teams the task depends on to complete |
| 7 | Testing requirement | what has to pass before the change is trusted |
| 8 | Reasoning depth | how many steps of inference separate the request from the fix |
| 9 | Rollback difficulty | what it costs to undo if it is wrong |
| 10 | User impact | how many users, and how directly, are affected |
| 11 | Production impact | whether a live system or live data is touched |

## 3. Signal to tier

Each signal is rated against this table. A signal absent from the task (no
dependency, for instance) scores TRIVIAL on that axis and drops out of the
combination in section 4.

| Signal | TRIVIAL | LOW | MEDIUM | HIGH | CRITICAL |
|---|---|---|---|---|---|
| Files touched | 1 | 2 to 5 | 6 to 20 | 21 to 50 | more, or unbounded |
| Systems touched | 1 | 1, isolated | 2 | 3 or more | the whole platform |
| Architectural impact | none | none | one module's internals | a boundary or a public contract | a data model migration or a boundary every consumer depends on |
| Security sensitivity | none | input touched, no privilege | authorization logic | authentication, session, secrets | payments, credential storage, an existing breach |
| Ambiguity | none, fully specified | one detail inferred | several details inferred, none blocking | a requirement conflicts with another | the objective itself is unclear |
| Dependency count | 0 | 1, stable | 2 to 3 | 4 or more, or one unstable | an external team or a vendor gate |
| Testing requirement | none, no behaviour change | unit, existing suite | unit plus integration | integration plus a manual or exploratory pass | full regression plus an independent security or QA pass |
| Reasoning depth | none, mechanical | one inference step | two to three steps | a chain the agent must re-verify mid task | requires an expert model to avoid a wrong conclusion |
| Rollback difficulty | trivial, revert the commit | a redeploy | a redeploy plus a cache or session concern | a data migration to reverse | not fully reversible, or reversible only with data loss |
| User impact | none, internal only | a handful of users | a feature area | most users | every user, or a user's money or data |
| Production impact | none, not yet deployed | staging only | production, low traffic path | production, high traffic path | production, during an incident or at scale |

## 4. Combination rule

The task's tier is the **highest tier reached by any signal**, not an average.

```
one CRITICAL signal   -> the task is CRITICAL, regardless of the other ten
no signal above LOW   -> the task is LOW at most
```

This is deliberate and non-negotiable: a one-line change to a password reset
flow is CRITICAL because signal 4 says so, even though signals 1, 2 and 6 all
say TRIVIAL. Averaging would hide exactly the risk this classification exists
to surface. `model-routing` section 3 depends on this asymmetry: it is what
lets a small, high-stakes task still receive strong reasoning instead of a
fast, cheap pass sized to its file count.

## 5. Producing the classification

```
Task: <one line>
Signals:
  files: <n>              -> <tier>
  systems: <n>             -> <tier>
  architecture: <none|module|boundary|contract|migration> -> <tier>
  security: <none|input|authz|authn|payments>              -> <tier>
  ambiguity: <none|one|several|conflicting|unclear>        -> <tier>
  dependencies: <n>, <stable|unstable>                     -> <tier>
  testing: <none|unit|integration|manual|full-regression>  -> <tier>
  reasoning: <mechanical|1-step|2-3-step|chained|expert>    -> <tier>
  rollback: <revert|redeploy|migration|irreversible>        -> <tier>
  user_impact: <none|handful|area|most|all>                 -> <tier>
  production_impact: <none|staging|prod-low|prod-high|incident> -> <tier>
Classification: <the highest tier reached>
Driving signal: <which signal reached it, and why>
```

The driving signal is not decoration. It is what a human skimming the
classification checks first, and it is what changes when the task is
decomposed (section 6).

## 6. Decomposition

A HIGH or CRITICAL classification driven by breadth (signals 1, 2, 6) rather
than by risk (signals 3, 4, 9, 10, 11) is a candidate for decomposition: split
the task, classify each part on its own, and route each part independently. A
classification driven by a risk signal is not a decomposition candidate: the
risk travels with the smallest possible slice of the work that touches it.

```
example: a HIGH classification from "40 files, 3 systems, no security
signal, fully reversible" splits cleanly into per-system LOW or MEDIUM tasks.

counter-example: a HIGH classification from "1 file, the session cookie
flag" does not get smaller by splitting; the file is already minimal, and
splitting it further would only hide the signal that made it HIGH.
```

## 7. Reclassification

The classification is provisional until the task is actually explored. It is
revised, never silently kept, when:

- exploration reveals a system, a dependency or a data path not visible from
  the request;
- a signal that was estimated turns out to differ once code is read, for
  example an assumed single-tenant table that is actually shared;
- the task is decomposed, per section 6, into parts with their own tiers;
- a fix reveals the defect is upstream, in a dependency or a different
  service.

A reclassification is announced in one line: `Reclassified: MEDIUM to HIGH,
signal 4 revised, the endpoint returns another user's data with a forged id.`
This is the same trigger `engineering-orchestrator` section 8 calls a
re-plan, and the same trigger `model-routing` section 5 calls an escalation:
one event, read by two consumers.

## 8. What reads this classification

| Consumer | Uses it to |
|---|---|
| `engineering-orchestrator` | decide plan breadth: a TRIVIAL task skips steps a HIGH task cannot |
| `delivery-orchestrator` | size phases 1 through 6, per its own section 3 |
| `model-routing` | select a model tier and an effort level |
| `token-optimization` | set a proportional context budget |
| verification depth, generally | a CRITICAL task requires an independent verification pass; a TRIVIAL one does not |

None of these re-derive the tier from the eleven signals. They read the
classification this skill produced and act on it.

## 9. Protocol

1. Read the task as stated, plus whatever exploration has already
   established about the files, systems and data paths it touches.
2. Rate each of the eleven signals in section 2 against the table in
   section 3. A signal with nothing to measure rates TRIVIAL.
3. Apply the combination rule in section 4: the tier is the highest tier any
   signal reached.
4. Name the driving signal, per section 5's template.
5. When breadth signals (files, systems, dependencies) dominate and no risk
   signal (architecture, security, rollback, user or production impact)
   reaches above LOW, consider decomposition per section 6.
6. Publish the classification in the format of section 5 so `model-routing`
   and the orchestrators can read it without re-deriving it.
7. Revise the classification per section 7 the moment new evidence
   contradicts a rated signal; never carry a stale classification forward.

## 10. Auto-critique

Score from 0 to 5: every applicable signal was actually rated rather than
assumed, the combination rule was applied literally, the driving signal is
named, decomposition was considered when breadth dominated, reclassification
happened when new evidence appeared.

Threshold: no axis below 3, average at least 4. A CRITICAL task classified
without naming the driving signal scores 0 on that axis regardless of the
rest, because an unnamed driving signal cannot be checked by anyone else.

## 11. Interfaces

- Upstream: `engineering-core`.
- Downstream: `engineering-orchestrator`, `delivery-orchestrator`,
  `model-routing`, `token-optimization`.
- Reference data: `resources/tier-examples.md`.
