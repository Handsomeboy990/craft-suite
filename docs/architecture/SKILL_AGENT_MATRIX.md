# Skill to agent orchestration matrix

How a workflow's canonical skill plan maps to the agents that would execute
it in multi-context mode. Read `documentation/agents.md`, "When you do not
need agents", before this table: skills are the unit that always runs. An
agent is a heavier execution mode, a separate context per role, used when a
task is large enough that separating roles pays for the handoff it costs. A
single small task runs its skill plan in one context, with `--no-agents`, and
never appears in this matrix as needing one.

Canonical skill plans are not restated here; they are in
`engineering/dev-skills/engineering-orchestrator/resources/execution-plans.md`
and `engineering/delivery-skills/delivery-orchestrator/resources/delivery-phases.md`.
This matrix adds the one thing those files do not carry: which of the twenty-six
agents a plan's steps map to, when the work is dispatched across contexts.

## Columns

- **Workflow**: the request shape, named by its `engineering-orchestrator`
  category or `delivery-orchestrator` phase range.
- **Required agents**: dispatched whenever the workflow runs in multi-agent
  mode; dropping one is a defect, not an optimisation.
- **Optional agents**: dispatched when the surface calls for them, dropped
  with a stated reason otherwise, per the exclusion rules already in
  `engineering-orchestrator/SKILL.md` section 5.
- **Preconditions**: what must be true before dispatch starts.
- **Verification agent**: who reviews the work independently of who did it.
- **Security gate**: whether `security-engineer` involvement is mandatory,
  conditional, or not applicable.
- **Model routing note**: what `task-complexity` typically drives for this
  workflow, stated as a tendency, never as a fixed rule; the actual tier is
  always computed per instance, per `model-routing/SKILL.md` section 3.

## New project, full lifecycle

| Field | Value |
|---|---|
| Workflow | `delivery-orchestrator` phases 01 to 14 |
| Required agents | `requirements-analyst` (phase 01 to 02), `software-architect` (phase 03 to 04), the implementation agents the approved architecture names (phase 07), `qa-engineer` (phase 08), `devops-engineer` (phase 09 to 10), `documentation-engineer` (phase 12), `release-engineer` (phase 14) |
| Optional agents | `database-engineer` when the architecture includes a schema, `performance-engineer` when a measured target exists, `playwright-engineer` when the surface has a browser, `ui-ux-engineer` when the surface is user facing |
| Preconditions | phase 05, `validation-gate`, is an approval gate; nothing in phase 07 onward starts without it |
| Verification agent | `qa-engineer` at phase 08, `security-engineer` wherever the gate table in `delivery-orchestrator/SKILL.md` section 4 fires, `compliance-verifier` at phase 11 for a user-facing web product, `release-engineer` at phase 14 |
| Security gate | mandatory whenever auth, payments, uploads, user content, permissions, secrets or dependencies are touched, per the same gate table |
| Model routing note | phases 01 to 06 are typically MEDIUM, driven by ambiguity; an authentication or payment surface inside phase 07 typically escalates to CRITICAL by `task-complexity`'s security signal regardless of the phase's average size |

## FRONTEND

| Field | Value |
|---|---|
| Workflow | `engineering-orchestrator` category FRONTEND |
| Required agents | `frontend-engineer` |
| Optional agents | `ui-ux-engineer` (visual or interaction change), `playwright-engineer` (browser tooling exists or is justified), `security-engineer` (a server action is introduced) |
| Preconditions | the contract the component consumes is fixed, per `frontend-engineer/agents.md` Boundaries |
| Verification agent | `qa-engineer`, plus `ui-ux-engineer` when a visual claim is made |
| Security gate | conditional: only when the change introduces a server action or new input |
| Model routing note | typically LOW to MEDIUM; escalates when the component reads authentication state or user-scoped data |

## BACKEND and AUTHENTICATION

| Field | Value |
|---|---|
| Workflow | `engineering-orchestrator` categories BACKEND, AUTHENTICATION |
| Required agents | `backend-engineer`, `security-engineer` |
| Optional agents | `database-engineer` (schema or query change), `performance-engineer` (a measured concern exists) |
| Preconditions | the API contract exists, or is fixed in the same task before implementation starts |
| Verification agent | `qa-engineer`; `security-engineer` reviews independently of `backend-engineer` even when the same task introduced both, per `agents/README.md` review gates |
| Security gate | mandatory for AUTHENTICATION always; mandatory for BACKEND whenever the endpoint returns user-scoped data |
| Model routing note | AUTHENTICATION routes to strongest by `model-routing/SKILL.md` section 5's security override, regardless of the task's breadth |

## SECURITY (audit and hardening)

| Field | Value |
|---|---|
| Workflow | `engineering-orchestrator` category SECURITY; `security/security-assurance/authorized-pentesting` for offensive testing |
| Required agents | `security-engineer` |
| Optional agents | `backend-engineer` for the fix once a finding is confirmed, `qa-engineer` for the regression test that encodes it |
| Preconditions | for `authorized-pentesting`: written, specific, in-scope authorization on record before any offensive step; there is no agent that performs this work without it |
| Verification agent | `qa-engineer`, for the test that encodes each fix, per `agents/README.md` review gates |
| Security gate | this workflow is the gate; not applicable as a separate check |
| Model routing note | CRITICAL by default; `task-complexity` signal 4 rates any confirmed vulnerability CRITICAL regardless of file count |
| Gap, phase 2 | no dedicated `pentester` agent exists yet; `authorized-pentesting` runs today as a skill inside `security-engineer`'s scope or in a single-context session, not as a separate agent role. Recorded in `multi-agent-assessment.md` section 3, not silently assumed to exist. |

## QUALITY_CAMPAIGN (production readiness)

| Field | Value |
|---|---|
| Workflow | `engineering-orchestrator` category QUALITY_CAMPAIGN |
| Required agents | `qa-engineer` |
| Optional agents | `playwright-engineer` (browser surface), `security-engineer` (`security-testing` runs only inside a written authorization, per the plan's own note), `performance-engineer` |
| Preconditions | `quality-engineering` has already selected which disciplines apply and dropped the rest with a stated reason, before any agent is dispatched |
| Verification agent | `qa-engineer` is the owner and the verifier here; `documentation-engineer` records the campaign's findings |
| Security gate | conditional on written authorization, per the plan |
| Model routing note | typically HIGH, driven by the breadth of a whole-product campaign rather than by a single risk signal; a decomposition per `task-complexity` section 6 into one dispatch per discipline is the usual shape, not one dispatch covering all of them |

## RELEASE

| Field | Value |
|---|---|
| Workflow | `engineering-orchestrator` category RELEASE; `delivery-orchestrator` phase 14 |
| Required agents | `release-engineer` |
| Optional agents | `security-engineer` (the release plan includes `security-audit` unconditionally, so this is functionally required whenever the release plan is followed in full) |
| Preconditions | `regression-testing` and `test-reporting` steps of the RELEASE plan have run |
| Verification agent | `release-engineer` issues the go or no-go verdict; it does not trust a prior agent's claim without the evidence the RELEASE plan's steps produced |
| Security gate | mandatory, per the RELEASE plan |
| Model routing note | typically MEDIUM; escalates to HIGH when `regression-testing` surfaces a finding that changes scope |

## What this matrix does not claim

No workflow in this matrix is forced to use every agent it lists as
optional. `engineering-orchestrator` section 5's exclusion rules apply
identically whether the plan runs in one context or across agent dispatches:
a workflow with no browser surface does not receive `playwright-engineer`
because this matrix mentions the role, any more than the canonical execution
plan would list `playwright-automation` for it.
