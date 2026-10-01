# Answering "who calls charge()" from a partly stale map

A worked example of steps 6 to 8. The repository is a monorepo with an API
application and four packages; the map was built two weeks earlier.

## The question

Before changing the signature of `charge()` in the billing service, the
engineer asks who calls it.

## Step 6, freshness check

```
STAMP.md        Commit a41c9e2
git diff --name-only a41c9e2 -- .
  apps/api/checkout.ts
  apps/api/subscriptions/renew.ts
  packages/ui/button.tsx
```

Mapped through INDEX.md:

```
apps/api/checkout.ts                -> node api            stale
apps/api/subscriptions/renew.ts     -> node api            stale
packages/ui/button.tsx              -> node design-system  stale
billing                             -> unchanged           fresh
```

## Step 8, the answer

The `billing` node is fresh, so its own internal callers come from the map.
The `api` node is stale, so its callers are read from the source, not the map.

```
callers of billing.charge

  billing (fresh, from map)
    services/billing/refund.ts:31       retryCharge -> charge

  api (stale, from source at HEAD)
    apps/api/checkout.ts:52             submitOrder -> charge
    apps/api/subscriptions/renew.ts:19  renewPlan -> charge     new since a41c9e2

  jobs (fresh, from map)
    packages/jobs/dunning.ts:44         heuristic edge: dynamic dispatch,
                                        confirm before relying on it
```

Two things the map alone would have got wrong: `renewPlan` did not exist at
`a41c9e2`, and the line in `checkout.ts` moved. Both were caught because the
stale node was not trusted.

## Step 7, regeneration

Only `api` and `design-system` are regenerated. `INDEX.md` and `STAMP.md` move
to the current commit. The rebuild touched two nodes out of six.

## What the engineer received

Four call sites, each with file and line, one flagged as heuristic, and the
note that two of them came from the source because the map was behind. The
whole answer cost a few hundred lines of reading instead of a repository
search across every package.
