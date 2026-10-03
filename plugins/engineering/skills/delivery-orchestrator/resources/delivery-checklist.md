# Delivery checklist

Maintained continuously, not filled at the end. Every line is `done` with its
evidence, `n/a` with a reason, or `pending`.

A line is never marked from intention. The evidence column is what separates
this document from a wish list.

```
Project:
Revision:
Updated:

| # | Item | State | Evidence |
|---|---|---|---|
| 1  | Requirements analysed            | | specification document |
| 2  | Questions resolved               | | answers received, or assumptions recorded |
| 3  | Scope defined                    | | in scope and out of scope lists |
| 4  | Stack selected                   | | technology decisions document |
| 5  | Architecture proposed            | | architecture document |
| 6  | Architecture approved            | | the user's approval, quoted |
| 7  | Delivery plan produced           | | task breakdown with dependencies |
| 8  | Repository initialised           | | the project runs locally |
| 9  | Database implemented             | | migrations applied, schema readable |
| 10 | Authentication implemented       | | sign in works, session verified |
| 11 | Authorization implemented        | | a forbidden access test passes |
| 12 | Backend implemented              | | endpoints answer, contract tests pass |
| 13 | Frontend implemented             | | pages render, five states present |
| 14 | Integrations implemented         | | a real call succeeded, or the blocker is named |
| 15 | Input validation complete        | | boundary map with no unvalidated entry |
| 16 | No fake functionality            | | integrity scan clean |
| 17 | Unit and integration tests       | | suite output |
| 18 | End to end tests                 | | browser suite output, run twice |
| 19 | Security audit complete          | | audit report, findings fixed |
| 20 | Performance verified             | | baseline and delta, or a stated budget met |
| 21 | UI and UX verified               | | states, responsive widths, keyboard pass |
| 22 | Accessibility verified           | | contrast measured, keyboard path, scan result |
| 23 | Code review complete             | | review report, blockers fixed |
| 24 | Environments configured          | | variable inventory per environment |
| 25 | Secrets managed                  | | no secret in the repository, sources named |
| 26 | CI pipeline green                | | pipeline run identifier |
| 27 | Deployment executed              | | deploy output |
| 28 | Production verified              | | real request answered, checks listed |
| 29 | Observability in place           | | a failure of this system is visible |
| 30 | Backups verified                 | | a restore was performed, or n/a with reason |
| 31 | Documentation complete           | | every command in it was run |
| 32 | Continuity updated               | | continuity note passes the resumption test |
| 33 | Git history clean                | | author, atomicity, no secret |
| 34 | Handover package complete        | | another engineer could take over |
| 35 | Release verdict issued           | | go, go with notes, or no go with blockers |
```

## The six lines that get faked

**Item 14, integrations.** Marked done when the code compiles against the SDK.
Done means a real call succeeded against the real service, or the blocker is
named with what is missing.

**Item 16, no fake functionality.** Marked done because nobody remembers
writing a stub. Done means `implementation-integrity` ran its scan.

**Item 27 versus item 28.** Deployment executed is not production verified.
The deploy command exiting zero says the artefact moved, nothing more.

**Item 30, backups.** Marked done when a backup job exists. Done means a
restore was performed somewhere, or the impossibility is stated.

**Item 20, performance.** Marked done because the application feels fast on a
developer machine with fifty rows of seed data.

**Items 17 and 26, tests and pipeline.** Marked done, or quietly `n/a`,
because every feature works when clicked through. An application with no test
command in its manifest and no pipeline in the repository cannot pass item 17
or item 26, however complete its features look: there is no suite output to
cite and no run identifier to quote. Neither line is ever `n/a` for software
that ships. Done means a test command exists, its output is attached, and a
pipeline runs it on every change; until then both lines are `pending`, and the
release verdict, item 35, is `no go` with them named as blockers.

## Reporting

The checklist is reported at phase boundaries, not per item. The useful form
is short:

```
Delivery status: 28 done, 4 n/a, 3 pending
Pending:
  18 end to end tests, browser suite written, not yet run in CI
  28 production verification, blocked on the DNS record
  30 backups, restore untested, staging has no snapshot capability
```

Three lines that say exactly where the project is. A thirty five line table
pasted into a conversation says the same thing and gets skimmed.
