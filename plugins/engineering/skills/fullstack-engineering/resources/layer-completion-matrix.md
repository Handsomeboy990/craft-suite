# Layer completion matrix

Copy per feature. Every cell holds `done`, `n/a` with a reason, or `missing`
with a plan. The feature is not complete while any cell says `missing`.

```
Feature: team invitations
Revision: <commit>

| Layer | Implemented | Validated | Errors handled | Tested |
|---|---|---|---|---|
| database schema | done | n/a | n/a | done |
| migration | done | n/a | n/a | done |
| data access | done | n/a | done | done |
| service rules | done | done | done | done |
| handler | done | done | done | done |
| authorization | done | done | done | done |
| external effects | done | n/a | done | done |
| client call | done | n/a | done | done |
| cache invalidation | done | n/a | n/a | done |
| component states | done | n/a | done | done |
| form and validation | done | done | done | done |
| navigation and focus | done | n/a | n/a | done |
| accessibility | done | n/a | n/a | done |
| documentation | done | n/a | n/a | n/a |
```

## Column meanings

**Implemented.** The code exists and does what the contract says.

**Validated.** External input reaching this layer is validated here or was
validated at a boundary this layer trusts. `n/a` where no external input
reaches it, with that stated.

**Errors handled.** Every failure this layer can encounter produces a defined
outcome. For the UI, that means a rendered state, not a thrown error.

**Tested.** A test exists and was executed. Intending to write one is
`missing`, not `done`.

## Rows that are frequently forgotten

| Row | What gets missed |
|---|---|
| migration | reversibility, and whether the running code survives the deploy window |
| authorization | the create, update and delete paths, when only the read was checked; the list that returns drafts to anyone who asks |
| handler | the server action called directly, without the form that validated it |
| external effects | what happens when the mail provider is down |
| cache invalidation | the list that still shows stale data after the mutation |
| navigation and focus | focus after a dialog closes, and after a redirect |
| accessibility | the new form's labels and error announcements |
| documentation | the API reference for a new endpoint |

## Use in the report

The matrix goes into the continuity notes, not into the commit message. It is
the artefact that lets the next engineer see, in one screen, what was actually
finished and what was consciously deferred.
