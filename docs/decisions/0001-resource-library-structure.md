# ADR 0001: resource-library structure

Date: 2026-10-01
Status: accepted
Supersedes: none

## Context

The suite is turning from a library of knowledge into a library of resources.
A skill is knowledge an agent reads; a resource is also code a project
installs and runs. The two are built and verified differently, and the current
layout gives code no home: the only shippable code today, the two site
examples under `engineering/dev-skills/site-template-generation/examples/`, is
duplicated, twenty-nine files byte-for-byte identical between the two, and
copied again into `plugins/`.

Forces:

- The eight skill trees at the repository root are depended on by `install.sh`
  (its per-tree counts), `.claude-plugin/marketplace.json` (its `./plugins/*`
  source paths), the six validation scripts (hardcoded group paths), and
  `plugins/build.sh`. A move touches all of them.
- The maintainer wants the repository organised by domain, each domain holding
  its skills, its agents and its code, with one chief orchestrator over all
  agents.
- The direction and its reasoning are in
  `docs/architecture/RESOURCE_LIBRARY.md`, ratified by this record.
- Change rate: the layout is load-bearing and rarely changed; a wrong move is
  expensive to undo across the four dependents above.

## Options

1. Move every skill tree under a new top-level `domains/` directory, each with
   `skills/`, `agents/` and `libraries/`.
   Cost: rewrites every path in the four dependents and hundreds of links, for
   a tidier diagram and no reader benefit. High blast radius, reversible only
   by another equally large move.
2. Keep the skill trees at root (they are already the domains) and add a
   top-level `libraries/` directory for shippable code, one subdirectory per
   library, each with its own licence, tests and per-component documentation.
   Cost: "by domain" is split across two roots (the tree and `libraries/`),
   which a short note in each has to explain.
3. Put each library inside its domain tree, for example
   `engineering/libraries/ui/`.
   Cost: the tree paths the validation scripts walk now contain non-skill
   directories, so every script that lists a tree's children has to learn to
   skip them. Spreads the change back into the scripts option 2 avoids.

## Decision

Option 2. The skill trees stay at root. A new top-level `libraries/` holds
shippable code, one subdirectory per library, each self-contained with its own
`LICENSE`, tests and documentation. Agents and skills reference a library;
a project installs it. The per-domain agent team reports to the single
`delivery-orchestrator`; no second chief is added.

## Consequences

Positive: code gets a home without touching the installer, the marketplace,
the six validation scripts or the plugin build. The duplicated site code has
somewhere to be consolidated. A library ships and is licensed independently.

Negative: "organised by domain" is now split across the skill tree and
`libraries/`. `docs/architecture/RESOURCE_LIBRARY.md` and `libraries/README.md`
carry the note that explains why.

Operational: a library's contract (own licence, tests, per-component docs, a CI
guard) is enforced in CI. The guard lands with this record as an empty-safe
gate and tightens as the first library arrives.

## Reversal cost

Low while `libraries/` is empty or small: the directory can be removed or moved
with no dependent relying on its path yet. The cost rises with each library
that ships and each project that installs one, which is the usual reason to
record the decision before the code rather than after.
