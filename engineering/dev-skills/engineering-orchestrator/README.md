# engineering-orchestrator

Central routing layer. Classifies the request into one of thirty-nine
categories, locates the affected surface, composes the smallest complete plan
from the canonical plans, assigns each step to the agent the chief's team map
names, enforces the mandatory gates, prevents loops and issues the completion
verdict.

- Inputs: the user request, the repository.
- Outputs: task classification, execution plan, team plan when agents run
  it, verification gates, completion verdict.
- Depends on: engineering-core, project-exploration.
- Downstream: every skill in `dev-skills`.

Reference data: `resources/execution-plans.md` holds one machine checkable
plan per category, `resources/routing-table.md` maps phrasing and diff facts
to categories and forced gates. `resources/agent-dispatch.md` maps each category
to its lead and each plan step to the agent that runs it, applying
`delivery-orchestrator`'s `resources/team-routing.md` and
`resources/parallel-dispatch.md` rather than restating them.

Validated by `tests/validate-orchestration.sh`, which checks that every
category has a plan, that every plan step names a real skill, and that the
mandatory gates appear in the plans that require them.
