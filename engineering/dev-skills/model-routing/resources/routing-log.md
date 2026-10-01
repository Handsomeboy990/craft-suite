# Routing log

The durable record of every dispatch and every escalation, kept in the
project rather than only in conversation. `SKILL.md` section 7 writes to it on
every dispatch; section 6 writes to its escalation table on every
reclassification and every `output-quality-failure`. This file is the
template; a project keeps its own copy, typically next to its other
continuity records (for example `docs/AGENT_LOG.md`, or wherever
`project-continuity` keeps this project's running state).

## Why a log, not only an announcement

Section 8's announcement is read once, in the moment, by whoever is watching
the session. The log is read afterward, by a different agent, a reviewer, or
the project owner asking why a given dispatch cost what it cost. A default
that was silently applied, an override that fired, or an escalation that
happened twice on the same task are all findings that only survive if they
are written down where the next reader can see them.

## Dispatch table

One row per dispatch, appended, never edited after the fact. A correction is
a new row, not a rewrite of an old one.

| # | Dispatch | Agent | Task | Complexity | Model tier | Resolved model | Override fired | Reason | Outcome |
|---|---|---|---|---|---|---|---|---|---|
| 1 | D0.1 | `researcher` | Verify the vendor's uptime claim | MEDIUM | balanced | sonnet | none | table default | confirmed, one source, no contradiction |
| 2 | D2.1 | `backend-engineer` | Reset-token comparison | HIGH | strongest | opus | security-driving-signal | authentication surface | passed review |
| 3 | D2.2 | `frontend-engineer` | Rename a shared prop across three components | LOW | fast | haiku | large-mechanical-output | mechanical, no judgment calls | passed review |
| 4 | D4.1 | `final-verifier` | Reproduce the reset-token evidence | LOW | strongest | opus | independent-verifier-floor | verifies dispatch 2, routed strongest | reproduced, done |

Columns:

- **#**: sequential, one per dispatch, never reused.
- **Dispatch**: the dispatch id of the chief's dispatch record,
  `D<wave>.<n>`, so each worker of a parallel wave has its own row. Rows 2
  and 3 above are two workers of one wave, routed separately.
- **Agent**: the subagent type dispatched.
- **Task**: one line, enough to identify it later.
- **Complexity**: the `task-complexity` tier at dispatch time.
- **Model tier**: `fast`, `balanced` or `strongest`, from section 3 or an
  override.
- **Resolved model**: the real identifier passed through the dispatch
  override, per `routing-policy.md`. If the default mapping was applied
  because `model_routing` was absent or empty, say so here rather than
  leaving the reader to infer it, for example `haiku (default mapping)`.
- **Override fired**: the `id` from `tier-table.json`'s `override_conditions`
  when one applied, otherwise `none`.
- **Reason**: the specific evidence, not a restatement of the tier name.
- **Outcome**: what happened to the work this dispatch produced, so a later
  reader can see whether the routing decision held up.

## Escalation and de-escalation table

One row per escalation record from `SKILL.md` section 6, in either direction.

| # | Dispatch # | Trigger | Prior | New | Reason | Failed output kept | Outcome |
|---|---|---|---|---|---|---|---|
| 1 | 2 | reclassification | MEDIUM / balanced / medium | CRITICAL / strongest / max | a timing side channel was found in the token comparison | not applicable | independent verification pass added, merged |
| 2 | 5 | output-quality-failure | MEDIUM / balanced / medium | MEDIUM / strongest / high | missed-required-section: the confidence statement and open questions were absent | `synthesis-draft-1.md` | retry passed, both sections present |

Columns:

- **Dispatch #**: the row in the dispatch table this escalation belongs to.
- **Trigger**: `reclassification` or `output-quality-failure`, per
  `SKILL.md` section 6.
- **Prior** and **New**: `complexity / model tier / effort`, each side of the
  transition.
- **Reason**: the evidence that changed, or the specific quality trigger from
  `tier-table.json`'s `quality_escalation_triggers` that fired.
- **Failed output kept**: where the weak output was kept for comparison, on
  an `output-quality-failure` row. `not applicable` on a `reclassification`
  row, since nothing failed; the task itself changed shape.
- **Outcome**: what the escalation actually bought, so a pattern of
  escalations that never change the outcome is visible rather than buried.

## What this file is not

Not a substitute for the handoff block in `agents/handoff-protocol.md`, which
carries what a specific agent did. Not a token or cost ledger; that
measurement, where it exists, belongs to `token-optimization` and the Control
Center. This log answers one question only: which model ran which dispatch,
and why.
