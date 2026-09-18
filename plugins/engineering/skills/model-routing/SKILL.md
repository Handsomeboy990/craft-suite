---
name: model-routing
description: Recommends which Claude model, and where meaningful which effort, an agent dispatch should use, from the task-complexity classification and risk signals such as security sensitivity, novelty and expected iteration. States plainly what the current agent runtime can and cannot switch, and never claims a capability the tooling does not have. Use before dispatching a subagent, and whenever complexity changes mid task.
license: MIT
metadata:
  category: dev-skills
  version: 1.0.0
  depends_on: [engineering-core, task-complexity]
  outputs: [model-recommendation, routing-rationale, escalation-record]
---

# Model Routing

Two model choices cost the same mistake in opposite directions: the strongest
model on a rename wastes budget the task never needed, and the fastest model
on a payment bug produces a wrong fix with confidence. This skill routes on
the classification from `task-complexity`, not on habit.

## 1. What this skill decides, and on what evidence

Two mechanisms are real and verified against this runtime's own tool
definitions, not against secondary sources:

```
agent frontmatter    a subagent definition can declare model: <name>, a
                     fixed default used whenever that agent is dispatched
                     without an override
dispatch override    the orchestrating session can pass an explicit model
                     when dispatching a subagent, which takes precedence
                     over the agent's own frontmatter default
```

One mechanism is verified absent, and this skill does not pretend otherwise:

```
no self-switching    a running session cannot change its own model or
                     reasoning depth mid task. The only paths are the
                     human issuing a model command, or the orchestrator
                     choosing the model of the next subagent it dispatches
```

Effort, as a distinct dial from model choice, exists only where a specific
skill or command explicitly defines an effort parameter of its own, such as a
review skill accepting `low` through `max`. There is no verified, general
mechanism to set an effort level on an arbitrary subagent dispatch the way
model can be set. This skill therefore routes model with confidence, and
states effort as a recommendation for a human or for a skill that has its own
effort parameter, never as a claim that every dispatch obeys it.

## 2. Model tiers, not model names

Model identifiers change over time and availability varies by account. This
skill routes to an abstract tier, resolved to an actual identifier through the
`model_routing` section of the configuration, per `resources/routing-policy.md`.
A routing decision that hardcodes a specific model name would break the day
that name is retired.

| Tier | What it is for |
|---|---|
| fast | mechanical, high volume, low ambiguity work |
| balanced | ordinary engineering judgment, the default for most tasks |
| strongest | deep reasoning, high stakes, or both |

The configuration maps each tier to a real model identifier and is never
assumed: `resources/routing-policy.md` ships a default mapping, and a project
overrides it in its own configuration file when its available models differ.

## 3. Routing table

Reads the classification `task-complexity` already produced. Never re-derives
it. Machine checked in `resources/tier-table.json`; the table below is its
human-readable rendering, and the two are never allowed to disagree.

| Complexity tier | Model tier | Why |
|---|---|---|
| TRIVIAL | fast | mechanical work has one correct answer; a stronger model spends budget without changing the outcome |
| LOW | fast, balanced if the task also has non-trivial ambiguity | the classification already isolated risk; most LOW tasks are genuinely low risk |
| MEDIUM | balanced | the default: enough judgment to need real reasoning, not enough stakes to require the strongest configuration |
| HIGH | strongest | crosses systems or is hard to reverse; a wrong conclusion here is expensive to discover later |
| CRITICAL | strongest, plus an independent verification pass | the cost of a wrong answer exceeds the cost of the strongest available reasoning by a wide margin |

Quality per token, not minimum tokens. A HIGH task that is HIGH only because
of breadth (many similar files, no risk signal, per `task-complexity` section
6) is a stronger case for decomposition into several balanced-tier dispatches
than for one expensive strongest-tier pass over all of it. A MEDIUM task
touching authentication is a stronger case for strongest, despite its tier,
than the table alone suggests: section 5 covers this override.

## 4. Effort, where a lever exists

Where the target skill or command exposes its own effort parameter, this
table applies. Where it does not, effort is a note for the human, not an
instruction the system can enforce.

