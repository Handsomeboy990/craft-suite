---
name: backend-engineering
description: Builds server side features to production standard: handlers, services, business rules, authorization, database access, transactions, migrations, indexes, error handling, logging, jobs, queues, webhooks, idempotency, retries, timeouts and observability. Use for any endpoint, service, job or data change.
license: MIT
metadata:
  category: dev-skills
  version: 1.1.0
  depends_on: [engineering-core, project-exploration, architecture-design]
  outputs: [handlers, services, migrations, error-contract, observability-notes]
---

# Backend Engineering

The server is the only place where a rule is actually enforced. Everything the
client does is a suggestion.

## 1. Layering

Three responsibilities, kept apart, whatever the framework calls them.

```
Handler   parse, validate, authenticate, authorize, call, map to a response
Service   business rules, invariants, orchestration, transaction boundary
Data      queries and persistence, no business rules
```

Rules for the handler: no business logic, no query construction, no more than
a screen of code. Rules for the service: no framework request or response
objects, no HTTP status codes. Rules for the data layer: no decisions.

When the project has fewer layers, follow the project. Do not introduce a
layer to satisfy a diagram; introduce it when a second caller appears.

## 2. Handler protocol

Every handler, in this order, without exception:

1. authenticate, reject before anything else;
2. validate the input against a schema, reject on failure;
3. authorize, including object level ownership;
4. call the service with typed, valid arguments;
5. map the result to a response shape the project already uses;
6. map failures to status codes deliberately;
7. log the failure with context, without secrets.

Skipping step 3 because step 1 passed is the most common serious defect in
backend code. Authentication says who; authorization says whether.

The input schema and the authorization rule are declared together at the
handler's definition, where a reviewer sees them without reading the body. A
server function, a server action or a remote procedure is a public endpoint
whatever the framework calls it, and follows the same order.

Create is authorized like update. A create that attaches the new object to a
parent (a team, a community, a project) checks the caller's right on that
parent exactly as the update does. The create path is the one most often left
open, because there is no existing row to check.

## 3. Never trust the client

Read from the server, never from the request:

prices and totals, currency, discounts, roles and permissions, ownership,
resource identifiers used for access decisions, workflow state transitions,
quotas and limits, timestamps that drive business rules, visibility (drafts,
unpublished, private or deleted rows), anything that grants an advantage.

Visibility is derived on the server from the caller's identity and role. A
filter parameter may narrow what the caller is allowed to see; it never
widens it. An unauthenticated read that accepts a `draft` or `includePrivate`
flag from the caller publishes the drafts.

The request may carry an identifier and a quantity. Everything else is looked
up.

## 4. Database

**Queries.** Parameterised, always. Select the columns needed, not everything.
Every list query has a limit and a pagination contract. No query inside a
loop.

**Indexes.** Every column used for filtering, joining or ordering in a query
the feature adds. A foreign key without an index is a slow delete waiting to
happen. Composite index order matters: equality columns first, then range.

**Transactions.** Wrap exactly what must be atomic. No network call inside a
transaction. Keep them short; a transaction held across an external request is
a lock held across someone else's latency. Choose the isolation level
deliberately when the default does not prevent the anomaly at hand.

**Concurrency.** A check followed by a write is a race unless the database
enforces it. Prefer a unique constraint, a conditional update, or an atomic
increment over a read then write. A counter (views, likes, stock) is
incremented by the store, never read and set to the value plus one. A rate
limit counter is checked and incremented in one conditional statement, several
windows in one transaction, per `rate-limiting`.

**Ownership in the query.** Where the store allows it, object level
authorization is part of the statement: select, update or delete by identifier
and owner together, and answer not found when no row matches. The check cannot
then be lost between a read and a write, and the answer does not reveal that
another caller's row exists. A dependent row that blocks the operation (a
comment with replies) is refused with an explicit conflict, not left to fail
on the foreign key.

**Migrations.** Reversible, or explicitly marked irreversible with the reason.
Additive first: add the column, backfill, switch the reads, then drop the old
one, in separate deploys. Never rename and drop in the same migration that the
running code depends on. State the lock behaviour on large tables.

