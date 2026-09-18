# Installation

The skills and agents are Markdown, the installer is shell. No runtime and no
package manager are needed to use them.

If you are new to the suite, read [usage.md](usage.md) first: it says what runs
these skills, what happens after the install, and how a skill comes to be used
at all. This page covers the install itself.

## Requirements

| Tool | Needed for |
|---|---|
| `bash` 4 or later | the installer and the validation scripts |
| `git` | cloning, and the `git-workflow` skill |
| `zip` | the optional `--zip` mode only |
| `python3` | `--control-center` and `--report` only |
| `curl` | installing without cloning only |

Optional, and only for `pdf-production`: `pdfinfo`, `pdffonts`, `pdftotext`
and `pdftoppm` from Poppler, plus `qpdf`. The skill states which of its checks
could not be run when they are absent rather than implying they passed.

## Choosing what to install

The installer never decides for you. With no argument it asks, and it installs
only what you pick. That is deliberate: the eight trees serve different people,
and a developer has no use for a prosody skill.

```bash
git clone https://github.com/Handsomeboy990/craft-suite.git
cd craft-suite
bash install.sh
```

```
   1) Creative writing        42 skills   novels, poetry, screenplay, editing
   2) Professional documents   7 skills   guides, manuals, reports, letters, PDF
   3) Software engineering    82 skills   plus 24 agents
   4) Cybersecurity           12 skills   threat models, audits, hardening
   5) Research                 5 skills   sources, verification, synthesis
   6) Career                   7 skills   job search, CV, interviews
   7) Opportunity              9 skills   ideation, hackathons, business
   8) Everything             166 skills   plus 25 agents
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
bash install.sh --dev          82 engineering skills and 24 agents
bash install.sh --security     12 defensive security skills and 2 agents
bash install.sh --research      5 general research skills
bash install.sh --career        7 job search and application skills
bash install.sh --opportunity   9 ideation, hackathon and business skills
bash install.sh --all          everything
bash install.sh --shared        the 2 cross domain skills only
bash install.sh --agents        the 25 agents only
bash install.sh --no-agents     skills without agents
bash install.sh --remove        uninstall the scope instead of installing it
```

Those are tree counts. The number the installer prints when it finishes is
larger, because it counts what actually landed: see
[the table at the end of this page](#verifying-the-installation).

Scopes combine, and combine with `--zip` and `--remove`:

```bash
bash install.sh --writing --documents
bash install.sh --dev --zip
bash install.sh --writing --remove
```

Two scopes carry agents of their own: `--dev` installs the 24-agent delivery
team, `--security` installs `security-engineer` and `web-auditor`. No other
scope installs an agent unless `--agents` asks for the whole roster, and
`--no-agents` suppresses them everywhere. The mapping lives in `install.sh`,
in `agent_domains`, and `tests/validate-plugins.sh` check 4 verifies it per
domain.

Every scope also installs the two cross domain skills, because every tree
calls them. A scoped removal keeps them; only `--all --remove` or
`--shared --remove` takes them out.

A scope also installs any skill from another tree that its own skills declare.
Today that happens once: `--security` installs `security-audit`,
`engineering-core`, `project-exploration` and `input-validation` from the
engineering tree, because `vulnerability-assessment` declares `security-audit`
and that skill declares the other three. This is why `--security` reports 18
and not 14. A removal never takes those back out, since the engineering tree
may still be using them.

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
| `dev-skills` | 55 | engineering |
| `delivery-skills` | 11 | engineering |
| `devops-skills` | 16 | engineering |
| `secure-development` | 9 | security |
| `security-assurance` | 3 | security |
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

A category never carries agents, whichever tree it belongs to. Add them with
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
Installed: thriller self-critique project-brief writing-constitution
           novel-architect scene-builder chapter-architect
```

Resolution crosses categories, and crosses trees where a skill declares one.
`pdf-production` pulls `document-core` and `document-design` from another
category of the documents tree, for five in total. The one dependency that
currently crosses a tree boundary is `vulnerability-assessment` to
`security-audit`.

An unknown name stops the install and points at `--list`. It does not install
a shorter list quietly.

Nine skills depend on nothing and install alone. They are the constitution of
their tree, and each is the one to read first:

```
self-critique          shared
project-brief          shared
writing-constitution   writing
document-core          documents
engineering-core       engineering
security-core          security
research-core          research
career-core            career
opportunity-core       opportunity
```

For those, copying the directory is equivalent:

```bash
cp -r shared/self-critique ~/.claude/skills/
```

## Installing without cloning

```bash
curl -fsSL https://raw.githubusercontent.com/Handsomeboy990/craft-suite/main/install.sh | bash -s -- --writing
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
bash tests/validate-counts.sh
```

The installer runs the first one itself and refuses to install a repository
that does not pass it. What each of the six checks is in
[../tests/README.md](../tests/README.md).

## Archives

```bash
bash install.sh --all --zip
```

`--zip` is a modifier, not a scope: it builds one archive per skill installed
by the scope it accompanies, into `dist/`, for a runtime that imports skills
individually. On its own it has no scope, so it opens the same menu a bare
`install.sh` opens, and builds the archives for whatever you pick. `dist/` is
not tracked in version control.

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
git switch main && git pull
bash install.sh --writing        the scope you installed before
```

`main` carries the released version. `dev` is the integration branch and can be
ahead of the documentation you are reading.

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

## Configuring

The install is not finished until this has run:

```bash
bash install.sh --configure
```

It asks who you are, which language your readers speak, and which steps the
agent may perform on its own rather than hand back to you. It writes
`~/.claude/craft.config.yaml` and, for every step you kept,
`~/.claude/craft-manual-tasks.md`. Re-running it is not destructive: it asks
only about the scopes you name, keeps every answer you have already given, and
leaves sections it does not manage, such as `model_routing` and `career`,
exactly as you wrote them. Field reference: [configuration.md](configuration.md).

## Verifying the installation

```bash
ls ~/.claude/skills | wc -l
ls ~/.claude/agents | wc -l
cat ~/.claude/craft.config.yaml
```

What each scope should show, measured, with the two cross domain skills already
counted in:

| Scope | Skills | Agents |
|---|---|---|
| `--writing` | 44 | 0 |
| `--documents` | 9 | 0 |
| `--dev` | 84 | 24 |
| `--security` | 18 | 2 |
| `--research` | 7 | 0 |
| `--career` | 9 | 0 |
| `--opportunity` | 11 | 0 |
| `--shared` | 2 | 0 |
| `--all` | 166 | 25 |
| `--agents` | 0 | 25 |

The installer prints the same two numbers when it finishes, so a mismatch is
visible without counting anything by hand. `tests/validate-counts.sh` checks
this table against the repository.

After a full install, the installer reports whether the identity fields the
engineering tree requires are present, and names the ones that are missing. It
does not invent them.
