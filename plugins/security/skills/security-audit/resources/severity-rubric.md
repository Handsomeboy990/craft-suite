# Security severity rubric

Severity is exploitability multiplied by impact. Both are stated, never
implied.

## Exploitability

| Level | Meaning |
|---|---|
| trivial | any unauthenticated caller, one request, no special knowledge |
| easy | an authenticated caller of the lowest privilege, one or two requests |
| moderate | requires a precondition the attacker can create, or a race window |
| hard | requires a precondition the attacker does not control, or another compromise first |

## Impact

| Level | Meaning |
|---|---|
| severe | full account takeover, arbitrary code execution, mass data disclosure, money movement |
| high | one victim's private data or account, or a targeted money loss |
| moderate | limited disclosure, denial of a single user's service, abuse of a costly resource |
| low | information that helps a later attack without being harmful alone |

## Resulting level

| | severe | high | moderate | low |
|---|---|---|---|---|
| **trivial** | critical | critical | high | medium |
| **easy** | critical | high | medium | low |
| **moderate** | high | medium | medium | low |
| **hard** | medium | medium | low | low |

## Action by level

| Level | Action |
|---|---|
| critical | fix before anything else ships, and check whether it was already exploited |
| high | fix in this task |
| medium | fix in this task when contained, otherwise scheduled with a date and an owner |
| low | recorded, fixed when the area is next touched |

## Worked examples

```
Object level authorization missing on GET /api/invoices
Exploitability trivial: authenticated user changes one query parameter
Impact severe: every customer's billing data
Level: critical
```

```
Missing rate limit on password reset
Exploitability trivial: unauthenticated, repeated requests
Impact moderate: mail flooding, address enumeration by response timing
Level: high
```

```
Session cookie without SameSite on a site with no state changing GET routes
Exploitability moderate: needs a victim to visit an attacker page while
authenticated, and a POST that is not otherwise protected
Impact high: action performed as the victim
Level: medium, raised to high if a token check is also absent
```

```
Verbose error message revealing the ORM and its version
Exploitability trivial
Impact low: helps target a later attack, harmful only with a known advisory
Level: medium by the table, reported as low with the reasoning stated when the
dependency is current
```

The table is the default. Deviating from it is allowed, and the deviation is
written down with its argument. Silent deviation is not.

## Anti patterns in ranking

- Raising severity to force attention. If the impact is moderate, say moderate
  and let the attacker path do the persuading.
- Lowering severity because the fix is inconvenient.
- Ranking on the theoretical worst case rather than on the reachable one.
- Ranking a whole class as one finding when only one instance is reachable, or
  the reverse: reporting one instance when the class is systemic. State which
  it is.
