# The documents system

Technical documentation of the `documents/` tree: seven skills for documents
that are delivered to someone.

## 1. Why it is a separate tree

Before this tree existed, document production was a secondary behaviour of two
other systems. Creative writing skills carried rules about dialogue and
flashbacks that no manual needs. The engineering tree carried
`technical-documentation`, which correctly covers documentation living inside
a codebase and correctly refuses to cover a letter to a public administration.

Neither could grow to cover the third case without damaging what it already
did well. A tree governed by `writing-constitution` cannot host an attestation
whose entire quality criterion is that nothing in it was invented. A tree
governed by `engineering-core` cannot host a user manual whose reader must
never see a command.

So: a third tree, its own constitution, its own quality gate, and explicit
boundaries with the other two.

## 2. Structure

```
documents/
├── documentation/
│   ├── document-core           the constitution
│   ├── technical-writing       readers who can run commands
│   ├── user-documentation      readers who want to finish a task
│   └── report-writing          readers who must decide
├── administrative/
│   └── administrative-writing  institutions, clients, counterparties
└── publishing/
    ├── document-design         how it looks and is navigated
    └── pdf-production          how it renders, and whether it survived
```

Three categories, seven skills. The split inside `documentation/` is by
reader, never by subject: one system produces a technical reference, a user
manual and an assessment report, and none is derivable from another.

## 3. The constitution

`document-core` governs the tree. Every other skill declares it as a
dependency, verified by `tests/validate-orchestration.sh` check 12, and refers
to it rather than restating it.

It carries five things:

| Part | Content |
|---|---|
| The three languages | skill, system, output, and which is which |
| The audience model | eight profiles, what each wants and never wants |
| Structure by purpose | six purposes, six shapes |
| The evidence rule | nothing asserted that was not verified |
| The quality gate | eight reviews, eleven when paginated |

### The three languages

The distinction the tree exists to get right.

```
Skill language     English, always. The instructions.
System language    English, always. Identifiers, paths, keys, commits.
Output language    the recipient's. Never the author's, never the system's.
```

Resolution order for the output language: an explicit instruction, then the
language of the request or source material, then `language.document_output`
from the configuration.

### The evidence rule

Nothing is asserted that was not verified. Three behaviours when a fact is
missing, and only three:

| Situation | Behaviour |
|---|---|
| Verifiable now | verify it, then write it |
| Not verifiable, not essential | omit it |
| Not verifiable, essential | mark it as a gap, visibly, and name who fills it |

```
[TO CONFIRM: exact registration number, held by the finance office]
```

The marker survives into the delivered draft. A silent blank is the failure
this rule exists to prevent, because the reader cannot tell it from an
omission.

The rule is strictest in `administrative-writing`, where it covers statutes,
registration numbers, institutions, titles and prior exchanges. A plausible
article number in a formal letter is quoted back and found wrong by the
recipient rather than by the author.

### The quality gate

| # | Review | Owner |
|---|---|---|
| 1 | Content | the writing skill |
| 2 | Structure | the writing skill |
| 3 | Language | the writing skill |
| 4 | Formatting | `document-design` |
| 5 | Audience | the writing skill |
| 6 | Consistency | the writing skill |
| 7 | Requirement | `project-brief` |
| 8 | Self critique | `self-critique` |
| 9 | Rendering | `pdf-production` |
| 10 | Pagination | `pdf-production` |
| 11 | Visual | `pdf-production` |

Gates 9 to 11 apply to paginated deliverables only. The gate is recorded; a
gate claimed without a record did not run.

## 4. Pipeline

```
project-brief
    -> document-core
    -> technical-writing | user-documentation | report-writing
       | administrative-writing
    -> document-design
    -> pdf-production
    -> self-critique
```

The four writing skills are alternatives, not stages. `document-design` and
`pdf-production` run on whatever they produced.

`document-design` depends on `document-core`. `pdf-production` depends on
`document-design`. Check 12 verifies both, so the pipeline cannot be
reordered by accident.

## 5. Boundaries

| Work | Owner | Test |
|---|---|---|
| Documentation in a codebase | `technical-documentation`, engineering tree | a commit should change it |
| Delivered, versioned document | this tree | it is an artefact handed over |
| Fiction, poetry, screenplay | `writing/` | it is read for its own sake |
| The interface itself | `ui-ux-engineering` | it is not a document |

The line with `technical-documentation` is ownership, not subject. A readme,
an API reference generated from routes, a runbook in the repository: those
belong in the repository and change with the code. An integration guide handed
to a partner, an architecture document delivered to a client, a manual with a
cover page: those belong here.

Getting this wrong in either direction is expensive. A repository readme
maintained as a deliverable goes stale within two releases. A client
architecture document maintained in the repository leaks internal detail into
a client's hands.

## 6. What the tree refuses

```
writing before naming the audience
writing in the author's language rather than the recipient's
asserting a command that was never run
inventing a legal reference, a registration number or an institution
filling a missing fact with a plausible value instead of marking it
one document for two audiences
carrying meaning in colour alone
a fourth heading level instead of restructuring
delivering a PDF whose pages were never rendered and looked at
```

Each corresponds to an automatic failure in a skill's auto-critique section,
which means the skill fails regardless of its average score.

## 7. Configuration

| Field | Read by | Missing behaviour |
|---|---|---|
| `language.document_output` | all seven | defaults to English, stated once |
| `identity.organization` | design, PDF, administrative, report | no organisation line, correct for a personal document |
| `identity.author_name` | administrative, design, PDF | no signature block |
| `documents.page_size` | design, PDF | A4 |
| `documents.pdf_engine` | PDF | choose per document, then verify it is installed |
| `documents.date_format` | administrative, report | ISO, overridden by the recipient's country |

None is required. Field reference in `config/README.md`.

## 8. Verification

The six scripts cover this tree as they cover the others.

- `validate-structure.sh`: the four mandatory files, the metadata block, a
  numbered `Protocol` section and an `Interfaces` section, since this is a
  procedural tree.
- `validate-rules.sh`: no emoji, no em dash, no credential-shaped string, no
  hardcoded personal identity.
- `validate-orchestration.sh`: check 8 for dependencies, check 9 for
  `Interfaces` cross references, check 12 for the pipeline.

## 9. Adding a skill

1. Decide the category by reader, not by subject. If the reader matches an
   existing skill, extend that skill instead.
2. Create the directory with `SKILL.md`, `README.md`, `examples/` and
   `resources/`.
3. Declare `depends_on: [document-core]`. Check 12 requires it.
4. Include a numbered `Protocol` section, an `Auto-critique` section and an
   `Interfaces` section.
5. Refer to `document-core`; never restate the audience model, the evidence
   rule or the gate.
6. Add it to `documents/README.md` and to the category index.
7. Add it to `documentation/skills-guide.md`.
8. Run the six scripts.

The first step is the one that keeps the tree small. Seven skills cover the
document types listed in this file because they are separated by reader rather
than by document name. A skill per document type would produce thirty skills
sharing one method, which would then drift.

## 10. Worked example

`documents/examples/jeu-conges/` writes one subject for three readers: a user
guide, a technical manual and a deployment report on the same fictional system.
Each passes the eight-point gate, and an artefact records the gate reports, the
reader-split check and a PDF render verification, so the reader rule and the
delivery gate are visible as artefacts, the way `writing/examples/` keeps a
saga and `engineering/examples/` keeps a delivery run.
