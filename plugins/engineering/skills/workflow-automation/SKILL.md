---
name: workflow-automation
description: Builds automation workflows for a project through an external workflow engine reached over a connector, such as n8n over its MCP server: decides whether the project wants automation at all and asks per project rather than assuming, detects and explains the connector it needs instead of inventing access, and builds workflows that are idempotent, retried, observable and free of embedded secrets. Use when a project asks for scheduled jobs, integrations or event-driven automation through a workflow tool.
license: MIT
metadata:
  category: devops-skills
  version: 1.0.0
  depends_on: [engineering-core, devops-core]
  outputs: [automation-opt-in-record, connector-requirement, workflow-definitions, workflow-verification]
---

# Workflow Automation

Some projects want a layer of automation that does not belong in the
application: a nightly export, a webhook that fans out to three services, a
Slack message when an order fails, a scheduled reconciliation. A workflow
engine such as n8n does that, and this skill builds those workflows cleanly.
It starts from two refusals: it does not assume a project wants automation,
and it does not pretend to have a connection it has not been given.

The concrete target here is n8n, reached over its MCP server. The method is
written to be general, because the next engine is reached the same way; the
n8n specifics are in `resources/n8n-connector.md`.

## 1. Per project, ask first

Automation is opt-in, per project, and the answer is recorded, not assumed.

```
before building anything
    ask the project owner, once: does this project want workflow automation,
    and for what. A project that does not want an external engine in its
    stack should not get one because a workflow was easy to write.
record the answer
    yes, with the workflows wanted; or no, and nothing is built. A silent
    default of yes adds an operational dependency nobody chose.
```

A workflow engine is an operational dependency: another system to run, secure,
monitor and pay for. Adding it to a project that did not ask is the same defect
as adding a library nobody needed.

## 2. The connector is detected, explained, never invented

n8n is reached over an MCP server that must be configured and authorized
outside this skill, interactively, by the person running the agent. This skill
does not fabricate that connection.

```
detect       determine whether the n8n MCP connector is configured and
             reachable in this environment
present      if it is not, state exactly what is missing: the MCP server is
             not configured or not authorized
guide        point to the configuration step (the MCP configuration, the
             authorization flow), which is the user's to run interactively
stop         until the connector is real, no workflow is built against it, and
             no access is assumed or simulated
```

This is the general rule for any external connector, stated in the source
material: detect the requirement, explain it, guide the user to configure it,
and do not invent access. A skill that pretends a connection exists produces a
workflow that cannot run and a report that lies.

## 3. What a clean workflow has

Once the connector is real and the project has opted in, every workflow built
carries these, and none is optional.

| Property | What it means |
|---|---|
| Idempotency | a workflow that runs twice on the same input produces the same effect once, because a scheduler or a retry will run it twice |
| Error handling | every node that can fail has a failure path: a caught error, a notification, a dead-letter, not a silent stop |
| Bounded retries | a failed step retries with backoff a stated number of times, then stops and reports, rather than retrying forever |
| Timeouts | every outbound call has a timeout and a decided behaviour when it is hit |
| No embedded secret | credentials come from the engine's own credential store or the environment, never hardcoded in the workflow definition |
| Signed inbound | a webhook the workflow receives verifies its signature before acting |
| Observability | a run leaves a trace an operator can read: what ran, what it touched, what failed |
| Versioned definition | the workflow definition is exported and version controlled, so it is reviewable and restorable, not only living in the engine |

## 4. Secrets never live in the workflow

The workflow definition is exported, committed and shared. A credential in it
is a leaked credential.

```
credentials       held in the engine's credential store, referenced by name,
                  or read from the environment; never written into a node
the exported JSON  reviewed before commit for any token, key or connection
                  string, exactly as any diff is
a leaked one      rotated, not just deleted, because export and commit may
                  already have carried it
```

This is `secrets-management` applied to a workflow definition: the definition
is source, and source carries no secret.

## 5. Verifying a workflow

A workflow is not done because it was created in the engine. It is done when it
was run and observed.

```
run it on a real input, or a representative test input
observe the trace: every node reached, the effect produced once, the failure
    paths exercised by a deliberately bad input
confirm idempotency by running it twice and checking the effect happened once
confirm the retry and timeout behaviour by forcing a failure
```

A workflow reported as working without a run observed is the same fabrication
`implementation-integrity` forbids in application code.

## 6. Prohibitions

- No workflow engine added to a project that did not opt in.
- No workflow built against a connector that is not actually configured and
  authorized; the connection is never assumed or simulated.
- No secret written into a workflow definition.
- No unbounded retry, no failure path that silently stops.
- No workflow reported as working without a run observed.
- No inbound webhook acted on without verifying its signature.

## 7. Protocol

1. Ask the project owner whether this project wants workflow automation, and
   for what. Record the answer. If no, stop.
2. Detect whether the n8n MCP connector is configured and reachable. If not,
   state what is missing and hand the interactive configuration step to the
   user; do not proceed against a connection that does not exist.
3. For each wanted workflow, design it with the section 3 properties:
   idempotency, error handling, bounded retries, timeouts, observability.
4. Keep every credential in the engine's credential store or the environment,
   and scan the exported definition for secrets before committing it.
5. Run each workflow on a real or representative input, observe the trace,
   force a failure to exercise the error and retry paths, and run it twice to
   confirm idempotency.
6. Export the workflow definition, review it, and commit it under version
   control so it is reviewable and restorable.

## 8. Auto-critique

Score from 0 to 5: the project actually opted in rather than being assumed
into automation, the connector was detected and its absence handed over rather
than simulated, every workflow has idempotency, error handling, bounded
retries and timeouts, no secret is in the definition, and each workflow was
run and observed rather than declared.

Threshold: no axis below 3, average at least 4. A workflow built against a
connector that was assumed rather than confirmed scores 0 overall, because it
cannot run and the report that says it can is false.

## 9. Interfaces

- Upstream: `engineering-core`, `devops-core`.
- Lateral: `secrets-management` for the credentials the workflow uses,
  `background-jobs` when the automation belongs in the application's own job
  system rather than an external engine, `observability` for the run traces,
  `input-validation` for the inbound webhook payloads.
- Reference data: `resources/n8n-connector.md`.
