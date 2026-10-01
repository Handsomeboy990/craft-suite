# codebase-mapping

Builds and keeps a durable structural map of a codebase, so agents read the
map instead of re-reading the repository at every session, and stop trusting
it the moment the code has moved.

## What it produces

| Output | Content |
|---|---|
| `codebase-map` | the index of subsystems, the entry point any agent reads first |
| `subsystem-nodes` | one short file per subsystem: purpose, entry points, surface, ownership, dependencies, tests, key files, evidence |
| `wiring-graph` | symbols and edges with file and line, parsed or marked heuristic |
| `staleness-report` | which nodes no longer match the current tree, and why |

## Inputs

The repository, the commit to map, the scope (repository, workspace or
federation), and the project's convention for generated documentation.

## How it differs from its neighbours

| Skill | Answers |
|---|---|
| `project-exploration` | what is true in this repository, for this session |
| `codebase-mapping` | the same facts, kept on disk, stamped with a commit, regenerated as the code changes |
| `token-optimization` | the discipline of reusing such a document instead of re-exploring |

## Dependencies

`engineering-core`, `project-exploration`.

## Configuration

None of its own. The map's location and whether the wiring layer is committed
are project decisions, recorded with `decision-records`, never hardcoded here.

## Prior art

The approach, a deterministic structural graph first and optional summaries
second, with per-subsystem nodes that agents query instead of the tree, follows
the idea behind open-source context layers for coding agents such as Graft
(MIT). This skill states the method in the suite's own terms; no code or text
from those projects is reused.
