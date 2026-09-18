# Certainty vocabulary

Three levels. Nothing between them.

## Verified

The fact was observed directly during this session. The observation is
quotable.

```
Verified: the project uses Prisma.
Evidence: prisma/schema.prisma exists, @prisma/client 5.22.0 appears in
package.json dependencies and in package-lock.json.
```

## Inferred

The fact was deduced from code that was read. The deduction path is stated so
a reader can disagree with it.

```
Inferred: sessions are stored server side.
Path: lib/auth.ts creates a random opaque token and writes it to the sessions
table; the cookie carries only that token, no claims.
```

## Unknown

The repository cannot answer. The missing input is named precisely.

```
Unknown: which environment provides STRIPE_WEBHOOK_SECRET in production.
Missing input: the deployment environment variable configuration, which is not
present in the repository.
```

## Banned formulations

| Banned | Why | Replacement |
|---|---|---|
| probably uses | disguises a guess | read the manifest, state Verified |
| should work | no observation | run it, state Verified, or state Unknown |
| typically this framework | memory, not evidence | read this project |
| it seems that | unquantified | Inferred plus the path |
| I assume | explicit guess | read the code or ask one direct question |
| looks correct | no criterion | name the criterion and the check |
| best practice says | authority without context | state the concrete failure avoided |

## Applying the levels to findings

A finding that cannot reach `Verified` or a defensible `Inferred` is not
reported as a finding. It is either investigated further or dropped.

Severity is never inflated to compensate for weak evidence.
