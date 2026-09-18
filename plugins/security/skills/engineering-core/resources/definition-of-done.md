# Definition of done checklist

Copy into the working notes and answer every line with `yes`, `no` or
`not applicable`. A single `no` blocks delivery.

## Implementation

- [ ] The stated requirement is implemented in full, not partially.
- [ ] No requirement was silently narrowed, widened or reinterpreted.
- [ ] Every layer touched by the feature is consistent with the others.
- [ ] No unrelated code was refactored.
- [ ] Existing project conventions were followed, not replaced.

## Correctness

- [ ] Null, undefined and empty values are handled on every new path.
- [ ] Async operations are awaited or explicitly fire and forget with a reason.
- [ ] Boundary values were considered: zero, one, maximum, overflow.
- [ ] Concurrent execution of the new path was considered.
- [ ] Errors from called code are handled or deliberately propagated.

## Security

- [ ] External input reaching the change is validated at a trusted boundary.
- [ ] Authorization is checked on the server for every new access path.
- [ ] No client supplied value is trusted for price, role, ownership or state.
- [ ] No secret was introduced into code, logs, tests or documentation.
- [ ] No new injection, traversal or rendering sink was created unescaped.

## Robustness

- [ ] Loading state exists where the user waits.
- [ ] Empty state exists where a list can be empty.
- [ ] Error state exists where a request can fail.
- [ ] Timeouts exist on every outbound network call.
- [ ] Retries, where present, are bounded and idempotent.

## Verification

- [ ] Tests covering the new behaviour exist.
- [ ] Tests were executed and their output observed.
- [ ] The repository checks that apply were executed and pass.
- [ ] Failures caused by this work were fixed, not silenced.
- [ ] No test was modified purely to make it pass.

## Delivery

- [ ] Documentation touching the changed behaviour was updated.
- [ ] Continuity notes reflect the new state.
- [ ] Commits are atomic, English, imperative, correctly authored.
- [ ] The working tree contains no debug leftovers or commented out code.
- [ ] What remains unfinished is named explicitly in the report.
