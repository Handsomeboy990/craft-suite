# Sizing to composition

How the one classification of `SKILL.md` feeds the chief's composition step:
phase depth, team shape, parallel waves, and what happens when the scope
moves. The composition procedure itself is `delivery-orchestrator`'s
`resources/team-routing.md` section 5, and the waves are its
`resources/parallel-dispatch.md` section 4; this file says only what the size
contributes to them.

## 1. Two classifications, each produced once

```
request    produced once, before composition, by whoever composes: the
           chief for a project, engineering-orchestrator for a single task.
           Read by phase depth, team shape, wave plan, verification depth.
slice      produced once per dispatch, when the slice is cut: a task of
           delivery-planning, or a part from decomposition, SKILL.md
           section 6. Read by model-routing for that dispatch, and recorded
           in the dispatch record's Model field.
```

A slice that carries the request's driving risk signal classifies at least at
the tier that signal reached: the risk travels with the smallest slice that
touches it. A slice that does not carry it is classified on its own signals.

No consumer re-derives either classification. A consumer that disagrees with
one asks for a reclassification, section 4, with its evidence; it does not
compute a private tier and act on it.

### Text-only steps

Some slices only transform text the dispatcher already holds: a title for a
pull request, a summary of a returned handoff, a compaction into
`project-continuity`'s sections, a reformat of a table. Such a slice is sized
by what it actually does, not by the request it serves:

```
files, systems     none: it reads no file and touches no system   TRIVIAL
dependencies       none                                            TRIVIAL
testing            none: no behaviour changes                      TRIVIAL
reasoning          mechanical, or one inference step               TRIVIAL or LOW
rollback           the dispatcher discards the text                TRIVIAL
```

It is dispatched with no tools and no write surface; the dispatcher writes
its result, and `model-routing` section 5 routes it to the smallest tier. The
request's driving risk signal does not travel into it, because it touches
nothing that carries the risk.

Not a text-only step, whatever its length: a verdict, a gate decision, a
security finding, a review of another dispatch's work, or a summary that a
gate will read in place of the evidence. Each of these is a judgement, and is
classified as the work it judges.

## 2. Phase depth

`delivery-orchestrator` section 3 sizes phases 1 to 6 as small, medium or
large. That scale describes surfaces, integrations and migrations, so it
reads the breadth signals of the request classification, files (1), systems
(2) and dependencies (6), plus architectural impact (3), which is where a
migration or a new boundary shows. Signal 3 stays a risk signal for
decomposition, `SKILL.md` section 6.

| Highest of signals 1, 2, 3, 6 | Phase depth |
|---|---|
| TRIVIAL or LOW | small |
| MEDIUM | medium |
| HIGH or CRITICAL | large |

The other risk signals (4, 9, 10, 11) do not change the page count. They change gate
strength: a risk signal at HIGH or CRITICAL brings in the independent
verification pass and the agent whose condition the signal meets, such as
the security-engineer agent for signal 4. A small project with a CRITICAL
risk signal keeps a one page proposal, and the risk section of that page is
written in full. Depth is never zero: the validation gate holds at every
size.

## 3. Team shape and waves

The tier shapes the team. The conditions of `team-routing.md` section 2
decide its membership. A tier never adds an agent whose condition is unmet,
and never removes one whose condition is met. Every team carries the
independent gates the work reaches, the final-verifier agent always.

| Request tier | Team shape | Waves |
|---|---|---|
| TRIVIAL | the row's minimum team, which a TRIVIAL task rarely extends; the owning implementer leads itself | one write dispatch, then its verification; no parallel wave |
| LOW | the minimum team plus agents whose condition is met | one write wave; read-mode verification may run in parallel |
| MEDIUM | as LOW; the principal-engineer agent leads when two or more implementer surfaces are touched | a contract wave when a contract changes, then implementation across it, then verification |
| HIGH, breadth driven | decomposed per `SKILL.md` section 6; each slice is its own dispatch | slices in parallel when their write surfaces are disjoint, then one integrator for the hot files |
| HIGH, risk driven | not decomposed; one writer holds the risky slice | sequential on the risky surface; its verification in a read wave once it lands |
| CRITICAL | as HIGH, plus the independent verification pass and the agent whose condition the driving signal meets | the risky slice never shares a wave with another writer on its surface |

Breadth, not tier, is what makes work parallel. A HIGH task driven by risk
gains nothing from more writers; a HIGH task driven by breadth gains a wave
per contract. A wave with one dispatch is a correct outcome, not a failure to
parallelise.

## 4. Re-sizing when the scope changes

The request classification is revised, never silently kept, on:

- new evidence that contradicts a rated signal, `SKILL.md` section 7;
- a change approved through `scope-and-change-control`;
- a rescope or an added requirement accepted by the human, per
  `delivery-orchestrator`'s `resources/handoff-and-escalation.md` section 4;
- a slice decomposed further, or two slices merged.

Not a trigger: slippage alone, schedule pressure, or a weak returned output.
A weak output is `model-routing`'s `output-quality-failure`: it strengthens
the model of that dispatch and leaves the classification unchanged.

One re-size is one event, read by every consumer in this order:

1. Announce it in one line, with the signal that moved.
2. The composer re-composes the team: each agent added states its condition,
   each agent released is named.
3. Waves not yet started are re-planned. A dispatch in flight keeps its
   record until it returns; one whose surface the change moved is stopped and
   redispatched with a new record rather than left to drift.
4. Every affected dispatch is re-routed through `model-routing`'s
   reclassification trigger, with an escalation record in the routing log.
5. Phase depth is reviewed. Before phase 5 a larger size enlarges the
   proposal; after phase 5 a size change that moves the architecture is
   change control, not a re-size.
6. A smaller size never removes a gate the work already reached. It releases
   an agent or lowers a model tier only when the signal that justified it is
   gone.
