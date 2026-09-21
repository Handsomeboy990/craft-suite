# Using Craft Suite

Every other document here describes a part of the repository. This one
describes what you actually do with it, in order, from the moment you have a
clone to the moment you can tell whether it is working.

[Version francaise](usage.fr.md)

## 1. What this is, and what runs it

The repository is a library. It contains no program. A skill is a Markdown
file holding a numbered procedure, and an agent is a Markdown file describing
a role. Nothing in here executes.

What executes them is an agent runtime that reads skills from disk. Claude
Code is the one this suite is written against: it reads `~/.claude/skills`
and, for agents, `~/.claude/agents`. Any runtime that reads the same layout
works the same way. Running `install.sh` without such a runtime installed
copies files that nothing will ever open.

So the first question is not which tree to install. It is whether you have a
host that reads `~/.claude/skills`. If you do not, install that first.

## 2. Install

Two paths, and they land in the same place.

```bash
git clone https://github.com/Handsomeboy990/craft-suite.git
cd craft-suite
bash install.sh --dev
```

or, through the plugin marketplace, one domain at a time:

```
/plugin marketplace add Handsomeboy990/craft-suite
/plugin install craft-engineering
```

Install the tree you will actually use. The installer never chooses for you,
and a scope you do not install costs you nothing. Every option is in
[installation.md](installation.md).

## 3. Configure, once

```bash
bash install.sh --configure
```

This is not optional decoration. It writes two files:

| File | Holds |
|---|---|
| `~/.claude/craft.config.yaml` | who you are, which language your readers speak, what the agent may do without asking |
| `~/.claude/craft-manual-tasks.md` | every step you told it not to do, with the exact command to run yourself |

The two questions with no default are `identity.author_name` and
`identity.author_email`. `git-workflow` stops and names the missing one rather
than inventing a value, because a history that attributes work to a tool is a
history nobody can audit.

The eight `delegation` questions are the ones worth slowing down for. Each one
you answer with anything other than a plain yes moves that step out of the
agent's hands and into `craft-manual-tasks.md`. Answer them the way you would
answer a new colleague asking what they may push without checking.

Re-running `--configure` is safe. It keeps every answer you already gave, does
not empty the sections its scope did not ask about, and leaves
`model_routing` and `career`, which it never asks about, exactly as you wrote
them. Field reference: [configuration.md](configuration.md).

## 4. How a skill actually reaches your conversation

This is the part nothing else in the repository explains, and the part people
get wrong.

You do not load a skill. You describe your task, and the host picks.

Every `SKILL.md` opens with a frontmatter block. One field in it is the whole
interface:

```yaml
---
name: thriller
description: Writes a thriller: vital stake, visible deadline, competent
  antagonist, rising cost, tension mechanics, short chapters, procedural
  credibility. Use to build or revise a thriller, a countdown narrative or a
  race against time.
---
```

The host reads `description` and matches it against what you asked for. That
is why every description in this repository ends with a sentence beginning
"Use to" or "Use when": it is written for the matcher, not for you. The rest
of the file is only read once the skill has been selected.

Two consequences worth holding on to:

- **Naming the skill is not required, and naming it is still allowed.** "Write
  me a thriller opening" reaches `thriller` on its own. "Use the thriller
  skill" also works, and is the faster route when you already know which one
  you want.
- **Selection is the host's behaviour, not this repository's.** Nothing here
  enforces it. If your host does not read skill descriptions, none of this
  happens, and the files sit unread.

`depends_on` in the frontmatter is read at install time only. It is how
`install.sh` decides what else to copy so a skill never lands without what it
refers to. Nothing reads it while you work.

## 5. What to say, by kind of request

The suite routes on the nature of the request, not its subject. A report about
a novel is a document, not fiction. This is the table the agent itself uses,
from [AGENTS.md](../AGENTS.md):

