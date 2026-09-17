# Contributing

Contributions are welcome. The bar is the same one the skills apply to
themselves: a rule that cannot be verified by an explicit procedure does not
belong here.

## Before anything

1. Read `README.md`.
2. Read the constitution of the tree you are touching.
3. Read `documentation/architecture.md`.
4. Run the five validation scripts and confirm they pass on a clean
   checkout.

```bash
bash tests/validate-structure.sh
bash tests/validate-rules.sh
bash tests/validate-orchestration.sh
bash tests/validate-plugins.sh
bash tests/validate-model-routing.sh
```

## Branches

**Branch from `dev`. Never from `main`, and never target `main`.**

```
main    release branch. Receives only pull requests from dev, opened by a
        maintainer. Never written to directly.

dev     integration branch. Every contribution targets it.

<type>/<short-description>
        where your work happens. Branched from dev, merged back into dev.
```

```bash
git switch dev
git pull
git switch -c feat/my-change
# work, commit
git push -u origin feat/my-change
# open a pull request into dev
```

Branch names are English, kebab-case, and name the change rather than the
person or the ticket alone: `feat/team-invitations`,
`fix/expired-session-redirect`, `docs/pdf-verification-steps`.

Enable the local guard once per clone:

```bash
git config core.hooksPath .githooks
```

It refuses a direct push to `main` or `dev`, refuses a commit attributed to a
tool, and refuses a commit with an empty author. It is a convenience, not the
rule: the server side rule is in `documentation/branch-protection.md`.

## Review

Both `main` and `dev` require a pull request and an approval from a code
owner. Owners are listed in `.github/CODEOWNERS`.

A pull request is mergeable when:

- the `validate` workflow is green, meaning all five scripts pass;
- a code owner has approved it;
- every conversation is resolved;
- the branch is up to date with its base.

Adding an authorized reviewer is an edit to `.github/CODEOWNERS`, merged into
both `dev` and `main`. Nothing about authorisation lives anywhere else.

## Language

| Layer | Language |
|---|---|
| Skills, agents, technical documentation | English |
| Paths, filenames, identifiers, configuration keys | English, kebab-case |
| Commit messages, branch names | English |
| `README.md` and `README.fr.md` | both, kept equivalent |
| French reference material in `writing/resources/` and the writing skills' `examples/` | French |

The last row is not an exception being tolerated. That material is what the
writing skills produce, not how they are instructed, and it keeps its French
names for the same reason.

## Adding a skill

A skill is one isolated directory with four mandatory elements:

```
skill-name/
├── SKILL.md      the expertise: procedure, thresholds, refusals
├── README.md     summary, inputs, outputs, dependencies, configuration
├── examples/     at least one worked example
└── resources/    at least one grid, checklist or reference
```

Requirements:

- YAML metadata block with `name`, `description`, `license`, then under
  `metadata`: `category`, `version`, `depends_on`, `outputs`.
- `name` identical to the directory. `category` identical to the group
  basename.
- A description of at least forty characters, saying what the skill does and
  when to load it, with the terms that should trigger it.
- An `Auto-critique` section with a numeric threshold.
- Outside `writing/`: a numbered `Protocol` section and an `Interfaces`
  section.
- A README whose first line is `# skill-name`.
- A name that collides with no existing skill. Installation is flat.
- References to the tree's constitution rather than copies of it.
- An entry in the category index and in `documentation/skills-guide.md`.

For `engineering/`, membership of at least one execution plan or delivery
phase, or check 7 reports it as an orphan.

For `documents/`, `depends_on: [document-core]`, or check 12 fails.

For `shared/`, `depends_on: []`. A dependency there would make two trees
depend on a third by transitivity, and check 13 refuses it.

## Adding an agent

An agent is a role, not a copy of a skill. It cites the skills it uses and
restates none of them.

1. The file in `agents/<group>/`, with its eight mandatory sections: Role,
   Mission, Responsibilities, Inputs, Outputs, Boundaries, Verification,
   Handoff, plus a `Skills` section. The group is the kind of work the agent
   owns: `core`, `development`, `design`, `security`, `testing`,
   `documentation`, `research`, `devops`.
2. A row in `agents/README.md`.
3. The name added to `AGENT_NAMES` in `tests/validate-orchestration.sh`.

Step 3 is not optional. Check 10 fails both for a declared agent with no file
and for a file with no declaration.

## Writing standard

Applies to every file you add.

Never: emoji, em dash, decorative symbols, manufactured enthusiasm, filler,
throat clearing, the same information in three places, vague intensifiers,
promises the system does not keep such as `simply` or `easily`.

Always: short paragraphs, tables where the content is comparative, lists where
it is enumerable, prose where it is an argument, the specific noun, the active
voice, and a stated threshold for anything claimed to be finished.

Checks 1 and 2 of `validate-rules.sh` enforce the first two prohibitions
mechanically. The rest is review.

## Configuration

Never hardcode a user specific value: an identity, an organisation, a package
manager, a platform, a language. Declare the field in `config/README.md`, add
it to the template and to the installer prompts, and have the skill state what
happens when it is missing.

Three behaviours, and only three: stop and name the field for identity
values, apply a documented default, or read it from the project. Never invent
one.

## Commits

- English, imperative, conventional prefix: `feat:`, `fix:`, `docs:`,
  `test:`, `refactor:`, `chore:`, `perf:`, `style:`, `build:`, `ci:`.
- One commit, one logical change. If the message needs the word `and`, it is
  two commits.
- No trailing period on the summary, about seventy characters at most.

Forbidden in messages, trailers, author fields and branch names:
`Co-authored-by` with any tool, `Generated by`, `Created with`, `Assisted by`,
and any mention of Claude, an AI, an assistant, a bot or a model. A commit
carrying one is amended before it is pushed.

Set your own identity before committing:

```bash
git config user.name  "Your Name"
git config user.email "you@example.org"
```

The repository does not impose an author. `git-workflow` reads
`identity.author_name` and `identity.author_email` from the suite
configuration and stops if either is missing, rather than inventing one.

## Never committed

```
.env and .env.*
private keys, certificates, credential files
local agent and editor configuration: .claude/, CLAUDE.md, .cursor/, *.local
build output, dist/
```

`.gitignore` covers these, and `tests/validate-rules.sh` check 7 fails the
build if one of them is ever tracked, including a file named after an agent
runtime. The public entry point for an agent is `AGENTS.md`, which is
versioned because it is documentation rather than machine local
configuration.

A secret already committed is not fixed by deleting it. Report it for
rotation.

## Before opening a pull request

- [ ] The base branch is `dev`.
- [ ] The five validation scripts pass.
- [ ] The staged diff was read in full.
- [ ] No secret, no `.env`, no local configuration.
- [ ] No emoji, no em dash, in any file.
- [ ] Every new skill has its four elements and its metadata.
- [ ] Every index and `skills-guide.md` list the new skill.
- [ ] `README.md` and `README.fr.md` still say the same thing.
- [ ] Counts are correct wherever they appear: 158 skills, 19 agents.
- [ ] `CHANGELOG.md` has an entry.
- [ ] `CONTINUITY.md` reflects the new state if the change is structural.

## Pull request contents

`.github/pull_request_template.md` fills itself in when you open one. Summary,
what changed and why. Implementation, including what was rejected. Validation,
the last line of each of the five scripts. Risks, what could break and how it
would show. Follow up, named, with why it was not done here.

Remove the sections that do not apply rather than filling them with none.
