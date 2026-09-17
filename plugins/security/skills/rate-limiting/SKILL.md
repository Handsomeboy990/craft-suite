---
name: rate-limiting
description: Sets a rate limit per endpoint by what abuse of that endpoint costs, not one number everywhere: login and one-time codes and password reset tighter than a read, uploads and search and expensive operations by resource cost, keyed by IP, by user, or by both, with the right algorithm and a shared store when more than one instance serves. Use on login, OTP, password reset, uploads, search, public forms and any endpoint abuse can hurt.
license: MIT
metadata:
  category: secure-development
  version: 1.0.0
  depends_on: [security-core]
  outputs: [rate-limit-policy, per-endpoint-limits, limit-implementation, throttle-response]
---

# Rate Limiting

A single rate limit applied to the whole application is two mistakes at once:
too loose for the login endpoint an attacker is spraying, and too tight for the
search box a real user is typing into. Rate limiting is a per-endpoint
decision, set by what abuse of that endpoint costs.

## 1. The limit follows the cost of abuse

Set each limit by asking what an attacker gains from hammering this endpoint,
and what a legitimate user actually needs.

| Endpoint class | Why it is limited | Direction of the limit |
|---|---|---|
| Login, one-time codes, password reset | credential stuffing, code brute force, reset abuse | tight, per account and per source |
| Signup, contact and public forms | spam, resource creation, mail floods | tight, per source, with a challenge on top |
| Expensive operations: search, export, report, upload | resource exhaustion, cost | by cost, a low number of concurrent or per-window |
| Ordinary authenticated reads | little to gain | loose, generous |
| Webhooks and machine callers | abuse of an integration | per credential, by the agreed contract |

The same number everywhere is the failure mode this skill exists to prevent.

## 2. What the limit is keyed by

A limit counts events against a key. The key decides who is limited.

```
by IP        the default for unauthenticated traffic; watch for shared IPs
             behind a proxy or a NAT, and read the real client IP correctly,
             not the proxy's
by user      for authenticated endpoints, so one account cannot be throttled
             by another sharing an IP
by both      the strong form for a login: per account to stop targeting one
             user, and per source to stop spraying many
by credential  for API keys and webhooks, per key
```

Behind a proxy, the client IP comes from the forwarded header only when the
proxy is trusted and sets it; trusting that header from the client directly
lets an attacker forge a new key per request and defeat the limit entirely.

## 3. The algorithm

| Algorithm | Behaviour | Use when |
|---|---|---|
| Fixed window | count per clock window, reset at the boundary | simple, but a burst straddling the boundary passes double |
| Sliding window | count over a moving window | smooths the boundary burst; the common default |
| Token bucket | tokens refill at a rate, a request spends one | allows a controlled burst then a steady rate, good for APIs |

State the algorithm, because the boundary behaviour is a real difference an
attacker will find.

## 4. Where the count lives

```
one instance      an in-memory counter is enough
more than one     the count must be in a store both instances share, or each
                  instance enforces a fraction of the limit and the real limit
                  is the sum, which is not the limit you set
```

A rate limit kept in the memory of one instance, behind a load balancer across
three, is a third of the limit it claims to be. Multi-instance rate limiting
needs a shared store.

## 5. What the caller gets back

```
status        429 Too Many Requests, not 200 and not a silent drop
Retry-After   how long to wait, so a well-behaved client backs off
no leak        the response does not reveal whether an account exists, on a
               login or a reset; the limit is the same for a real and an
               unknown account
logging        a limit that keeps triggering for one key is a signal an
               operator should see, without logging the credential
```

## 6. Rate limiting is one layer

A limit slows an attack; it does not replace the control underneath.

```
login          rate limited AND behind a strong slow password hash AND, on
               repeated failure, a lockout or a challenge
public form    rate limited AND behind anti-spam (a honeypot, a challenge)
upload         rate limited AND validated by content, size bounded before
               parsing
```

A limit alone is a speed bump. The control it sits in front of still exists.

## 7. Prohibitions

- No single global limit standing in for per-endpoint limits.
- No limit keyed on a client-supplied header a caller can forge.
- No in-memory limit on a multi-instance deployment.
- No 200 or silent drop where a 429 with `Retry-After` belongs.
- No limit that reveals account existence on a login or a reset.
- No rate limit treated as the whole defence for the endpoint it guards.

## 8. Protocol

1. List the endpoints, and for each name what abuse costs and what a real user
   needs.
2. Set a limit per endpoint from section 1, tight where the cost is high.
3. Choose the key per endpoint from section 2, by user, by source, or both,
   reading the client IP correctly behind a proxy.
4. Choose the algorithm from section 3 and state it.
5. Put the count in a shared store if more than one instance serves.
6. Return 429 with `Retry-After`, leak nothing about account existence, and
   log the repeated-trigger signal without the credential.
7. Confirm the limit sits in front of the real control, not instead of it.

## 9. Auto-critique

Score from 0 to 5: limits are per endpoint by cost rather than one global
number, the key cannot be forged and is right for authenticated versus
anonymous traffic, the algorithm and its boundary behaviour are stated, a
multi-instance deployment uses a shared store, the response is a 429 with
`Retry-After` and leaks no account existence, and the limit is one layer over
the real control.

Threshold: no axis below 3, average at least 4. A limit keyed on a forgeable
header, or an in-memory limit behind a load balancer, scores 0 overall, because
it is a limit in name that an attacker walks through.

## 10. Interfaces

- Upstream: `security-core` for the severity scale and the posture.
- Lateral: `authentication-security` for the login and reset flows a limit
  guards, `input-validation` for the anti-spam and upload controls it sits in
  front of, `session-security` for the authenticated key, `security-headers`
  for the response.
- Downstream: `observability` for the repeated-trigger signal.
