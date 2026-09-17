# Multi-agent architecture assessment

Written before any implementation, updated after phase 1 landed. Records what
existed, what phase 1 added, what remains, and why each call was made.
Superseded sections are marked rather than deleted, so a reader can see what
changed and why, not only the current answer.

## 1. What already existed

The repository already had a working, tested multi-agent layer before this
assessment was written. This mattered for scoping: the request that produced
this document described a system to build, and a large part of it was already
built, correctly, and passing its own tests.

| Capability | State found | Evidence |
|---|---|---|
| Skills | 152, across eight trees | `tests/validate-structure.sh`: 152 skills, 0 errors |
| Agents | 16, each with a full contract (Role, Mission, Responsibilities, Inputs, Outputs, Boundaries, Verification, Handoff, Skills) | `engineering/agents/*.md`, `tests/validate-orchestration.sh` check 10 |
| Handoff protocol | Seven fixed fields, worked example, guidance on the two fields that carry the most | `agents/handoff-protocol.md` |
| Task orchestration | `engineering-orchestrator`: 37 categories, a routing table, mandatory gates, exclusion rules, anti-loop rules, a completion verdict with three explicit states | `engineering/dev-skills/engineering-orchestrator/` |
| Project orchestration | `delivery-orchestrator`: 14 phases, four kinds of gate, phase depth scaled to project size | `engineering/delivery-skills/delivery-orchestrator/` |
| Per-domain distribution | 7 plugins generated from the trees, marketplace manifest, install by tree, category or single skill | `plugins/`, `.claude-plugin/marketplace.json`, `tests/validate-plugins.sh` |
| Local telemetry | Control Center: real session, token and tool data, zero fabricated metrics, a deterministic optimization advisor | `control-center/`, `docs/control-center-evolution.md` |
| Validation | Four scripts, structure, rules, orchestration, plugins, all green | `tests/` |
| Rename | `claude-writer-suite` to `craft-suite`, complete except deliberate historical mentions | this document, section 6 |

Nothing in this list needed to be built from nothing. The task was to extend
it without breaking it.

## 2. What phase 1 added

Scoped by an explicit conversation with the requester before any file was
touched, because the request as written asked for roughly fifty sections of
work in one pass, several of which duplicate what already existed, and one of
which described a Claude Code capability that does not exist as specified.
Rather than build on an unverified premise, three questions were asked, and
this phase was scoped to their answers: a routing core first, agents moved to
a repository-wide tree, new agents added only where a real boundary exists,
and model routing built on the two mechanisms this runtime actually supports.

| Addition | What it is | Why here, not deferred |
|---|---|---|
| `task-complexity` skill | five tiers from eleven signals, highest-signal-wins | every other addition in this phase reads it; it had to exist first |
| `model-routing` skill | model tier, and effort where a lever exists, from the classification | the second most requested capability in the source request, and the one with a real capability trap, see section 4 |
| `token-optimization` skill | the during-the-work discipline paired with the Control Center's after-the-fact measurement | requested explicitly as a first-class concern; implemented as policy, since no reliable per-task token measurement exists at authoring time to build a numeric budget on |
| Agents moved to `agents/<group>/` | `core`, `development`, `design`, `security`, `testing`, `documentation`, `devops`, `research` (reserved) | prerequisite for independent agent packs, requested in the source material's domain-independence rule |
| `tests/validate-model-routing.sh` | eleven deterministic fixtures checked against the routing table, no live model call | the source material explicitly required routing to be testable without live model calls |
| `model_routing` configuration section | three tier names resolved to real identifiers by the project | prevents a hardcoded model name from going stale, per the source material's explicit prohibition |
| This document, `AGENT_ARCHITECTURE.md`, `MODEL_ROUTING.md`, `TOKEN_OPTIMIZATION.md`, `SKILL_AGENT_MATRIX.md`, `ORCHESTRATION.md`, `docs/agents/README.md` | architecture documentation | requested explicitly, and the only way the routing decisions above are checkable by a reader who is not re-reading every skill file |

## 3. What is deferred, and why

Deferred by the same scoping conversation, not by oversight discovered later.

