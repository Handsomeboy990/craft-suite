---
name: self-critique
description: Reviews finished work from the professional roles that would actually receive it, in any domain: selects the relevant reviewers, checks the result against the user's stated request, ranks what it finds by severity, fixes it, and re-reviews what the fix touched. Run before presenting any meaningful output as complete.
license: MIT
metadata:
  category: shared
  version: 1.0.0
  depends_on: []
  outputs: [review-record, corrected-output, residual-list]
---

# Self Critique

First results are drafts. This skill is the procedure that turns a draft into
something that survives contact with the person who receives it.

The move is not to reread. Rereading finds typographic errors and confirms
what you already believe. The move is to stop owning the work, adopt the roles
that will judge it, and let each one look for the failure it is trained to see.

## 1. When it runs

Run it before any of the following:

```
presenting work as complete
handing work to another agent, engineer or reviewer
sending a document to its recipient
committing a change
declaring a deployment successful
```

Skip it for a trivial, fully verified action: a one line typo fix already
covered by a passing test, answering a factual question, reading a file.
Skipping is a decision that gets stated, not a default.

The cost is bounded. A small change earns two roles and five minutes. A
delivery earns the full catalogue.

## 2. Selecting the reviewers

Reviewer selection is the skill. The wrong panel produces confident,
irrelevant approval.

1. Name what was produced, concretely: an endpoint, a migration, a page, a
   letter, a chapter, a PDF, an architecture proposal.
2. Name who is affected by it being wrong. Include the person who maintains it
   six months from now.
3. Take the roles from section 3 that match. Two to four for a small change,
   four to eight for a delivery.
4. Add any role the specific work demands and the catalogue does not list.
5. Drop every role with nothing to look at. A security engineer reviewing a
   copy change finds nothing, and that empty finding dilutes the real ones.

Each selected role gets its own pass. One pass, one perspective, one question.
Reviewing from four roles at once is reviewing from none.

## 3. Role catalogue

Each role carries the question it exists to ask. Ask it literally.

### Software, general

| Role | Asks |
|---|---|
| Senior developer | is this how the rest of the codebase does it, and if not, why |
| Software architect | what does this make harder to change later |
| Security engineer | what does a hostile caller send here |
| QA engineer | which input breaks this, and is there a test that would catch it |
| Performance engineer | what is the cost at a hundred times this volume |
| Maintainer | can someone fix this at 3am without the author |
| DevOps engineer | what happens when this is deployed and the dependency is down |
| End user | what do I see when it fails |

### Frontend

| Role | Asks |
|---|---|
| Senior frontend engineer | where does state live, and why there |
| UI/UX designer | what is the hierarchy telling me to look at first |
| Accessibility specialist | can this be operated with a keyboard and announced by a screen reader |
| Performance engineer | what does this add to the bundle and to the first render |
| Mobile user | what does this look like at 360 pixels, one handed, on a slow network |
| QA engineer | are loading, empty, error, partial and success all implemented |
| End user | what do I do when it fails, and does the message tell me |

### Backend

| Role | Asks |
|---|---|
| Backend architect | what is the transaction boundary, and what happens on partial failure |
| Security engineer | authentication, authorization, injection, rate limiting: which is missing |
| Database engineer | what does this query plan do when the table is large |
| Performance engineer | how many round trips, and is one of them in a loop |
| API reviewer | is this contract one a client can use without reading the implementation |
| QA engineer | which of the mandatory cases is untested |
| Operations engineer | when this breaks in production, what in the logs tells me |

### Documentation

| Role | Asks |
|---|---|
| Technical writer | is the structure the reader's, or the author's |
| Subject matter expert | is any statement here actually false |
| New developer | can I follow this without asking anyone a question |
| End user | is the vocabulary mine, or the system's |
| Editor | which paragraph carries nothing |
| Information architect | can I find this again in six months, from the title alone |

### Administrative and professional documents

| Role | Asks |
|---|---|
| Professional editor | is the register consistent from the first line to the signature |
| Administrative reviewer | is a required element missing: date, reference, subject, attachment, signature |
| Recipient | what am I being asked to do, and by when |
| Compliance oriented reviewer | does any sentence assert a fact, a credential or an obligation that was never established |

### Creative writing

Do not improvise a panel here. The creative roles, their scoring axes and
their thresholds already exist and are more demanding than anything this
section would invent. Delegate to `self-critique-protocol` and, where the
verdict has to be editorial, to `story-doctor`, `literary-editor`,
`beta-reader` and `literary-critic`.

### Project and delivery

| Role | Asks |
|---|---|
| Project manager | what did we agree to deliver, and is it delivered |
| Client | is this what I asked for, in words I understand |
| Executive | what is the decision, and what does it cost |
| Next owner | can I take this over without the person who built it |

## 4. The user vision check

Mandatory. Runs on every self critique, whatever the domain, before the role
passes and again after the fixes. Answer each question with a yes or a no and
a reason. An unqualified yes to all nine, on the first pass, means the check
was not performed.

```
Did I answer what was actually requested, or an adjacent question I preferred?
Did I respect every stated constraint?
Did I preserve the intent, including the parts I disagreed with?
Did I add anything nobody asked for?
Did I leave out anything that was asked for?
Which assumptions did I make, and are they written down where someone can see them?
Is this more complicated than the problem required?
Could another professional continue this work from what exists?
Is the result usable now, or only demonstrable?
```

