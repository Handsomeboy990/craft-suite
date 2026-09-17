# The n8n connector

n8n is the concrete workflow engine this skill targets, reached over its MCP
server. This file holds what is specific to n8n; the method in `SKILL.md` stays
general so a different engine is reached the same way.

## The connection is the user's to make

The n8n MCP server is configured and authorized outside this skill, and it
cannot be done from a non-interactive session. The person running the agent
configures it interactively, through their MCP configuration and n8n's own
authorization. This skill does not fabricate that connection, and it does not
ask for a token, an API key or a callback URL to configure it by hand: that is
not how an MCP server is authorized.

```
detect       the skill checks whether the n8n MCP tools are available in this
             environment
absent        if they are not, the skill states that the n8n MCP server is not
             configured or not authorized, and stops
guide         it points the user to configure it interactively (their MCP
             settings, the n8n authorization flow) and to re-run once done
never         it never proceeds against an assumed connection, and never
             invents a workflow it claims was created in n8n when it was not
```

## n8n specifics that map to the general rules

| General rule (SKILL.md) | On n8n |
|---|---|
| No secret in the definition | credentials live in n8n's credential store and are referenced by a node, never typed into the node's fields; the exported workflow JSON carries the reference, not the value |
| Idempotency | a workflow triggered by a schedule or a webhook guards against double effect with a dedupe key or an upsert, because n8n will re-run on retry |
| Error handling | an Error Trigger workflow, or a node's own error output, catches a failure and routes it to a notification or a dead-letter, rather than letting the run stop silently |
| Bounded retries | a node's retry-on-fail is set to a stated count with a wait between attempts, not left unbounded |
| Timeouts | HTTP Request nodes set a timeout and a decided behaviour when it is hit |
| Signed inbound | a Webhook node verifies the provider signature in an early node before any effect |
| Versioned definition | the workflow is exported to its JSON and committed, so it is reviewable in a diff and restorable, not only present in the running n8n instance |

## What is exported and committed

The workflow JSON, with credentials referenced by name and no value inlined,
reviewed for secrets before commit exactly as any diff is. A credential that
reaches the exported JSON is rotated in n8n, not just removed from the file,
because the export and the commit may already have carried it.
