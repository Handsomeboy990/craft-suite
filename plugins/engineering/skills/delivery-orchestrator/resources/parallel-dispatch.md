# Parallel dispatch

How the chief runs several agents at once without two of them colliding, and
how it proves there is no conflict before any pull request is opened.

SKILL.md section 6 states the rule: parallelise across a contract, never
across an unknown. This file is the procedure that applies it.

## 1. The dispatch record

No agent is dispatched on a sentence. Every dispatch carries this record,
written before the agent starts and kept in the continuity note.

```
Dispatch    D<wave>.<n>
Agent       <exact agent name>
Lead        <the domain lead it reports to, or the chief>
Task        <one outcome, with its acceptance items>
Mode        read | write
Surface     <files and directories it may write; "none" in read mode>
Permits     <one allow | ask | deny per action class, section 1.1>
Contract    <the fixed artefact it builds against, by path>
Inputs      <the handoff blocks and documents it starts from, and the
            tracked convention file of each directory in its surface>
Base        <branch and commit it starts from>
Branch      <its own branch, one per write dispatch>
Model       <tier, resolved with model-routing>
Exit        <the evidence that closes it: command and expected result>
Returns     the handoff block, to <lead or chief>
```

Three fields carry the safety of the whole wave: `Mode`, `Surface` and
`Permits`.

### 1.1 Permits, as data

`Mode` and `Surface` say what may be written. `Permits` says what else the
dispatch may do, as rules a checker can read rather than intentions in prose.
Each rule names an action class, an optional pattern, and one of three values.

```
action classes   write, run, network, outside-repo, dispatch, plus any
                 action the delegation configuration names (commit, push,
                 pull request, deployment, database operation)
values           allow    done without asking
                 ask      stopped and handed to the rung above, section 2 of
                          handoff-and-escalation.md
                 deny     never done; a need for it is reported in Known issues
evaluation       the last rule that matches wins; an action no rule matches
                 is ask, never allow
```

```
Permits   write allow (inside Surface); run allow (the project's test and
          lint commands); network deny; outside-repo deny; dispatch deny;
          push ask
```

`write allow` never reaches outside `Surface`, whatever the pattern says, and
an `allow` never overrides a stop of `handoff-and-escalation.md` section 3 or
an action the `delegation` configuration keeps: those are `ask` or `deny` by
construction. Read mode is `write deny`.

### 1.2 What a sub-dispatch inherits

A dispatch may start further dispatches only when its agent definition grants
the dispatch tool in its `tools` field: today the chief, `principal-engineer`
and `design-director`. Every other agent holds `dispatch deny`, and a
specialist that needs more hands reports it to its lead; it does not
dispatch. Nesting stops at one level below a lead: chief, lead, specialist,
never deeper.

When a lead does dispatch, the child's record starts from the parent's
restrictions, not from its grants:

```
inherited       every deny of the parent, every action the delegation
                configuration keeps, every pending stop, and outside-repo
                rules
not inherited   any allow; each is granted again, explicitly, in the
                child's own record
surface         a subset of the parent's surface, never larger
```

A restriction placed on a dispatch binds everything that dispatch starts. A
permission does not travel.

## 2. Read mode and write mode

Separate looking from changing. An agent in read mode explores, maps, audits
or plans; it writes nothing in the repository, and its output is a handoff
block. An agent in write mode changes only its named surface.

```
read      checkup, source-of-truth, codebase-cartographer (writes only its
          map), researcher, design-research, design-verification,
          compliance-verifier, final-verifier, pr-reviewer, web-auditor in
          passive mode, any planning pass
write     implementers, documentation-engineer, devops-engineer,
          ci-cd-engineer, release-engineer, pr-author, a reviewer that also
          fixes
```

Any number of read dispatches run in parallel against a stable base. Write
dispatches run in parallel only when their surfaces are disjoint, section 3.
A reviewer that may fix is a write dispatch, whatever its title says.

## 3. Disjoint surfaces

Before a wave starts, the chief lists the declared surfaces and intersects
them. The wave runs in parallel only if every pair is empty.

