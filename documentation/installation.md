# Installation

The repository is Markdown and shell. No runtime, no package manager, no
dependency.

## Requirements

| Tool | Needed for |
|---|---|
| `bash` 4 or later | the installer and the validation scripts |
| `git` | cloning, and the `git-workflow` skill |
| `zip` | the optional `--zip` mode only |

Optional, and only for `pdf-production`: `pdfinfo`, `pdffonts`, `pdftotext`
and `pdftoppm` from Poppler, plus `qpdf`. The skill states which of its checks
could not be run when they are absent rather than implying they passed.

## Choosing what to install

The installer never decides for you. With no argument it asks, and it installs
only what you pick. That is deliberate: the eight trees serve different people,
and a developer has no use for a prosody skill.

```bash
git clone <repository-url> craft-suite
cd craft-suite
bash install.sh
```

```
   1) Creative writing        42 skills   novels, poetry, screenplay, editing
   2) Professional documents   7 skills   guides, manuals, reports, letters, PDF
   3) Software engineering    75 skills   plus 19 agents
   4) Cybersecurity           10 skills   threat models, audits, hardening
   5) Research                 5 skills   sources, verification, synthesis
   6) Career                   7 skills   job search, CV, interviews
   7) Opportunity              9 skills   ideation, hackathons, business
   8) Everything             158 skills   plus 19 agents
   9) Individual skills, chosen by name
  10) One or more categories, for example genres only

Choice [1]:
```

Several numbers may be given, separated by spaces. `1 2` installs writing and
documents.

With no terminal available and no scope given, the installer refuses and
prints the flags instead of guessing. It never falls back to installing
everything.

## Scoped installation

```bash
bash install.sh --writing      42 creative writing skills
bash install.sh --documents     7 professional document skills
bash install.sh --dev          75 engineering skills and 19 agents
bash install.sh --security     11 defensive security skills
bash install.sh --research      5 general research skills
bash install.sh --career        7 job search and application skills
bash install.sh --opportunity   9 ideation, hackathon and business skills
bash install.sh --all          everything
bash install.sh --shared        the 2 cross domain skills only
bash install.sh --agents        the 19 agents only
bash install.sh --no-agents     skills without agents
```

Scopes combine, and combine with `--zip` and `--remove`:

```bash
bash install.sh --writing --documents
bash install.sh --dev --zip
bash install.sh --writing --remove
```

Agents follow the engineering tree unless `--agents` or `--no-agents` says
otherwise.

Every scope also installs the two cross domain skills, because every tree
calls them. A scoped removal keeps them; only `--all --remove` or
`--shared --remove` takes them out.

### By category

A tree is often more than you need. A thriller writer has no use for prosody.

```bash
bash install.sh --group genres            15 skills, plus the shared pair
bash install.sh --group genres,quality    two categories
bash install.sh --group writing/poetry    the full path also works
bash install.sh --group devops-skills     operations only
```

| Category | Skills | Tree |
|---|---|---|
| `core` | 14 | writing |
| `genres` | 15 | writing |
| `poetry` | 5 | writing |
| `quality` | 8 | writing |
| `documentation` | 4 | documents |
| `administrative` | 1 | documents |
| `publishing` | 2 | documents |
| `dev-skills` | 51 | engineering |
| `delivery-skills` | 11 | engineering |
| `devops-skills` | 13 | engineering |
| `secure-development` | 8 | security |
| `security-assurance` | 2 | security |
| `research` | 5 | research |
| `career` | 7 | career |
| `ideation` | 3 | opportunity |
| `hackathons` | 3 | opportunity |
| `business` | 3 | opportunity |
| `shared` | 2 | shared |

Everything combines, and the result is deduplicated:

```bash
bash install.sh --group poetry --skill thriller
12 skills installed
```

The five poetry skills, `thriller` with its four dependencies,
`writing-constitution` counted once, and the cross domain pair.

The agents follow the engineering tree, not a category of it. Add them with
`--agents` when installing `--group dev-skills` alone.

## Installing individual skills

```bash
bash install.sh --list
bash install.sh --skill thriller
bash install.sh --skill sonnet,haiku
bash install.sh --skill pdf-production report-writing
```

