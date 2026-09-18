# model-routing

Recommends a model tier, and where a lever exists an effort level, from the
classification `task-complexity` produces. States exactly which switching
mechanisms this runtime actually supports: a fixed default in an agent's own
frontmatter, and a per-dispatch override from the orchestrating session.
Neither a running session changing its own model, nor a universal per-agent
effort control, is claimed, because neither is verified to exist.

- Inputs: the complexity classification and driving signal from
  `task-complexity`.
- Outputs: a model tier recommendation, an effort recommendation where
  applicable, a routing rationale, an escalation record when complexity
  changes mid task.
- Depends on: engineering-core, task-complexity.
- Downstream: engineering-orchestrator, delivery-orchestrator, any agent
  dispatch.

The routing table maps five complexity tiers to three model tiers, fast,
balanced and strongest, resolved to real model identifiers through
configuration rather than hardcoded, because model availability differs by
account and changes over time.