| What you are asking for | The skill that takes the request |
|---|---|
| Any significant project, or taking one over | `project-brief` |
| Fiction, poetry, screenplay, text revision | `writing-constitution` |
| A delivered document, report, letter, manual, PDF | `document-core` |
| A single coding task: feature, bug, review, refactor | `engineering-orchestrator` |
| A specification, brief or client request | `delivery-orchestrator` |
| Environment, pipeline, deployment, production database, secret | `devops-core` |
| Validating a whole product, or a QA campaign | `quality-engineering` |
| A degraded production system | `incident-response` |
| Threat modeling, a security audit, or hardening | `security-core` |
| Active testing under written authorization | `authorized-pentesting` |
| Researching a question with real, cited sources | `research-core` |
| A job search, CV, cover letter or interview prep | `career-core` |
| Generating and evaluating ideas | `opportunity-core` |
| Finding or winning a hackathon | `hackathon-discovery` |
| Finding clients or sizing a market | `client-discovery` |
| Anything just finished | `self-critique` |

Each of those is a constitution or an orchestrator. It loads what the task
actually needs and leaves the rest alone. A typo fix runs four steps; a
payment endpoint runs eleven. Asking for the whole chain by reflex is the one
failure mode the orchestrators are written to prevent.

## 6. What "finished" means, and why the first answer takes longer

The reason to install this rather than nothing is the gates. They are what
turns a plausible first draft into something you can hand over.

| You asked for | What has to happen before it may be called done |
|---|---|
| A bug fix | reproduce it, name the cause at a file and a line, fix it, add a test that fails without the fix |
| An endpoint | agree the contract first, implement, then pass an independent review with a test that was executed and observed |
| A report | name the recipient, lead with the conclusion, attribute every figure, state what is uncertain |
| A PDF | render the pages and look at them, for clipping, orphans, broken tables, missing glyphs |
| A chapter | `self-critique-protocol`, then at least one revision skill |
| A deployment | `production-verification` before anything is announced as delivered |
| A security audit | which checks ran, with which results, on which revision, and never a verdict of "secure" |

These are stated once, in [AGENTS.md](../AGENTS.md) under Mandatory gates, and
referenced everywhere else. A gate is not dropped to save time. If you want a
quick answer without one, say so: the gate is a discipline the agent follows,
so it can be waived deliberately, which is different from it being forgotten.

## 7. Agents, and when not to use them

The agent definitions in `~/.claude/agents` are roles for a runtime that
supports subagents. There are 25 in the repository; `--dev` installs 24 of them
and `--security` two, so how many you have depends on the scope you chose. Two
rules govern all of them:

- **They are used only when you ask.** An agent is a separate context with its
  own budget. For a single task, the skills alone are enough, and
  `engineering-orchestrator` sequences them in one context. Install with
  `--no-agents` if you never want them.
- **An agent stays thin.** The expertise is in the skill it cites. An agent
  decides who owns a piece of work, what it may touch, and what it hands on.

Ask for one by name when the work genuinely splits: "have the security
engineer audit this", "run a final verification". The roster and what each one
owns is in [agents.md](agents.md).

The honest limit, recorded rather than hidden: an agent's Boundaries section
is a written discipline, not a runtime guarantee. A runtime that grants every
subagent full write access enforces none of them.

## 8. Day to day

**The manual task list.** Whatever you kept in `delegation` is written to
`~/.claude/craft-manual-tasks.md` with the command for each step. When the
agent reaches one of those boundaries it stops, hands you what it prepared,
and names the step. It never performs it anyway, and it never passes over it
in silence. Read that file once after configuring; it is the contract you
signed.

**Two rules never delegate**, whatever you answered: a destructive operation
is counted and confirmed before it runs, and a leaked secret is reported for
rotation rather than quietly removed.

**Worked examples**, if you want to see a full run before starting one:

| Example | Shows |
|---|---|
| `engineering/examples/delivery-link-shortener/` | the fourteen delivery phases on one small application, with the four approval gates as explicit stops |
| `documents/examples/jeu-conges/` | one subject written for three different readers, each through the eight-point gate |

