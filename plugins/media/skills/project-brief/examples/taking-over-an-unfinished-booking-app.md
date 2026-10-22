# Taking over an unfinished booking application

The request, in full, as received:

> We have a booking app a freelancer started and abandoned. Can you finish it?
> Payments never worked. We need it live for the season.

Three sentences, and every one of them hides a decision.

## What was not done

No question was asked yet. A question asked before reading the repository
would have been answered by the repository.

## Inspection, before any question

Two hours with `project-exploration`, no file modified.

| Question | Finding | Evidence |
|---|---|---|
| Stack | Next.js 14 app router, Postgres via Prisma 5.2, Tailwind | `package.json`, `pnpm-lock.yaml` |
| Auth | NextAuth with a credentials provider, sessions in a database | `auth.ts`, `sessions` table |
| Payments | Stripe SDK installed, checkout session created, no webhook route | `lib/stripe.ts`, no handler under `app/api/webhooks` |
| Bookings | Created on redirect back from Stripe, in a `useEffect` | `app/booking/success/page.tsx:22` |
| Tests | Two, both on a date formatting helper | `lib/date.test.ts` |
| CI | None | no workflow directory |
| Deployment | Vercel project exists, last deploy four months ago | project settings |
| Migrations | 11, applied; one edited after being applied | `migrations/`, checksum mismatch |
| Secrets | `.env` committed in history, live Stripe test key inside | `git log -p -- .env` |

Established without asking: payments do not fail randomly. There is no
webhook, so a booking is only created if the customer's browser survives the
redirect. Close the tab and the payment succeeds with no booking. The reported
symptom and the actual defect are not the same thing, and this is why the
inspection precedes the questions.

Also established: a secret is in history. That is not a question either. It is
reported immediately and rotated regardless of the answer.

## The single batch

Nine questions. Each one changes what gets built.

```markdown
## Before I start, these change the outcome

I have read the repository. The summary of what I found is attached. Three
findings need your decision before I touch anything.

**Findings that need a decision**

1. [required] There is no Stripe webhook. Bookings are created by the
   customer's browser after the redirect, so any payment where the customer
   closed the tab took money without creating a booking. Can you check Stripe
   for payments with no matching booking since launch? I can write the
   reconciliation script either way, but whether it runs against 3 rows or
   300 changes the plan.

2. [required] A live Stripe test key was committed and is still in history. I
   will rotate it. Confirm you can regenerate it in the Stripe dashboard, or
   tell me who can.

3. [required] Migration `0007` was edited after being applied. Production and
   the migration files disagree. Do you have a production database backup from
   before that edit, or should I reconcile forward from the current schema?

**Scope**

4. [required] Season is when, exactly? A date changes what I cut.

5. [required] Fixed scope or fixed date? Only one can be fixed. If the date is
   fixed I will propose what ships and what waits.

6. [optional] Is the half built admin dashboard in scope?
   Default: no. It is 40 percent done and nothing depends on it.

**Constraints**

7. [optional] Staying on Vercel and Postgres? Default: yes, no reason to move.

8. [optional] Anything I must not touch? Default: nothing outside the booking
   and payment paths.

**Done**

9. [required] What has to be true for you to call this delivered? My proposal:
   a customer can book and pay, the booking exists even if the browser closes,
   you can see bookings, and money taken without a booking is reconciled.
```

Not asked, and why:

- Which CSS framework: Tailwind is installed and used throughout. Reading
  answered it.
- Whether they want tests: they are getting tests. It is not an option offered
  to the client.
- Preferred package manager: `pnpm-lock.yaml` answered it.
- Node version: `.nvmrc` answered it.

Four questions removed by two hours of reading. That is the return on section
3 of the skill.

## The agreement, after answers

```markdown
# Working Agreement, booking application

Date:    2026-03-04
Parties: Client, contractor
Status:  agreed
Version: 1

## Objective

Make the existing booking application take money and create bookings
reliably, and put it back in production before the season opens on 15 May.

## Deliverables

| # | Deliverable | Format | Recipient |
|---|---|---|---|
| 1 | Stripe webhook, bookings created server side | code | repository |
| 2 | Reconciliation of the 47 orphaned payments | script plus report | client |
| 3 | Rotated Stripe credentials, history cleaned | operation plus note | client |
| 4 | Schema reconciled with production | migration | repository |
| 5 | Tests on the payment and booking paths | code | repository |
| 6 | Deployment with CI | pipeline | repository |

## Definition of done

- [ ] A booking exists after payment even when the browser is closed at the
      redirect, verified by closing the tab during a real test payment.
- [ ] The 47 orphaned payments are reconciled and the client has the list.
- [ ] The old Stripe key is revoked and the new one is not in the repository.
- [ ] `prisma migrate status` is clean against production.
- [ ] Payment and booking paths are covered by tests that were each observed
      failing before their fix.
- [ ] The application is deployed and a real booking was completed in
      production.

## Out of scope

Admin dashboard. Email notification redesign. Mobile application. Multi
currency. Anything not on the deliverables list.

## Constraints

| Constraint | Value | Source |
|---|---|---|
| Deadline | 15 May 2026, hard, season opening | client |
| Fixed dimension | date; scope flexes | client |
| Technology | stays on Next.js, Postgres, Vercel, Stripe | inspection plus client |
| Must not be modified | existing booking records | client |

## Assumptions

| # | Assumption | Default applied | Impact if wrong |
|---|---|---|---|
| 1 | Existing booking rows are correct and are kept | preserve, never rewrite | reconciliation would need a data fix first |
| 2 | Test coverage on the payment path only, not the whole application | scoped tests | more time needed for full coverage |
| 3 | One production environment, no staging | deploy behind a flag, verify in production | a staging environment would change the deployment plan |

## Change log

| Date | Change | Reason | Decided by |
|---|---|---|---|
| 2026-03-04 | Initial agreement | | both |
```

## What the agreement caught later

On day nine, the reconciliation revealed that 6 of the 47 orphaned payments
were refunded manually by the client months ago, with no record in the
database. That contradicts assumption 1: existing booking data is not
complete, only what is there is correct.

Protocol of section 7, applied:

1. Contradiction: assumption 1 says existing records are authoritative. Six
   payments have a refund in Stripe and no trace in the database.
2. Stated in three sentences, with the six payment identifiers.
3. Smallest resolution: mark those six as refunded from the Stripe record
   rather than creating bookings for them. No schema change, no new feature.
4. Asked, because it touches money and the client's own records.
5. Client confirmed. Assumption 1 updated to name Stripe as authoritative for
   payment state, and the database as authoritative for booking state.
6. Continued.

Total cost: one message, one paragraph in the change log. Without the written
assumption there would have been six bookings created for refunded payments,
found by a customer rather than by us.
