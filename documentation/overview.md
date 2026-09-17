# Craft Suite

Expertise systems for an agent, in one repository: **write**, **produce
documents**, **build software**, **secure it**, **research**, **run a job
search**, **find and evaluate opportunities**, and **review your own work**.

Called `claude-writer-suite` until 3.0.0, when the writing tree stopped being
the whole of it.

165 skills and 22 agents. Not prompts: numbered protocols, decision criteria,
scoring grids and review procedures, each with a stated threshold for what
counts as finished.

[Version francaise](overview.fr.md)

```
craft-suite/
├── shared/           2 cross domain skills, called by every tree
├── writing/         42 creative writing skills
├── documents/        7 professional document skills
├── engineering/     81 software skills
├── agents/          22 role definitions, repository wide
├── security/        12 defensive security skills
├── research/         5 general research skills
├── career/           7 job search and application skills
├── opportunity/      9 ideation, hackathon and business skills
├── config/           user specific values, nothing hardcoded
├── control-center/   optional local dashboard, zero dependency
├── plugins/          per-domain plugin bundles, generated from the trees
├── documentation/    technical documentation of the trees
└── tests/            five validation scripts
```

## Why it exists

An agent that writes a chapter, a letter or an endpoint will produce something
plausible on the first attempt. Plausible is not the same as correct, and the
gap only appears later: at the deadline, in the reader's hands, in production.

Every skill here encodes the same shape. What the work is for. How it is done,
as a numbered procedure. What must be verified before it is called finished.
What score it has to reach. What it refuses to do.

## Language

The repository separates three languages that are routinely confused.

| Layer | What it is | Value |
|---|---|---|
| Skill language | the instructions themselves | English, all 165 skills |
| System language | paths, identifiers, config keys, commits | English |
| Output language | what the reader receives | theirs, set per project |

Skills are written in English so the system is usable internationally. What
they produce is a separate decision: `language.creative_output` defaults to
French because the writing tree encodes French craft, and
`language.document_output` is set to the language of whoever receives the
document. The French reference material in `writing/resources/` stays French,
because it is what the skills produce rather than how they are instructed.

## The trees

### shared

Two skills that belong to no domain and are called by all of them.

| Skill | Runs | Produces |
|---|---|---|
| [project-brief](../shared/project-brief/) | before the work | the agreement the work is measured against |
| [self-critique](../shared/self-critique/) | after the work | the corrected result, and what was found |

`project-brief` inspects what exists, asks the decision-critical questions once
in a single batch, and records an assumption for everything it did not ask.
`self-critique` selects the professional roles that will actually receive the
work, runs one pass per role, and fixes what it finds rather than reporting it.

### writing

Creative writing. The agent works as novelist, screenwriter, editor, critic,
researcher, proofreader and beta reader, from a short story to a saga.

| Category | Skills | Purpose |
|---|---|---|
| [core](../writing/core/) | 14 | foundations and production |
| [genres](../writing/genres/) | 15 | thriller, mystery, fantasy, SF, romance, historical |
| [poetry](../writing/poetry/) | 5 | French prosody and four forms |
| [quality](../writing/quality/) | 8 | diagnosis, rewriting, correction, validation |

Index: [writing/README.md](../writing/README.md).

### documents

Professional documents that are delivered to someone.

| Category | Skills | Question it answers |
|---|---|---|
| [documentation](../documents/documentation/) | 4 | how the reader understands and uses the system |
| [administrative](../documents/administrative/) | 1 | how a formal document survives being filed and quoted |
| [publishing](../documents/publishing/) | 2 | how it looks, paginates and renders |

Four rules run through the tree: the audience is named before the first
sentence; the output language is the recipient's; nothing is asserted that was
not verified; and a generated PDF is not a finished PDF until the rendered
pages have been looked at.

Index: [documents/README.md](../documents/README.md).

### engineering

Software engineering and project delivery. The agent takes a specification and
delivers a system that is implemented, tested, documented, deployed and
verified in production.

| Category | Skills | Question it answers |
|---|---|---|
| [dev-skills](../engineering/dev-skills/) | 54 | how a change is made correctly |
| [delivery-skills](../engineering/delivery-skills/) | 11 | what to build, in what order, with what approval |
| [devops-skills](../engineering/devops-skills/) | 16 | how the system runs, deploys and restores |

