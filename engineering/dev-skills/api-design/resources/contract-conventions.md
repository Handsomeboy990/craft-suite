# Contract conventions

Decide each of these once for a surface, write it down, and apply it without
exception. Consistency is worth more than any individual choice here.

## Status codes

| Outcome | Status |
|---|---|
| read succeeded | 200 |
| resource created | 201, with the resource or its location |
| accepted for asynchronous processing | 202, with a way to observe it |
| succeeded, nothing to return | 204, empty body |
| malformed request, cannot be parsed | 400 |
| well formed, fails validation | 422, or 400 if the surface uses one code |
| no credentials, or invalid credentials | 401 |
| authenticated, not permitted | 403 |
| absent, or not visible to this caller | 404 |
| method not allowed on an existing path | 405 |
| unsupported media type | 415 |
| conflict with current state | 409 |
| precondition failed | 412 |
| payload too large | 413 |
| rate limited | 429, with retry information |
| unhandled fault | 500, with no internal detail |
| dependency unavailable | 503, with retry information if known |

Pick 400 or 422 for validation and never mix them on the same surface.

## Error format

```json
{
  "error": {
    "code": "invalid_range",
    "message": "range must be one of last-30-days, all",
    "field": "range",
    "details": [
      { "field": "items[2].quantity", "code": "out_of_range",
        "message": "quantity must be between 1 and 99" }
    ],
    "requestId": "req_01HZY..."
  }
}
```

```
code       stable, machine readable, documented, never repurposed
message    for a developer, in English, never a raw exception
field      present when the fault is attributable to one input
details    present when several inputs failed, so one round trip is enough
requestId  correlates with the server logs, safe to show to a user
```

Never include a stack trace, a query, a file path, an internal host name or a
column name.

## Pagination

```
cursor form
  request   ?limit=50&cursor=<opaque>
  response  { "data": [...], "nextCursor": "<opaque>" | null }
  rules     opaque cursor, stable ordering, limit capped server side

offset form, small stable collections only
  request   ?limit=50&offset=100
  response  { "data": [...], "total": 431 }
  rules     total only when it is cheap, ordering deterministic
```

## Filtering and sorting

```
?status=active&createdAfter=2026-01-01&sort=-createdAt

declared fields only, rejected with 400 when unknown
one operator convention: suffixes, or bracket syntax, never both
sort direction by prefix or by a second parameter, chosen once
always a deterministic tiebreaker, usually the identifier
```

## Idempotency

```
GET, HEAD, PUT and DELETE are idempotent by definition and must behave so
POST is not, unless it accepts an idempotency key

Idempotency-Key: <client generated>
  same key, same payload    the original response, no second effect
  same key, different body  409
  key retention window      declared, typically 24 hours
```

## Field conventions

```
naming        one case convention for the whole surface
timestamps    ISO 8601 with an offset, named createdAt, updatedAt
dates         ISO 8601 date, when there is genuinely no time
money         { "amount": 1250, "currency": "EUR" }, integer minor units
durations     integer with a unit in the field name, such as timeoutMs
booleans      positive names: enabled rather than disabled
enumerations  lowercase strings with underscores, values documented
identifiers   strings, prefixed by type where it aids debugging
null          absent and null mean the same thing, or they do not, decided once
```

## Headers

```
Content-Type and Accept honoured, not assumed
Idempotency-Key on retryable writes
ETag and If-Match where concurrent edits are possible
Retry-After on 429 and 503
the limit, the remaining count and the reset time on every rate limited
  response, under one naming convention for the whole surface
Cache-Control explicit on every authenticated response
correlation identifier accepted and echoed
```

## Versioning

```
mechanism     one of: /v1/ in the path, a version header, a media type
scope         the whole surface, not per endpoint
breaking      removal, rename, type change, semantic change, new required
              field, narrowed enumeration, changed default, stricter
              validation, changed error code
additive      new endpoint, new optional field, new enumeration value the
              client is documented to ignore safely
deprecation   announced with a date, a replacement, and usage measurement
```

## Checklist before publishing

```
every endpoint has a documented authorization rule
every error code appears in the specification
one error shape, verified across the surface
no internal field leaked in any response
pagination and limits enforced server side
idempotency stated for every unsafe operation
the specification matches the implementation, checked automatically
clients are generated from the specification, and none is edited by hand
no list operation takes a visibility flag from the caller
```
