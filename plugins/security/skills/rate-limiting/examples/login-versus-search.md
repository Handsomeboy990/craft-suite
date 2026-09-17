# Example: the same app, two very different limits

One application, two endpoints. Applying the same limit to both would break one
of them.

## The login endpoint

```
threat    credential stuffing: an attacker tries many passwords for one
          account, and one password across many accounts
key       account AND source, so neither targeting one user nor spraying many
          gets through
limit     a handful of attempts per minute per account; a higher but still
          bounded number per source
algorithm sliding window, so a burst on the window boundary does not pass double
on top    a slow password hash underneath, and a challenge or a short lockout
          after repeated failure
response  429 with Retry-After; the same response for a real account and an
          unknown one, so the limit does not become an oracle for which
          accounts exist
```

## The search endpoint

```
threat    resource exhaustion: expensive queries run in a tight loop
key       user for signed-in search, source for public search
limit     a low steady rate with a token bucket, so a user typing gets a small
          burst then a steady refill, and a script gets throttled
algorithm token bucket, for the controlled burst
on top    the query itself is bounded: a result limit, a timeout
response  429 with Retry-After
```

## Why one number would fail

Give both the login's tight per-minute limit and the real user's search-as-you-
type is throttled on the third keystroke. Give both the search's generous rate
and the login is wide open to a stuffing attack. The limits differ because the
cost of abuse differs, which is the whole skill.
