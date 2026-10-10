# documents

Professional document production. Eight skills in four categories, for
documents that are delivered to someone rather than written for yourself.

Skill language: English. Output language: the recipient's, decided per
document. The distinction is section 2 of `document-core` and it is the first
thing this tree gets right.

## Categories

| Category | Skills | Question it answers |
|---|---|---|
| [documentation](documentation/) | 4 | how the reader understands and uses the system |
| [administrative](administrative/) | 1 | how a formal document survives being filed and quoted |
| [publishing](publishing/) | 2 | how the document looks, paginates and renders |
| [communication](communication/) | 1 | what a brand says, in which words, approved by whom |

## The eight

| Skill | Produces | Reader |
|---|---|---|
| [document-core](documentation/document-core/) | the constitution of this tree | every other skill here |
| [technical-writing](documentation/technical-writing/) | architecture documents, API references, installation and operational guides | someone who can run commands |
| [user-documentation](documentation/user-documentation/) | guides, manuals, help articles, support material | someone who does not want to understand the system |
| [report-writing](documentation/report-writing/) | status, audit, incident and options reports | someone who must decide |
| [administrative-writing](administrative/administrative-writing/) | letters, notices, attestations, minutes, applications | an institution, a client, a counterparty |
| [document-design](publishing/document-design/) | the style sheet and the layout system | applied to everything above |
| [pdf-production](publishing/pdf-production/) | the rendered, verified PDF | the final deliverable |
| [editorial-line](communication/editorial-line/) | audience, promise, pillars, vocabulary, what is never said, formats, review rule | whoever writes for a brand |

## Order

```
document-core
    -> technical-writing | user-documentation | report-writing
       | administrative-writing | editorial-line
    -> document-design
    -> pdf-production
    -> self-critique
```

`document-core` is loaded first, always. The five writing skills are
alternatives, not stages: pick the one whose reader you have. The last three
run on whatever the writing skill produced. `editorial-line` is the one whose
reader is a writer: it produces the rules others write by, for a brand.

## The four rules of this tree

1. **The audience is named before the first sentence.** The same subject
   produces eight different documents, and choosing the wrong one wastes all
   the work.
2. **The output language is the recipient's**, never the author's, never the
   system's.
3. **Nothing is asserted that was not verified.** Commands are run, endpoints
   are called, legal references are copied from their text. Missing facts are
   marked visibly as gaps, never filled with plausible text.
4. **A generated PDF is not a finished PDF** until the rendered pages have
   been looked at.

## Choosing a skill

| Situation | Skill |
|---|---|
| A partner has to integrate with our API | `technical-writing` |
| An operator has to install this on their own server | `technical-writing` |
| A customer cannot find how to change their address | `user-documentation` |
| Support keeps answering the same question wrong | `user-documentation` |
| Leadership has to decide whether to migrate | `report-writing` |
| An outage needs a post-mortem | `report-writing` |
| The town hall refused our request | `administrative-writing` |
| A contract has to be terminated formally | `administrative-writing` |
| Four deliverables must look like one set | `document-design` |
| The client wants a PDF | `pdf-production` |
| Someone other than the client will write for the brand | `editorial-line` |

## Boundary with the other trees

| Work | Tree |
|---|---|
| Documentation living in a codebase, maintained with the code | `engineering/`, skill `technical-documentation` |
| A document handed over and versioned as a deliverable | here |
| Fiction, poetry, screenplay | `writing/` |
| The interface itself rather than a document about it | `engineering/`, skill `ui-ux-engineering` |

The line with the engineering tree is ownership, not subject. If a commit
should change the document, it belongs in the repository and to
`technical-documentation`. If it is an artefact delivered to someone, it
belongs here.

## Installation

```bash
bash install.sh --documents     these eight, plus the two shared skills
```

## Configuration

| Field | Used by |
|---|---|
| `language.document_output` | all eight, as the default output language |
| `identity.organization` | covers, letterheads, PDF metadata |
| `identity.author_name` | signature blocks, PDF metadata |
| `documents.page_size` | `document-design`, `pdf-production` |
| `documents.pdf_engine` | `pdf-production`, empty means choose per document |
| `documents.date_format` | `administrative-writing`, `report-writing` |

Field reference in `config/README.md`. None of them is required: every one has
a documented default, and an empty value means decide per document rather than
assume.
