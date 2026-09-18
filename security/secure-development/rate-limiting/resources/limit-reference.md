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