| Complexity tier | Effort |
|---|---|
| TRIVIAL | low |
| LOW | low, medium if ambiguity is the driving signal |
| MEDIUM | medium |
| HIGH | high |
| CRITICAL | max, or the highest the target skill exposes |

Never raise effort to compensate for a badly scoped task; decompose it
instead, per `task-complexity` section 6. Never lower effort on a task whose
driving signal is security or irreversibility, whatever its breadth.

## 5. Overrides

The table in section 3 is a default, not a ceiling or a floor. Override it,
and record the override, when:

- the driving signal (from `task-complexity` section 3) is security,
  authentication or payments, whatever the overall tier: route to strongest;
- the task is genuinely novel, with no comparable precedent in the codebase
  or its history: route one tier stronger than the table suggests;
- the task is a repetition of a pattern already solved correctly earlier in
  the same session, with no new risk signal: route one tier lighter, since
  the reasoning was already done and only needs to be applied again;
- the expected output is large and mechanical (a bulk rename, a generated
  file set) with no judgment calls inside it: route lighter and decompose,
  regardless of file count.

## 6. Escalation and de-escalation

Triggered by the same reclassification event `task-complexity` section 7
defines. This skill does not invent a second trigger; it reads the same one.

```
Escalation record:
  Task: <one line>
  Prior:  complexity <tier>, model <tier>, effort <level>
  New:    complexity <tier>, model <tier>, effort <level>
  Reason: <the specific evidence that changed>
  Expected benefit: <what the stronger configuration is expected to catch>
```

De-escalation is symmetric and equally deliberate: recorded once decomposition
or new evidence shows the remaining work no longer carries the signal that
justified the stronger tier, never assumed by default partway through a task.

**Anti-thrash rule.** A switch without a stated reason does not happen. A task
does not oscillate between tiers more than once without new evidence between
the two switches; a second unexplained switch is treated as a planning defect
in the surrounding orchestration, not as legitimate routing.

## 7. Protocol

1. Read the classification `task-complexity` produced. Do not reclassify here.
2. Look up the model tier and effort in sections 3 and 4.
3. Apply section 5 overrides where their conditions hold, and state which one
   fired.
4. Resolve the tier to a real identifier through `resources/routing-policy.md`
   and the project configuration.
5. State the routing decision in the format of section 8.
6. When the task is dispatched to a subagent, pass the resolved model through
   the dispatch override, never relying on the agent's own frontmatter default
   to happen to match.
7. On reclassification, produce the escalation record of section 6 and repeat
   from step 2.

## 8. Routing announcement format

```
Complexity: MEDIUM, driving signal: authorization logic
Model: balanced -> escalated to strongest, section 5 override (security signal)
Effort: medium -> escalated to high
Resolved model: <identifier from routing-policy.md>
```

One block, stated once per dispatch, not repeated per file touched.

## 9. What this skill refuses

- Claiming a subagent dispatch obeys an effort parameter the target skill
  does not define.
- Claiming the orchestrating session changed its own model mid task.
- Hardcoding a specific model identifier instead of a tier and a
  configuration lookup.
- Escalating without a stated reason, or switching more than once without new
  evidence between the switches.
- Lowering model tier or effort to save tokens when the driving signal is
  security, authentication, payments or an irreversible action.

## 10. Auto-critique

Score from 0 to 5: the classification was read, not re-derived, the tier
lookup and any override are both stated, the resolved identifier came from
configuration rather than being hardcoded, an escalation carries a reason and
an expected benefit, no capability was claimed that section 1 marks as
unverified.

Threshold: no axis below 3, average at least 4. A routing decision that
claims a capability section 1 does not verify scores 0 on that axis
regardless of the rest.

## 11. Interfaces

- Upstream: `engineering-core`, `task-complexity`.
- Lateral: `token-optimization`, which reads the same escalation events for
  its own budget decisions.
- Downstream: `engineering-orchestrator`, `delivery-orchestrator`, and any
  agent dispatch that follows `agents/handoff-protocol.md`.
- Reference data: `resources/routing-policy.md`, `resources/tier-table.json`,
  `resources/fixtures.json`.
- Validated by: `tests/validate-model-routing.sh`.
