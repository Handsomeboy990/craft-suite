# Attack checklist

Four lines. Each item is raised only as a concrete scenario, never as a doubt.

## Line 1, the claim is false

- [ ] A real case named where the stated result is simply not true.
- [ ] The benchmark's conditions match how it will actually be used.
- [ ] "It works" was executed, and on more than the happy path.
- [ ] Every figure has a source that says what is claimed.

## Line 2, the reasoning does not hold

- [ ] Each premise was checked against the repository or the data.
- [ ] No step smuggles in the conclusion it was meant to reach.
- [ ] A comparison changed one variable, not several silently.
- [ ] No generalisation rests on a single observation.

## Line 3, the alternative was not considered

- [ ] The simpler option was rejected with a stated cost, not by default.
- [ ] No dependency was added where the platform already does it.
- [ ] The pattern fits this constraint, not just habit.
- [ ] The decision was checked against its stated assumptions.

## Line 4, the cost was understated

- [ ] Migration, lock in and operational burden were priced.
- [ ] The rare failure mode was checked at scale.
- [ ] The effect on the next change through this code was considered.
- [ ] Token, time and money costs were measured, not assumed optimistically.

## Before raising any item

- [ ] It is stated as a scenario with an input, not as a feeling.
- [ ] Its severity comes from the consequence if it is right.
- [ ] The challenger can state the author's claim fairly first.
