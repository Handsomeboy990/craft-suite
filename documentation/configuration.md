# Configuration

Nothing in this repository assumes who you are, which tools you use, or which
language your readers speak. Those answers live in one file outside the
repository.

`config/README.md` is the field reference. This document explains the contract
from the installer side: which fields are asked, when, and what happens when
one is missing.

## The file

| Item | Value |
|---|---|
| Template | `config/craft.config.example.yaml` |
| Default location | `~/.claude/craft.config.yaml` |
| Override | `CLAUDE_CONFIG_FILE` |
| Written by | `bash install.sh --configure` |
| Permissions | 600, set by the installer |

## Running the prompts

```bash
bash install.sh --configure
```

Only the fields relevant to the installed scope are asked. Installing the
writing tree alone does not ask for a package manager.

| Scope | Asked |
|---|---|
| `--dev` or full | identity, git conventions, engineering defaults, documentation language |
| `--writing` | creative output language |
| `--documents` | organisation, document output language, PDF engine, page size, date format |
| `--shared` | nothing; neither shared skill requires configuration |

Every prompt is pre-filled with the value already stored. Pressing enter keeps
it, so re-running is not destructive.

The prompts need a terminal. Without one, the installer says so and points at
the template, rather than writing defaults nobody chose.

## Required against optional

Two fields are required and have no default, ever:

```
identity.author_name
identity.author_email
```

A commit carries a real person. `git-workflow` stops and names the missing
field rather than inventing one, because a history whose author cannot be
traced to a person is not auditable, which is the entire point of a history.

Everything else has a documented default, or an empty value meaning detect it
from the project.

| Field kind | Missing behaviour |
|---|---|
| Required, identity related | stop, name the field, name the command that fixes it |
| Optional with a safe default | use the default, state it once |
| Optional meaning detect | read the project, never assume |

## Validation

The installer refuses, rather than storing and failing later:

| Rule | Reason |
|---|---|
| `author_email` must be an email address | it goes into every commit |
| `author_name` and `author_email` must not look like a tool | no assistant, bot, model or generator name in a history |
| Enumerated fields must hold an accepted value | a typo in `commit_convention` would be silently ignored |
| A key whose name suggests a credential is refused | this file is not where secrets live |

The tool-name check rejects `ai`, `bot`, `gpt`, `llm`, `claude`, `chatgpt`,
`openai`, `anthropic`, `copilot`, `assistant`, `generated` and `generator` as
whole words. It is not cosmetic. Attribution to a tool makes a history
unauditable, and `git-workflow` forbids the same strings in messages,
trailers, author fields and branch names.

## The three languages

The most confused part of the contract, and the reason it has three fields
rather than one.

| Layer | Field | Value | Editable |
|---|---|---|---|
| Skill language | `language.skill` | English | no |
| System language | `language.documentation` | English by default | yes |
| Output language | `language.creative_output`, `language.document_output` | per audience | yes |

- **Skill language** is the language the instructions are written in. English
  for all 155 skills, so the system is usable internationally.
- **System language** is the language of identifiers, paths, configuration
  keys, commits and technical documentation. English.
- **Output language** is the language of what a reader receives. It is the
  recipient's, never the author's, never the system's.

`creative_output` defaults to French because the writing tree encodes French
craft: dialogue typography, incise inversion, alexandrine scansion, agreement
rules. Those skills are written in English and produce French. Set the field
to another language and the structural expertise still applies; the
language-specific rules do not, and the affected skills say so.

## What must never go in this file

```
API keys and tokens
passwords and connection strings
private keys and certificates
client confidential information
```

Secrets belong to the environment of the target project. Their lifecycle
belongs to `engineering/devops-skills/secrets-management`.
`tests/validate-rules.sh` check 3 scans the repository for credential-shaped
strings.

## Changing a value later

```bash
bash install.sh --configure
$EDITOR ~/.claude/craft.config.yaml
```

Both are supported. The file is plain YAML with two levels and no
indirection.

## How a skill consumes it

A skill names the field and states the missing behaviour. It never restates
the configuration and never embeds a value.

```
Read identity.author_name and identity.author_email.
If either is missing, stop and report which one, with the command that fixes
it. Do not commit with a guessed identity.
```

Skills that read configuration list their fields in their README, under
Configuration. Skills with no Configuration section read none.

## Which skills read what

| Field | Read by |
|---|---|
| `identity.author_name` | `git-workflow`, `administrative-writing`, `document-design`, `pdf-production` |
| `identity.author_email` | `git-workflow` |
| `identity.organization` | `administrative-writing`, `document-design`, `pdf-production`, `report-writing` |
| `git.commit_convention` | `git-workflow`, `release-engineering` |
| `git.branch_convention` | `git-workflow` |
| `git.default_branch` | `git-workflow`, `ci-cd-pipelines` |
| `language.documentation` | `technical-documentation`, `technical-writing` |
| `language.creative_output` | the `writing/` tree |
| `language.document_output` | the `documents/` tree, `project-brief` |
| `engineering.package_manager` | `dependency-selection`, `ci-cd-pipelines` |
| `engineering.deployment_platform` | `deployment-engineering` |
| `engineering.database` | `architecture-design`, `technology-selection` |
| `documents.pdf_engine` | `pdf-production` |
| `documents.page_size` | `document-design`, `pdf-production` |
| `documents.date_format` | `administrative-writing`, `report-writing` |

For the last three engineering fields, empty is the recommended value. Empty
means detect it from the project, which is what the engineering tree does
regardless. Fill one only to express a preference for greenfield work, and
expect the project to win when the project already decided.
