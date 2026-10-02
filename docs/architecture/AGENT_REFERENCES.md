# Agent reference analysis

Phase 8.3, first task. What `sst/opencode` does in its agent and orchestration
layer, compared first-hand with what the suite's chief and orchestration skills
already say, and the principles the suite takes from it. Graft, the other
reference of 8.3, is recorded at the end from what was already read.

This is a `research-core` output in the shape of `UI_REFERENCES.md`. Every
claim below about opencode was read in its source at the commit named, and is
a fact unless it is labelled `inference`. Patterns and principles only: no
code, no prompt text and no identifier is copied, and what the suite ships is
written in its own terms.

```
reference       the real project, its code and prompts, owned by its authors
inspiration     the direction it gives, free to take
pattern         the reusable technique, stated in the abstract
implementation  the original change in the suite's skills, the only thing committed
```

## The reference, with licence

| Project | Licence (read) | Commit read | Stack |
|---|---|---|---|
| `sst/opencode` | MIT, `LICENSE` at the repository root, "Copyright (c) 2025 opencode" | `0112a92c416f5ad833d96e7a8308441f0a875d94`, 2026-10-01 | TypeScript on Bun, Effect, a typed HTTP API server with generated clients |

How it was read: a shallow clone of `github.com/sst/opencode`, outside this
repository. Its website was unreachable from this environment, so nothing here
rests on its documentation site; the source is the primary document. The
README's own badges and links name `anomalyco/opencode`, so the project may
have moved organisation; the clone of `sst/opencode` resolved and is what was
read. Files read: `packages/opencode/src/agent/` (agent definitions and the
subagent permission rule), `permission/` (evaluation and the ask, reply
cycle), `tool/task.*` (subagent dispatch), `tool/plan.ts` and the plan prompts,
`session/` (overflow, compaction, the loop detector, instruction loading),
`tool/truncate.ts`, `snapshot/index.ts`, `server/` and the repository's own
`AGENTS.md` files.

## What it is

An open-source terminal coding agent. A core process holds sessions, agents,
tools and permissions and serves them over an HTTP API; the terminal UI, the
desktop and web apps and the SDKs are clients of that API. Agents are
configuration, not code: a name, a mode, a permission ruleset, an optional
model and prompt.

## What the suite already says, and where opencode goes further

The suite's chief (`delivery-orchestrator` 1.1.0 and its `resources/`) already
holds most of what opencode encodes at runtime: read mode against write mode,
a declared write surface per dispatch, one integrator for hot files, waves,
redispatch one model tier stronger, an escalation ladder, and the human stops.
`engineering-orchestrator` section 6 holds five anti-loop rules and forbids
recursive orchestration. `project-continuity` holds a seven-section resumption
note. The patterns below are only the ones the suite does not yet state.

## Patterns worth taking, with the suite skill each would feed

### 1. Permissions as data: allow, ask, deny, last match wins

Every agent carries a ruleset of `permission, pattern, action` entries, where
the action is `allow`, `ask` or `deny` and the pattern is a wildcard over a
tool argument such as a path or a command. Rulesets are layered (built-in
defaults, then the agent's own, then the user's configuration) and evaluated
by taking the last matching rule; when nothing matches the answer is `ask`,
never `allow`. Examples from the defaults: reading `*.env` asks while
`*.env.example` is allowed; editing outside the project directory asks.

Principle: the dispatch record's `Mode` and `Surface` are a coarse form of the
same thing. A dispatch could carry an explicit three-valued rule per action
class (write, run, network, external directory), with `ask` as the default for
anything unlisted, so "not declared" means "stop and ask", not "allowed".
Feeds `delivery-orchestrator` `resources/parallel-dispatch.md` section 1.

### 2. Denies inherit downward; spawning is denied by default

When a subagent is spawned, its session receives every `deny` rule of the
parent's session, plus the parent's external-directory rules; the parent's
`allow` rules do not travel. A subagent may not spawn further subagents or
write the shared todo list unless its own definition grants it. Nesting is
capped by a configured depth, default one level.

Principle: a restriction placed on a dispatch binds everything that dispatch
starts, and a permission does not. The suite forbids recursive orchestration
(`engineering-orchestrator` section 5) but does not say that a specialist may
not dispatch further agents, nor that a kept action (`delegation`) or a denied
surface binds a sub-dispatch. Feeds `delivery-orchestrator` section 6 and
`resources/parallel-dispatch.md`; `docs/architecture/ORCHESTRATION.md`
records the structural rule.

