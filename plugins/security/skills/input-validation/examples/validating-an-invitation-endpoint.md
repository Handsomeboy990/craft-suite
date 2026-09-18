# Example: validating a team invitation endpoint

Endpoint: `POST /api/teams/:teamId/invitations`, body `{ email, role }`.

Project system, verified: Zod 3.23, schemas in `lib/validation/`, parsed
inside the route handler, errors returned as `{ error, fields }` with 400.
Two occurrences confirm the convention: `lib/validation/auth.ts` and
`lib/validation/settings.ts`.

## Boundary map

```
| Entry point | Kind | Inputs | Schema | Parsed at | Failure | Auth |
|---|---|---|---|---|---|---|
| POST /api/teams/:teamId/invitations | route | teamId, email, role | inviteSchema | route.ts:16 | 400 { error, fields } | session + team admin |
```

Three inputs, not two. The route parameter is an input, and it is the one that
carries the authorization risk.

## Schema

```ts
// lib/validation/invitations.ts
export const inviteParams = z.object({
  teamId: z.string().uuid(),
})

export const inviteSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    role: z.enum(["member", "admin"]),
    message: z.string().trim().max(500).optional(),
  })
  .strict()
```

Decisions, each deliberate:

- `.strict()` rejects unknown keys. Without it, a client can send
  `{ email, role, teamId: "other-team" }` and hope a later refactor spreads
  the body into a query.
- `role` is an enum, not a string. A free string would let `owner` through the
  day someone adds that role to the database.
- `254` is the maximum email length in the relevant standard. A field with no
  maximum is a denial of service vector once it reaches a log line.
- `teamId` is validated as a UUID for format only. Format is not
  authorization; the ownership check is separate and mandatory.

## Handler

```ts
export async function POST(req: Request, { params }: Ctx) {
  const session = await requireSession()

  const p = inviteParams.safeParse(await params)
  if (!p.success) return badRequest(p.error)

  const body = inviteSchema.safeParse(await req.json().catch(() => null))
  if (!body.success) return badRequest(body.error)

  // Authorization, not validation: format was checked above, membership here.
  const membership = await getMembership(session.userId, p.data.teamId)
  if (membership?.role !== "admin") return forbidden()

  return Response.json(await inviteMember(p.data.teamId, body.data))
}
```

`await req.json().catch(() => null)` matters. A malformed JSON body throws
before any schema runs, and an uncaught throw here is a 500 that looks like a
server defect in the dashboard while it is in fact a client sending garbage.

## Cross field and contextual rules, inside the service

Field level validity is not request validity. These run in the same
transaction as the write:

```
already a member         -> 409, no second invitation row
already invited, pending -> 200, the existing invitation is returned, no
                            duplicate email sent
seat quota reached       -> 402 with the upgrade path
inviting an owner role   -> impossible, the enum does not contain it
self invitation          -> 400, email equals the session user email
```

The pending case is worth the extra line: without it, a user who clicks twice
sends two emails, and the second invitation token invalidates the first.

## Matrix turned into tests

```
rejects a missing email                              400
rejects an empty email                               400
rejects a whitespace only email                      400
rejects an email of 255 characters                   400
accepts an email of 254 characters                   200
normalises Mixed.Case@Example.COM before storage     stored lowercase
rejects role "owner"                                 400
rejects role "" and role null                        400
rejects an unknown key in the body                   400
rejects a body that is not JSON                      400, not 500
rejects a non uuid teamId                            400
rejects a valid uuid for a team the caller does not administer   403
rejects a 4000 character message                     400
stores a message containing <script> verbatim        rendered escaped
rejects a second invitation for a pending email      200, one row, one email
two concurrent identical requests                    one row, unique index
```

Sixteen tests for one endpoint. Four of them cover the case the feature was
written for; the other twelve cover what happens when it is used by someone
who did not read the documentation.

## What the schema does not cover

```
Unknown: whether the mail provider rate limits invitations per recipient.
Missing input: the provider dashboard configuration, outside the repository.
Consequence: a user could invite the same address repeatedly across teams.
Mitigation shipped: a per team per email uniqueness constraint. The cross team
case is recorded as follow up rather than left silent.
```
