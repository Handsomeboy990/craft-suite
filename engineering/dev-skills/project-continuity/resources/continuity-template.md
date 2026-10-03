# Continuity note template

```markdown
# Continuity, <date>

## Completed

- <what>, <path>
- <what>, <path>

## Current state

Works today:
- <capability a user or caller has now>

Looks finished but is not:
- <what appears complete and is not, and how to tell>

## Decisions

- <decision>. Reason: <force>. Rejected: <alternative and why>.

## Remaining

- <task>, <where>, first step: <action>
- <task>, <where>, first step: <action>

## Next move

1. <command or edit>, <path>
2. <command or edit>, <path>

## Risks

- <what breaks>, under <condition>, presents as <symptom>
- <limit>, fine at <current volume>, revisit at <trigger>

## Verification

- <command>: <result>
- <command>: <result>
Not verified: <what, and why>

## Context

- <fact a newcomer cannot deduce from the repository>
```

## Worked example

```markdown
# Continuity, 2026-08-10

## Completed

- Invitations table and partial unique index, prisma/migrations/20260810_invitations
- Invitation service with expiry and seat quota, lib/services/invitations.ts
- POST and DELETE endpoints, app/api/teams/[id]/invitations/
- Invite dialog and pending list, components/team/invite-dialog.tsx
- Focus restoration fix in the shared dialog, components/ui/dialog.tsx

## Current state

Works today:
- An administrator can invite a member, see it pending, and revoke it.
- The invited address receives an email with a seven day token.
- Duplicate invitations are refused, including under concurrency.

Looks finished but is not:
- The accept page renders and validates the token, but does not yet add the
  user to the team. app/invite/[token]/page.tsx line 34 has the branch and no
  implementation. The happy path demo stops there.

## Decisions

- Concurrency handled by a partial unique index on pending invitations rather
  than an application lock. Reason: works across instances, no lock to
  maintain. Rejected: a plain unique constraint on (team_id, email), which
  would block reinviting after a decline and would require deleting history.
- Mail is sent after the transaction commits. Reason: a provider outage should
  not roll back the invitation. Rejected: sending inside the transaction,
  which couples a database write to a third party's availability.

## Remaining

- Implement team membership creation on accept, app/invite/[token]/page.tsx:34,
  first step: call addMember in lib/services/teams.ts, which already exists.
- Add a resend action, the UI has the button disabled with a TODO at
  components/team/pending-list.tsx:52.
- Cross team invitation flooding for one address is unlimited. First step:
  decide whether the limit is per address globally or per address per hour.

## Next move

1. Open app/invite/[token]/page.tsx at line 34 and call addMember from
   lib/services/teams.ts inside the existing branch.
2. Run npx playwright test invitations and extend its accept case to assert
   the membership exists.

## Risks

- Mail delivery failure leaves an invitation nobody sees. The list shows the
  delivery state, but there is no alert. Presents as a user saying they were
  never invited.
- The seat quota is read at invitation time, not at acceptance. Two pending
  invitations can both be accepted past the limit. Fine at current team sizes;
  revisit before self service plan changes ship.
- invitations has no index on expires_at. The cleanup job scans. Acceptable
  below roughly 50k rows, currently 340.

## Verification

- npm test: 228 passing, 0 failing
- npx playwright test invitations: 3 passing, run twice consecutively
- npm run typecheck: clean
- npm run lint: clean
- Manual: invited a fictional address on a local team, received the mail
  through the local mail sandbox, token validated.
Not verified: production mail delivery. The staging environment has no mail
provider configured.

## Context

- The mail provider account is shared with the marketing tooling. Rate limits
  are consumed by both, which is why the invitation limiter is deliberately
  conservative at 20 per hour per team.
- STRIPE_WEBHOOK_SECRET and MAIL_API_KEY must exist in the deployment
  environment. The service now fails to start without them rather than
  running degraded. Values are in the team vault, not here.
- A previous attempt at this feature, reverted in March, stored the raw token
  in the database. The current implementation stores only a hash, and the
  accept page compares hashes. Do not reintroduce the raw column.
```

## What makes this note work

Every remaining item names a file and a first step, and the next move picks
the one to start with. Every risk names a
condition and a symptom. Every decision carries the rejected alternative, so
the next engineer does not spend a morning rediscovering why the obvious
approach was not taken. The last context line prevents a specific, expensive
mistake from being repeated.

No value of any secret appears. Two are named, with where they live.
