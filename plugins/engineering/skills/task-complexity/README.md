# task-complexity

Classifies a task into one of five tiers, TRIVIAL through CRITICAL, from
eleven concrete signals combined by a highest-signal-wins rule. Produces one
classification that agent selection, model routing, phase sizing and
verification depth all read, instead of each re-deriving its own.

- Inputs: the task description, plus what exploration has established about
  the files, systems and data it touches.
- Outputs: a complexity classification, the driving signal, a rationale.
- Depends on: engineering-core.
- Downstream: engineering-orchestrator, delivery-orchestrator,
  model-routing, token-optimization.

A one-line change to a password reset flow classifies CRITICAL because of its
security signal alone, even though every other signal says TRIVIAL. A
five-hundred-line mechanical rename classifies LOW because no signal reaches
higher. The rule is deliberate: averaging signals would hide the one that
matters.
