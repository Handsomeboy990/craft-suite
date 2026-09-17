# Model routing architecture

The operational rules live in
`engineering/dev-skills/model-routing/SKILL.md`; this document is why the
architecture looks the way it does, and what it deliberately refuses to
claim. Read the skill for the routing table and the protocol; read this for
the reasoning behind its boundaries.

## The problem this solves

Two failure modes, and they are not symmetric in cost:

```
too strong    a fast fix or a mechanical rename processed at the strongest
              available reasoning configuration. Wastes budget; rarely wrong.
too weak      a security-sensitive or highly ambiguous change processed at
              the fastest, cheapest configuration. Sometimes wrong, and wrong
              in a way that looks finished.
```

The objective stated for this work was to maximise result quality per token,
not to minimise token count. A router that always picks the cheapest model
optimises the wrong variable. `model-routing` routes on
`task-complexity`'s classification precisely because that classification is
built to surface the second failure mode even when every breadth signal
says the task is small: see `task-complexity/SKILL.md` section 4, the
highest-signal-wins combination rule.

## What is real, verified against this runtime

Before any routing rule was written, the two candidate mechanisms were
checked against this session's own tool definitions, not against a search
result:

```
real, verified       an agent definition's frontmatter can declare a
                      default model; the orchestrating session can override
                      it per dispatch when handing work to a subagent
not verified          a running session changing its own model or
                      reasoning depth mid task without a human command
not verified          a universal, per-agent effort control, outside a
                      specific skill or command that defines its own
                      effort parameter
```

A first pass at this research, run through a subagent, reported the third
item as an existing capability, citing a GitHub feature-request issue. A
feature request is evidence that a capability has been asked for, not that
it ships. That claim is not reflected anywhere in this architecture: routing
a model is a firm recommendation with two real levers behind it; routing an
effort level is a recommendation with no enforcement outside a skill that
already defines its own effort parameter, such as a review skill accepting a
stated level.

This boundary is the concrete answer to two of the source material's
explicit prohibitions: do not create a fake integration, and do not pretend
a capability exists if the current architecture does not support it.

## Why tiers, not model names

`model-routing` never writes a specific model identifier into its own logic.
It routes to one of three abstract tiers, `fast`, `balanced`, `strongest`,
resolved to a real identifier through the `model_routing` section of the
project configuration. A skill that hardcodes a model name becomes silently
wrong the day that identifier is retired or the day the suite runs on an
account with a different lineup. The tier names are fixed policy; what
answers to each name is configuration, per `config/README.md`.

## Where the decision is made, and how often

Read together with `AGENT_ARCHITECTURE.md`'s layer diagram: the decision is
made per step of a composed plan, not once for an entire request.
`engineering-orchestrator` section 1 step 7 classifies and routes before
each step, because a single feature request routinely mixes a
security-sensitive endpoint with a documentation update, and one routing
decision for both would either overpay for the second or underpay for the
first. The worked example in
`model-routing/examples/authentication-feature-routing.md` shows the same
feature producing four different routing decisions across its steps.

## Escalation and de-escalation

One reclassification event, read by three consumers, never three independent
judgment calls reaching different answers:

```
task-complexity     revises the tier, per its section 7
model-routing        reads the revision, produces an escalation or
                     de-escalation record, per its section 6
token-optimization    reads the same event to decide whether the remaining
                     work should be decomposed further
```

An escalation without a stated reason does not happen, and a task does not
switch tiers twice without new evidence between the two switches; the second
unexplained switch is treated as a planning defect, not as legitimate
routing. This is the suite's answer to the requested anti-thrash guarantee.

## Testability without a live model call

`tests/validate-model-routing.sh` checks eleven fixtures, five base tiers,
four override conditions, two escalation and de-escalation transitions,
against the machine-checked table in
`model-routing/resources/tier-table.json`. Every fixture is a static
assertion: given this classification and this override condition, the table
must say this model tier and this effort. Nothing in this check contacts a
model, and nothing in it depends on which model identifiers the running
account actually has available.

## What this architecture explicitly does not do

- It does not measure actual token savings from a routing decision; no such
  measurement exists at authoring time, and `token-optimization/SKILL.md`
  section 6 states this refusal directly rather than estimating a number.
- It does not claim a session can lower its own effort mid task; it states
  the recommendation and lets the orchestrator or the human act on it.
- It does not treat model choice as a substitute for decomposition: a task
  that is large because it is unfocused is decomposed per
  `task-complexity` section 6 before a stronger model is asked to compensate
  for the missing decomposition.
