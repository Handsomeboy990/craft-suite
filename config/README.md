# config

User specific values that skills read instead of hardcoding.

Nothing in this repository assumes who you are, which package manager you use,
or which language your readers speak. Those answers live in one configuration
file, outside the repository, written once.

## The file

| Item | Value |
|---|---|
| Template | `config/craft.config.example.yaml` |
| Default location | `~/.claude/craft.config.yaml` |
| Override | `CLAUDE_CONFIG_FILE` |
| Format | YAML |
| Written by | `bash install.sh --configure`, or by hand |

The installer only asks for the fields the skills you installed actually need.
Installing the writing tree alone does not ask for a package manager.

## Field reference

### identity

| Field | Required | Default | Read by |
|---|---|---|---|
| `author_name` | yes, for any commit | none | `git-workflow` |
| `author_email` | yes, for any commit | none | `git-workflow` |
| `organization` | no | empty | `document-design`, `pdf-production`, `administrative-writing` |

`author_name` and `author_email` have no default and never will. A commit
carries a real person. A skill that cannot resolve them stops and says which
field is missing, rather than inventing one.

The installer rejects an author name or email that matches an assistant, a
model, a bot or a generator. That rule is not cosmetic: a history that
attributes work to a tool is a history nobody can audit.

`organization` appears on document covers, letterheads and PDF metadata. Empty
means the document carries no organisation line, which is correct for a
personal document.

### delegation

What the agent may do without asking. This is the section that decides how
much of the work reaches you as a finished action and how much reaches you as
a prepared step.

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

Any value other than a plain `yes` moves that step to your manual task list.
The agent stops at the boundary, hands you what it prepared, and names the
step rather than performing it.

The installer writes that list as `craft-manual-tasks.md`, next to the
configuration file, with the exact command for each step you kept. Re-running
`--configure` rewrites it.

Two rules are never delegated and are not in this table: a destructive
operation is counted and confirmed before it runs, and a leaked secret is
reported for rotation rather than quietly removed.

### git

| Field | Required | Default | Read by |
|---|---|---|---|
| `commit_convention` | no | `conventional` | `git-workflow`, `release-engineering` |
| `branch_convention` | no | `type/short-kebab-description` | `git-workflow` |
| `default_branch` | no | `main` | `git-workflow`, `ci-cd-pipelines` |
| `protected_branches` | no | `default` | `git-workflow`, `release-engineering` |

Accepted values for `commit_convention`: `conventional`, `plain`.

Accepted values for `protected_branches`: `default`, `default+release`,
`none`. Anything other than `none` means the agent never pushes to those
branches directly and always goes through a pull request.

The convention fields are fallbacks. A repository that already has a
convention wins: `git-workflow` reads `git log` before it reads this file.

### language

The suite separates three languages that are routinely confused.

| Layer | Field | Meaning |
|---|---|---|
| Skill language | `skill` | the language the instructions are written in |
| System language | `documentation` | the language of paths, identifiers, commits, technical documents |
| Output language | `creative_output`, `document_output` | the language of what the reader receives |

| Field | Required | Default | Read by |
|---|---|---|---|
| `skill` | no | `english` | not editable, present for clarity |
| `documentation` | no | `english` | `technical-documentation`, `technical-writing` |
| `creative_output` | no | `french` | the `writing/` tree |
| `document_output` | no | `english` | the `documents/` tree |

`creative_output` defaults to French because the writing tree encodes French
craft: dialogue typography, incise inversion, alexandrine scansion, agreement
rules. Those skills are written in English and produce French. Setting this
field to another language keeps the structural expertise and drops the
language specific rules, which the affected skills state explicitly.

`document_output` has no safe default beyond English. Set it per project to
the language of the person who receives the document.

### engineering

| Field | Required | Default | Read by |
|---|---|---|---|
| `package_manager` | no | empty | `dependency-selection`, `ci-cd-pipelines` |
| `deployment_platform` | no | empty | `deployment-engineering` |
| `database` | no | empty | `architecture-design`, `technology-selection` |