**Optional, and only if you have `python3`:**

```bash
bash install.sh --control-center    a local dashboard, no network
bash install.sh --report            the same data as text
```

Both read your local session data and report measured patterns. Neither
asserts that any work was wasted; see `control-center/README.md` for what it
refuses to claim.

## 9. Checking it works

```bash
ls ~/.claude/skills | wc -l
ls ~/.claude/agents | wc -l
cat ~/.claude/craft.config.yaml
```

What each scope should show, with the two cross domain skills already counted
in:

| Scope | Skills | Agents |
|---|---|---|
| `--writing` | 44 | 0 |
| `--documents` | 9 | 0 |
| `--dev` | 85 | 25 |
| `--security` | 18 | 2 |
| `--research` | 7 | 0 |
| `--career` | 9 | 0 |
| `--opportunity` | 11 | 0 |
| `--shared` | 2 | 0 |
| `--all` | 167 | 26 |
| `--agents` | 0 | 26 |

`~/.claude/skills` is shared. It holds every skill you have, not only this
suite's: a skill installed from somewhere else sits beside them, and claude.ai
keeps its synced skills in a `synced` subdirectory that `ls` counts as one more
entry. So the table is a floor, not an equality, and a larger number is normal.

To count only this suite's, from inside the clone:

```bash
comm -12 <(find . -name SKILL.md -not -path './plugins/*' \
             | sed 's|/SKILL.md$||' | xargs -n1 basename | sort) \
         <(ls ~/.claude/skills | sort) | wc -l
```

The installer prints its own two numbers when it finishes, and those count only
what it just installed, so they are the ones to compare against the table. After
a `--dev` install it also checks that the identity fields exist and names the
missing one.

Then ask for something small and see whether a gate fires. "Fix this typo and
tell me what you verified" is a good first test: the answer should name what
was run, not assert that it is fine.

To check the repository itself rather than your install:

```bash
bash tests/validate-structure.sh
bash tests/validate-rules.sh
bash tests/validate-orchestration.sh
bash tests/validate-plugins.sh
bash tests/validate-model-routing.sh
bash tests/validate-counts.sh
```

What each one verifies: [../tests/README.md](../tests/README.md).

## 10. Updating and removing

```bash
git switch main && git pull
bash install.sh --dev          the same scope you installed before
```

Installing overwrites the skill directories it manages and leaves the others
alone, so re-running a scope updates exactly what you have. It never touches
the configuration file.

```bash
bash install.sh --writing --remove
bash install.sh --all --remove
```

A scoped removal keeps the two cross domain skills, since another tree may
still use them, and keeps any skill it pulled in from another tree for the
same reason. Only `--all --remove` or `--shared --remove` takes the pair out.
Removing never deletes the configuration; its path is printed so you can
remove it deliberately.

## 11. What this does not do

Stated so it is chosen rather than discovered.

- It does not make the agent run the procedures. It makes them available and
  states them precisely. Every gate here is a discipline the model follows,
  not something a runtime enforces.
- It does not know your stack. The engineering tree reads the project it is
  given and adapts. Configuration fields like `engineering.database` are
  preferences for greenfield work; the project wins when the project already
  decided.
- Model routing recommends a tier and, where a lever exists, an effort. It
  cannot enforce effort on an arbitrary dispatch. Only the model choice is a
  real lever.
- It is a library, not a service. Nothing phones home, nothing is collected,
  and the Control Center reads only files already on your disk.

## Where to go next

| You want | Read |
|---|---|
| Every install option | [installation.md](installation.md) |
| Every configuration field | [configuration.md](configuration.md), `config/README.md` |
| The whole catalogue, tree by tree | [overview.md](overview.md) |
| One line per skill | [skills-guide.md](skills-guide.md) |
| The agent roster and its contracts | [agents.md](agents.md) |
| How the pieces fit | [architecture.md](architecture.md) |
