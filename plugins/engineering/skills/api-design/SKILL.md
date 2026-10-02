---
name: api-design
description: Designs an HTTP or GraphQL contract before it is implemented: resources and operations, request and response shapes, status codes, one error format, pagination, filtering, sorting, idempotency, versioning, authentication and authorization, rate limits and the published specification. Use before writing a new endpoint, changing a payload or publishing an interface anyone else will depend on.
license: MIT
metadata:
  category: dev-skills
  version: 1.1.0
  depends_on: [engineering-core, architecture-design]
  outputs: [api-contract, endpoint-specification, error-format, versioning-policy]
---

# API Design

A contract is the most expensive thing to change, because someone else's code
depends on it. Design it deliberately, once, before it exists in the wild.

An API that grows endpoint by endpoint from whatever each screen needed is not
a contract; it is a collection of accidents with a base URL.

## 1. Before designing anything

```
who consumes it: our own client, a partner, the public, another service
what they need, expressed as their operations, not as our tables
what already exists in this project, and what conventions it set
whether the existing conventions are worth keeping, decided once
what must never be exposed, from the data model
```

An internal API for one client is allowed to be shaped by that client. A
public API is not, because its consumers will be shaped by it for years.

## 2. Choosing the style

| Style | Fits |
|---|---|
| REST over HTTP | resources with clear identity, caching, broad client support |
| RPC style endpoints | operations that are not resources: actions, workflows, computations |
| GraphQL | many clients with divergent field needs, and a team able to own query cost and depth limits |
| streaming or events | continuous data, or consumers that must not poll |

Mixing is normal: a REST surface with a few action endpoints is honest, and
better than pretending an operation is a resource.

GraphQL carries costs that are decided at design time, never later: query cost
limits, depth limits, per field authorization, and an N plus 1 strategy.

## 3. Resources and operations

```
name resources as plural nouns, actions as verbs on a sub path
one canonical identifier per resource, opaque unless there is a reason
no verb in a resource path, no resource in an action name
nesting only where the child cannot exist without the parent, one level
a collection endpoint is not the place to hide seventeen filters and a mode
```

Every operation declares: who may call it, what it reads, what it changes, and
what it costs.

## 4. Request and response shapes

```
one envelope convention across the whole surface, or none, decided once
field names in one case convention, applied everywhere
dates as a single unambiguous format with a timezone
money as an integer minor unit with a currency, never a float
enumerations as strings with declared values, never as integers
identifiers as strings, even when they are numbers today
optional means absent or null, chosen once and documented
no field the caller may not use, and no field only one client needs
```

Never return a field because it was easy to include. Every field is a promise.

## 5. Status codes and errors

Follow the map in `resources/contract-conventions.md`. Two rules dominate:

```
the status carries the outcome: never a 200 with an error inside
one error shape across the whole surface, with a stable machine readable code,
  a human message, and field level detail where it applies
```

Error codes are part of the contract. Clients branch on them, so they are
named, documented and never repurposed.

## 6. Collections

```
pagination decided once: cursor for large or changing sets, offset only for
  small stable ones, and never both
a declared maximum page size, enforced rather than trusted
filtering on a declared list of fields, with declared operators
sorting on a declared list of fields, with a deterministic tiebreaker
a total count only when it is affordable, and marked as approximate when it is
empty is an empty collection with a 200, never a 404
```

## 7. Writes

```
create returns the created resource, or its identifier and location
update: partial or full, chosen once for the whole surface
delete: idempotent, and soft or hard decided at the data model level
every unsafe operation states whether it is idempotent
retryable writes accept an idempotency key and return the original result
long operations return an accepted status and a way to observe completion
```

## 8. Authentication, authorization and limits

```
one authentication mechanism per audience, documented, with expiry and
  revocation semantics stated
authorization stated per operation, at object level, not only at route level
a caller who may not see a resource gets the same answer as for one that does
  not exist
visibility (drafts, unpublished, private) decided by the server from the
  caller's identity; a filter parameter may narrow it, never widen it
rate limits declared with their window, their scope and their response: 429
  with Retry-After and the limit and remaining count, the counter checked and
  incremented atomically, per `rate-limiting`
every operation that creates a resource without authentication is rate limited
payload size limits declared
```

## 9. Versioning and change

```
additive changes are not versioned: new optional fields, new endpoints
breaking changes are versioned: removal, rename, type change, semantic change,
  a new required field, a narrowed enumeration, a changed default
the versioning mechanism is chosen once: path, header or media type
deprecation has a date, a replacement and a way to observe remaining usage
two versions run in parallel only for as long as the policy states
```

A change is breaking if any conforming client could stop working. The judge is
the contract, not the current clients.

## 10. Specification

The contract is written down in a machine readable form where the ecosystem
supports one, generated from the code or checked against it, never maintained
by hand as a second source of truth. Where it cannot be generated, a drift
check belongs in the pipeline.

When more than one client consumes the server (a web app, a terminal, a mobile
app, an SDK), the server's published specification is the contract and every
client is generated from it. Generated clients are never edited by hand: a
change goes into the server, and the clients are regenerated.

The package dependency direction is written down and checked:

```
schema       shapes and validators, depends on nothing in the product
core         business rules, depends on schema
server       transport, depends on core and schema
clients      depend on schema and the generated client, never on core or server
```

The names follow the project; the rule is that the arrows point one way, and
an import rule or a lint in the pipeline fails the build when one points back.

## 11. Prohibitions

- Never expose an internal model directly as a response shape.
- Never let a client supply a value the server must decide: price, role,
  owner, status, timestamps.
- Never leak storage detail through field names, error text or identifiers.
- Never add a mode flag that changes the meaning of a response.
- Never break a published contract without a version and a deprecation path.
- Never document an endpoint that does not exist, or omit one that does.
- Never edit a generated client by hand, or let a client import server
  internals.
- Never take visibility from a caller supplied flag.

## 12. Protocol

1. Establish the consumers and the operations they need.
2. Read the existing surface and record its conventions.
3. Choose the style, and say why.
4. Define resources, operations and identifiers.
5. Define request and response shapes, field by field.
6. Define the single error format and the codes this surface uses.
7. Decide pagination, filtering, sorting, idempotency and limits.
8. State authentication and per operation authorization.
9. Decide the versioning policy and what counts as breaking here.
10. Write or generate the specification, and hand it to implementation.
11. Hand the same contract to `api-testing` before the first client uses it.

## 13. Auto-critique

Score from 0 to 5: fit to consumer needs, consistency with the existing
surface, shape discipline, status and error coherence, collection rules,
idempotency, authorization and visibility stated per operation, versioning
policy, quality of the specification and of the generated clients.

Threshold: no axis below 3, average at least 4. A surface with two error
formats, or an operation whose authorization is undefined, is redesigned
before it is built.

## 14. Interfaces

- Upstream: `requirements-analysis`, `architecture-design`,
  `technology-selection`.
- Lateral: `input-validation` for the validation rules the contract implies,
  `backend-engineering` for implementation, `rate-limiting` for limit policy,
  `security-audit` for exposure, `fullstack-engineering` for the clients.
- Downstream: `api-testing` to verify the contract holds,
  `technical-documentation` to publish it, `release-engineering` for
  deprecation and version rollout.
