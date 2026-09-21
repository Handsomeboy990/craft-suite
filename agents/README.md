# agents

Twenty-six specialised agent definitions for an agent runtime that supports
subagents, such as Claude Code.

An agent here is a role with a narrow responsibility. It is thin by design:
the expertise lives in the skills, and the agent decides which skills apply,
executes within its boundary, and hands off through a durable artefact.

## Why the expertise is not in the agent

A skill and an agent answer different questions.

```
Skill   how this kind of work is done correctly
Agent   who owns this piece of work, what they may touch, what they hand on
```

Duplicating a skill's content into an agent produces two documents that drift.
Every agent below references the skills it uses and never restates them.

## The twenty-six

| Agent | Owns | Primary skills |
|---|---|---|
| `delivery-orchestrator` | the project lifecycle and its gates | delivery-orchestrator |
| `compliance-verifier` | the launch completeness gate, verified with evidence | launch-readiness, implementation-integrity |
| `source-of-truth` | the canonical facts of a project, docs reconciled against the code | project-exploration, project-continuity |
| `checkup` | the pre-intervention inspection: architecture, debt, risk, safe boundaries | project-exploration, architecture-design |
| `final-verifier` | the independent, evidence-only final gate that trusts no previous agent | code-review-protocol, validation-gate |
| `principal-engineer` | a multi surface engineering request and its gates | engineering-orchestrator, engineering-core |
| `requirements-analyst` | requirements into a specification | requirements-analysis, clarification-gate |
| `pr-author` | packages verified work into a pull request and opens it | git-workflow, implementation-integrity |
| `pr-reviewer` | the independent review and mergeability gate on a pull request | code-review-protocol, git-workflow |
| `software-architect` | architecture and technology decisions | architecture-proposal, technology-selection, architecture-design |
| `frontend-engineer` | client implementation | frontend-engineering, ui-ux-engineering |
| `site-template-engineer` | a client site template and the back office its owner runs it from | site-template-generation, admin-console |
| `backend-engineer` | server implementation | backend-engineering, input-validation |
| `database-engineer` | schema, migrations, query quality | database-operations, performance-engineering |
| `security-engineer` | audits and fixes security | security-audit, input-validation |
| `web-auditor` | audits a live site from its URL, passive anywhere and active on authorization | website-audit, playwright-automation |
| `qa-engineer` | test strategy and quality gates | testing-quality, code-review-protocol |
| `playwright-engineer` | browser verification | playwright-automation |
| `ui-ux-engineer` | rendered experience and accessibility | ui-ux-engineering |
| `design-verification` | design drift and generic-defaults, verified against intent | design-authenticity, ui-ux-engineering |
| `design-research` | reference patterns extracted as principles, never copied | design-authenticity, animation |
| `devops-engineer` | environments, pipeline, deployment | devops-core and family |
| `performance-engineer` | measured performance work | performance-engineering |
| `documentation-engineer` | documentation matching the code | technical-documentation |
| `release-engineer` | release verification and rollout | release-readiness, release-engineering |
| `incident-responder` | a degraded production system, then the postmortem | incident-response, observability |

## Structure

```
                       delivery-orchestrator
                                |
                       principal-engineer
                                |
        +---------------+-------+-------+---------------+
        |               |               |               |
   requirements-    software-       security-       devops-
     analyst        architect       engineer        engineer
        |               |               |               |
        +-------+-------+       +-------+-------+       |
                |               |               |       |
          frontend-        backend-        database-    |
          engineer         engineer        engineer     |
                |               |               |       |
          ui-ux-           performance-    playwright-  |
          engineer         engineer        engineer     |
                |               |               |       |
                +-------+-------+-------+-------+-------+
                        |
                   qa-engineer
                        |
              documentation-engineer
                        |
                 release-engineer
                        |
                 incident-responder
```

The lines are handoff paths, not a command hierarchy. Every agent reports back
to the orchestrator, which holds the gates.

## Review gates

No agent is the only authority over its own critical work.

```
frontend-engineer      -> qa-engineer, ui-ux-engineer, code review
site-template-engineer -> ui-ux-engineer for the rendered result, qa-engineer
                          for the gate
backend-engineer       -> security-engineer, qa-engineer, code review
database-engineer      -> backend-engineer, performance-engineer,
                          release-engineer
devops-engineer        -> security-engineer, release-engineer
security-engineer      -> qa-engineer, for the tests that encode each fix
incident-responder     -> qa-engineer for the regression, release-engineer for
                          the hotfix path
```

## Handoff

Every agent finishes by writing the handoff block from
`handoff-protocol.md`. Nothing important travels only in conversation: the
next agent may start with none of the previous one's context.

## Installation

```
bash install.sh --agents      copy the agents to ~/.claude/agents
bash install.sh               skills and agents together
```

The directory is `agents/` in the repository rather than `.claude/agents/`,
because `.claude/` is machine local configuration and is never committed. The
installer places them where the runtime reads them.

## Parallel execution

Agents run in parallel only across a defined contract, per
`delivery-orchestrator` section 6. The common safe case is frontend and
backend after the API contract task is complete. The common unsafe case is any
agent working against a shape that has not been fixed yet.
