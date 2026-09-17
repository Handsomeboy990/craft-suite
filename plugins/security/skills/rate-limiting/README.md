# rate-limiting

Sets a rate limit per endpoint by what abuse of that endpoint costs, not one
number everywhere. Login and one-time codes and password reset are tighter than
a read; uploads and search and expensive operations are limited by resource
cost; the limit is keyed by IP, by user, or by both, with the right algorithm
and a shared store when more than one instance serves.

- Inputs: the endpoints, and for each what abuse costs and what a real user
  needs.
- Outputs: the per-endpoint limit policy, the keys and algorithms, the
  implementation, the throttle response.
- Depends on: security-core.

A single global limit is two mistakes at once: too loose for the login endpoint
an attacker sprays, too tight for the search box a user types into. The key
must be one a caller cannot forge (reading the client IP correctly behind a
proxy), the count must live in a shared store when more than one instance
serves or the real limit is a fraction of the stated one, and the response is a
429 with Retry-After that leaks nothing about whether an account exists.

A rate limit is one layer. It slows an attack; it does not replace the slow
password hash, the anti-spam, or the upload validation it sits in front of.
