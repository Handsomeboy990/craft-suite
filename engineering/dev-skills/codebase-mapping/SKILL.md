---
name: codebase-mapping
description: Builds and maintains a durable, versioned structural map of a codebase that agents consult instead of re-reading the repository: one node per subsystem, a symbol-level wiring graph, the commit it was built at, and incremental regeneration of only what changed. Answers map, skeleton, callers and trace queries from the map, and falls back to the source the moment a node is stale. Use on a repository too large to re-explore each session, before multi-agent work, and whenever exploration keeps repeating itself.
license: MIT
metadata:
  category: dev-skills
  version: 1.0.0
  depends_on: [engineering-core, project-exploration]
  outputs: [codebase-map, subsystem-nodes, wiring-graph, staleness-report]
---

# Codebase Mapping

`project-exploration` turns an unknown repository into verified facts for one
session. This skill keeps those facts. It produces a map that lives in the
repository, survives the session, records exactly which commit it describes,
and is regenerated piece by piece as the code moves, so the next agent reads a
few hundred lines of map instead of the whole tree.

A map is a cache of the code, and it obeys the rule every cache obeys: it is
only useful while it is true. Everything below is organised around keeping it
true, and around refusing to trust it the moment it is not.

## 1. When a map earns its cost

Build one when at least one of these holds:

- the repository is large enough that an L3 exploration, per
  `project-exploration`, takes more than one context's worth of reading;
- several agents, or several sessions, will work on the same codebase;
- the same questions (where is X defined, who calls Y, what does subsystem Z
  own) are being answered by re-reading code more than once;
- a monorepo or a multi-repository layout hides how the pieces connect.

Do not build one for a small repository, a one-off fix, or a codebase about to
be replaced. Say so and use `project-exploration` alone. A map nobody will read
twice is waste written to disk.

## 2. The three layers

```
index        one short file listing every subsystem node, with its one-line
             purpose and its path; the entry point an agent reads first
nodes        one file per subsystem: what it owns, how it is entered, what it
             exposes, what it depends on, what depends on it, where its tests
             live, and the handful of files that matter
wiring       a machine-readable graph of symbols and edges: defines, imports,
             calls, implements, reads, writes; each edge carries file and line
```

A subsystem is a unit a person would name in conversation: the billing
service, the auth module, the design system package. It is decided from the
code's own boundaries, packages, workspaces, top-level directories, module
declarations, never from directory names alone.

A node is short. Its target is what fits on one screen. It summarises and
points; it never pastes source bodies. A node that has grown into a copy of the
code has stopped being a map.

## 3. Protocol

### Step 1, scope and location

Declare what is mapped: the whole repository, one workspace, or a federation
of repositories. Read the repository's convention for where generated
documentation lives; absent one, propose a single directory, for example
`docs/codebase-map/`, and record the decision with `decision-records` if the
team will rely on it. Decide, and record, whether the wiring layer is committed
or regenerated locally: it is derived data, and both choices are defensible.

### Step 2, structural pass, deterministic

Extract structure with tools that read the code rather than guess about it: a
language parser, the compiler's or the language server's own symbol output, or
the build tool's dependency graph. Where none is available, fall back to
pattern search and mark every edge so produced as `heuristic`.

This pass needs no model and must be reproducible: the same commit yields the
same wiring. Exclude everything `project-exploration` excludes: dependencies,
build output, vendored and generated code, lockfiles.

### Step 3, grouping into nodes

Cluster files into subsystems from the declared boundaries first, then from
the wiring's dense regions. For each node, record:

```
purpose        one sentence, from the code's own documentation or entry point
entry points   routes, exported functions, commands, consumers, jobs
public surface the symbols other subsystems actually use, from the wiring
owns           data, tables, files, state that only this subsystem writes
depends on     other nodes it calls, with the edge count
used by        nodes that call it
tests          where they live and how to run them
key files      at most a handful, each with one line on why it matters
evidence       file and line for every claim above
```

### Step 4, optional summary pass

A model may write the one-sentence purposes and tighten the prose. Every
sentence it writes is marked as a summary, sits next to the evidence it was
drawn from, and never introduces a fact the structural pass did not find. If
the structural pass did not parse a file, the summary pass says nothing about
it.

### Step 5, stamp

Write the commit the map was built from, the date, the tools and versions that
produced the wiring, and the list of what was excluded. A map without its
commit cannot be checked for staleness and is not delivered.

### Step 6, freshness check, before every use

Before answering anything from the map:

1. diff the current working tree against the stamped commit, and list the
   untracked files as well, since a diff against a commit does not show a file
   git has never seen;
2. map each changed, added, deleted or renamed file to the nodes and edges it
   belongs to; a file no node claims means a boundary may have moved, per
   step 7;
3. mark those nodes `stale`, with the files that made them so.

A stale node is never used as truth. The question is answered from the source
for that part, and the node is queued for regeneration.

### Step 7, incremental regeneration

Re-run steps 2 to 5 for the stale nodes only, then update the index and the
stamp. Rebuild the whole map only when the boundaries themselves moved: a new
workspace, a split package, a renamed top-level module. Record which it was.

### Step 8, answering queries

Four questions, answered from the map with evidence, and from the source
wherever a node is stale:

```
map        the index and the nodes relevant to a task, nothing else
skeleton   a subsystem's public surface: signatures and types, no bodies
callers    every edge into a symbol, grouped by node, with file and line
trace      the chain of edges from an entry point to a symbol, end to end
```

Each answer names the nodes it used and their freshness. An answer that leaned
on a `heuristic` edge says so.

## 4. Deliverable

```
index          the subsystem list, with paths and one-line purposes
nodes          one file per subsystem, per step 3
wiring         the symbol graph, with its format documented once
stamp          commit, date, tools and versions, exclusions
staleness      the nodes stale against the current tree, and why
decisions      location, committed or regenerated, and any boundary choice
```

Size target: the index under one screen; each node under one screen; the
whole human-readable map a small fraction of the source it describes. A map
that rivals the code in length has failed its purpose.

## 5. Prohibitions

- No answer from a stale node. The source wins, every time.
- No map delivered without the commit it describes.
- No fact in a summary that the structural pass did not find.
- No source bodies pasted into nodes; point at file and line instead.
- No secret, credential, environment value or personal data in any layer,
  even when it appears in the code being mapped. Name the location, never the
  value.
- No mapping of dependency sources, build output or vendored code.
- No silent mixing of parsed and heuristic edges.
- No map built where `project-exploration` alone would serve, and no claim
  that a map replaces reading the code a change actually touches.

## 6. Auto-critique

Score from 0 to 5: every claim carries evidence, the stamp is complete,
staleness was checked before use, nodes follow the code's real boundaries,
nodes stay within their size target, heuristic edges are marked, no secret
appears in any layer, regeneration touched only what changed.

Threshold: no axis below 3, average at least 4. A map used while stale, or
delivered without its commit, is below threshold whatever the other scores.

## 7. Interfaces

- Upstream: `engineering-core`, and `project-exploration`, whose census and
  maps are the raw material of the first build.
- Discipline: `token-optimization`, which says to reuse a canonical document
  instead of re-exploring; this skill is how that document is produced and
  kept true.
- Feeds: `architecture-design` with the real boundaries and dependencies,
  `refactoring` and `legacy-code` with callers before anything moves,
  `code-review-protocol` with the blast radius of a diff, `security-audit`
  with the entry points per subsystem.
- Records: `project-continuity` points at the map and its stamp;
  `decision-records` holds the location and commit policy;
  `technical-documentation` may link nodes from the developer docs, never
  duplicate them.
