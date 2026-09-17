# Example: the two gates before a workflow is built

A project team says "automate our order failures: when an order fails, post to
Slack and open a ticket." Two gates come before any workflow exists.

## Gate 1: the project opts in

```
Ask: does this project want a workflow engine (n8n) in its stack, for this
     automation and any future automation, given it is another system to run,
     secure, monitor and pay for?
Answer recorded: yes, for order-failure notifications and a nightly export.
```

Had the answer been no, nothing is built, and the automation is proposed as an
application job through `background-jobs` instead, which needs no external
engine.

## Gate 2: the connector is real, or it is not

```
Detect: are the n8n MCP tools available in this environment?
Result: no. The n8n MCP server is not configured or not authorized here.

The skill stops and reports:
  "The n8n workflow cannot be built yet: the n8n MCP server is not configured
   or not authorized in this environment. Configure and authorize it
   interactively in your MCP settings, then re-run. I will not simulate the
   connection or produce a workflow I cannot actually create."
```

The skill does not ask for an API token to wire n8n by hand, does not invent a
workflow id, and does not report a workflow as created. The connection is the
user's to make, interactively.

## After both gates pass

With the project opted in and the connector real, the order-failure workflow
is built with the section 3 properties:

```
trigger        the order-failure event, received on a Webhook node that
               verifies the provider signature first
idempotency    a dedupe key on the order id, so a retried event posts to Slack
               and opens a ticket once, not twice
Slack node     a timeout and an error output routed to an Error Trigger
ticket node    the same, with a bounded retry of three attempts and a wait
credentials    the Slack and ticket tokens referenced from n8n's credential
               store, never typed into the nodes
verification   run on a real failed order, observe the trace, force the ticket
               API to fail to exercise the retry and error path, run the event
               twice to confirm one Slack post and one ticket
export         the workflow JSON committed, reviewed for secrets first
```

The automation exists because the project chose it and the connector was real,
and it is trusted because it was run and observed, not because it was created.
