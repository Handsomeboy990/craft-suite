---
name: project-brief
description: Frames a piece of work before it starts: establishes what is being built, for whom, under which constraints and what counts as done, by asking the decision-critical questions once in a single batch rather than one at a time. Produces the working agreement that becomes the operational source of truth. Run at the start of any significant project, and before taking over an existing one.
license: MIT
metadata:
  category: shared
  version: 1.0.0
  depends_on: []
  outputs: [working-agreement, question-batch, assumption-register, change-record]
---

# Project Brief

Most failed work is not badly executed. It is precisely executed against a
request nobody wrote down.

This skill produces one short document, agreed before the work starts, that
says what is being built, for whom, under which constraints, and what counts
as finished. Everything afterwards is measured against it.

## 1. When it runs

| Input | Action |
|---|---|
| A single, clear, bounded task | skip; a brief for a typo fix is bureaucracy |
| A project, brief, specification, PRD or client request | run, then hand to `requirements-analysis` if it is software |
| Taking over an existing codebase or manuscript | run, with section 6 |
| A request whose scope you cannot state in one sentence | run, this is the symptom |
| Work that will span more than one session | run, so the next session has a reference |

The test: can you write, in one sentence, what will exist at the end and how
you will know it is right? If not, this skill runs.

## 2. Name it for the context

The document has one purpose and several names. Use the one the reader
recognises.

| Context | Name |
|---|---|
| Client engagement | Project Brief |
| Engineering project | Technical Requirements Document |
| Internal or collaborative work | Working Agreement |
| Formal or contractual setting | Project Contract |
| Book or manuscript | Project Bible, the entry point of `novel-architect` |

Choose one and keep it. The name is not the deliverable; the agreement is.

## 3. Inspect before asking

Questions asked about things the repository, the specification or the
attached files already answer waste the user's time and signal that nothing
was read.

Before writing a single question:

```
Read the request completely, including attachments and links.
Read the repository or the existing material: structure, stack, conventions, history.
Read the existing documentation, continuity notes and prior agreements.
List what you now know. List what you inferred. Keep the two lists apart.
```

For software, `project-exploration` does this properly and its output feeds
here. For an existing manuscript, `continuity-manager` does.

Only what remains after inspection becomes a question.

## 4. The single batch

Ask once. All of it. Structured.

Serial questioning is the most expensive failure mode: it multiplies context
switches, delays the start by the number of questions, and forces the user to
hold the whole problem in their head across the gaps.

Rules for the batch:

- Every question must change what you would do. If both answers lead to the
  same work, it is not a question, it is curiosity. Cut it.
- Group by theme, not by the order the questions occurred to you.
- Offer the likely options where they exist. A question with three named
  options is answered in seconds; an open question is answered in a paragraph
  or not at all.
- Mark each question required or optional. Optional means you have a defensible
  default and will proceed with it.
- State the default next to every optional question, so silence is a valid,
  informed answer.
- Keep it under about ten questions. More than ten means the inspection of
  section 3 was not done, or the work should be split.

```markdown
## Before I start, these change the outcome

**Scope**
1. [required] X or Y? I read the spec as X because <reason>.
2. [optional] Is Z in scope for this phase? Default: no, recorded as follow up.

**Constraints**
3. [required] Fixed deadline, or fixed scope? Only one can be fixed.
4. [optional] Anything I must not modify? Default: nothing outside <area>.

**Definition of done**
5. [required] What must be true for you to consider this delivered?
```

Everything not asked becomes a written assumption, in section 5. Silence is
never treated as agreement to something that was never stated.

## 5. Contents of the agreement

Include a field only when it changes the work. A brief with thirty empty
headings is worse than eight filled ones, because a reader cannot tell which
blanks are decisions and which are omissions.

### Always

```
Objective            one sentence, what will exist and why
Deliverables         the concrete artefacts handed over
Definition of done   the conditions under which this is finished
Out of scope         what will not be built, explicitly
Assumptions          what was decided without an answer, and by whom
Constraints          deadline, budget, technology, policy, people
```

### For software work, when relevant

```
Target users and roles       Permissions
Functional requirements      Non functional requirements
Existing stack               Preferred stack
Hosting                      Database
External services            Integrations
Authentication               Payments
Localisation                 Accessibility
Design and responsive        Security
Performance targets          Testing expectations
Deployment                   Documentation
Acceptance criteria          Priority order
```

