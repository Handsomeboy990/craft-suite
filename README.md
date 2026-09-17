# Craft Suite

**Craft, encoded.** 165 skills and 21 agents that hold an agent to a
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

Or all of it at once, into `~/.claude/skills`. No dependencies: the repository
is Markdown and shell.

```bash
git clone https://github.com/Handsomeboy990/craft-suite.git
cd craft-suite
bash install.sh              # a menu, pick the trees you want
bash install.sh --all        # or take all 165 and the 21 agents
bash install.sh --configure
```

`--configure` asks who you are, which language your readers speak, and which
steps the agent may perform on its own rather than hand back to you. Nothing
user specific is ever hardcoded in a skill.

Scoped installs: `--writing`, `--documents`, `--dev`, `--security`,
`--research`, `--career`, `--opportunity`, `--no-agents`.

## The seven plugins

| Plugin | What the agent becomes | Domain skills |
|---|---|---|
| `craft-writing` | novelist, screenwriter, editor, critic, proofreader | 42 |
| `craft-documents` | technical writer, report author, PDF producer | 7 |
| `craft-engineering` | a delivery team, from specification to production | 81 and 21 agents |
| `craft-security` | defensive engineer, and auditor under written authorization | 10 |
| `craft-research` | researcher who cites only what was actually read | 5 |
| `craft-career` | job search that never invents a listing | 7 |
| `craft-opportunity` | ideas, hackathons, clients, markets | 9 |

Each plugin is self contained. It carries its domain, the two cross domain
skills every tree calls, and any cross tree dependency its skills declare,
resolved transitively, so no skill installs broken.

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
| The 21 agents | [documentation/agents.md](documentation/agents.md) |
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