```
D2.1 backend-engineer    src/api/orders/**, src/services/orders.ts
D2.2 frontend-engineer   src/app/orders/**, src/components/order-*/**
D2.3 documentation-eng.  docs/orders.md
intersection             none           -> parallel
```

### Hot files

Some files are written by nearly every change. They are never in two
surfaces of the same wave. One integrator owns them, and applies their edits
serially after the wave lands.

```
indexes and registries     README tables, category indexes, route maps
counts                     any file a validator checks a number in
changelog                  CHANGELOG and release notes
dependency manifests       package manifests and lock files
migrations                 the migration directory and its ordering
shared contracts           the API or schema contract the wave builds against
generated output           bundles, compiled assets, plugin copies
```

The integrator is one agent the chief names in the wave plan, usually the
writer whose domain owns most of the hot edits. The chief decides what goes
into a hot file; it does not type the edit, because it does not implement. A specialist that finds it needs a hot file stops and reports it
in `Known issues`; it does not edit the file.

### When the surface is not yet known

A task whose surface cannot be stated is not ready for parallel dispatch. It
runs first, alone, or a read dispatch maps its surface before the wave. On a
large repository that read dispatch is `codebase-cartographer`, and the map is
checked for freshness against the base commit before any surface is drawn
from it; a stale node is re-read from source, never trusted.

## 4. Waves

Work is grouped into waves. A wave is a set of dispatches that can run at the
same time; the next wave starts from what the previous one landed.

```
Wave 0   read only: exploration, map, checkup, research
Wave 1   the contracts: schema, API contract, design tokens, one writer each
Wave 2   implementation across the fixed contracts, disjoint surfaces
Wave 3   integration: the hot files, generated output, one integrator
Wave 4   verification: review, tests, audit, read mode, in parallel
Wave 5   packaging: pull request, then the independent review
```

Not every project has every wave. A wave with one dispatch is sequential
work, and that is a correct outcome, not a failure to parallelise.

Sequential, always:

- anything after an approval gate waits for the approval;
- a write that depends on another write's result;
- two writers on the same file, in any arrangement;
- a security audit of code still being written;
- a fix after a review that found the defect.

## 5. Preventing conflicts before a pull request

The chief does not open, or let `pr-author` open, a pull request until this
check passes on every branch of the wave.

1. **Surface held.** The files the branch changed are inside its declared
   surface. A change outside it is a finding: either the surface was wrong
   and the wave plan is corrected, or the agent drifted and the change is
   moved or dropped.
2. **Pairwise disjoint.** The changed file lists of every pair of branches in
   the wave do not intersect.
3. **Fresh base.** Each branch is rebased on the latest integration branch,
   and the rebase is clean.
4. **Verification re-run.** The project's checks run again on the rebased
   branch. A green run on the old base proves nothing about the new one.
5. **Hot files last.** The integrator's branch is rebased after every other
   branch of the wave has landed, and re-verified.

```
changed(A) = files changed on A since the base
changed(B) = files changed on B since the base
changed(A) and changed(B) share no file   -> may proceed
any shared file                           -> sequence, section 6
```

## 6. Resolving a conflict

When two branches do touch the same file, or a rebase stops:

1. Stop both pull requests. Neither merges on the hope that the other will
   adapt.
2. The branch that landed first stands. The later one rebases onto it.
3. A textual conflict with an obvious resolution is resolved by the later
   branch's owner, then step 4 of section 5 runs again.
4. A semantic conflict, where both sides are right about different things, goes
   to the lead of the domain that owns the file, or to the chief when two
   domains own it. It is resolved by a decision, recorded, not by a merge tool.
5. A conflict that contradicts the approved architecture is change control,
   `scope-and-change-control`, not a merge.
6. Never force push over another agent's work, never resolve by deleting the
   other side, never weaken a check to get a green run.

The cost of a conflict found here is one rebase. The cost of one found after
merge is a broken integration branch for every agent at once.

## 7. Collecting results

A wave closes when every dispatch has returned its handoff block and its
`Exit` evidence is reproduced, not merely reported. A dispatch that returns
without evidence is not closed; it is redispatched once, one model tier
stronger per `model-routing`, and a second failure is a blocker reported to
the chief, never a third attempt.
