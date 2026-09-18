# Handoff protocol

Every agent ends its turn with this block. It is the only thing the next agent
is guaranteed to receive.

## The block

```
Completed
- <what was actually done, with paths>

Changed
- <files and areas touched>

Decisions
- <choice>. Reason: <force>. Rejected: <alternative>.

Verified
- <command>: <result>

Known issues
- <what is wrong, incomplete, or uncertain>

Next action
- <the specific thing the next agent should do>

For
- <which agent, or the orchestrator>
```

Seven fields. Every one is filled or explicitly marked `none`. An omitted
field reads as forgotten rather than empty.

## Field rules

**Completed.** Facts with paths. Not activities.

```
Bad   worked on the invitation endpoint
Good  POST /api/teams/[id]/invitations, app/api/teams/[id]/invitations/route.ts
```

**Changed.** What the next agent must read before touching anything. A file
list, not a narrative.

**Decisions.** Only choices the next agent could reasonably undo without
knowing why they were made. Each carries its rejected alternative, because a
decision without one gets reversed by the next person who has the same idea.

**Verified.** Commands and their output. The distinction between what is
proven and what is assumed is the single most useful thing an agent can pass
on.

```
Bad   tests pass
Good  npm test -- invitations: 14 passing, 0 failing
```

**Known issues.** What is wrong, incomplete or uncertain. An empty `Known
issues` on substantial work is usually a missing pass rather than clean work.

**Next action.** One specific thing. Not a list of everything remaining, which
is the orchestrator's job to hold.

**For.** Named. `for whoever picks this up` means nobody picks it up.

## Where it goes

```
Short handoff, same session   the message itself
Work spanning sessions        the continuity note, per project-continuity
Decisions that outlive the task  the architecture document or a decision record
Findings for a later phase    the follow up register
```

Never in a temporary file that nobody will find, and never only in
conversational context.

## Worked example

```
Completed
- Invitations table and partial unique index,
  prisma/migrations/20260810_invitations
- Invitation service with expiry, quota and duplicate rules,
  lib/services/invitations.ts
- POST and DELETE endpoints, app/api/teams/[id]/invitations/

Changed
- prisma/schema.prisma
- lib/services/invitations.ts (new)
- lib/validation/invitations.ts (new)
- app/api/teams/[id]/invitations/route.ts (new)
- lib/contracts/invitations.ts (new, shared with the frontend)

Decisions
- Concurrency handled by a partial unique index on pending invitations rather
  than an application lock. Reason: works across instances, nothing to
  maintain. Rejected: a plain unique constraint on (team_id, email), which
  would block reinviting after a decline.
- Mail is sent after the transaction commits. Reason: a provider outage
  should not roll back the invitation. Rejected: sending inside the
  transaction, which couples a database write to a third party.

Verified
- npm test -- invitations: 14 passing, 0 failing
- npm run typecheck: clean
- two concurrent identical requests produce one row, one 201 and one 409

Known issues
- Mail delivery is not covered end to end; the test environment has no mail
  sandbox. Covered by a stub at the client boundary. Registered as S1.
- The seat quota is checked at invitation time, not at acceptance, so two
  pending invitations can both be accepted past the limit. Registered as FU19.

Next action
- Build the invite dialog and the pending list against
  lib/contracts/invitations.ts. The contract is fixed; do not infer the shape
  from the handler.

For
- frontend-engineer
```

## The two fields that carry the most

`Verified` and `Known issues`. Together they tell the next agent exactly where
the reliable ground ends.

A handoff with a full `Completed` list and an empty `Known issues` invites the
next agent to trust everything, which is how a stub reaches production
believed to be finished.