## 5. Errors

Two kinds, handled differently.

| Kind | Example | Response | Log level |
|---|---|---|---|
| expected | invalid input, not found, forbidden, conflict, quota | precise status, stable error shape | info or warn |
| unexpected | database down, unhandled defect, provider failure | generic message, no internals | error, with the full context |

Rules:

- one error shape across the API, matching what already exists;
- status codes chosen deliberately: 400 malformed, 401 unauthenticated, 403
  unauthorized, 404 absent or hidden, 409 conflict, 422 semantically invalid,
  429 limited, 500 unexpected;
- never leak a stack trace, a query, a file path or an internal identifier;
- never swallow an exception silently;
- an error that cannot be handled is propagated, not converted to a null that
  the caller will misread as absence.

## 6. External services

Decided before the first call, not after the first incident:

```
Timeout      a value, always, connect and total
Retry        bounded, exponential, jittered, idempotent operations only
Circuit      what happens when it is down repeatedly
Fallback     degrade, queue, or fail, chosen and stated
Idempotency  a key on any call that moves money or creates a resource
Verification signatures on inbound webhooks, before parsing
```

A call with no timeout is an outage waiting for the dependency to be slow
rather than down, which is the more common failure and the harder one.

## 7. Jobs, queues and scheduled work

- Every job is idempotent, because it will run twice.
- Every job is bounded in time and in the number of rows it touches.
- Failures are retried with a limit, then moved somewhere visible.
- A scheduled job that overlaps its previous run either locks or is designed
  to tolerate the overlap.
- Job arguments are identifiers, not serialised entities that go stale in the
  queue.
- A table of rows that expire (rate limit windows, one-time tokens, sessions)
  has a cleanup job, or it grows without bound; see `background-jobs`.
- Every job logs its start, its outcome and its counts.

## 8. Observability

Logs are for reconstruction, not decoration.

```
Structured   fields, not interpolated prose
Correlated   a request identifier that crosses the layers
Levels       error for unexpected, warn for expected failures worth seeing,
             info for state changes, debug off in production
Never        passwords, tokens, session identifiers, full bodies, personal
             data beyond what is needed to reconstruct
Metrics      counts and durations for the paths that matter
```

The test for a log line: during an incident, does it change what the operator
does next? If not, remove it.

## 9. API contracts

- Additive changes are safe: new optional fields, new endpoints.
- Breaking changes require a version, a deprecation period or a migration, and
  a documentation update in the same change.
- Response shapes are explicit field lists. Serialising an entity directly is
  how private fields reach clients.
- Pagination is a contract, not an implementation detail: state the shape,
  the limit and the maximum.
- Empty results are an empty collection with a 200, not a 404.

## 10. Protocol

1. Read the conventions and the layering the project actually uses.
2. Take the boundary decisions from `architecture-design` when the change
   creates one.
3. Write the schema, then the handler skeleton in the order of section 2.
4. Write the service with the business rules and the transaction boundary.
5. Write the data access, with the indexes the queries require.
6. Decide the error contract and the failure behaviour of every dependency.
7. Add logging that an operator can use.
8. Write the tests, including the negative and concurrent cases.
9. Run the suite and the repository checks.
10. Hand to `security-audit` and `code-review-protocol`.

## 11. Auto-critique

Score from 0 to 5: layering respected, handler order complete including
authorization on create as on update, nothing trusted from the client
including visibility, query and index quality,
transaction correctness, error contract consistency, dependency failure
handling, idempotency, log usefulness, test coverage of negative paths.

Threshold: no axis below 3, average at least 4. A missing authorization check,
including on a create path, or an unparameterised query is an automatic
failure.

## 12. Interfaces

- Upstream: `architecture-design`, `project-exploration`.
- Lateral: `input-validation`, `frontend-engineering` for the contract,
  `rate-limiting` for limit policy, `background-jobs` for cleanup work.
- Downstream: `security-audit`, `testing-quality`,
  `performance-engineering`, `code-review-protocol`,
  `technical-documentation`.
