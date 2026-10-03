# Per-endpoint limit reference

A starting grid, to adapt to the product. Every number is a starting point set
by the cost of abuse, not a rule; the point is that they differ by endpoint.

## Authentication and account

| Endpoint | Key | Shape | Note |
|---|---|---|---|
| Login | account and source | tight, a handful per minute per account, more per source | plus lockout or challenge on repeated failure; same limit for a real and unknown account |
| One-time code entry | account | very tight, few attempts per code | a code is short; brute force is the threat |
| One-time code request | account and source | tight, few per window | stops code flooding and mail or SMS cost |
| Password reset request | account and source | tight | stops reset spam and enumeration |
| Signup | source | tight, plus a challenge | stops mass account creation |

## Public surface

| Endpoint | Key | Shape | Note |
|---|---|---|---|
| Contact and public forms | source | tight, plus a honeypot or challenge | anti-spam sits with it |
| Public API, unauthenticated | source | moderate | by the documented contract |

## Expensive operations

| Endpoint | Key | Shape | Note |
|---|---|---|---|
| Search | user or source | by cost, a low steady rate, token bucket for a small burst | expensive queries are the threat |
| Export and report | user | very low, often concurrency one | a heavy operation |
| Upload | user | low, plus size bound before parsing | resource cost and abuse |

## Ordinary traffic

| Endpoint | Key | Shape | Note |
|---|---|---|---|
| Authenticated reads | user | generous | little to gain from hammering |
| Webhooks and machine callers | credential | per the agreed contract | per integration key |

The reference exists to be varied. A grid where every row carries the same
number has missed the point of the skill.

## Atomic check and increment, by store

Whatever the store, one statement or one script both decides and counts. The
shapes below are written for this reference, generic, and adapted to the
project's own store and driver.

Relational, fixed window, one row per key and window start, a unique key on
both:

```sql
insert into rate_limit_window (key, window_start, hits, expires_at)
values ($1, $2, 1, $3)
on conflict (key, window_start)
do update set hits = rate_limit_window.hits + 1
  where rate_limit_window.hits < $4
returning hits;
```

A returned row means the request is counted and allowed. No row means the
conflict update was skipped because the window is full: refused, 429. Two
windows for one request run as two such statements in one transaction, and
the code rolls the transaction back on any refusal, so a refused request is
counted in no window.

Key-value store:

```
count = INCR key                    atomic, returns the new value
if count == 1: EXPIRE key window    set in the same script or pipeline
                                    transaction, never as a later call
allowed = count <= limit
```

Run as one server-side script so the expiry cannot be lost between the two
calls, which would leave a key that never resets.

The defect this replaces, in any store:

```
hits = read(key)          two requests read 9 under a limit of 10
if hits >= limit: refuse  both pass
write(key, hits + 1)      both write 10; the store saw two requests and
                          counted one
```

## Cleanup

| Store | Expiry |
|---|---|
| Relational | a scheduled job deletes rows whose `expires_at` has passed, indexed on that column |
| Key-value | the key's own expiry, set atomically with the first increment |
| In memory | evicted on window rollover; one instance only |
