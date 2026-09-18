---
name: input-validation
description: Treats every external input as hostile and validates it at the trusted boundary: bodies, params, headers, forms, files, URLs, identifiers, dates, enums, nested objects, cross field rules, plus the adversarial test matrix. Use whenever new external input reaches the system.
license: MIT
metadata:
  category: dev-skills
  version: 1.0.0
  depends_on: [engineering-core, project-exploration]
  outputs: [validation-schemas, boundary-report, validation-tests]
---

# Input Validation

Every value that did not originate inside the process is untrusted. This
includes the browser the team wrote, the mobile app the team shipped, and the
partner API the team integrated.

Validation is not a formality applied to request bodies. It is the decision
about which values are allowed to exist inside the system at all.

## 1. Where validation belongs

At the trusted boundary: the first point where the value crosses into code
that assumes it is well formed. Everything past that point may assume it.

| Boundary | Trusted point |
|---|---|
| HTTP handler | before the handler body reads any field |
| server action | first statement of the action |
| webhook | after signature verification, before payload use |
| queue consumer | on message deserialisation |
| CLI | on argument parsing |
| scheduled job | on the parameters it reads from storage |
| third party response | before its fields are used |

Client side validation exists for ergonomics. It never replaces the server
side check, and the server never assumes it ran. Both exist. One is trusted.

## 2. Protocol

1. **Enumerate the inputs** the change introduces or touches: body fields,
   query parameters, route parameters, headers, cookies, form fields,
   uploaded files, and anything read from an external response.
2. **Find the project's validation system.** Use it. Introducing a second
   validation library into a project that already has one is a defect, not an
   improvement.
3. **Write the schema** before the handler logic, so the handler receives a
   typed, valid value and never a raw one.
4. **Decide the failure response**: status code, error shape, whether field
   level detail is safe to return. Match the shape the project already
   returns.
5. **Apply the type rules** of section 3 to every field.
6. **Add the cross field rules** of section 4.
7. **Run the adversarial matrix** of section 5 as tests, not as thought.
8. **Verify** that the handler cannot be reached with an invalid value by any
   path, including a second route that shares the same service.

## 3. Rules by type

| Type | Mandatory constraints |
|---|---|
| string | trimmed or explicitly not, minimum, maximum, allowed character set where it matters |
| identifier | exact format, and ownership checked separately, format is not authorization |
| number | integer or decimal, minimum, maximum, finite, rejection of NaN and Infinity |
| money | integer minor units or a decimal type, never a float, currency validated against an allowlist |
| boolean | real boolean, not a truthy string |
| date | parseable, bounded range, timezone handling stated, no silent local time assumption |
| enum | closed allowlist, never a free string compared later |
| array | maximum length, element schema, duplicate policy stated |
| object | unknown keys rejected or stripped, decided explicitly |
| file | size limit, MIME sniffed from content not from the header, extension allowlist, filename sanitised, storage path never derived from the client name |
| URL | scheme allowlist, host allowlist when fetched server side, no redirect following into private ranges |
| email | one validation, then normalised, never used as a display value unescaped |
| phone | normalised to a canonical form, country handling stated |
| HTML or rich text | sanitised with an allowlist at the sink, never with a blocklist |
| JSON string | parsed inside a guarded block, then validated as an object |

Two rules apply to every type: a maximum length exists, and the value is
rejected rather than coerced when it does not match.

## 4. Cross field and contextual rules

Field level validity is not request validity.

- range coherence: start before end, minimum below maximum;
- conditional requirement: field B required when field A has a given value;
- mutual exclusion: exactly one of two fields present;
- referential existence: the referenced row exists, checked in the same
  transaction as the write that depends on it;
- ownership: the referenced row belongs to the caller, which is authorization
  and belongs to `security-audit`, but is verified here as a boundary rule;
- state coherence: the transition is legal from the current state;
- quota: the caller has not exceeded a limit;
- idempotency: a repeated request with the same key produces the same effect
  once.

## 5. Adversarial test matrix

Each of these becomes a test, per input, where applicable.

| Case | Expected |
|---|---|
| missing field | rejected, not defaulted silently |
| null | rejected unless nullable is declared |
| empty string | rejected or trimmed to rejection, decided explicitly |
| whitespace only | same as empty |
| minimum minus one | rejected |
| minimum | accepted |
| maximum | accepted |
| maximum plus one | rejected |
| wrong type | rejected, never coerced |
| extremely long value | rejected before it reaches storage or a log |
| Unicode, emoji, combining marks, right to left marks | handled, length counted in a stated unit |
| null bytes and control characters | rejected |
| leading zeros, plus signs, scientific notation on numbers | rejected or normalised, decided |
| numeric string where a number is expected | rejected or coerced, decided |
| duplicate array elements | policy applied |
| deeply nested object | depth limit enforced |
| prototype polluting keys such as `__proto__` and `constructor` | rejected or stripped |
| SQL metacharacters | stored safely, never concatenated |
| script tags and event handler attributes | escaped at the render sink |
| path traversal sequences | rejected, path resolved and confirmed inside the root |
| a URL pointing at localhost, a private range, or a cloud metadata address | rejected when fetched server side |
| two identical requests sent concurrently | one effect, or a documented conflict |

## 6. Prohibitions

- No validation in the client only.
- No blocklist where an allowlist is possible.
- No sanitising instead of rejecting, when rejecting is possible.
- No silent coercion that changes the meaning of the value.
- No validation library added when the project already has one.
- No schema declared and never applied. A declared schema without a call to
  parse at the boundary is worse than none, because it looks safe.
- No error message that reveals internal structure, existence of an account,
  or the reason a lookup failed when that reason is sensitive.

## 7. Deliverable

```
Inputs        every field the change accepts, with its source
Schema        the schema file and where it is parsed
Failure       status code, error shape, what is disclosed
Cross field   the rules and where they run
Tests         the matrix cases turned into tests
Gaps          inputs left unvalidated, with the reason, or none
```

## 8. Auto-critique

Score from 0 to 5: coverage of every input, validation at the correct
boundary, use of the project's existing system, correctness of the type rules,
cross field completeness, adversarial cases actually turned into tests, no
information disclosure in errors.

Threshold: no axis below 3, average at least 4. Any input reaching a side
effect unvalidated is an automatic failure regardless of other scores.

## 9. Interfaces

- Upstream: `project-exploration`, `architecture-design`.
- Lateral: `backend-engineering`, `frontend-engineering`,
  `fullstack-engineering`.
- Downstream: `testing-quality` for the matrix, `security-audit` for the
  authorization half, `code-review-protocol` for verification.
