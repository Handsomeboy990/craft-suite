---
name: validation-gate
description: The hard stop before implementation. Presents a short approval package covering architecture, stack, scope, assumptions, risks and cost, then waits for a human decision and records it. No production code is written before this gate returns an approval.
license: MIT
metadata:
  category: delivery-skills
  version: 1.1.0
  depends_on: [engineering-core, architecture-proposal, technology-selection]
  outputs: [approval-package, approval-record, revision-log]
---

# Validation Gate

The one place in the lifecycle where the system stops and waits.

Everything before it is cheap to change. Everything after it is not. The gate
exists because a paragraph rewritten costs a minute and a schema rewritten
costs a fortnight.

## 1. The rule

No production code before approval.

Permitted before the gate: reading the repository, running existing tests,
prototyping in a scratch directory that is never committed, writing the
specification and the proposal.

Not permitted: schema files, migrations, endpoints, components, dependency
installation, project scaffolding, configuration, commits of implementation.

A scaffold committed before approval is implementation. It anchors every
subsequent decision and makes the approval theatre.

### In dispatch terms

The rule is a field a checker can read, not a sentence an agent is trusted
to remember. Every dispatch of phases 1 to 4, per the chief's
`resources/parallel-dispatch.md` section 1:

```
Mode       read, except the one writer of a planning document
Surface    the specification, the clarification record, the stack decision,
           the proposal document; nothing under the source tree
Permits    write deny outside that surface; dependency installation deny;
           a commit only of the planning documents, and only as the
           delegation configuration allows
```

The switch to write mode for implementation is one event: the user's
explicit yes to the decision request, `approved` or `approved with changes`
of section 4, recorded verbatim per section 5. No quote, no switch. Silence,
a timeout, a question back, an approval of something else, or an agent's own
judgement that the proposal is good is not approval, and leaves every
dispatch in planning mode. The narrow work section 7 allows while approval is
pending is named in its own dispatch record, with its surface, before it
starts.

## 2. The approval package

Short. Someone must read it and decide, not study it.

```
Project        one paragraph, what will exist when this is done
Architecture   the shape, in five to ten lines
Stack          one line per major decision, with the reason in half a line
Database       the entities and the one thing that is expensive to change
Backend        the shape and the authorization rule
Frontend       the shape and the accessibility target
Infrastructure where it runs, and how it gets there
Testing        what will be tested and at which layer
Deployment     the mechanism, and the rollback
Scope          in, and explicitly out
Assumptions    every one still in force, with what changes if wrong
Questions      anything still open, and what it blocks
Risks          the three that matter, with their mitigation
Cost           recurring, per month, with the driver
Decision       what is being asked of the reader
```

Target: one screen for a small project, two for a large one. The full
architecture document is linked, not pasted.

## 3. The decision request

End with a specific request, not an open question.

```
Bad:   Let me know what you think.
Bad:   Is this okay?
Bad:   Shall I proceed?

Good:  Approve this and I start with the database and authentication, in that
       order, and report at the end of the backend phase.
       If you disagree with any assumption from A1 to A5, say which; each is
       free to change today.
       The one decision I would flag: A2, no payments at launch. If payments
       are expected in version one, the architecture changes now rather than
       later.
```

The reader is being asked for a decision, and told which part deserves their
attention most.

## 4. Possible outcomes

| Outcome | Meaning | Next |
|---|---|---|
| approved | proceed as proposed | `delivery-planning` |
| approved with changes | proceed with the named modifications | update the document, restate the changes, proceed |
| revision requested | the proposal is wrong in some respect | revise, re-present, do not implement |
| deferred | the reader cannot decide yet | name what unblocks the decision, do not implement |

`Approved with changes` requires the document to be updated before
implementation, and the changes restated in the record. An approval that lives
only in a conversation is not one.

## 5. Recording the approval

```
Approved:      <date>
By:            <who>
Version:       <the revision of the architecture document>
Changes:       <what the approval modified, or none>
Assumptions:   <the list approved, by identifier>
Out of scope:  <the list approved, by identifier>
Quote:         <the approving words, verbatim>
```

Stored with the architecture document. This record is what
`scope-and-change-control` compares against when implementation drifts, and
what the handover shows when someone asks why the system works the way it
does.

## 6. After the gate

The gate does not reopen for ordinary work. After approval the system
executes and reports at phase boundaries.

Asking again about a component's file name, a test's structure, or whether to
fix a bug it introduced is a failure of this skill's purpose: it converts a
single considered decision into a stream of small ones, which is the situation
the gate exists to prevent.

The gate reopens only through `scope-and-change-control`, for a change that
materially departs from what was approved.

## 7. When approval is not forthcoming

The user may be unavailable. Two honest options, chosen explicitly:

```
Wait        the correct default when nothing is urgent
Proceed     only on the parts the approval cannot change, named precisely
```

Work that survives any plausible approval outcome may proceed: repository
hygiene, reading, test infrastructure that is stack independent, documentation
of the proposal itself. Nothing that encodes an architectural decision.

The choice is stated, not assumed.

## 8. Protocol

1. Confirm the proposal, the stack decisions and the assumption register are
   complete.
2. Write the approval package, section 2.
3. Write the decision request, section 3, naming the item that most deserves
   attention.
4. Present, once. Stop. Every dispatch stays in planning mode, section 1.
5. On a response, classify it against section 4.
6. Record the approval, section 5. Only a recorded, quoted yes switches the
   project to write mode.
7. Update the architecture document when the approval changed anything.
8. Hand to `delivery-planning`.

## 9. Auto-critique

Score from 0 to 5: package length appropriate, every assumption surfaced,
scope both in and out, risks real, cost stated, decision request specific,
outcome classified, approval recorded verbatim, no implementation before
approval.

Threshold: no axis below 3, average at least 4. Any production code written
before the gate is an automatic failure of the whole delivery.

## 10. Interfaces

- Upstream: `architecture-proposal`, `technology-selection`,
  `clarification-gate`.
- Downstream: `delivery-planning`, then implementation.
- Reopened only by: `scope-and-change-control`.
- Sequenced by: `delivery-orchestrator`.
