---
name: model-routing
description: Recommends which Claude model, and where meaningful which effort, an agent dispatch should use, from the task-complexity classification and risk signals such as security sensitivity, novelty and expected iteration, and escalates when a dispatched output fails a quality check even without a complexity change. States plainly what the current agent runtime can and cannot switch, and never claims a capability the tooling does not have. Covers every agent of the chief's team map with a tier rule, and every parallel worker with its own explicit, recorded model. Use before dispatching a subagent, whenever complexity changes mid task, and whenever a returned output is shallow, uncited, factually wrong or fails its gate.
license: MIT
metadata:
  category: dev-skills
  version: 1.2.0
  depends_on: [engineering-core, task-complexity]
  outputs: [model-recommendation, routing-rationale, escalation-record, routing-log]
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
  regardless of file count;
- the dispatch is an independent gate verifying another dispatch's work, the
  final-verifier, pr-reviewer or compliance-verifier agent: route no lighter,
  in model tier and effort, than the dispatch whose work it verifies.

## 6. Escalation and de-escalation

Two triggers, both explicit, neither assumed by default partway through a
task.

**Trigger 1, reclassification.** The same event `task-complexity` section 7
defines. This skill does not re-derive complexity; it reads the classification
that changed.

**Trigger 2, `output-quality-failure`.** A dispatch returned, the work looks
finished, and it is not good enough. This is not a complexity change: the task
is the same task, and the model that ran it produced a result that does not
hold up. Concrete triggers, any one of which is sufficient:

```
shallow-against-acceptance      the output is shallow against the brief's
                                own acceptance items
factual-error-on-verification   a factual error is found when the output is
                                verified
uncited-claim                   a claim appears where a citation was
                                required and none is given
missed-required-section         a section the brief required is missing from
                                the output
failed-test-or-gate             a test fails, or the review gate fails
contradiction-with-sources      the output contradicts a source it cites or
                                should have checked
```

Machine checked in `resources/tier-table.json`'s `quality_escalation_triggers`
list; this table is its human-readable rendering; the two are never allowed
to disagree. On any one of these, escalate the model exactly one tier
stronger than the tier that produced the weak output (fast to balanced,
balanced to strongest; strongest has nowhere stronger to escalate to, and
the response there is an independent verification pass, per the CRITICAL row
of section 3). A reason is required, naming which trigger fired and the
specific evidence. The failed output is kept, not discarded, so the retry can
be compared against it rather than trusted on faith. This is a model
escalation only: `task-complexity`'s classification of the task itself does
not change because the first attempt was weak.

```
Escalation record:
  Task: <one line>
  Trigger: reclassification | output-quality-failure
  Prior:  complexity <tier>, model <tier>, effort <level>
  New:    complexity <tier>, model <tier>, effort <level>
  Reason: <the specific evidence that changed, or the quality trigger that fired>
  Expected benefit: <what the stronger configuration is expected to catch>
  Failed output: <kept at <path or reference>, for comparison>   (output-quality-failure only)
```

De-escalation is symmetric and equally deliberate, and applies to trigger 1
only: recorded once decomposition or new evidence shows the remaining work no
longer carries the signal that justified the stronger tier. There is no
de-escalation on trigger 2; a weak output is a reason to strengthen, never a
reason to weaken.

**Anti-thrash rule, both triggers.** A switch without a stated reason does not
happen. A task does not oscillate between tiers more than once without new
evidence between the two switches; a second unexplained switch is treated as
a planning defect in the surrounding orchestration, not as legitimate
routing. A model already escalated once by `output-quality-failure` that
fails again is not escalated a second time by the same trigger without new,
different evidence; a repeated failure at the strongest tier is a defect in
the task's framing, handed to the orchestrator rather than absorbed by a
third dispatch.

## 7. Protocol

1. Read the classification `task-complexity` produced. Do not reclassify here.
2. Look up the model tier and effort in sections 3 and 4.
3. Apply section 5 overrides where their conditions hold, and state which one
   fired.
4. Resolve the tier to a real identifier through `resources/routing-policy.md`
   and the project configuration. When `model_routing` is absent or empty,
   apply the documented default mapping rather than leaving the tier
   unresolved, per `resources/routing-policy.md`'s section on what an absent
   or empty configuration means.
5. State the routing decision in the format of section 8.
6. On every dispatch to a subagent, without exception, resolve a model per
   steps 2 to 4 and pass it through the dispatch override. An agent's own
   frontmatter default is never relied on to happen to match; the
   orchestrator resolves and passes the model itself, every time, for each
   worker of a parallel wave separately, section 9.
