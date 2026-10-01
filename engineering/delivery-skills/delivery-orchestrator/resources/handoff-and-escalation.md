# Handoff, escalation and the stop

What travels between agents, when a problem climbs to the chief, when the
chief stops and asks the human, how the deadline is pushed without cutting a
gate, and what must be proven before anything is called done.

The handoff block itself is defined once, in `agents/handoff-protocol.md`.
This file does not restate it; it states what each edge of the team must put
in it.

## 1. Handoff contracts

Every edge has an input the receiver may rely on, an output it owes, and the
evidence that makes the output trustworthy. A handoff missing its evidence is
returned, not accepted.

| From | To | Input carried | Evidence required |
|---|---|---|---|
| `requirements-analyst` | `software-architect` | the specification, assumptions recorded | blocking questions answered or quoted as assumptions |
| `software-architect` | the chief | the approval package | nine sections, alternatives with rejection reasons |
| the chief | implementers | the approved architecture, the delivery plan, the dispatch record | the user's approval, quoted |
| `database-engineer` | `backend-engineer` | the schema and migration | migration applied on a scratch database, its rollback stated |
| `backend-engineer` | `frontend-engineer` | the contract file, by path | contract tests passing |
| `ui-ux-engineer` | `frontend-engineer` | the state inventory and specification | every state named, accessibility targets stated |
| implementer | `qa-engineer` | the change and its surface | the test command and its output |
| implementer | `security-engineer` | the sensitive paths touched | the list of entry points and their checks |
| `penetration-tester` | `security-engineer` | each finding with a bounded proof | the authorization on record, the reproduction |
| `qa-engineer` | `release-engineer` | the gate result | suite output, negative cases included |
| any agent | `pr-author` | finished, verified work | every mandatory gate below, with its output |
| `pr-author` | `pr-reviewer` | the pull request | validation output in the description, not claims |
| any team | `final-verifier` | the revision and its acceptance items | nothing is taken on trust; it reproduces |
| `final-verifier` | the chief | the verdict per item | the proof it produced itself |

A receiver that finds `Known issues` empty on substantial work asks once
whether a pass was missed, before building on it.

## 2. Escalation ladder

```
specialist  ->  domain lead  ->  the chief  ->  the human
```

A problem climbs one rung at a time and stops at the first rung that owns it.

| Problem | Owner |
|---|---|
| a defect inside one surface | the specialist |
| two specialists of one team disagree | the domain lead, section 6 of `team-routing.md` |
| two teams disagree, or a hot file is needed | the chief |
| a step fails twice, at the strongest model tier | the chief, as a blocker |
| a discovery contradicts the approved architecture | the chief, then the human through change control |
| a gate cannot be met by the date | the chief, then the human, section 4 |

An agent that skips a rung reports to the rung it reached, and the skipped
lead is informed. An agent that never escalates and loops is stopped by
anti-loop rule 5 of `engineering-orchestrator`.

## 3. When the chief stops and asks the human

The chief stops, presents, and waits, in exactly these cases:

1. the four phase approval gates: clarification (02), validation (05),
   deployment (10), release (14), unchanged by anything in this file;
2. a change to the approved architecture judged significant, per
   `scope-and-change-control`;
3. an irreversible action: destructive migration, production data operation,
   recurring cost;
4. any offensive security action, which needs written, specific, in-scope
   authorization on record, per `security-core`;
5. any action the `delegation` configuration keeps for the user: it is
   prepared and handed over with its command, never performed anyway and
   never silently skipped, per `git-workflow`;
6. a date that cannot be met without moving scope or time, section 4;
7. a blocker outside the project: a credential, an account, a decision
   only the client can make.

Everything else is executed and reported at the phase boundary. Asking about
a filename, a test layout or a dependency already covered by the approved
stack is an interruption, not diligence.

One message per stop. The question, the options, the consequence of each, the
recommendation. Not a status report with a question buried in it.

## 4. Deadline and quality

`delivery-manager` owns time. The chief owns the gates. The tension between
them is resolved by one rule: **the gates are not scope**.

What `delivery-manager` may push for:

- pace on the critical path, and the unblock of whatever holds it;
- a resequence that moves independent work earlier;
- more parallel dispatches, when section 3 of `parallel-dispatch.md` allows;
- a smaller model tier where `model-routing` allows it for the step's tier.

What it surfaces to the chief and never decides itself:

```
Slippage   <task>, <days>, cause: <the real cause, with evidence>
Options    1 rescope: drop or defer <named items>, consequence <...>
           2 resequence: <what moves>, consequence <...>
           3 add time: <new date>, consequence <...>
           4 add help: <which agent, on which disjoint surface>
Not an option
           skipping, shortening or waiving any mandatory gate
```

The chief takes options 2 and 4 on its own authority when they stay inside
the approved scope and date. Options 1 and 3 change what the user approved,
so they go to the human, case 6 of section 3.

A gate that runs slowly is made faster by preparing its inputs earlier,
running its read-mode parts in parallel, or sizing it to the change. It is
never made faster by running it on less than the change, or by marking it
passed from intention.

## 5. Nothing is done without its gate

Before the chief reports any piece of work done, every mandatory gate of
`AGENTS.md` that the work reaches has evidence:

| Work | Gate | Proven by |
|---|---|---|
| code | `code-review-protocol`, with a test run and observed | review report, test output |
| project | `validation-gate` before any production code, scaffolding included | the user's approval, quoted |
| deployment | `production-verification` before it is announced | a real request answered |
| product campaign | the twelve point gate of `quality-engineering` | the campaign report |
| document | the eight-point gate of `document-core`, eleven when paginated | the gate table |
| writing | `self-critique-protocol`, then at least one revision skill | the critique and the revision |
| security | written authorization before any offensive action; no audit concludes a system is secure, `security-core` | the authorization, the report |
| opportunity | a ranked few with reasoning, `opportunity-core` | the ranking |
| research and career | every source, listing, deadline or figure cited live or withheld, `research-core`, `career-core` | the citations |
| anything just finished | `self-critique` | the critique |

Then `final-verifier` reproduces the evidence for the revision. Its verdict
is the last word: a gate that only a previous agent asserts is unverified, and
an unverified gate makes the delivery verdict `Partial`, never `Delivered`.