Two failure modes this check exists to catch, because nothing else catches
them:

- **Silent scope reduction.** The hard part was skipped and the easy part was
  delivered with confidence. If any part of the request is not in the output,
  it is stated as omitted, with the reason. Deciding to reduce scope is the
  user's call.
- **Silent scope inflation.** An abstraction, an option, a configuration
  layer or a file was added because it seemed useful. If it was not requested
  and is not required by what was requested, remove it or justify it in one
  line.

## 5. Severity and the fix rule

Every finding gets a severity, and severity decides what happens next.

| Severity | Definition | Action |
|---|---|---|
| Blocking | wrong result, data loss, exposure, unusable output, requirement not met | fix before presenting, no exception |
| Major | works but will fail under a foreseeable condition | fix, or state the condition and why it is accepted |
| Minor | quality, clarity, consistency | fix when cheap, otherwise list |
| Note | preference | list only, never act silently |

The fix rule: **when the skill can modify the output, it fixes what it
finds.** A review that hands back a list of defects and an unchanged artefact
has moved the work to the user rather than doing it.

Two limits on that rule, and they are the only two:

- A fix that changes agreed scope is proposed, not applied.
- A fix outside the boundary of what was asked to be modified is reported
  with its location, not applied.

## 6. Re-review

Any fix classified blocking or major invalidates the passes it touched. Re-run
those passes only, not all of them.

Stop when a full pass produces no blocking and no major finding, or after
three cycles. Three cycles without convergence is not a fourth cycle: it means
the approach is wrong, and the work is redone from the requirement rather than
patched further.

## 7. Anti-complacency

Self review fails in one predictable way: the reviewer knows what the author
meant, so the artefact reads as clear.

Four rules that make that harder:

- Review the artefact alone. Do not consult your own reasoning to resolve an
  ambiguity. If the artefact needs your memory to be understood, that is the
  finding.
- Every finding cites a location: a file and line, a section, a sentence. A
  finding without a location is an impression and gets discarded.
- A pass that produces zero findings records what it checked. A silent pass is
  a skipped pass.
- The first cycle of a non trivial piece of work produces findings. If it does
  not, the panel was wrong or the passes were merged. Reselect and redo.

## 8. Output record

```markdown
## Self critique

Reviewed: <what, in one line>
Roles: <the panel, and why these>

### Vision check
<the nine answers, one line each>

### Findings
| # | Severity | Role | Location | Finding | Action |
|---|---|---|---|---|---|

### Applied
<what changed, in one line each>

### Not applied
<finding, why not, who decides>

### Verification
<what was re-run or re-read after the fixes, and the observed result>
```

Where a lighter footprint is wanted, the record collapses to three lines: what
was reviewed, what was fixed, what remains. It is never dropped entirely.
Claiming a review happened without a record of what it looked at is the exact
behaviour this skill exists to prevent.

## 9. Delegation

This skill selects perspectives and enforces the loop. It does not duplicate
the deep reviews. When a domain has a dedicated review skill, that skill owns
the depth.

| Output | Delegate to |
|---|---|
| Code written or changed | `code-review-protocol` |
| Authentication, payments, uploads, permissions, secrets | `security-audit` |
| Anything about to ship | `release-readiness` |
| Fiction, poetry, screenplay | `self-critique-protocol` |
| A manuscript with an editorial verdict at stake | `literary-critic` |
| A professional or administrative document | `document-core` section on the quality gate |
| A generated PDF | `pdf-production` verification section |
| Scope against an approved agreement | `project-brief`, then `scope-and-change-control` |

Delegating does not end this skill's work. The vision check of section 4 runs
regardless, because no domain reviewer checks whether the user was answered.

## 10. Protocol

1. State what was produced and what was requested. Read the request again,
   from its source, not from memory.
2. Select the panel with section 2. Write down which roles and why.
3. Run the vision check of section 4.
4. Run one pass per role. One question, one pass, findings with locations.
5. Delegate the deep review where section 9 requires it.
6. Rank every finding by severity.
7. Fix everything blocking. Fix major and minor findings within the boundary.
8. Re-run the invalidated passes.
9. Re-run the vision check against the corrected result.
10. Write the record of section 8, including what was not fixed and why.
11. Present the corrected work, not the draft, with the record attached.

## 11. Auto-critique

Score 0 to 5: panel relevant to the artefact, passes actually separate,
findings carry locations, vision check answered rather than asserted, severity
honestly assigned, blocking findings all fixed, re-review performed on what
changed, unfixed findings named with a reason, record present.

Threshold: no axis below 3, average at least 4.

Automatic failure, whatever the average: a blocking finding presented as
resolved without the fix, a review claimed without a record, or a vision check
answered with nine unqualified yeses on the first cycle.

## 12. Interfaces

- Upstream: any skill that produces an artefact.
- Downstream: `code-review-protocol`, `security-audit`, `release-readiness`,
  `self-critique-protocol`, `document-core`, `pdf-production`.
- Related: `project-brief` holds the agreed scope this skill checks against.
