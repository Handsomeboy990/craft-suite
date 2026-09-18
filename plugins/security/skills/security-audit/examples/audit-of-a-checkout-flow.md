# Example: audit of a checkout flow

Scope declared: `apps/api` billing module and its webhook, revision `a91f0c2`.
Points applicable: 18 of 24. Skipped with reasons: uploads (none in scope),
CORS (same origin only, verified in `next.config.js`), enumeration (no account
lookup in this flow), deserialisation (no dynamic evaluation), traversal (no
filesystem access), command injection (no process spawn).

## Finding 1, critical

```
Point 19, business logic. lib/checkout.ts:22

const total = body.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
const session = await stripe.checkout.sessions.create({ amount: total })

Attacker path
  POST /api/checkout with items [{ id: "prod_x", price: 1, quantity: 1 }]
Precondition
  a normal authenticated account
Impact
  any product purchased for one cent, unlimited
Level
  exploitability trivial, impact severe, critical
```

Fix: prices are read from the `products` table by id; the request carries ids
and quantities only.

```ts
const products = await db.product.findMany({
  where: { id: { in: body.items.map((i) => i.id) } },
  select: { id: true, priceMinor: true, currency: true, active: true },
})
```

Two rules applied at once: the client no longer supplies the price, and the
server rejects inactive products, which the previous code also accepted.

```
Verified: npm test -- checkout
  rejects a tampered price          ok
  rejects an inactive product       ok
  computes the total from the db    ok
```

## Finding 2, critical

```
Point 21, payments. app/api/webhooks/stripe/route.ts:8

const event = JSON.parse(await req.text())
if (event.type === "checkout.session.completed") await fulfil(event.data)

Attacker path
  POST /api/webhooks/stripe with a forged completed event
Impact
  free fulfilment of any order
Level
  critical
```

The signature was never verified. The handler had a `stripe.webhooks` import
that was unused, which is why a quick read looked reassuring.

Fix: signature verified against the raw body before parsing, plus an
idempotency record on the event id.

```
Verified: npm test -- webhooks
  rejects an unsigned payload            ok
  rejects a payload signed with a wrong secret   ok
  rejects an event older than five minutes       ok
  processes a valid event exactly once           ok
  a replayed event does not fulfil twice         ok
```

## Finding 3, high

```
Point 20, race conditions. lib/coupons.ts:41

const coupon = await db.coupon.findUnique({ where: { code } })
if (coupon.usedCount < coupon.maxUses) {
  await db.coupon.update({ data: { usedCount: { increment: 1 } }, ... })
}

Attacker path
  fifty concurrent checkout requests with the same single use code
Impact
  a code limited to one use redeemed fifty times
Level
  exploitability moderate, impact high, high
```

Fix: a conditional update that performs the check and the increment in one
statement, and a unique constraint on `(couponId, orderId)` so a retry cannot
double count.

```
Verified: npm test -- coupons
  fifty concurrent redemptions of a single use code -> 1 success, 49 conflicts
```

## Finding 4, medium

```
Point 16, sensitive data exposure. app/api/orders/[id]/route.ts:19

include: { user: true }

The order response contains the customer's email, stripeCustomerId and
passwordHash. The page displays the name.
Level
  exploitability easy, impact moderate, medium
```

Fix: explicit `select` with four fields. The `passwordHash` presence also
means the field is reachable from any endpoint that includes the user
relation, so the class was checked: three other endpoints had the same
pattern, all fixed in the same commit.

## Finding 5, medium

```
Point 23, rate limiting. No limit on POST /api/checkout.
Impact
  a script can create unlimited Stripe sessions, each one billable at the
  provider and each one a row in the database
Level
  medium
```

Fix: limiter on the existing Redis client, twenty per hour per user.

## Manual action required

```
1 Rotate STRIPE_SECRET_KEY.
  Reason: it appears in .env.example in commit 3d81ba0 from January and the
  repository is public. Removing it from the file does not undo the exposure.
  Where: Stripe dashboard, developers, API keys.

2 Set STRIPE_WEBHOOK_SECRET in the production environment.
  Reason: the handler now refuses to start without it instead of accepting
  unsigned events. Without this variable the deployment will fail closed,
  which is intended, but it must be set before the next deploy.

3 Confirm the webhook endpoint in the Stripe dashboard points at the current
  domain and that the old endpoint is deleted.
  Reason: not visible from the repository.
```

## Statement

```
Eighteen applicable points were checked on revision a91f0c2. Five findings,
all fixed in code except the three manual actions above. This is not a
statement that the system is secure. The mobile client, the infrastructure
configuration and the provider dashboard were outside the scope.
```
