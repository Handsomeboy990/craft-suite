# Example: two handoffs, one usable

The same session, written up twice.

## Handoff A

```markdown
# Session notes

Worked on the invitations feature today. Got quite far. The backend is mostly
done and the frontend is coming along. There were some tricky issues with
concurrency but I found a solution.

TODO:
- finish the accept flow
- add more tests
- clean up
- improve error handling

The tests pass. Should be ready to continue tomorrow.
```

Six sentences. Now try to resume from it.

What is mostly done? Which concurrency issue, and what was the solution, so it
is not undone by the next change? What does finish the accept flow mean, and
where does it start? Which tests pass, and which do not exist? What breaks in
production?

Every question requires reading the whole diff, which is exactly the work the
note was supposed to save. The note also fails silently: it reads as
reassuring, so the next engineer trusts it, demonstrates the accept flow to a
stakeholder, and discovers in front of them that it does nothing.

## Handoff B

```markdown
# Continuity, 2026-08-10

## Completed

- Invitations table and partial unique index,
  prisma/migrations/20260810_invitations
- Invitation service, expiry and seat quota, lib/services/invitations.ts
- POST and DELETE endpoints, app/api/teams/[id]/invitations/
- Invite dialog and pending list, components/team/

## Current state

Works today: invite, see pending, revoke, duplicate refused under concurrency.

Looks finished but is not: the accept page validates the token and does not
create the membership. app/invite/[token]/page.tsx:34 is an empty branch. A
demo of the full loop will fail at that point.

## Decisions

- Concurrency uses a partial unique index on pending invitations, not an
  application lock. Works across instances. Rejected: a plain unique
  constraint, which blocks reinviting after a decline.

## Remaining

- Create the membership on accept, app/invite/[token]/page.tsx:34.
  First step: call addMember in lib/services/teams.ts, which exists.
- Enable the resend button, components/team/pending-list.tsx:52, currently
  disabled with a TODO.
- Decide the cross team flooding limit for one address. No implementation yet.

## Next move

1. app/invite/[token]/page.tsx:34, call addMember inside the existing branch.
2. Run npx playwright test invitations; extend the accept case to assert the
   membership exists.

## Risks

- Mail failure leaves an invitation nobody sees. Delivery state is shown in
  the list, no alert exists. Presents as a user saying they were never
  invited.
- Seat quota is checked at invitation, not at acceptance, so two pending
  invitations can both be accepted past the limit. Fine at current team
  sizes, revisit before self service plans.

## Verification

- npm test: 228 passing
- npx playwright test invitations: 3 passing, run twice
- npm run typecheck, npm run lint: clean
Not verified: production mail delivery, staging has no provider configured.

## Context

- A March attempt stored the raw token in the database and was reverted. The
  current implementation stores a hash only. Do not reintroduce the raw
  column.
- MAIL_API_KEY and STRIPE_WEBHOOK_SECRET must be set in the deployment
  environment; the service now refuses to start without them. Values are in
  the team vault.
```

## What the difference buys

The `Looks finished but is not` line saves a failed demonstration.

The decision line saves a morning: the next engineer will consider replacing
the partial index with a plain unique constraint, because it is the obvious
choice, and the note explains in one sentence why it was rejected.

The March context line saves a security regression. Nothing in the current
code says the raw token was once stored and why that was wrong; the git
history holds it, but only for someone who thinks to look.

The `Next move` lines remove the first half hour of the next session: it
starts on a named line of a named file, not on choosing among the remaining
items.

The `Not verified` line is the one that keeps the rest credible. A note that
claims everything works is trusted less than one that names its own gap.

## Length

Handoff B is roughly one screen. It contains no narrative, no mood, no
description of the effort involved, and no secret value. Every line is a fact
the next reader would otherwise have to derive.