### 3. Plan and build as two agents, with one writable file and an explicit switch

The `plan` agent is the `build` agent with every edit denied except the plan
file in a dedicated plans directory. Leaving plan mode is a tool call that asks
the user a yes or no question naming the plan file; only a yes switches the
session to `build`, with a synthetic message stating that the plan is approved.
The plan prompt structures the work in four phases: explore with at most three
parallel read-only explore agents (one when the scope is known), design,
review against the request, then write only the recommended approach with the
critical file paths.

Principle: the suite's phases 1 to 4 and the validation gate already separate
planning from building. What it does not state is the mechanical form: during
phases 1 to 4 every dispatch is read mode, and the only write surface is the
proposal document itself; the switch to write mode is the recorded approval,
quoted, and nothing else. Feeds `validation-gate` and `delivery-orchestrator`
section 4.

### 4. A step-level loop detector

The session processor watches the last three tool calls: if they are the same
tool with byte-identical input, it raises a `doom_loop` permission request
(default `ask`) before running it again.

Principle: `engineering-orchestrator` anti-loop rule 5 works at the plan level
("no progress twice in a row"). A step-level rule is missing: the same action
with the same input three times in a row is a loop, stopped and reported,
whatever the plan says. Feeds `engineering-orchestrator` section 6 and
`token-optimization`.

### 5. A rejection carries feedback, and cancels its siblings

A user can reject a permission request with a message; the message is returned
to the agent as a correction, not as a bare failure. Any rejection also
rejects every other pending request of the same session, so a parallel batch
does not keep asking after the user said no. Approving with "always" records
the pattern for the rest of the session; for shell commands the remembered
pattern is the command's prefix up to its subcommand (for example a package
manager plus its verb), not the whole line.

Principle: a human "no" at a stop applies to the whole pending batch of that
dispatch, and a "no, because" is a change of instruction to apply, not a
blocker to report. Feeds `delivery-orchestrator` `resources/handoff-and-escalation.md`
section 3.

### 6. Compaction with a fixed template and a merge rule

When a session reaches its usable context (the model's limit minus a reserved
output buffer), a hidden `compaction` agent with every tool denied writes a
summary in fixed sections: objective, important details, work state split into
completed, active and blocked, the next move as numbered concrete actions, and
relevant files. When a previous summary exists, the new one merges it with the
rule that the newer conversation wins on any conflict, that open objectives and
constraints are carried forward even if unmentioned, and that whatever is not
carried forward is lost. Recent turns are preserved verbatim within a budget,
and old tool outputs are pruned first while the outputs of skill loads are
protected.

Principle: `project-continuity` already has seven sections. Two things are new
to it: a `Next move` section that names the immediate concrete action (not
only `Remaining`), and the merge rule for updating an existing note, newest
wins and nothing open is dropped silently. The protection of loaded skill text
from pruning maps onto `token-optimization`: the governing rules are the last
thing to drop from context. Feeds `project-continuity` and `token-optimization`.

### 7. Oversized output goes to a file, not into context

A tool output above a line or byte limit (defaults 2000 lines, 50 KB) is cut,
the full text is written to a truncation directory, and the agent is told the
path; that directory is pre-allowed for reading so the agent can page through
it. Files there expire after seven days.

Principle: a large output is a file reference plus a head, never the whole
output pasted. `token-optimization` names "large output" as a signal; it can
name this remedy. Feeds `token-optimization` section 5.

### 8. Single-purpose hidden agents with no tools

Title generation, session summaries and compaction are each a hidden agent
whose ruleset denies every tool. They cannot act; they can only write text.

Principle: a step that only transforms text is dispatched with no write
surface and no tools, and is a candidate for the smallest model tier. Feeds
`model-routing` and `task-complexity`.

### 9. Instructions scoped by directory

The root `AGENTS.md` is loaded into every session (the first match walking up
from the working directory, not every ancestor). When the agent reads a file,
any `AGENTS.md` in the directories between that file and the root is attached
once, so boundary notes live next to the code they govern. The opencode
repository uses this itself: eighteen `AGENTS.md` files, one per package or
layer.

Principle: `codebase-mapping`'s per-subsystem nodes are the suite's equivalent;
a node could name the local convention file that governs its subsystem so that
a dispatch into it loads that file. Feeds `codebase-mapping` and
`project-exploration`.

### 10. One core behind a typed API, clients generated, dependency direction stated

