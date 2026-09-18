# Craft Suite

**Craft, encoded.** 166 skills and 25 agents that hold an agent to a
professional standard: write, produce documents, build software, secure it,
research, run a job search, evaluate opportunities, and review its own work.

[Version francaise](README.fr.md) | [Full documentation](documentation/overview.md)

## Why

An agent asked to write a chapter, a letter or an endpoint will produce
something plausible on the first attempt. Plausible is not the same as correct,
and the gap only appears later: at the deadline, in the reader's hands, in
production.

These are not prompts. Each skill is a numbered procedure with decision
criteria, a scoring grid, a stated threshold for what counts as finished, and
an explicit list of what it refuses to do.

## Install

Through the plugin marketplace, one domain at a time:

```
/plugin marketplace add Handsomeboy990/craft-suite
/plugin install craft-engineering
```

Or all of it at once, into `~/.claude/skills`. The skills and agents are
Markdown, the installer is shell, and nothing else is needed to use them. Only
the optional Control Center and the report also want `python3`.

```bash
git clone https://github.com/Handsomeboy990/craft-suite.git
cd craft-suite
bash install.sh              # a menu, pick the trees you want
bash install.sh --all        # or take all 166 and the 25 agents
bash install.sh --configure
```

`--configure` asks who you are, which language your readers speak, and which
steps the agent may perform on its own rather than hand back to you. Nothing
user specific is ever hardcoded in a skill.

Scoped installs: `--writing`, `--documents`, `--dev`, `--security`,
`--research`, `--career`, `--opportunity`, `--shared`, `--agents`, `--all`,
`--no-agents`, `--remove`. New here: start with
[documentation/usage.md](documentation/usage.md).

## The seven plugins

Two counts, because they answer two questions. "Domain" is how many skills the
tree itself holds. "Installed" is how many directories land on disk, which is
the domain plus the two cross domain skills every tree calls, plus any cross
tree dependency those skills declare.

| Plugin | What the agent becomes | Domain | Installed |
|---|---|---|---|
| `craft-writing` | novelist, screenwriter, editor, critic, proofreader | 42 | 44 |
| `craft-documents` | technical writer, report author, PDF producer | 7 | 9 |
| `craft-engineering` | a delivery team, from specification to production | 82 | 84 and 24 agents |
| `craft-security` | defensive engineer, and auditor under written authorization | 12 | 18 and 2 agents |
| `craft-research` | researcher who cites only what was actually read | 5 | 7 |
| `craft-career` | job search that never invents a listing | 7 | 9 |
| `craft-opportunity` | ideas, hackathons, clients, markets | 9 | 11 |

Each plugin is self contained, which is why the second column is larger. The
security bundle is the one that currently reaches into another tree: its
`vulnerability-assessment` declares `security-audit`, which lives in the
engineering tree, so the bundle carries that skill and the three it depends on
in turn. The engineering plugin ships 24 of the 25 agents; `web-auditor` is a
security tool with no role in the delivery sequence and ships with
`craft-security` instead.

## What "finished" means here

| You ask | What the agent must do before it may call it done |
|---|---|
| Fix this bug | reproduce it, name the cause at a file and line, fix it, and add a test that fails without the fix |
| Build this endpoint | agree the contract first, then implement, then pass an independent review with a test that was executed and observed |
| Write me a report | name the recipient, lead with the conclusion, attribute every figure, and state what is uncertain instead of smoothing it |
| Produce a PDF | render the pages and look at them, for clipping, orphans, broken tables and missing glyphs |
| Draft this chapter | pass the self critique protocol, then at least one revision skill, before the text is called finished |
| Find me a job | trace every listing to a live source or withhold it, and claim nothing the candidate cannot support |
| Ship this | nine readiness gates, and no release announced before production has been exercised |

Two skills belong to no domain and are called by all of them.
[project-brief](shared/project-brief/) runs before the work and produces the
agreement it will be measured against. [self-critique](shared/self-critique/)
runs after it, selects the professional roles that would actually receive the
result, and fixes what it finds rather than reporting it.

## What the system refuses

```
guessing anything the repository can establish
asserting without having run it
writing a command into a document without running it first
inventing a legal reference, a registration number or an institution
writing production code before the architecture is approved
weakening a test to obtain a green pipeline
running a destructive statement without counting the rows first
declaring a deployment successful without exercising a journey
delivering a PDF whose pages were never rendered and looked at
attributing a commit to a tool
```

Two prohibitions apply to every file in the repository, including this one: no
emoji, no em dash. Both are enforced by `tests/validate-rules.sh` in CI.

## Where to go next

| | |
|---|---|
| The whole suite, tree by tree | [documentation/overview.md](documentation/overview.md) |
| Which skill do I need | [documentation/skills-guide.md](documentation/skills-guide.md) |
| Installation options in detail | [documentation/installation.md](documentation/installation.md) |
| Configuration reference | [documentation/configuration.md](documentation/configuration.md) |
| Plugins, and how the bundles are built | [documentation/plugins.md](documentation/plugins.md) |
| The 25 agents | [documentation/agents.md](documentation/agents.md) |
| Architecture of the repository | [documentation/architecture.md](documentation/architecture.md) |
| Local usage dashboard | [control-center/README.md](control-center/README.md) |
| Contributing | [CONTRIBUTING.md](CONTRIBUTING.md) |
| History | [CHANGELOG.md](CHANGELOG.md) |

## Philosophy

- Constraint produces style. Rules remove noise rather than freedom.
- A text is judged on its effect, never on its intention.
- A system is judged on what was executed, never on what was planned.
- Consistency is a form of respect, for the reader and for the next engineer.
- Every rule stated must be verifiable by an explicit procedure.
- Critical severity is a service, not a posture.

## Author

**Lauret Chacha**

| | |
|---|---|
| GitHub | [@Handsomeboy990](https://github.com/Handsomeboy990) |
| Portfolio | [lauret-chacha.vercel.app](https://lauret-chacha.vercel.app) |
| LinkedIn | [in/lauret-chacha](https://linkedin.com/in/lauret-chacha) |
| Email | lauretchacha@gmail.com |

## License

MIT. See [LICENSE](LICENSE).

Copyright (c) 2026 Lauret Chacha (Handsomeboy990).
