# tests

Five scripts, no external dependency beyond `python3`. All five must pass
before any commit.

```bash
bash tests/validate-structure.sh
bash tests/validate-rules.sh
bash tests/validate-orchestration.sh
bash tests/validate-plugins.sh
bash tests/validate-model-routing.sh
```

`install.sh` runs the first one itself and refuses to install a repository
that does not pass it.

## validate-structure.sh

Verifies the mandatory shape of all 155 skills across the eight trees.

Per skill:

- `SKILL.md`, `README.md`, a non-empty `examples/`, a non-empty `resources/`;
- a YAML metadata block, with `name`, `description`, `license` and `metadata`,
  and under `metadata`: `category`, `version`, `depends_on`, `outputs`;
- `name` matching the directory, `category` matching the group;
- a description of at least forty characters, so selection has something to
  work with;
- an `Auto-critique` section;
- for `documents/`, `engineering/` and `shared/`, a numbered `Protocol`
  section and an `Interfaces` section;
- a README whose title matches the directory name;
- no duplicate skill name anywhere, since installation is flat and a
  collision would silently lose one.

Repository level: the root files, the expected directories, every tree and
category index, the configuration template, and every file in
`documentation/`.

## validate-rules.sh

Six checks over every Markdown file, `dist/` excluded.

| Check | Scope | Severity |
|---|---|---|
| 1, em dash | every file | error |
| 2, emoji and pictograms | every file | error |
| 3, credential-shaped strings | every file | error |
| 4, hardcoded personal identity | the four skill trees | error |
| 5, straight quotes in French prose | `writing/` only | warning |
| 6, repeated exclamation marks | every file | warning |

Check 3 looks for private key headers, live provider keys and token formats.
Check 4 looks for email addresses outside the reserved documentation domains
of RFC 2606 and RFC 6761, because a skill that names a real person has stopped
being reusable.

Check 5 is scoped to `writing/`. The rest of the repository is written in
English, where the straight quote is correct rather than a defect.

The arrow block, `U+2190` to `U+21FF`, is rejected by check 2 alongside emoji.
Diagrams are written with `->`.

Current state: 0 errors, 1 warning. The warning is a deliberate typographic
counter-example inside a French dialogue rules table.

## validate-orchestration.sh

Thirteen checks on internal coherence.

| # | Check |
|---|---|
| 1 | the system files exist |
| 2 | one classification and one plan per task category |
| 3 | every plan step names a real skill |
| 4 | mandatory gates present, and in the right order |
| 5 | the five reference routing scenarios resolve correctly |
| 6 | fourteen delivery phases, sequential, with approval gates at 02, 05, 10, 14 |
| 7 | no orphan engineering skill, absent from every plan and phase |
| 8 | every declared dependency resolves, in every tree |
| 9 | every `Interfaces` cross reference resolves, in every procedural tree |
| 10 | the fourteen agent definitions, with their eight mandatory sections |
| 11 | agents cite only real skills |
| 12 | the document pipeline: `document-core` declared, design before production |
| 13 | `shared/` depends on nothing, so every tree can call it |

Checks 8 and 9 resolve skill names across all eight trees, which is what allows
a documents skill to reference an engineering skill in its `Interfaces`
section without breaking.

Check 13 is the one that keeps `shared/` shared. A dependency added there
would make two trees depend on a third by transitivity.

## validate-plugins.sh

Verifies that the per-domain plugin bundles under `plugins/` are in sync with
the canonical skill trees, and that the marketplace and manifests are well
formed.

| Check | What it verifies |
|---|---|
| 1 | `marketplace.json` and every `plugin.json` are valid JSON |
| 2 | every marketplace source path exists and has a manifest |
| 3 | each plugin's skill set matches what its scope would install, regenerated into a sandbox and compared |
| 4 | the engineering plugin carries the 16 agents |

Check 3 is the one that catches drift: add a skill to a tree and forget to run
`bash plugins/build.sh`, and this fails, naming the domain to rebuild. The trees
are the source of truth; the bundles are generated from them.

## validate-model-routing.sh

Checks the `model-routing` skill's fixtures against its own tier table, with
no live model call, per its `resources/fixtures.json` and
`resources/tier-table.json`.

| Check | What it verifies |
|---|---|
| 1 | each base tier fixture's expected model and effort match the table |
| 2 | each override fixture references a real, declared override condition |
| 3 | each escalation or de-escalation fixture carries a reason and an actual tier change in the stated direction |

Requires only `python3`, reads two JSON files and asserts, no live model call
and no network access.

## Adding a skill

The five scripts are the acceptance criteria. A new skill passes when:

1. it has the four mandatory elements;
2. its metadata matches its directory and its group;
3. it carries `Auto-critique`, plus `Protocol` and `Interfaces` outside
   `writing/`;
4. its name collides with nothing;
5. its dependencies and cross references resolve;
6. for the engineering tree, it belongs to at least one execution plan or
   delivery phase;
7. its category index and `documentation/skills-guide.md` list it.

## Adding an agent

Check 10 fails both for a declared agent with no file and for a file with no
declaration. Add the name to `AGENT_NAMES` in `validate-orchestration.sh` in
the same change as the file.

## After moving anything

Run all five. Some of them resolve paths and fail cleanly by naming what is
missing.
