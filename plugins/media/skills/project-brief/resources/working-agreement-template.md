# Working agreement template

Delete every heading that does not apply. An empty heading is worse than an
absent one: the reader cannot tell a blank from an omission.

```markdown
# <Project Brief | Technical Requirements Document | Working Agreement>

Date:      <yyyy-mm-dd>
Parties:   <who requests, who delivers>
Status:    draft | agreed | superseded by <version>
Version:   1

## Objective

<One sentence. What will exist at the end, and why it is wanted.>

## Deliverables

| # | Deliverable | Format | Recipient |
|---|---|---|---|

## Definition of done

<Conditions, each verifiable by someone who was not involved.>

- [ ]
- [ ]

## Out of scope

<Explicitly not built. This section prevents more disputes than any other.>

## Constraints

| Constraint | Value | Source |
|---|---|---|
| Deadline | | |
| Fixed dimension | scope or deadline, not both | |
| Technology | | |
| Budget | | |
| Policy or compliance | | |
| Must not be modified | | |

## Assumptions

Anything decided without an answer. Each one is a question that was not worth
asking, and each one is a place this agreement can turn out wrong.

| # | Assumption | Default applied | Impact if wrong |
|---|---|---|---|

## Acceptance criteria

<How the recipient will verify delivery. Observable, not aspirational.>

## Open questions

| # | Question | Blocks | Needed by |
|---|---|---|---|

## Change log

| Date | Change | Reason | Decided by |
|---|---|---|---|
```

## Software addendum

Append only the rows that apply.

```markdown
## Technical context

| Item | Value |
|---|---|
| Existing stack | |
| Preferred stack | |
| Hosting | |
| Database | |
| Authentication | |
| External services | |
| Integrations | |
| Payments | |
| Localisation | |

## Requirements

### Functional
| # | Requirement | Priority | Acceptance |
|---|---|---|---|

### Non functional
| Dimension | Target | Measured how |
|---|---|---|
| Performance | | |
| Availability | | |
| Security | | |
| Accessibility | | |
| Browser and device support | | |

## Users and permissions

| Role | Can | Cannot |
|---|---|---|
```

## Takeover addendum

```markdown
## Current state, established by inspection

| Question | Finding | Evidence |
|---|---|---|
| What exists | | |
| What works | | ran it, output observed |
| What is incomplete | | |
| What is broken | | reproduced, steps recorded |
| Current architecture | | as built |
| Current stack and versions | | from manifest and lockfile |
| Current deployment | | |
| Known technical debt | | named by the owner |

## Change list

| # | Change requested | Priority |
|---|---|---|

## Must not change

| Area | Why | Consequence of changing it |
|---|---|---|
```

## Rules for filling this in

- Every line is either a fact with evidence, or an assumption in the
  assumptions table. There is no third category.
- The definition of done is verifiable by someone who was not in the
  conversation. If it needs you to explain it, it is not done yet.
- Out of scope is written even when it feels obvious. Especially then.
- Superseded versions are kept. A brief with no history is a brief nobody can
  audit.