### For a document deliverable, when relevant

```
Recipient and audience       Output language
Format and length            Confidentiality
Tone and register            Source material and its authority
Branding                     Delivery format, including whether a PDF is required
```

### For a writing project, when relevant

```
Genre and register           Length and format
Point of view                Output language
Target reader                Publication intent
Constraints inherited from an existing volume or series
```

## 6. Taking over existing work

Never change anything first. Diagnosis before treatment is not caution, it is
the only way to know which of the current behaviour is a bug and which is a
requirement nobody documented.

Establish, and write down:

```
What exists                  the actual inventory, from the material itself
What works                   verified by running or reading it, not assumed
What is incomplete           started and not finished
What is broken               reproduced, not reported
What must change             the actual request
What must not change         the part where a change is a regression
Current architecture         as built, not as documented
Current stack and versions   from manifests and lockfiles
Current deployment           where it runs, how it gets there
Known technical debt         theirs, named by them
Priorities                   theirs, ordered
Expected final state         the target
```

Two rules that prevent the classic takeover failures:

- Existing behaviour is a requirement until someone says otherwise. Code that
  looks wrong may be load bearing.
- What is not on the change list is out of scope, including things that
  visibly want improving. Note them; do not fix them uninvited.

## 7. The agreement as source of truth

Once accepted, the brief governs. It outranks a preference formed later,
including your own.

When implementation contradicts it, and it will:

1. Name the contradiction precisely: which line of the brief, which fact.
2. State it in two or three sentences. No essay.
3. Propose the smallest resolution that preserves the objective.
4. Ask only when the resolution changes cost, scope, deadline or a stated
   constraint. Otherwise decide, and record it.
5. Update the brief with the decision, its date and its reason.
6. Continue.

A requirement is never silently rewritten, never quietly dropped, and never
reinterpreted into something more convenient. If the brief turns out to be
wrong, that is a finding to report, not a licence to substitute your own.

For software delivery under an approved architecture,
`scope-and-change-control` owns this loop in detail and this section defers to
it.

## 8. Handing over to the deeper skills

This skill frames. It does not analyse requirements, choose a stack or design
an architecture.

| After the brief | Continue with |
|---|---|
| Software project | `requirements-analysis`, then `clarification-gate` |
| Software task | `engineering-orchestrator` |
| Full delivery with gates | `delivery-orchestrator` |
| Professional document | `document-core` |
| Novel, saga or screenplay | `novel-architect` |

For a full delivery, the brief is the input to phase one, not a replacement
for it. `requirements-analysis` will separate requirements from assumptions
far more strictly than a brief does, and `clarification-gate` will ask a
second, sharper batch once the architecture questions surface. That is not
duplication: the first batch establishes what the work is, the second resolves
what the design needs.

## 9. Protocol

1. Decide whether a brief is warranted with section 1. If not, say so and
   proceed.
2. Inspect everything already available, per section 3.
3. Separate what is known from what is inferred.
4. Build the question batch with section 4. Cut every question that does not
   change the work.
5. Ask once.
6. Record every unanswered item as a written assumption with its default.
7. Write the agreement with section 5, sized to the work.
8. Present it for confirmation. State plainly that silence on an assumption
   will be treated as acceptance of the stated default.
9. Store it where the next person will find it, next to the work.
10. Work against it. Apply section 7 on every contradiction.
11. Update it when a decision changes it, with the date and the reason.

## 10. Auto-critique

Score 0 to 5: inspection actually performed before asking, every question
decision critical, one batch rather than a drip, defaults stated for optional
questions, assumptions written rather than implied, definition of done
testable, out of scope explicit, agreement short enough to be read, contradiction
protocol followed rather than silent rewriting.

Threshold: no axis below 3, average at least 4.

Automatic failure: a question whose answer would not have changed the work, a
requirement altered without a recorded decision, or an assumption acted on
without being written down.

## 11. Interfaces

- Upstream: the raw request, `project-exploration`, `continuity-manager`.
- Downstream: `requirements-analysis`, `clarification-gate`,
  `delivery-orchestrator`, `engineering-orchestrator`, `document-core`,
  `novel-architect`.
- Related: `scope-and-change-control` owns change control once an architecture
  is approved. `self-critique` checks finished work against this agreement.