Stack and platform agnostic: the system reads the project it is given rather
than assuming its shape. The twenty-two agents are not a category of this tree:
they are a repository-wide layer, at [agents](../agents/), who owns what and
what is handed on.

Index: [engineering/README.md](../engineering/README.md).

### security

Defensive security and, under written authorization only, assurance. The agent
builds a system harder to attack and audits one that exists, ranking every
finding by reachability and fixing what code can fix.

| Category | Skills | Question it answers |
|---|---|---|
| [secure-development](../security/secure-development/) | 9 | how a system is built and hardened to resist attack |
| [security-assurance](../security/security-assurance/) | 3 | what is wrong in a system that exists, without breaking it |

Two rules never bend: no offensive action without written, specific, in-scope
authorization on record, and no audit ever concludes that a system is secure. It
reports which checks were run, with which results, on which revision. The
engineering tree's `security-audit` and `security-testing` stay where twelve
execution plans call them; this tree governs their posture and installs them with
it.

Index: [security/README.md](../security/README.md).

### research

General-purpose research for a decision, distinct from the writing tree's
`research-director`, which serves fiction. The agent states the question, finds
and reads the sources, verifies what carries weight, and writes an answer a reader
can act on and check.

| Category | Skills | Purpose |
|---|---|---|
| [research](../research/) | 5 | framing, gathering, verification, comparison, synthesis |

A source is cited only if it was actually consulted, and a gap is stated honestly
rather than filled with a plausible invention.

Index: [research/README.md](../research/README.md).

### career

Helping a real person find and win real roles. The agent builds an honest
profile, finds real openings from live sources, renders a CV and cover letter
that survive both a parser and an interview, researches the employer, and
rehearses the conversation.

| Category | Skills | Purpose |
|---|---|---|
| [career](../career/) | 7 | profile, job search, CV, cover letter, company research, interview prep |

Nothing about the outside world is invented: a listing is traced to a live source
or withheld. Nothing about the candidate is claimed that they cannot support.

Index: [career/README.md](../career/README.md).

### opportunity

Discovering and evaluating opportunities, whatever their shape: ideas, hackathons,
clients, markets. One method runs through all of it: discover a field, evaluate it
against reality, recommend a few with reasoning, never dump a hundred.

| Category | Skills | Question it answers |
|---|---|---|
| [ideation](../opportunity/ideation/) | 3 | which ideas are worth pursuing, and how to test them |
| [hackathons](../opportunity/hackathons/) | 3 | which hackathon to enter and how to win it |
| [business](../opportunity/business/) | 3 | who to sell to, how to reach them, whether the market is real |

Every opportunity is grounded in something verifiable or marked a hypothesis,
never fabricated. The deliverable is the evaluated few with their next steps.

Index: [opportunity/README.md](../opportunity/README.md).

## Installation

No dependencies. The repository is Markdown and shell.

```bash
git clone <repository-url> craft-suite
cd craft-suite
bash install.sh
```

**Nothing is installed until you choose.** With no argument the installer asks
what you actually do, and installs only that. A developer is never given a
novelist's toolkit, and a novelist is never given the engineering tree.

```
   1) Creative writing        42 skills   novels, poetry, screenplay, editing
   2) Professional documents   7 skills   guides, manuals, reports, letters, PDF
   3) Software engineering    81 skills   plus 22 agents
   4) Cybersecurity           10 skills   threat models, audits, hardening
   5) Research                 5 skills   sources, verification, synthesis
   6) Career                   7 skills   job search, CV, interviews
   7) Opportunity              9 skills   ideation, hackathons, business
   8) Everything             165 skills   plus 22 agents
   9) Individual skills, chosen by name
  10) One or more categories, for example genres only

Choice [1]:
```

Several numbers may be given: `1 2` installs writing and documents.

Then configure it:

```bash
bash install.sh --configure
```

### Choosing without the prompt

