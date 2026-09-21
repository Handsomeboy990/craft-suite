# Agent documentation

Entry point for the agent architecture. The agent definitions themselves,
and their public contracts, are not duplicated here; this page is a map to
where each piece of the system actually lives.

## Start here

| Question | Answer, and where |
|---|---|
| What is an agent, and how does it differ from a skill | `documentation/agents.md` |
| What are the twenty-six agents, and what does each own | `agents/README.md`, the catalog |
| What is the full contract of one specific agent | the agent's own file, `agents/<group>/<name>.md` |
| How does an agent hand off to the next one | `agents/handoff-protocol.md` |
| How does the suite decide which agents a request needs | `docs/architecture/AGENT_ARCHITECTURE.md`, `docs/architecture/ORCHESTRATION.md` |
| Which agents does a given kind of workflow use | `docs/architecture/SKILL_AGENT_MATRIX.md` |
| Which model and effort should an agent dispatch use | `docs/architecture/MODEL_ROUTING.md`, the skill at `engineering/dev-skills/model-routing/` |
| How is token use kept proportional across a multi-agent task | `docs/architecture/TOKEN_OPTIMIZATION.md` |
| What was already built, what changed, what is deferred and why | `docs/architecture/multi-agent-assessment.md` |
| How does a project install only the agents it needs | `documentation/installation.md`, `bash install.sh --agents` |

## The shape of the system, in one paragraph

A skill is knowledge with no boundary; an agent is a role with a boundary,
an input, an output and a handoff; orchestration decides which agents run,
in what order, with what context, and when the work is actually finished.
`task-complexity` classifies a task once; `model-routing` reads that
classification to recommend a model tier and, where a lever exists, an
effort level; `token-optimization` is the discipline that keeps the work
proportional to the task while it happens. None of these five ideas
duplicates another's definition; each is written once, at the location this
page points to, and referenced everywhere else.

## What is not yet built

Named honestly rather than implied to exist: a `model-router` agent distinct
from the `model-routing` skill, a `pentester`, a `reproduction` agent and a
`research` agent. Full reasoning for the boundary in
`docs/architecture/multi-agent-assessment.md` section 3, whose own figures are
those of the moment it was written.

The rest of the list that used to stand here has since been built and shipped:
`source-of-truth`, `checkup` and `final-verifier` in Phase 4,
`design-research`, `design-verification` and `compliance-verifier` before them.
`agents/README.md` is the roster of what exists, and
`tests/validate-counts.sh` fails if a name in the paragraph above turns up as a
file under `agents/`, so this page cannot go stale again in that direction.

## Installing only what is needed

Agents install independently of any single domain's skills:

```bash
bash install.sh --agents      the twenty-six agents, no skills
bash install.sh --no-agents   skills without agents, for single-context work
bash install.sh --dev         the engineering skills and the agents together
```

A writer, a researcher or a job seeker installing `--writing`, `--research`
or `--career` never receives an agent; the agent layer is specific to
software delivery today, per `agents/README.md`'s own note that the writing
and documents trees are sequential, single-context work where an agent
boundary would add a handoff and remove nothing.
