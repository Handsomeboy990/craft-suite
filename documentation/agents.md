# Agents

Twenty-one agent definitions, for a runtime that supports subagents.

This document explains the difference between a skill, an agent and
orchestration, and gives the public contract of each agent. The definitions
themselves are in `agents/<group>/`, and the transfer format is in
`agents/handoff-protocol.md`.

## Skill, agent, orchestration

```
Skill          how this kind of work is done correctly
Agent          who owns this piece of work, what they may touch, what they hand on
Orchestration  which agents run, in what order, and where the gates are
```

A skill is knowledge. It has no boundary, no ownership and no state. Two
agents can load the same skill.

An agent is a role. It has a boundary, an input, an output and a handoff. It
is deliberately thin: it names the skills it uses and never restates them.
Duplicating a skill into an agent produces two documents that drift, and the
one the agent reads is the stale one.

Orchestration is sequencing. `delivery-orchestrator` owns a project across
fourteen phases and holds four approval gates. `principal-engineer` owns a
request that spans several surfaces without being a full delivery.
`engineering-orchestrator` owns a single task and composes the smallest
complete plan for it.

## When you do not need agents

Agents are useful when a runtime can run subagents with separate contexts, and
when a piece of work is large enough that separating roles pays for the
handoff.

For a single task, the skills alone are enough. Install with `--no-agents` and
let `engineering-orchestrator` sequence the skills in one context.

## The seventeen

| Agent | Owns | Runs after | Hands to |
|---|---|---|---|
| `delivery-orchestrator` | the project and its gates | the brief | every other agent |
| `principal-engineer` | one multi surface request and its gates | a request larger than one task | the specialist agents |
| `requirements-analyst` | requirements into a specification | the brief | `software-architect` |
| `software-architect` | architecture and technology decisions | requirements | the validation gate, then implementation |
| `frontend-engineer` | client implementation | approved architecture, fixed contract | `qa-engineer` |
| `backend-engineer` | server implementation | approved architecture | `qa-engineer`, `security-engineer` |
| `database-engineer` | schema, migrations, query quality | approved architecture | `backend-engineer` |
| `security-engineer` | audit and fix | implementation | `qa-engineer` |
| `qa-engineer` | test strategy and the quality gate | implementation | `release-engineer` |
| `playwright-engineer` | browser verification | a working interface | `qa-engineer` |
| `ui-ux-engineer` | the rendered experience | requirements | `frontend-engineer` |
| `devops-engineer` | environments, pipeline, deployment | a verified build | `release-engineer` |
| `performance-engineer` | measured performance work | a measurement or a symptom | `qa-engineer` |
| `documentation-engineer` | documentation matching the code | behaviour change | `release-engineer` |
| `release-engineer` | whether it ships, and how | every gate passed | production verification |
| `incident-responder` | a degraded production system | an alert or a report | `debugging`, `qa-engineer`, the action items |

## The contract of every agent

Each definition carries the same eight sections, verified by
`tests/validate-orchestration.sh` check 10.

| Section | Answers |
|---|---|
| Role | what this agent is |
| Mission | what it is responsible for achieving |
| Responsibilities | what it does, concretely |
| Inputs | what it needs before it can start |
| Outputs | what it produces |
| Boundaries | what it must not touch, and who owns that instead |
| Verification | what it must have observed before reporting done |
| Handoff | what it passes on, and to whom |

Plus a `Skills` section naming the skills it loads. Check 11 verifies that
every skill named there exists.

Boundaries are the section that makes the set work. Without them, two agents
edit the same file with different intentions, and the second silently
overwrites the first.

## Reading an agent before using it

```bash
sed -n '1,40p' agents/development/backend-engineer.md
```

The metadata block gives the name and a description built for selection. The
Boundaries and Handoff sections tell you what it will refuse and what you get
back. Those three are enough to decide whether it is the right agent.

## Interaction model

Agents communicate through artefacts, not conversation. The format is in
`agents/handoff-protocol.md`.

An agent that finishes leaves behind what the next one needs to start: what
was done, what was verified and how, what was decided, what remains, and what
the next agent must not assume. A handoff that says the work is complete and
nothing else has transferred nothing.

## Configuration

Agents hold no configuration. They inherit it from the skills they load. The
one that matters in practice is `identity.author_name` and
`identity.author_email`, read by `git-workflow`, which most implementation
agents reach at the end of their work.

## Limitations

- An agent is only as bounded as its runtime. A runtime that gives every
  subagent full write access enforces none of the Boundaries sections, which
  then become a documented discipline rather than a guarantee.
- Nothing verifies at runtime that a review gate between two agents was
  actually held. `tests/validate-orchestration.sh` verifies the definitions
  are coherent, not that an execution respected them.
- The seventeen cover software delivery. There is no agent for the writing tree
  or the documents tree: both are sequential, single-context work where an
  agent boundary would add a handoff and remove nothing.

## Adding an agent

1. Create the file in `agents/<group>/`, with the eight sections and a
   `Skills` section.
2. Reference skills; never copy their content.
3. Add a row to `agents/README.md`.
4. Add the name to `AGENT_NAMES` in `tests/validate-orchestration.sh`.
5. Run the five validation scripts.

Step 4 is not optional: check 10 fails for a declared agent with no file, and
also for a file with no declaration. The list and the directory are kept in
agreement in both directions.