```bash
bash install.sh --writing      42 creative writing skills
bash install.sh --documents     7 professional document skills
bash install.sh --dev          81 engineering skills and 22 agents
bash install.sh --security     12 defensive security skills
bash install.sh --research      5 general research skills
bash install.sh --career        7 job search and application skills
bash install.sh --opportunity   9 ideation, hackathon and business skills
bash install.sh --all          everything
bash install.sh --shared        the 2 cross domain skills only
bash install.sh --agents        the 22 agents only
bash install.sh --no-agents     skills without agents
bash install.sh --all --zip     also build one archive per skill in dist/
bash install.sh --remove        uninstall the selected scope
```

Scopes combine: `bash install.sh --writing --documents`.

Every scope also installs the two cross domain skills, `self-critique` and
`project-brief`, because every tree calls them. A scoped removal leaves them
in place, so removing one tree never breaks another.

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
| `dev-skills` | 54 | engineering |
| `delivery-skills` | 11 | engineering |
| `devops-skills` | 16 | engineering |
| `secure-development` | 9 | security |
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

### One skill at a time

```bash
bash install.sh --list                    every skill, with its purpose
bash install.sh --skill thriller          one skill, and what it needs
bash install.sh --skill sonnet,haiku      several
```

Dependencies are resolved transitively, so a single skill is never installed
broken:

```
$ bash install.sh --skill thriller
7 skills installed
Installed: thriller writing-constitution novel-architect scene-builder
           chapter-architect self-critique project-brief
```

An unknown name stops the install rather than silently shortening it.

### Without cloning first

```bash
curl -fsSL <raw-url>/install.sh | bash -s -- --writing
```

The script fetches the skills into `~/.cache/craft-suite` when it has
none beside it. It still asks what to install if you give it no scope, reading
your answer from the terminal rather than from the pipe. If the repository is
private, clone it yourself and run `install.sh` from inside it.

Skills go to `~/.claude/skills`, agents to `~/.claude/agents`, configuration to
`~/.claude/craft.config.yaml`. All three are overridable with
`CLAUDE_SKILLS_DIR`, `CLAUDE_AGENTS_DIR` and `CLAUDE_CONFIG_FILE`.

Full detail, including installing one skill alone:
[documentation/installation.md](installation.md).

## Configuration

Nothing assumes who you are, which tools you use, or which language your
readers speak.

```bash
bash install.sh --configure
```

Every question has a recommended answer, already selected: press enter to
accept it. Only the fields relevant to the scope you installed are asked.

Two fields are required and have no default, ever: `identity.author_name` and
`identity.author_email`. A commit carries a real person, and `git-workflow`
stops and names the missing field rather than inventing one. The installer
rejects an author name that looks like a tool.

### What the agent may do on its own

The `delegation` section decides how much of the work reaches you as a
finished action and how much reaches you as a prepared step.

| Field | Values |
|---|---|
| `commits` | yes, stage-only, no |
| `branches` | yes, no |
| `push` | yes, branch-only, no |
| `pull_requests` | yes, draft, no |
| `release_tags` | yes, no |
| `deployments` | yes, non-production, no |
| `database_operations` | yes, non-production, no |
| `dependency_changes` | yes, with-justification, no |

Say no to anything you would rather do yourself. The agent stops at that
boundary, hands you what it prepared, and names the step.

Everything you keep is written to `craft-manual-tasks.md`, next to the
configuration file, with the command for each step. Nothing is silently left
undone.

Two rules are never delegated: a destructive operation is counted and
confirmed before it runs, and a leaked secret is reported for rotation rather
than quietly removed.

Field reference: [config/README.md](../config/README.md). Installer side:
[documentation/configuration.md](configuration.md).

## Which skill do I need