The core runs as an HTTP API with typed route groups (sessions, permissions,
questions, files, events as a stream) and an OpenAPI description; the clients
are generated from it and the repository's `AGENTS.md` forbids editing the
generated code by hand. It also states a one-way dependency direction between
packages: schema, then core and protocol, then server; client code may depend
on schema and protocol but never on core or server. A server password is read
from the environment when the API is exposed.

Principle: for any product with more than one client, the contract is the
server's published API, clients are generated from it, and the package
dependency direction is written down and checkable. Feeds `api-design`,
`architecture-design` and `fullstack-engineering`.

### 11. Undo without touching the user's history

File snapshots are taken in a separate git directory, outside the project's
own repository, sharing its objects, so a session can be reverted without
creating commits or stashes in the user's history.

Principle, recorded only: an agent's own checkpoints never live in the user's
version control. The suite works through the user's git by design, under
`git-workflow`; nothing to change now.

## What not to take, and why

- **"The agent's outputs should generally be trusted."** The task tool's
  description tells the parent to trust a subagent's result. The suite's rule
  is the opposite and stays: a handoff without its evidence is returned, and
  `final-verifier` reproduces rather than trusts.
- **Allow-by-default for the main agent.** The `build` agent's base rule is
  `allow` for everything not listed. The suite keeps the human stops of
  `handoff-and-escalation.md` section 3 and the `delegation` configuration
  regardless of how capable an agent is.
- **Model-specific system prompts.** opencode ships a different base prompt per
  model family. The suite routes by tier with `model-routing` and keeps one set
  of skills; per-model prompt forks would multiply what must be kept true.
- **Plan prompts that forbid all edits in capitals.** The constraint is real;
  the suite states it as a dispatch field that a checker can read, not as
  emphasis.
- **Code and prompt text.** MIT would allow reuse with attribution; none is
  reused. Every principle above is stated in the suite's own words.

## Graft, as already recorded

Graft (`trailhq/Graft`, MIT) was read earlier from its README, and its idea is
already in the suite as `codebase-mapping` and the `codebase-cartographer`
agent (3.29.0): a durable structural map of a codebase, stamped with the commit
it describes, checked for freshness before use. It was not re-read in this
pass.

```
                     Graft (as recorded)             opencode (read here)
question answered    where is it, what calls what    who may do what, and when
unit                 a structural map, stamped        an agent: mode, ruleset, model
context strategy     read the map, not the repo       compact the session, spill large
                                                      output to files, scoped AGENTS.md
safety model         a stale node is not trusted      allow, ask, deny; denies inherit
suite home           codebase-mapping, cartographer   the chief's dispatch and stop rules
```

The two are complementary: Graft reduces what an agent must read; opencode
governs what an agent may do and how it survives a long session.

## Follow-ups

Skill changes recommended, none made in this pass:

1. `delivery-orchestrator` `resources/parallel-dispatch.md`: add a permission
   field to the dispatch record (allow, ask, deny per action class, `ask` by
   default), and the rule that denies and kept actions inherit into any
   sub-dispatch while permissions do not. Patterns 1 and 2.
2. `delivery-orchestrator` section 6 and `docs/architecture/ORCHESTRATION.md`:
   state that a specialist does not dispatch further agents unless its
   definition grants it, with a nesting depth of one by default. Pattern 2.
3. `validation-gate` and `delivery-orchestrator` section 4: phases 1 to 4 run in
   read mode with the proposal document as the only write surface; the switch
   to write mode is the quoted approval. Pattern 3.
4. `engineering-orchestrator` section 6: a sixth anti-loop rule, the same action
   with the same input three times in a row is a loop, stopped and reported.
   Pattern 4.
5. `resources/handoff-and-escalation.md` section 3: a human "no" cancels the
   whole pending batch of that dispatch; a "no, because" is applied as a
   correction. Pattern 5.
6. `project-continuity`: a `Next move` line and the merge rule (newest wins,
   nothing open is dropped silently). Pattern 6.
7. `token-optimization`: spill a large output to a file and pass its path;
   governing rules are the last thing dropped from context. Patterns 6 and 7.
8. `model-routing`: a text-only transform step runs with no tools and is a
   candidate for the smallest tier. Pattern 8.
9. `codebase-mapping`: a node names the local convention file of its subsystem.
   Pattern 9.
10. `api-design` and `fullstack-engineering`: one server contract, generated
    clients never edited by hand, a written package dependency direction.
    Pattern 10.

Not done in this pass: opencode's documentation site, unreachable from this
environment; the desktop, web and enterprise packages, not read; Graft, not
re-read.
