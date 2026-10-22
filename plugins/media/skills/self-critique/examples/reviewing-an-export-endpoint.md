# Self critique of an export endpoint

The request was: add an endpoint that lets a signed in user download their own
orders as CSV.

The work produced: a route handler, a CSV serialiser, one test.

## Panel

Backend architect, security engineer, database engineer, QA engineer,
operations engineer, end user.

Not selected: frontend engineer, nothing was rendered. Not selected:
accessibility specialist, no interface. Not selected: performance engineer as
a separate role, the database engineer covers the only cost that exists here.

## Vision check, first pass

```
Answered what was requested?          Yes. Endpoint exists, returns CSV.
Respected the constraints?            Partly. The request said their own orders.
                                      The query filters by a user id taken from
                                      the query string, not from the session.
Preserved the intent?                 Yes.
Added anything unrequested?           Yes. A format parameter accepting json,
                                      which nobody asked for.
Left anything out?                    Yes. No pagination or streaming; the
                                      request implies the full history.
Assumptions made?                     That order history is small. Unwritten.
More complicated than required?       Yes, by the format parameter.
Could another professional continue?  Yes.
Usable now?                           No. See the blocking finding.
```

## Findings

| # | Severity | Role | Location | Finding | Action |
|---|---|---|---|---|---|
| 1 | Blocking | Security engineer | `routes/orders.ts:14` | User id read from `req.query.userId`. Any authenticated user can export any other user's orders by changing one number. | Fixed |
| 2 | Blocking | End user | `routes/orders.ts:31` | A serialiser failure returns 200 with a truncated body. The browser saves a partial file that looks complete. | Fixed |
| 3 | Major | Database engineer | `routes/orders.ts:19` | `findMany` with no limit. One account with 400k orders loads them all into memory. | Fixed |
| 4 | Major | Security engineer | `csv.ts:8` | A cell beginning with `=`, `+`, `-` or `@` executes as a formula when the file is opened in a spreadsheet. Order notes are user supplied. | Fixed |
| 5 | Major | QA engineer | `orders.test.ts` | One test, the happy path. No test for another user's id, empty history, or a cell that starts with an equals sign. | Fixed |
| 6 | Minor | Operations engineer | `routes/orders.ts:12` | No log line. An export of a full order history leaves no trace of who ran it or when. | Fixed |
| 7 | Minor | Backend architect | `routes/orders.ts:22` | Serialisation lives in the handler. The next export format duplicates it. | Not applied |
| 8 | Note | Backend architect | `routes/orders.ts:9` | The `format=json` parameter was never requested. | Fixed |

## Applied

1. User id now comes from the session. The query parameter is ignored, and
   requesting another user's id returns 403 rather than an empty file, so the
   attempt is visible in the logs.
2. Headers are sent after serialisation succeeds. A failure returns 500 with
   no body, so no partial file is ever saved.
3. Streamed in batches of 1000 rows, with a hard cap and a documented limit.
4. Cells matching the formula prefixes are prefixed with a single quote on
   write. Test added with a note reading `=1+1`.
5. Tests added: another user's id returns 403, empty history returns a header
   row only, formula prefix is neutralised, the cap is enforced.
6. One structured log line per export: actor, row count, duration.
8. The `format=json` parameter was removed. It was not requested, had no
   caller, and would have been a second contract to maintain.

## Not applied

Finding 7, extracting the serialiser. Real, and correct as a direction, but
there is exactly one export today. Extracting an abstraction for a second
caller that does not exist yet is speculative. Recorded as a follow up for the
moment a second format is actually requested.

## Re-review

Findings 1, 2, 3 and 4 are blocking or major, so the security, database, end
user and QA passes ran again on the corrected code.

- Security: session derived id, 403 on mismatch, formula prefixes neutralised.
  Nothing further.
- Database: batched, capped. Query plan uses the existing index on
  `orders(user_id, created_at)`. Nothing further.
- End user: failure now produces a browser error rather than a corrupt file.
  Nothing further.
- QA: five tests. Each was made to fail once by reverting its fix, then passed
  with the fix restored. A test that has never failed proves nothing.

## Vision check, second pass

The two deviations from the request are resolved: authorization now matches
their own orders, and the unrequested parameter is gone. The assumption about
history size is no longer an assumption, it is a documented cap. The remaining
answer that is not a clean yes is the follow up in finding 7, which is
recorded rather than silently dropped.

## Verification

`npm test -- orders` : 5 passed. Manual check with two accounts: account B
requesting account A's id receives 403, and the log line records the attempt.

## What the panel produced that a reread would not

Findings 1 and 4 came from the security pass only. Finding 2 came from the end
user pass, because the code path looks correct until you ask what lands in the
downloads folder. Finding 8 came from the vision check, not from any role: no
reviewer objects to a working feature, only the request does.
