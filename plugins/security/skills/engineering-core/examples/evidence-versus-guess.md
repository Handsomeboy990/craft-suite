# Example: evidence versus guess

Task received: "add a rate limit to the login endpoint".

## Guess based answer, rejected

> The project is a Next.js app, so I added the rate limit in
> `middleware.ts` using an in memory `Map`. This should work fine and follows
> best practices for API protection.

Four breaches of `engineering-core`:

1. The framework was assumed instead of read.
2. The storage choice was made without checking whether the project already
   has a shared cache.
3. `should work` is a banned formulation; nothing was executed.
4. An in memory counter is silently wrong on a multi instance deployment, and
   that limitation was not stated.

## Evidence based answer, accepted

```
Verified: framework is Next.js 15 App Router.
Evidence: next 15.1.3 in package.json, app/ directory with layout.tsx,
no pages/ directory.

Verified: the login handler is app/api/auth/login/route.ts, POST export,
lines 12 to 58.

Verified: a shared Redis client already exists at lib/redis.ts and is used by
app/api/webhooks/stripe/route.ts for idempotency keys.

Inferred: production runs more than one instance.
Path: vercel.json declares no instance pinning and the Stripe webhook handler
uses Redis rather than process memory for idempotency, which only makes sense
across instances.

Decision: implement the limiter on the existing Redis client rather than
introducing a new dependency or a process local counter.
```

Implementation, then verification:

```
Verified: limiter blocks the eleventh attempt within sixty seconds.
Command: npm test -- rate-limit
Output: 6 passing, 0 failing.

Verified: existing auth tests still pass.
Command: npm test -- auth
Output: 24 passing, 0 failing.

Unknown: the production Redis eviction policy.
Missing input: the managed Redis configuration, not present in the repository.
Consequence: if the policy is allkeys-lru, limiter counters can be evicted
early under memory pressure and the limit becomes permissive. Reported, not
silently accepted.
```

## What the difference costs

The guess produced code that passes local review and fails in production
exactly when it matters, during a credential stuffing attempt distributed
across instances. The evidence path took four extra file reads.