| Deferred item | Why it is a separate phase |
|---|---|
| `source-of-truth`, `checkup`, `final-verifier` agents | each is a real, distinct role with its own contract; adding them correctly means writing three more full agent definitions and their skill-selection logic, which is its own reviewable unit of work |
| A dedicated `model-router` agent | `model-routing` exists today as a skill, consulted by every orchestrator; whether a thin agent wrapper adds anything beyond that skill is a design question worth its own review, not a rubber stamp added to hit a section count |
| `pentester`, `design-research`, `design-verification`, `reproduction`, `research`, `compliance` agents | each requires the same care as the three above, and several depend on tooling (a Playwright-capable environment, an authorized target) that is a precondition, not a file to write |
| Installer per-agent-group selection | today's installer installs all sixteen agents together or none; splitting by group is an installer change, not an architecture change, and belongs with the agents that would make the split meaningful |
| Control Center agent-orchestration and model-and-token sections | superseded, see section 9: the collector now exists and the data is real. Only the browser panel remains |

## 4. The capability that does not exist as originally specified

The source request asked for a "Model Router / Model Strategy Agent" able to
determine, dynamically and during a task, "which Claude model" and "what
effort level" to use, with escalation and de-escalation happening as the
orchestrating session's own reasoning changes mid task.

Verified against this runtime's own tool definitions before writing anything,
rather than against a secondary source:

```
real       an agent definition's frontmatter can declare a default model
real       the orchestrating session can override that model per dispatch,
           when it hands work to a subagent
not verified   a running session changing its own model or reasoning depth
               mid task, without a human issuing a model command
not verified   a universal, per-agent effort control equivalent to the model
               override, outside a specific skill that defines its own
               effort parameter
```

A first search for these facts, run through a subagent, reported an `effort:`
frontmatter field as an existing capability. Its citation was a GitHub
feature-request issue, which is evidence that a capability has been
requested, not that it has been shipped. That claim was rejected, and the
`model-routing` skill was written to state exactly the two mechanisms that
are real and to recommend, never enforce, effort where no lever exists. This
is the concrete instance of the source material's own rule: do not create a
fake integration, and do not pretend a capability exists if the current
architecture does not support it.

## 5. What could conflict with the target architecture, checked and cleared

| Risk | Finding |
|---|---|
| Duplicating the existing skill-routing table (`engineering-orchestrator/resources/routing-table.md`) with a second, model-flavoured classification | Avoided: `task-complexity` is a distinct axis (risk and reversibility, not task category) and is declared upstream of both the existing skill router and the new model router, read by both, restated by neither |
| Duplicating the Control Center advisor's wasteful-pattern detection inside a skill | Avoided: `token-optimization` names the same seven patterns and states plainly which side is retrospective measurement and which is during-the-work discipline; one table in `SKILL.md` section 1 is the single point where the two are said to agree |
| A second, incompatible agent contract format | Avoided: every new consideration was added to the existing eight-section contract rather than inventing a ninth format; no new agent was created in this phase, so the contract itself was not exercised, only read |
| Breaking the flat installation, plugin generation, or the four existing validation scripts by moving `engineering/agents/` | Checked directly: all four scripts, plus the new fifth one, pass after the move; `git mv` used throughout, confirmed by `git status` reporting renames rather than delete-plus-add |
| Inventing a token metric the Control Center cannot actually measure | Avoided: `token-optimization` explicitly refuses to set a numeric token budget, stating that no reliable per-task measurement exists at authoring time; the Control Center's own real measurements are read, not duplicated or estimated |

## 6. The rename, checked for completeness

`claude-writer-suite` to `craft-suite` was already complete before this
phase. Eight residual mentions remain, all in `CHANGELOG.md`, `CONTINUITY.md`,
`AGENTS.md` and `documentation/architecture.md` and `overview.{md,fr.md}`,
and all of them are a historical statement of what the repository was called
at a past date, inside dated log entries or a changelog. None is a currently
asserted name, so none was changed; changing them would misrepresent history
rather than correct an error.

## 7. Compatibility considerations for phase 2

- Any new agent added later follows the group placement convention this
  phase established in `agents/README.md`, so the catalog does not need a
  second reorganisation.
- `task-complexity` and `model-routing` are dependencies any new agent's
  supporting skill can declare without waiting for a second review of their
  contract; both are stable as of this phase.
- The Control Center's telemetry gap (section 3) is a known, named limitation
  rather than a silently missing feature; when subagent dispatch produces
  real transcript evidence, `reader.py` gets a new collector and
  `advisor.py` a new detection function, per the extension points already
  documented in `docs/control-center-evolution.md`.

## 8. Migration strategy actually followed

1. Full repository audit before any file was touched, reported to the
   requester with the state found, what could be reused, and what would
   conflict, per section 1 through 5 above.
2. Four targeted questions asked in one batch, covering exactly the
   decisions that would change the shape of the work: phasing, agent
   directory layout, agent granularity, and the model-routing capability
   claim.
3. The uncommitted working tree, 1458 files differing only in file mode with
   zero content change, restored to its committed permissions before any new
   work, so the diff of this phase is exactly this phase.
