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

The request is sized once, before composition, and each dispatched slice
once, when it is cut. `resources/sizing-to-composition.md` maps the size to
the chief's phase depth, team shape and parallel waves, and orders how a
re-size propagates when the scope changes. A text-only step (a title, a
summary, a compaction) is sized by what it does, not by the request it
serves: no tools, no write surface, the smallest model tier, unless its text
is a verdict on other work.

A one-line change to a password reset flow classifies CRITICAL because of its
security signal alone, even though every other signal says TRIVIAL. A
five-hundred-line mechanical rename classifies LOW because no signal reaches
higher. The rule is deliberate: averaging signals would hide the one that
matters.
