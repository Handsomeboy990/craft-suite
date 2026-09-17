# Architecture

## Overview

The Craft Suite is a library of 156 skills in eighteen groups across
eight trees, plus seventeen agents, shared resources, the configuration contract,
an optional local dashboard, per-domain plugins, documentation, a demonstration
project and validation scripts. The repository was called
`claude-writer-suite` until 3.0.0.

```
craft-suite/
├── README.md              short entry point, English
├── README.fr.md           short entry point, French
├── CONTRIBUTING.md
├── CHANGELOG.md
├── CONTINUITY.md
├── LICENSE
├── install.sh
├── shared/                 2 skills, cross domain
├── writing/               42 skills
│   ├── core/              14
│   ├── genres/            15
│   ├── poetry/             5
│   ├── quality/            8
│   ├── resources/         French reference material
│   └── examples/          demonstration project
├── documents/              7 skills
│   ├── documentation/      4
│   ├── administrative/     1
│   └── publishing/         2
├── engineering/           74 skills
│   ├── dev-skills/        50
│   ├── delivery-skills/   11
│   └── devops-skills/     13
├── agents/                17 role definitions, repository wide
│   ├── core/               4
│   ├── development/        5
│   ├── design/              1
│   ├── security/            1
│   ├── testing/             2
│   ├── documentation/       1
│   └── devops/              3
├── security/              10 skills
│   ├── secure-development/ 8
│   └── security-assurance/ 2
├── research/               5 skills
├── career/                 7 skills
├── opportunity/            9 skills
│   ├── ideation/           3
│   ├── hackathons/         3
│   └── business/           3
├── config/                configuration template and field reference
├── control-center/        optional local dashboard, zero dependency
├── plugins/               per-domain plugin bundles, generated from the trees
├── .claude-plugin/        the plugin marketplace manifest
├── documentation/         overview.md holds the long form of the README
└── tests/
```

The eight trees do not depend on each other. `shared/` is the exception by
design: it depends on nothing and is called by all the others, which is verified
by `tests/validate-orchestration.sh` check 13. Each of the other trees has one
constitution that depends on nothing, so any tree can be installed and used on
its own.

## Trees and their constitutions

Each tree has exactly one constitution. Every skill in it refers to that file
and none restates it.

| Tree | Constitution | Governs |
|---|---|---|
| `writing/` | `core/writing-constitution` | fiction, poetry, screenplay |
| `documents/` | `documentation/document-core` | delivered documents |
| `engineering/` | `dev-skills/engineering-core` | any change to a system |
| `engineering/` | `devops-skills/devops-core` | anything that runs |
| `shared/` | none | usable alone, in any domain |

## Isolation principle

One skill equals one directory. No skill depends on the internal content of
another: it consumes only the outputs declared in its metadata block. That
rule allows a skill to be added, replaced or removed without breaking the
rest.

Mandatory structure:

```
skill-name/
├── SKILL.md      the expertise, main document
├── README.md     summary, inputs, outputs, dependencies, configuration
├── examples/     at least one worked example
└── resources/    at least one grid, checklist or reference
```

Skills install flat, one directory per skill name.
`tests/validate-structure.sh` refuses two skills sharing a name, so a flat
target never loses one to another.

## Metadata

Every `SKILL.md` opens with a YAML block:

```yaml
---
name: skill-name
description: What the skill does, then when to use it, with the terms that
  should trigger it.
license: MIT
metadata:
  category: core | genres | poetry | quality
            | documentation | administrative | publishing
            | dev-skills | delivery-skills | devops-skills
            | shared
  version: 2.0.0
  depends_on: [required skills]
  outputs: [artefacts produced]
---
```

`name` and `description` sit at the top level: both are required for a skill
to be discovered and loaded by an agent. `name` must match the directory name,
and `category` must match the basename of the group directory. Project
specific metadata is grouped under `metadata`, where it does not interfere
with loading.

Descriptions are English and at least forty characters, so that selection has
something to work with.

## Section contract

Every `SKILL.md` carries an `Auto-critique` section with a numeric threshold.