4. Agents relocated with `git mv`, verified as renames, before any new skill
   was added, so the routing skills were written against the final agent
   layout rather than a layout that would move again underneath them.
5. Each new skill written, then immediately checked against the validation
   suite, then the suite extended with the one new script the new skill
   required, in that order, so no skill was written against a check that did
   not yet exist to catch its own mistakes.
6. Every numeric count in prose, 152 to 155 skills, four to five scripts,
   swept repository-wide and verified by grep to have no remaining stale
   occurrence outside a dated historical record.

## 9. The first real run of the agent layer

Everything in sections 1 through 8 was architecture. This section is what
happened when the architecture was executed on a real task for the first
time: building the Control Center's agent-dispatch telemetry collector,
dispatched across three agents. It is recorded here because the failures are
more useful than the successes.

### What the design got right

**The classification's asymmetry earned its keep immediately.** The task
rated LOW or TRIVIAL on ten of eleven signals and MEDIUM on one, sensitive
data exposure, because a Task tool_use block's input carries the dispatching
prompt, which can hold a credential. Under an averaging rule the task would
have classified LOW, no security review would have been dispatched, and the
defect described below would have shipped. `task-complexity` section 4's
highest-signal-wins rule exists for exactly this shape, and this is the first
case where it was load-bearing rather than theoretical.

**Differential routing inside one task was real, not decorative.** Three
dispatches, three different decisions: implementation at the balanced tier,
security review escalated to the strongest tier by the section 5 security
override, quality review at balanced. The requested model is recorded in the
transcript, so this is measurable after the fact rather than self-reported;
the report now shows `by model: sonnet 2, opus 1, default 1`.

**Independent review found what self-review had missed.** The implementing
agent verified its own work honestly and its claims were true as far as they
went. The two reviewers, reading the same code with different remits, found
seven security findings and three test-suite defects between them, including
two that matter:

```
the privacy boundary was bypassable   a non-string subagent_type was passed
                                      through str(), which renders a nested
                                      object whole, re-importing the prompt
                                      field the collector deliberately never
                                      reads

one metric could only ever be zero    the sidechain scan used a two-level
                                      glob; subagent transcripts live one
                                      level deeper, so the report printed
                                      "none recorded" over hundreds of
                                      unread records
```

Both were invisible to the implementer, who had tested the boundary and seen
it hold, because both tests and implementation shared the same blind spot.
The quality reviewer separately found a `check(..., True)` assertion that
could never fail, inflating the reported pass count while claiming coverage
its scenario did not provide.

### What the design got wrong, and it was the orchestrator

The two reviewers were dispatched **in parallel, both with authority to
modify the same two files**. `delivery-orchestrator` section 6 already states
the rule this violates: parallelise across a contract, never across an
unknown. Two review-and-fix agents sharing a write surface have no contract
between them. The quality reviewer detected the concurrent edits mid-review,
moved its mutation testing into an isolated copy, re-diffed before finishing,
and disclosed the episode in its `Known issues` rather than asserting that
nothing was lost. No work was lost, as far as anyone can establish, but that
outcome was owed to one agent's discipline, not to the orchestration.

The rule existed and was still violated, which means the rule was not
operational. Section 6 spoke of contracts without saying what a contract is
between two reviewers. The correction is in `ORCHESTRATION.md` and in
`delivery-orchestrator` section 6: parallel agents sharing a file surface are
read-only, or they are sequenced.

### The honest cost

```
implementation     roughly 96,000 tokens, 10 minutes
security review    roughly 138,000 tokens, 21 minutes
quality review     roughly 142,000 tokens, 15 minutes
```

Roughly 376,000 tokens and three quarters of an hour, for a collector of a
few hundred lines. A single context would have produced something that ran.
It would not plausibly have produced the two-level glob finding, which
required someone to go looking for the files the scan could not see rather
than trusting a zero, nor the `str()` finding, which required constructing a
hostile transcript rather than a well formed one. Whether that trade is worth
making is a judgement per task, which is precisely what `task-complexity` and
`model-routing` exist to make deliberately rather than by habit. On a
TRIVIAL or LOW task it would plainly not be worth it, and the routing table
says so.

### What was corrected in the suite as a result

- The parallelisation rule, made operational rather than aspirational.
- Two documents in this repository that stated an unlooked-for zero as a
  measurement, `TOKEN_OPTIMIZATION.md` and this one. The same two-level glob
  mistake that the security review found in the collector had already been
  made in this repository's own prose, by the same reasoning, and was
  repeated because nobody checked whether the scan could see what it claimed
  to have counted.
