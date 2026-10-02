# Handoff checklist

## Content

- [ ] All eight sections present, none silently omitted.
- [ ] Completed items name files, not activities.
- [ ] Current state distinguishes what works from what merely renders.
- [ ] Every decision carries its reason and its rejected alternative.
- [ ] Every remaining item names a location and a first step.
- [ ] Next move names one to three actions, in order, each with its path.
- [ ] Every risk names a condition and a symptom.
- [ ] Verification quotes commands and results, not intentions.
- [ ] Context contains facts that cannot be deduced from the repository.

## Concreteness

Rewrite anything matching these patterns:

| Vague | Concrete |
|---|---|
| improve error handling | add a timeout to the mail client, lib/mail.ts:12, currently unbounded |
| finish the UI | implement the empty state of the pending list, components/team/pending-list.tsx:18 |
| needs tests | add the concurrent duplicate case to lib/services/invitations.test.ts |
| there are some issues | the accept page validates the token and does not create the membership |
| clean up later | delete the unused legacy invite route, app/api/invite/route.ts |

## Safety

- [ ] No password, token, key or connection string.
- [ ] No session identifier or cookie value.
- [ ] No personal data beyond what the work requires.
- [ ] Secrets referenced by name and location only.
- [ ] No internal credential of any third party.

## Hygiene

- [ ] Every open item of the previous note is carried forward or its drop is
      stated with a reason.
- [ ] Where the previous note and this session disagree, this session's
      verified state is the one kept.

- [ ] Entries resolved by this session were deleted, not marked done.
- [ ] The note fits on one screen, two for a large session.
- [ ] No duplication of what the documentation already states durably.
- [ ] No duplication of what the commit history already states.

## Resumption test

Answer these from the note alone:

- [ ] What state is the work in?
- [ ] What can I run to see it?
- [ ] What is definitely finished?
- [ ] What is definitely not?
- [ ] What should I do next?
- [ ] What will surprise me?

A note that fails one of these is rewritten before it is committed.
