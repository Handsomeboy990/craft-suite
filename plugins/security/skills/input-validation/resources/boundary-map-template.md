# Boundary map template

One row per entry point the change touches. Filled from the code, not from
the API documentation.

```
| Entry point | Kind | Inputs | Schema | Parsed at | Failure | Auth |
|---|---|---|---|---|---|---|
| POST /api/invitations | route | body: email, role | lib/validation/invitations.ts inviteSchema | route.ts:14 | 400 { error, fields } | session + team admin |
| POST /api/uploads | route | file, folder | uploadSchema | route.ts:9 | 413 / 415 | session |
| stripe webhook | webhook | event payload | after signature check | route.ts:22 | 400 | signature |
| digest job | job | userIds from db | none needed, internal | n/a | n/a | n/a |
```

## Column rules

**Entry point.** The concrete route, action, consumer or command. Not a
description.

**Kind.** route, action, webhook, consumer, cli, job, external response.

**Inputs.** Every field read, including headers and cookies the handler
inspects. Fields nobody reads are removed from the schema, not documented.

**Schema.** The file and the exported name. `none` is a valid value only for
inputs that never leave the process boundary, and the reason is written.

**Parsed at.** File and line where parsing actually happens. A schema that is
declared but never parsed is recorded as a gap, not as coverage.

**Failure.** Status code and the exact error shape returned, matching what the
project already returns elsewhere.

**Auth.** What must be true about the caller. `public` is a valid answer when
it is deliberate.

## Completion rules

- Every entry point in the diff appears in the table.
- Every row has a `Parsed at` value or an explicit gap with a reason.
- Every gap has an owner and a follow up entry in the continuity notes.
- Rows whose `Auth` column says `public` are listed again in the security
  audit, since a public write endpoint is a decision, not a default.