The English procedural trees, `documents/`, `engineering/` and `shared/`,
additionally carry a numbered `Protocol` section and an `Interfaces` section.
Both are verified by `tests/validate-structure.sh`. The writing tree names its
procedure in ways inherited from its own domain and is exempt from that pair.

## Language

Three layers, kept apart.

| Layer | Value |
|---|---|
| Skill language | English, all 156 skills and all 17 agents |
| System language | English: paths, identifiers, config keys, commits, technical documentation |
| Output language | the recipient's, set per project in the configuration |

The writing tree is written in English and produces French by default, because
the craft it encodes is French. Its `resources/` and `examples/` stay French:
they are reference data and worked samples of the output, not instructions.

## Dependency graph

### writing

```
writing-constitution
        |
        +-- research-director --> world-builder --> immersion-director
        |                              |
        +-- character-psychologist ----+
        |                              |
        +-- novel-architect -----------+--> timeline-manager
                    |                            |
                    +--> chapter-architect --> scene-builder
                    |                            |
                    +--> saga-architect          +--> narrator
                    |                            +--> dialogue-master
                    +--> screenwriter
                                                 |
                              continuity-manager <+
                                                 |
                          self-critique-protocol <+
                                    |
        story-doctor <--------------+--------------> beta-reader
             |                                            |
        rewriting-engine                            literary-critic
             |                                            |
        literary-editor --> proofreader --> publication-review
```

### documents

```
document-core
    +-- technical-writing | user-documentation | report-writing
    +-- administrative-writing
                    |
            document-design
                    |
             pdf-production
```

### engineering

The graph for `dev-skills` is in `engineering-system.md` section 7, with the
mandatory gates and the task categories. The fourteen delivery phases are in
`delivery-system.md`.

### shared

None. `self-critique` and `project-brief` depend on nothing, which is what
allows every other tree to call them.

## Shared resources

`writing/resources/` holds what would otherwise be duplicated: typography,
narrative structures, lexicons, project templates. A skill refers to them and
never copies their content.

## Configuration

`config/` holds the template and the field reference. Values live outside the
repository, at `~/.claude/craft.config.yaml` by default.

Skills name the fields they read and state what happens when one is missing.
No skill embeds a value. Identity fields have no default and never will: a
skill that cannot resolve them stops and names the missing field.

The `delegation` section decides which actions the agent performs and which it
prepares and hands over. Everything handed over is written to
`craft-manual-tasks.md` next to the configuration.

## Tests

`tests/` holds five scripts with no external dependency beyond `python3`.

- `validate-structure.sh`: the mandatory files and directories of every skill,
  the metadata block, duplicate skill names, the `Protocol` and `Interfaces`
  sections for the procedural trees, and the presence of every index and
  documentation file.
- `validate-rules.sh`: the repository-wide prohibitions on every Markdown
  file: emoji, em dash, credential-shaped strings, hardcoded personal
  identity, plus French typography warnings scoped to `writing/`.
- `validate-orchestration.sh`: thirteen checks on internal coherence:
  execution plans, delivery phases, mandatory gates, routing scenarios,
  declared dependencies across every tree, `Interfaces` cross references, agent
  definitions, the document pipeline, and the independence of `shared/`.
- `validate-plugins.sh`: the per-domain plugin bundles stay in sync with the
  trees, and the marketplace and manifests are well formed.
- `validate-model-routing.sh`: the `model-routing` skill's fixtures match its
  own tier table, with no live model call.

## Extending

Adding a skill: create the directory with its four elements, declare the
metadata, refer to the constitution of its tree without restating it, add at
least one example and one resource, update the category index and
`skills-guide.md`, then run the five scripts.

For a skill in `documents/`, `engineering/` or `shared/`, four further
requirements: a numbered `Protocol` section, an `Interfaces` section, and for
the engineering tree membership of at least one execution plan or delivery
phase. Detail in `engineering-system.md` section 9, `delivery-system.md`
section 11 and `documents-system.md` section 9.

Adding an agent: the file in `agents/<group>/`, its eight mandatory
sections, an entry in `agents/README.md`, and its name added to
the expected list in `tests/validate-orchestration.sh`.