| Situation | Skill |
|---|---|
| I am starting a project of any kind | `shared/project-brief` |
| I finished something and want it checked | `shared/self-critique` |
| I am starting a novel | `writing/core/novel-architect` |
| My scene is flat | `writing/core/scene-builder` |
| Every character speaks alike | `writing/core/dialogue-master` |
| My middle sags | `writing/quality/story-doctor` |
| Is this publishable | `writing/quality/literary-critic` |
| A partner must integrate with our API | `documents/documentation/technical-writing` |
| A customer cannot find how to do something | `documents/documentation/user-documentation` |
| Leadership must decide | `documents/documentation/report-writing` |
| A formal letter has to be sent | `documents/administrative/administrative-writing` |
| The client wants a PDF | `documents/publishing/pdf-production` |
| I have a coding task | `engineering/dev-skills/engineering-orchestrator` |
| I have a bug | `engineering/dev-skills/debugging` |
| I have a specification, not a task | `engineering/delivery-skills/delivery-orchestrator` |
| Something must be deployed | `engineering/devops-skills/devops-core` |
| I need to threat-model or audit a system | `security/secure-development/security-core` |
| I have written authorization to test a system | `security/security-assurance/authorized-pentesting` |
| I need to research a question with real sources | `research/research-core` |
| I am job hunting | `career/career-core` |
| I need ideas, and then the good ones | `opportunity/ideation/opportunity-core` |
| I want to find and win a hackathon | `opportunity/hackathons/hackathon-discovery` |
| I need to find clients or size a market | `opportunity/business/client-discovery` |

Full directory: [documentation/skills-guide.md](skills-guide.md).

## Using a skill

Every skill is a self-contained directory:

```
skill-name/
├── SKILL.md      the expertise: procedure, thresholds, refusals
├── README.md     summary, inputs, outputs, dependencies, configuration
├── examples/     at least one worked example
└── resources/    at least one grid, checklist or reference
```

The README states its dependencies in four lines. `Depends on: nothing` means
it works alone; copy the directory and use it. A skill that depends on another
refers to it rather than restating it, so the other one is needed too.

Ten skills depend on nothing and work entirely on their own, one per tree plus
the operations and shared constitutions:
`shared/self-critique`, `shared/project-brief`,
`writing/core/writing-constitution`,
`documents/documentation/document-core`,
`engineering/dev-skills/engineering-core`,
`engineering/devops-skills/devops-core`,
`security/secure-development/security-core`,
`research/research-core`,
`career/career-core`,
`opportunity/ideation/opportunity-core`.

## Agents

Twenty-two role definitions, for a runtime that supports subagents.

```
Skill          how this kind of work is done correctly
Agent          who owns this piece of work, what they may touch, what they hand on
Orchestration  which agents run, in what order, and where the gates are
```

An agent is thin by design: it names the skills it uses and never restates
them. For a single task the skills alone are enough; install with
`--no-agents` and let `engineering-orchestrator` sequence them in one context.

Detail: [documentation/agents.md](agents.md).

## Dependencies between skills

```
project-brief
    -> requirements-analysis -> architecture-proposal -> validation-gate
    -> implementation -> testing-quality -> security-audit
    -> code-review-protocol -> release-readiness
    -> self-critique
```

Each tree has one constitution that every skill in it refers to and none
restates:

| Tree | Constitution |
|---|---|
| writing | `writing/core/writing-constitution` |
| documents | `documents/documentation/document-core` |
| engineering | `engineering/dev-skills/engineering-core` |
| engineering, operations | `engineering/devops-skills/devops-core` |
| security | `security/secure-development/security-core` |
| research | `research/research-core` |
| career | `career/career-core` |
| opportunity | `opportunity/ideation/opportunity-core` |

`tests/validate-orchestration.sh` verifies that every declared dependency and
every cross reference resolves, so the declarations are accurate rather than
aspirational.

## What the system refuses

```
guessing anything the repository can establish
asserting without having run it
writing a command into a document without running it first
inventing a legal reference, a registration number or an institution
leaving fake functionality on a reachable path
writing production code before the architecture is approved
weakening a test to obtain a green pipeline
hardcoding a value that varies by environment
running a destructive statement without counting the rows first
declaring a deployment successful without exercising a journey
delivering a PDF whose pages were never rendered and looked at
attributing a commit to a tool
```

Two prohibitions apply to every file in the repository, including this one:
**no emoji**, **no em dash**. Both are enforced by
`tests/validate-rules.sh`.

## Plugins

The suite also ships as Claude Code plugins, one per domain, so a user can add a
marketplace and install only the domains they want.

```
/plugin marketplace add Handsomeboy990/craft-suite
/plugin install craft-security
```

