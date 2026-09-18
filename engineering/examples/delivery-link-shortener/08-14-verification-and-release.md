# Phases 08 to 14: verification, operations, release

Sized small: about a page, every phase still executed.

## Phase 08, integration-verification (gate: verification)

The layers run together, failure paths included: submit a URL in the form,
follow the returned short link to the real destination, confirm the hit count
moved, hit an unknown code and see the 404, trip the rate limit and see the
error state. A path never run end to end is not integrated. Passed on that
evidence.

## Phase 09, devops (gate: verification)

- Environments: `local` and `production`, the same two the app already uses.
- Configuration: `DATABASE_URL` and the rate-limit store URL are read from the
  environment, never hardcoded; documented without their values.
- Pipeline: lint and tests run before deploy and block on failure.
- `not applicable`, with reason: containerization (Vercel builds the app, no
  container is authored); email-deliverability (this version sends no mail).

## Phase 10, deployment (gate: approval)

The migration is applied before the code that depends on it. The first
production deploy and the migration are irreversible, so the gate stops here.

APPROVAL (recorded): migration reviewed, ordered before the code, deploy
approved.

## Phase 11, production-verification (gate: verification)

- The deployed API answers a real request: a created short link redirects in
  production, not only in a test.
- launch-readiness: HTTPS enforced, a favicon and title, the 404 is the custom
  page, no secret in the client bundle, the rate limit holds against a real
  burst. A running system is not a launch-ready product until these are seen.
- backup-recovery: the `links` table is covered by the database's backup; a
  restore was rehearsed on a scratch instance.

## Phase 12, documentation (gate: none)

A readme written from the code and verified by running its commands: what the
app is, the two endpoints, the environment variables, how to run and deploy.

## Phase 13, handover (gate: none)

Another developer can install, run, operate and extend it without the author:
the setup steps, where the code and the migration live, how to add the deferred
alias feature, and the known limitations (no accounts, no expiry yet).

## Phase 14, release (gate: approval)

Versioned `1.0.0`, tagged, a short changelog. release-readiness runs its gates:
tests green, no open blocker, rollback is a redeploy of the previous build.

VERDICT (recorded): go. No blocker. Rollout is a single production deploy;
rollback is the previous deployment. Shipped.