7. Record the dispatch in the routing log, `resources/routing-log.md`.
8. On reclassification, or on an `output-quality-failure` per section 6,
   produce the escalation record, record it in the routing log's escalation
   table, and repeat from step 2.

## 8. Routing announcement format

```
Complexity: MEDIUM, driving signal: authorization logic
Model: balanced -> escalated to strongest, section 5 override (security signal)
Effort: medium -> escalated to high
Resolved model: <identifier from routing-policy.md>
```

One block, stated once per dispatch, not repeated per file touched. When the
default mapping documented in `resources/routing-policy.md` was applied because
`model_routing` was absent or empty, the announcement says so:

```
Resolved model: haiku (default mapping applied, model_routing is not configured)
```

## 9. Agents and parallel workers

**Every agent has a tier rule.** The thirty-three agents of the chief's
`resources/team-routing.md` each have one in `resources/agent-tiers.md`,
team by team. The rule is the slice's classification through section 3,
plus the override the agent's own condition always fires: the
`security-driving-signal` for the security team, the
`independent-verifier-floor` for the independent gates. A lead routes on the
request classification, because it plans the whole request. An agent missing
from that file is not dispatched until it has a rule.

**Every parallel worker is routed on its own.** A wave of the chief's
`resources/parallel-dispatch.md` section 4 is not a routing unit:

1. Each dispatch of the wave is routed from its own slice classification,
   never from a model chosen once for the wave.
2. Each dispatch passes its resolved model explicitly through the dispatch
   override, step 6 of section 7; two workers of one wave running the same
   agent may resolve different tiers.
3. The tier and resolved model are written in the dispatch record's `Model`
   field before the worker starts, and one routing log row per dispatch
   carries its dispatch id, `D<wave>.<n>`.
4. A worker redispatched under `parallel-dispatch.md` section 7 is an
   `output-quality-failure` of section 6: one tier stronger, the failed
   output kept, a second failure at the strongest tier a blocker for the
   chief, never a third dispatch.

## 10. What this skill refuses

- Claiming a subagent dispatch obeys an effort parameter the target skill
  does not define.
- Claiming the orchestrating session changed its own model mid task.
- Hardcoding a specific model identifier instead of a tier and a
  configuration lookup.
- Dispatching a subagent without resolving and passing an explicit model,
  even when the agent's own frontmatter default happens to match what would
  have been resolved.
- Treating an absent or empty `model_routing` section as a runtime decision
  to trust; on Claude Code an omitted `model` inherits the orchestrating
  session's own model, so silence here is silent, unrouted dispatch, not a
  sensible default.
- Routing a parallel wave on one shared model, or dispatching any worker of
  it without its own explicit model and its own routing log row.
- Dispatching an agent that has no tier rule in `resources/agent-tiers.md`.
- Escalating without a stated reason, or switching more than once without new
  evidence between the switches.
- Raising the model tier on an `output-quality-failure` by more than one
  tier, or treating a repeated failure at the strongest tier as a reason to
  keep re-dispatching rather than a defect handed to the orchestrator.
- De-escalating in response to an `output-quality-failure`.
- Lowering model tier or effort to save tokens when the driving signal is
  security, authentication, payments or an irreversible action.

## 11. Auto-critique

Score from 0 to 5: the classification was read, not re-derived, the tier
lookup and any override are both stated, the resolved identifier came from
configuration or the documented default mapping rather than being hardcoded
or silently inherited, an escalation carries a reason (naming the trigger)
and an expected benefit, a quality escalation kept the failed output, the
dispatch and any escalation were recorded in the routing log, every parallel
worker carried its own explicit model, every dispatched agent had a tier rule,
no capability was claimed that section 1 marks as unverified.

Threshold: no axis below 3, average at least 4. A routing decision that
claims a capability section 1 does not verify scores 0 on that axis
regardless of the rest. A dispatch with no explicit model passed, on a
runtime where `model_routing` is absent or empty, scores 0 on the same axis.

## 12. Interfaces

- Upstream: `engineering-core`, `task-complexity`.
- Lateral: `token-optimization`, which reads the same escalation events for
  its own budget decisions.
- Downstream: `engineering-orchestrator`, `delivery-orchestrator`, and any
  agent dispatch that follows `agents/handoff-protocol.md`.
- Reference data: `resources/routing-policy.md`, `resources/tier-table.json`,
  `resources/fixtures.json`, `resources/routing-log.md`,
  `resources/agent-tiers.md`; the chief's `resources/team-routing.md` and
  `resources/parallel-dispatch.md`.
- Validated by: `tests/validate-model-routing.sh`.
