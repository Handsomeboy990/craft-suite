# Example: L2 exploration before touching a login flow

Task: "users say the login page hangs when the password is wrong".

Depth chosen: L2, feature slice. The bug is of unknown origin but confined to
one flow.

## Stack, verified

```
Framework   Next.js 15.1.3 App Router
  Evidence  next in package.json, app/layout.tsx present, no pages/
Language    TypeScript 5.6, strict true in tsconfig.json
Manager     pnpm
  Evidence  pnpm-lock.yaml, pnpm-workspace.yaml absent so single app
Tests       Vitest 2.1 plus Playwright 1.49
  Evidence  vitest.config.ts, playwright.config.ts, scripts test and test:e2e
Data        PostgreSQL through Drizzle 0.36
  Evidence  drizzle.config.ts, db/schema.ts exporting pgTable
Auth        server side sessions
  Evidence  db/schema.ts declares sessions with userId and expiresAt,
            lib/session.ts sets an opaque cookie named sid
Validation  Zod 3.23 present in dependencies
```

## Flow trace, success path

```
app/(auth)/login/page.tsx        form, client component
  -> components/login-form.tsx   useActionState on loginAction
  -> app/(auth)/actions.ts       loginAction, server action, line 18
  -> lib/validation/auth.ts      loginSchema.parse, line 24
  -> lib/auth.ts                 verifyPassword, argon2 verify, line 41
  -> lib/session.ts              createSession, insert then cookie set
  -> redirect("/dashboard")
```

## Flow trace, failure path, where the bug lives

```
app/(auth)/actions.ts line 31

  const user = await db.query.users.findFirst(...)
  if (!user) return { error: "Invalid credentials" }
  const ok = await verifyPassword(user.passwordHash, input.password)
  if (!ok) throw new Error("Invalid credentials")
```

Two exits for the same business outcome. The unknown user branch returns a
state object that `useActionState` renders. The wrong password branch throws,
which in a server action produces a rejected promise; the client component has
no error boundary and no catch, so the pending state is never cleared. The
form stays in its submitting state forever.

```
Verified: the two branches differ.
Evidence: app/(auth)/actions.ts lines 29 to 33, read.

Verified: no error boundary wraps the form.
Evidence: app/(auth)/layout.tsx contains no error.tsx sibling and
components/login-form.tsx has no try catch around the action call.

Inferred: the hang is the unresolved pending state, not a network stall.
Path: the symptom is specific to wrong password, the only branch that throws.
```

## Conventions extracted, two occurrences each

- Server actions return `{ error: string }` on business failure.
  Occurrences: `app/(auth)/actions.ts` signup, `app/settings/actions.ts`
  updateEmail.
- Zod schemas live in `lib/validation/` and are parsed inside the action, not
  in the component. Occurrences: `auth.ts`, `settings.ts`.
- Errors are logged through `lib/logger.ts`, never `console.error`.
  Occurrences: `app/api/webhooks/stripe/route.ts`, `lib/db.ts`.

## Unknowns

```
Unknown: whether an unhandled server action rejection is reported to an error
tracker in production.
Missing input: no tracker SDK in package.json, no Sentry config, and the
deployment configuration is outside the repository.
Blocks: nothing in this fix. Reported for the continuity notes.
```

## Handoff

The map goes to `debugging`, which confirms the root cause with a targeted
test, then to `backend-engineering` for the fix, which must follow the
`{ error }` convention rather than inventing a third failure style.
