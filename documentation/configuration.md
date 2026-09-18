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
| `--dev` or full | identity, the eight delegation questions, `git.protected_branches`, git conventions, engineering defaults, documentation language |
| `--writing` | creative output language |
| `--documents` | organisation, document output language, PDF engine, page size, date format |
| `--shared` | nothing; neither shared skill requires configuration |

Every prompt is pre-filled with the value already stored. Pressing enter keeps
it, so re-running is not destructive, in three separate senses:

- an answer you already gave is the pre-filled default, so enter keeps it;
- a field whose question this scope does not ask is written back as it was, so
  `--dev --configure` after `--all --configure` does not empty the documents
  answers;
- a section the installer does not manage at all, `model_routing` and `career`,
  is carried through the rewrite untouched.

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
  for all 166 skills, so the system is usable internationally.
- **System language** is the language of identifiers, paths, configuration
  keys, commits and technical documentation. English.
- **Output language** is the language of what a reader receives. It is the
  recipient's, never the author's, never the system's.

`creative_output` defaults to French because the writing tree encodes French
craft: dialogue typography, incise inversion, alexandrine scansion, agreement
rules. Those skills are written in English and produce French. Set the field
to another language and the structural expertise still applies; the
language-specific rules do not, and the affected skills say so.

## Delegation

The section that decides how much of the work reaches you as a finished action
and how much reaches you as a prepared step. It is the most concrete thing
`--configure` produces, and the only section whose answers are written twice:
once into the configuration, once into a task list you can act on.

| Field | Accepted values | Default | Read by |
|---|---|---|---|
| `commits` | `yes`, `stage-only`, `no` | `yes` | `git-workflow` |
| `branches` | `yes`, `no` | `yes` | `git-workflow` |
| `push` | `yes`, `branch-only`, `no` | `branch-only` | `git-workflow` |
| `pull_requests` | `yes`, `draft`, `no` | `yes` | `git-workflow` |
| `release_tags` | `yes`, `no` | `no` | `release-engineering` |
| `deployments` | `yes`, `non-production`, `no` | `no` | `deployment-engineering` |
| `database_operations` | `yes`, `non-production`, `no` | `no` | `database-operations` |
| `dependency_changes` | `yes`, `with-justification`, `no` | `with-justification` | `dependency-selection` |

Any value other than a plain `yes` is a boundary. The agent does the work up to
that boundary, hands you what it prepared, and names the step instead of
performing it. What each value means:

| Value | What it changes |
|---|---|
| `stage-only` | the change is staged and the message written, you run `git commit` |
| `branch-only` | pushes to any branch except a protected one, per `git.protected_branches` |
| `draft` | the pull request is opened as a draft, never marked ready |
| `non-production` | the step runs in every environment except production |
| `with-justification` | each new or upgraded dependency is named and argued before it is added |
| `no` | the step is never performed, only prepared and handed over |

Every kept step is written to `~/.claude/craft-manual-tasks.md`, next to the
configuration file, with the exact command to run. `write_manual_tasks` in
`install.sh` produces it at the end of every `--configure`, so the list and the
configuration cannot drift apart. `CLAUDE_MANUAL_TASKS_FILE` overrides its path.

Two rules never delegate, in either direction, and are therefore not fields
here: a destructive operation is counted and confirmed before it runs, and a
leaked secret is reported for rotation rather than quietly removed.

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
| `git.protected_branches` | `git-workflow`, `release-engineering` |
| `delegation.commits`, `.branches`, `.push`, `.pull_requests` | `git-workflow` |
| `delegation.release_tags` | `release-engineering` |
| `delegation.deployments` | `deployment-engineering` |
| `delegation.database_operations` | `database-operations` |
| `delegation.dependency_changes` | `dependency-selection` |
| `model_routing.fast`, `.balanced`, `.strongest` | `model-routing` |
| `career.*` | the `career/` tree |
| `language.documentation` | `technical-documentation`, `technical-writing` |
| `language.creative_output` | the `writing/` tree |
| `language.document_output` | the `documents/` tree, `project-brief` |
| `engineering.package_manager` | `dependency-selection`, `ci-cd-pipelines` |
| `engineering.deployment_platform` | `deployment-engineering` |
| `engineering.database` | `architecture-design`, `technology-selection` |
| `documents.pdf_engine` | `pdf-production` |
| `documents.page_size` | `document-design`, `pdf-production` |
| `documents.date_format` | `administrative-writing`, `report-writing` |

`model_routing` and `career` are the two sections `--configure` never asks
about: the first is runtime policy that depends on the account, the second is
personal data the career skills ask for at the moment they need it. Both are
edited by hand in the file, and `--configure` carries them through untouched.

For the last three engineering fields, empty is the recommended value. Empty
means detect it from the project, which is what the engineering tree does
regardless. Fill one only to express a preference for greenfield work, and
expect the project to win when the project already decided.