Dependencies are resolved transitively from the `depends_on` field, so a named
skill is never installed without what it refers to:

```
$ bash install.sh --skill thriller
7 skills installed in ~/.claude/skills
Installed: thriller writing-constitution novel-architect scene-builder
           chapter-architect self-critique project-brief
```

Resolution crosses trees. `pdf-production` pulls `document-design` and
`document-core` with it.

An unknown name stops the install and points at `--list`. It does not install
a shorter list quietly.

Six skills depend on nothing and install alone:

```
self-critique
project-brief
document-core
engineering-core
devops-core
writing-constitution
```

For those, copying the directory is equivalent:

```bash
cp -r shared/self-critique ~/.claude/skills/
```

## Installing without cloning

```bash
curl -fsSL <raw-url>/install.sh | bash -s -- --writing
```

When the script finds no skills beside it, it clones the repository into
`~/.cache/craft-suite` and works from there. Subsequent runs pull
rather than re-clone.

Under `curl | bash` the script's own stdin is the pipe, so it opens the
terminal directly to ask its questions. If no terminal can be opened, it
refuses rather than choosing for you.

| Variable | Effect |
|---|---|
| `CLAUDE_SUITE_REPO` | clone source, when the script runs on its own |
| `CLAUDE_SUITE_CACHE` | where that clone lands, default `~/.cache/craft-suite` |

A private repository cannot be fetched this way without credentials. Clone it
yourself and run `install.sh` from inside it.

## Verifying before installing

```bash
bash tests/validate-structure.sh
bash tests/validate-rules.sh
bash tests/validate-orchestration.sh
bash tests/validate-plugins.sh
bash tests/validate-model-routing.sh
```

The installer runs the first one itself and refuses to install a repository
that does not pass it.

## Archives

```bash
bash install.sh --all --zip
```

`--zip` is a modifier, not a scope: it builds one archive per skill installed
by the scope it accompanies, into `dist/`, for a runtime that imports skills
individually. On its own it has nothing to build and prints the help.
`dist/` is not tracked in version control.

## Targets

| Variable | Default | Holds |
|---|---|---|
| `CLAUDE_SKILLS_DIR` | `~/.claude/skills` | one directory per skill |
| `CLAUDE_AGENTS_DIR` | `~/.claude/agents` | one file per agent |
| `CLAUDE_CONFIG_FILE` | `~/.claude/craft.config.yaml` | the user configuration |

```bash
CLAUDE_SKILLS_DIR=/opt/skills bash install.sh --dev
```

Skills are installed flat, one directory per skill name.
`tests/validate-structure.sh` refuses two skills sharing a name, so a flat
target never loses one to another.

## Using it without installing

Place the repository in the working directory and have the agent read
`README.md`, then the constitution of the tree concerned:

```
writing/core/writing-constitution            creative writing
documents/documentation/document-core        professional documents
engineering/dev-skills/engineering-core      software
engineering/devops-skills/devops-core        anything that runs
```

## Updating

```bash
git switch dev && git pull
bash install.sh --writing        the scope you installed before
```

Installation overwrites each skill directory it manages and leaves the others
alone, so re-running a scope updates exactly what you have. It never touches
the configuration file.

## Uninstalling

```bash
bash install.sh --all --remove       every skill and agent
bash install.sh --writing --remove   one tree
bash install.sh --skill haiku --remove   only that skill
```

`--remove` with no scope asks what to remove, the same way installing does.

A scoped removal keeps the two cross domain skills, since another tree may
still use them. Only `--all --remove` or `--shared --remove` takes them out.

A named removal takes only what was named. Its dependencies stay: they are
shared, and removing `writing-constitution` because someone dropped `haiku`
would break the rest of the tree.

Uninstalling never deletes the configuration file. Its path is printed so it
can be removed deliberately.

## Verifying the installation

```bash
ls ~/.claude/skills | wc -l      # 44 writing, 9 documents, 75 dev, 155 all
ls ~/.claude/agents | wc -l      # 16, with the engineering tree
cat ~/.claude/craft.config.yaml
```

Each scope count includes the two cross domain skills.

After a full install, the installer reports whether the identity fields the
engineering tree requires are present, and names the ones that are missing. It
does not invent them.
