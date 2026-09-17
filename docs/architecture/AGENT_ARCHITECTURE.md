# Agent architecture

How the suite separates three concerns that are routinely collapsed into one:
what a skill knows, who is responsible for applying it, and who decides which
responsibility is needed at all.

```
Skill            how a kind of work is done correctly, and to what standard
Agent            who owns a piece of work, what they may touch, what they hand on
Orchestration    which agents run, in what order, with what context, and when
                 the work is actually finished
```

A skill has no boundary and no state; two agents can load the same one. An
agent is deliberately thin: it names the skills it uses in a `Skills`
section and restates none of them, so the skill and the agent cannot drift
apart from each other. Full rationale in `documentation/agents.md`; this
document covers the architecture the agents sit inside, not the agents
individually.

## Layers

```
User
  |
Requirements / intake        requirements-analysis, clarification-gate
  |
Orchestration                delivery-orchestrator (a project)
                              principal-engineer (a multi-surface request)
                              engineering-orchestrator (one task)
  |
  +-- task-complexity          one classification, read by every branch below
  +-- model-routing            model tier and effort, from that classification
  |
  +-- Architecture             software-architect
  +-- Design                   ui-ux-engineer
  +-- Implementation           frontend-engineer, backend-engineer, database-engineer
  +-- Security                 security-engineer
  +-- QA / Testing             qa-engineer, playwright-engineer
  +-- Documentation            documentation-engineer
  +-- DevOps                   devops-engineer, release-engineer, incident-responder
  |
Verification                  code-review-protocol, testing-quality, evidence
  requirements from the agent that did the work, read by the orchestrator
  |
Delivery                      client-handover, release-readiness
```

This mirrors the layered flow requested for the suite's evolution, adapted to
what actually exists: `delivery-orchestrator` and `principal-engineer` already
fill the role a generic "Project Lead" would have filled, so no third,
overlapping orchestrator was added on top of them. Where the requested
architecture named a role with no equivalent, `source of truth`, `checkup`,
`final verifier`, that gap is recorded honestly in
`multi-agent-assessment.md` section 3 rather than filled with a thin,
unreviewed stand-in.

## The nineteen agents, by group

Agents live in `agents/<group>/`, a repository-wide tree independent of any
single skill domain, so a future agent pack, security, design, research,
installs on its own. Catalog and public contracts: `agents/README.md` and
`documentation/agents.md`.

| Group | Agents | Owns |
|---|---|---|
| `core` | `delivery-orchestrator`, `principal-engineer`, `requirements-analyst` | the project lifecycle, a multi-surface request, requirements |
| `development` | `software-architect`, `frontend-engineer`, `backend-engineer`, `database-engineer`, `performance-engineer` | architecture, client and server implementation, schema, measured performance |
| `design` | `ui-ux-engineer` | the rendered experience and accessibility |
| `security` | `security-engineer` | audits and fixes |
| `testing` | `qa-engineer`, `playwright-engineer` | test strategy, browser verification |
| `documentation` | `documentation-engineer` | documentation matching the implementation |
| `devops` | `devops-engineer`, `release-engineer`, `incident-responder` | environments and pipeline, release verification, incident response |
| `research` | reserved, empty | a future research agent; nothing installs from here yet |

## The agent contract

Eight mandatory sections, the same for every agent, checked by
`tests/validate-orchestration.sh` check 10: Role, Mission, Responsibilities,
Inputs, Outputs, Boundaries, Verification, Handoff, plus a `Skills` section
naming what it loads. `Boundaries` is the section that makes a set of agents
work together rather than collide: it states what an agent explicitly does
not do, so two agents do not silently edit the same concern with different
intentions.

## Handoff

Every agent finishes with the seven-field block in
`agents/handoff-protocol.md`: Completed, Changed, Decisions, Verified, Known
issues, Next action, For. The two fields that carry the most are `Verified`
and `Known issues`, because they are what tells the next agent where the
reliable ground ends. This is the suite's answer to the requested handoff
protocol; it predates this phase and was not changed by it.

## Model routing, at the agent boundary

Two mechanisms are real, verified against this runtime's own tool
definitions rather than a secondary source: an agent's frontmatter can
declare a default model, and the orchestrating session can override that
model when it dispatches the agent. `model-routing` decides which model tier
applies to a given dispatch, from the classification `task-complexity`
produces. Detail, and what is deliberately not claimed: `MODEL_ROUTING.md`.

## Safety

Enforced today at `engineering-orchestrator` section 6 (anti-loop rules) and
`delivery-orchestrator`'s gate structure, not duplicated here:

- a skill runs at most twice per task, the second run stating what changed;
- a rejected finding is not re-raised in the same form;
- verification is not repeated when its inputs are unchanged;
- a plan producing no progress twice in a row stops and reports the exact
  blocker rather than cycling.

Full detail, including delivery-level gates and escalation: `ORCHESTRATION.md`.

## What this phase did not change

No agent's Role, Mission, Responsibilities, Boundaries or Handoff content
changed. The sixteen files moved; none was rewritten. Review gates between
agents (`agents/README.md`, "Review gates") are unchanged.
