# Endpoint checklist

Applied to every route, action, consumer or job that the change adds or
modifies.

## Order of operations

- [ ] Authentication first, rejecting before any work.
- [ ] Input validated against a schema before any field is read.
- [ ] Authorization checked, including ownership of every referenced object.
- [ ] Schema and authorization declared together at the definition, server
      functions and server actions included.
- [ ] A create path checks the caller's right on the parent exactly as the
      update path does.
- [ ] The service receives typed, valid arguments.
- [ ] The result is mapped to the project's existing response shape.
- [ ] Failures are mapped to status codes deliberately.
- [ ] The handler contains no business logic and no query construction.

## Trust

- [ ] Price, total, currency and discount come from the database.
- [ ] Role, permission and plan come from the database.
- [ ] Ownership is verified, not accepted from the payload.
- [ ] State transitions are validated against the stored current state.
- [ ] Quotas and limits are enforced server side.
- [ ] Visibility (drafts, private, deleted) is derived from the caller, never
      taken from a request flag.
- [ ] No field is written that the caller should not be able to set.

## Queries

- [ ] Parameterised, with no string concatenation.
- [ ] Explicit column selection, no blanket entity serialisation.
- [ ] Every list query has a limit and a pagination contract.
- [ ] No query inside a loop.
- [ ] Filter, join and order columns are indexed.
- [ ] Composite index column order matches the query shape.
- [ ] The query plan was checked when the table is large.

## Transactions

- [ ] The boundary covers exactly what must be atomic.
- [ ] No network call inside the transaction.
- [ ] No long computation inside the transaction.
- [ ] Check then write sequences are replaced by constraints, conditional
      updates or locks.
- [ ] Counters are incremented by the store; rate limit counters are checked
      and incremented in one conditional statement.
- [ ] Ownership is part of the query where the store allows it, and a miss
      answers not found.
- [ ] Rollback leaves no side effect behind, including sent mail.

## Migrations

- [ ] Reversible, or the irreversibility is stated with the reason.
- [ ] Additive first, with the drop deferred to a later deploy.
- [ ] Backfill is batched and bounded on large tables.
- [ ] Lock behaviour on the target table is known and acceptable.
- [ ] The running code works both before and after, during the deploy window.
- [ ] Indexes are created concurrently where the engine supports it.

## Errors

- [ ] Expected failures return the project's error shape.
- [ ] Unexpected failures return a generic message and log the detail.
- [ ] No stack trace, query, path or internal identifier in a response.
- [ ] No silently swallowed exception.
- [ ] Nothing returns null where the caller cannot distinguish absence from
      failure.

## External dependencies

- [ ] Timeout set, with the value written down.
- [ ] Retries bounded, jittered, and limited to idempotent operations.
- [ ] Behaviour on sustained failure is chosen.
- [ ] Idempotency key on any call that creates a resource or moves money.
- [ ] Inbound webhook signatures verified before the payload is parsed.

## Jobs

- [ ] Idempotent, because it will run twice.
- [ ] Bounded in time and in rows touched.
- [ ] Retry limit, then a visible failure destination.
- [ ] Overlapping runs are prevented or tolerated by design.
- [ ] Arguments are identifiers, not serialised entities.
- [ ] Every table of expiring rows has a cleanup job.
- [ ] Start, outcome and counts are logged.

## Observability

- [ ] Structured fields, not interpolated prose.
- [ ] A correlation identifier crosses the layers.
- [ ] Levels used correctly, debug off in production.
- [ ] No secret, token, full body or unnecessary personal data logged.
- [ ] Every log line would change what an operator does next.

## Contract

- [ ] Additive change, or a breaking change with a stated migration path.
- [ ] Response built from an explicit field list.
- [ ] Pagination shape, default and maximum documented.
- [ ] Empty result returns 200 with an empty collection.
- [ ] Documentation updated in the same change.