| Plugin | Installs |
|---|---|
| `craft-writing` | the writing tree, 42 skills |
| `craft-documents` | the documents tree, 7 skills |
| `craft-engineering` | the engineering tree, 81 skills and 22 agents |
| `craft-security` | the security tree, 10 skills |
| `craft-research` | the research tree, 5 skills |
| `craft-career` | the career tree, 7 skills |
| `craft-opportunity` | the opportunity tree, 9 skills |

The trees are the single source of truth. The plugin bundles under `plugins/`
are generated from them by `bash plugins/build.sh`, and
`tests/validate-plugins.sh` verifies they stay in sync. The `install.sh` path
keeps working unchanged for everyone who prefers it.

## Control Center

An optional local dashboard, zero dependency, that reads the session data,
skills and configuration already on the machine and shows usage, tokens, models,
tools, projects and system health.

```bash
bash install.sh --control-center     # starts a local server, opens the browser
bash install.sh --report             # the same figures as a terminal report
```

It is optional: every skill works without it. It binds to `127.0.0.1` only,
reads local files, and keeps nothing of its own. Every figure is read from the
real local data; a metric that cannot be established is shown as unavailable,
never invented. Detail: [control-center/README.md](../control-center/README.md).

## Validation

```bash
bash tests/validate-structure.sh      structure and metadata of 165 skills
bash tests/validate-rules.sh          emoji, em dash, secrets, hardcoded identity
bash tests/validate-orchestration.sh  plans, phases, agents, cross references
bash tests/validate-plugins.sh        plugin bundles in sync with the trees
bash tests/validate-model-routing.sh  routing fixtures against the tier table
```

All five must pass before any commit. Detail in
[tests/README.md](../tests/README.md).

## Documentation

| File | Contents |
|---|---|
| [documentation/architecture.md](architecture.md) | organisation, skill isolation, metadata |
| [documentation/skills-guide.md](skills-guide.md) | directory of the 165 skills |
| [documentation/installation.md](installation.md) | full and per-skill installation |
| [documentation/configuration.md](configuration.md) | the configuration contract |
| [documentation/agents.md](agents.md) | skill, agent, orchestration |
| [documentation/documents-system.md](documents-system.md) | the documents tree in detail |
| [documentation/engineering-system.md](engineering-system.md) | the dev-skills layer in detail |
| [documentation/delivery-system.md](delivery-system.md) | delivery, operations and agents |
| [documentation/writing-rules.md](writing-rules.md) | the writing rules, operational form |
| [documentation/workflow.md](workflow.md) | the writing workflow, phase by phase |
| [documentation/branch-protection.md](branch-protection.md) | who may write to main and dev, and how |
| [CONTINUITY.md](../CONTINUITY.md) | state of the repository for whoever takes over |
| [CHANGELOG.md](../CHANGELOG.md) | version history |

## Contributing

Branch from `dev`. Never from `main`.

```bash
git switch dev && git pull
git switch -c feat/my-change
git config core.hooksPath .githooks    # once per clone
# work, commit
git push -u origin feat/my-change      # then open a pull request into dev
```

`main` is the release branch and receives only pull requests from `dev`,
opened by a maintainer. Both branches require a pull request, a green
`validate` run and an approval from a code owner listed in
[.github/CODEOWNERS](../.github/CODEOWNERS).

Adding a skill: create the directory with its four elements, declare the
metadata, refer to the constitution of its tree without restating it, add at
least one example and one resource, update the category index and
`documentation/skills-guide.md`, then run the five scripts.

Full rules: [CONTRIBUTING.md](../CONTRIBUTING.md). Branch rules and their setup:
[documentation/branch-protection.md](branch-protection.md).

## Philosophy

- Constraint produces style. Rules remove noise rather than freedom.
- A text is judged on its effect, never on its intention.
- A system is judged on what was executed, never on what was planned.
- Consistency is a form of respect, for the reader and for the next engineer.
- A skill must stay useful at chapter 3 and at chapter 90, at the first commit
  and at the hundredth.
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

MIT. See [LICENSE](../LICENSE).

Copyright (c) 2026 Lauret Chacha (Handsomeboy990).