Empty is the recommended value for all three. Empty means detect it from the
project, which is what the engineering tree does anyway. Fill one only to
express a preference for greenfield work, and expect the project to override
it when the project already decided.

### model_routing

| Field | Required | Default | Read by |
|---|---|---|---|
| `fast` | no | empty | `model-routing` |
| `balanced` | no | empty | `model-routing` |
| `strongest` | no | empty | `model-routing` |

The three field names are fixed policy, not a preference: they are the tier
names `model-routing` section 2 routes to. What each resolves to is not fixed,
because model availability differs by account and changes over time. Empty
means this runtime's own default resolution for that tier is used. A filled
value is a short model name this runtime accepts, never a full versioned
identifier.

### documents

| Field | Required | Default | Read by |
|---|---|---|---|
| `pdf_engine` | no | empty | `pdf-production` |
| `page_size` | no | `A4` | `document-design`, `pdf-production` |
| `date_format` | no | `iso` | `administrative-writing`, `report-writing` |

Accepted values for `pdf_engine`: empty, `chromium`, `weasyprint`, `typst`,
`latex`. Empty means `pdf-production` chooses per document and verifies the
engine exists before promising a PDF.

Accepted values for `page_size`: `A4`, `Letter`.

Accepted values for `date_format`: `iso`, `fr`, `us`.

### career

Read by the `career/` skills before they act. Every field is the candidate's
real situation. Optional to the suite as a whole, and required before the career
tree acts: a career skill run against an empty section asks for the fields it
needs, once and grouped, and never fills them with a plausible default.

| Field | Required | Default | Read by |
|---|---|---|---|
| `target_roles` | asked when career is used | empty | `career-profile`, `job-search` |
| `skills` | asked when career is used | empty | `career-profile`, `cv-engineering` |
| `location` | asked when career is used | empty | `job-search` |
| `remote_preference` | asked when career is used | empty | `job-search` |
| `employment_type` | asked when career is used | empty | `job-search` |
| `industries` | no | empty | `job-search`, `company-research` |
| `excluded_employers` | no | empty | `job-search` |
| `work_authorization` | asked when career is used | empty | `job-search` |
| `salary_floor` | no | empty | `job-search`, `interview-preparation` |

Two fields are never guessed under any circumstance: `work_authorization`,
because a wrong assumption wastes real applications on unreachable roles, and
`salary_floor`, because inventing a number the candidate did not choose can cost
them an offer. Both are asked or left empty, never assumed.

This section is personal data. It is used for the task and never committed with
real values, exactly as the rest of this file never holds a secret.

## How a skill uses it

A skill never restates the configuration. It names the field and states what
happens when it is missing.

```
Read identity.author_name and identity.author_email.
If either is missing, stop and report which one, with the command that fixes
it. Do not commit with a guessed identity.
```

Three behaviours, and only three:

| Field kind | Missing behaviour |
|---|---|
| Required, identity related | stop, name the field, name the fix |
| Optional with a safe default | use the default, say so once |
| Optional meaning detect | read the project, never assume |

## Changing a value later

```bash
bash install.sh --configure          # re-runs the prompts, keeps current values as defaults
$EDITOR ~/.claude/craft.config.yaml
```

Re-running `--configure` is not destructive: every prompt is pre-filled with
the value already stored, and pressing enter keeps it.

## What must never go in this file

```
API keys and tokens
passwords and connection strings
private keys and certificates
client confidential information
anything you would not paste into a public issue
```

The installer refuses to write a value under a key whose name suggests a
credential. Secrets belong to the environment of the target project, and their
lifecycle belongs to `engineering/devops-skills/secrets-management`.

## Related

- `engineering/dev-skills/git-workflow` consumes `identity` and `git`.
- `engineering/devops-skills/secrets-management` owns everything this file
  refuses to hold.
- `documentation/configuration.md` explains the same contract from the
  installer side, with the full prompt list.
