# Phase 07: implementation (gate: verification)

The bulk of a small project. Each planned task is routed through
`engineering-orchestrator`, which classifies it and composes the smallest
complete plan. `implementation-integrity` forbids fake functionality;
`scope-and-change-control` forbids silent scope or architecture drift.

## Task 1: migration, the links table

Category DATABASE. Plan: database-design (already fixed in Phase 04) ->
database-operations. The migration is reversible and creates
`links(code, url, hits, created_at)`. Verified by applying it to a scratch
database and reading the table back.

## Task 2: POST /api/links

Category API. Plan: input-validation -> backend-engineering -> security-audit ->
testing-quality.

- The URL is validated against an http/https allowlist before anything else; a
  `javascript:` or `data:` URL is rejected with 422.
- The code is 7 random base62 characters; on a unique-constraint violation the
  insert is retried, bounded to 3 attempts, then 500.
- Integrity check: the handler actually inserts and returns the real code. No
  hardcoded response, no "success" without a row written.

## Task 3: GET /:code

Category BACKEND. Plan: backend-engineering -> testing-quality.

- Look up the code; on a miss, render the 404 page; on a hit, increment `hits`
  and respond 302 to the stored URL.
- The increment is fire-and-forget relative to the redirect: a slow counter
  never delays the redirect, and a failed counter never blocks it.

## Task 4: IP rate limit on creation

Category VALIDATION. Plan: rate-limiting -> backend-engineering ->
testing-quality. This is the Phase 02 approval, honoured here.

- The limit is on `POST /api/links` only, keyed by IP, sized to abuse cost
  (creation writes a row; a read does not), with a shared store so more than one
  serverless instance shares the count.
- Scope note: the limit was approved in Phase 02. It is in scope. Adding link
  expiry here would not be, and is deferred, recorded, not silently built.

## Task 5: the submit form and the five UI states

Category FRONTEND. Plan: ui-ux-engineering -> frontend-engineering ->
input-validation -> accessibility-testing.

- The five states: idle (empty form), submitting (disabled), success (the short
  link with a copy button), error (invalid URL or rate limited), and the empty
  case is the idle form itself.
- Labels are real labels, the copy button has an accessible name, focus is
  visible.

## Task 6: tests

Category TESTING. Plan: testing-quality -> api-testing.

Mandatory cases that can actually fail: a valid URL returns a working code; the
short link redirects to the original; an unknown code returns 404; a
`javascript:` URL is rejected; the fourth rapid creation from one IP is limited.

## Verification gate

Every task ran end to end at least once, each mandatory test is red before its
fix and green after, and `code-review-protocol` found and fixed its findings.
The gate passes on that evidence, not on the tasks being marked done.
