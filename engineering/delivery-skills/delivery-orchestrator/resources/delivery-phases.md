# Delivery phases

Machine checkable format. Each phase declares a number, a name, the skills it
runs, and the kind of gate that closes it.

Gate values: `approval` stops for a human answer, `verification` passes on
evidence, `none` closes when its skills complete.

Skills named here exist in `dev-skills/`, `delivery-skills/` or
`devops-skills/`. Depth adapts to the project; the order does not change.

## Phase 01

phase: 01
name: requirements-analysis
skills: requirements-analysis
gate: none

Raw input becomes an engineering specification. Explicit requirements,
assumptions, constraints and unknowns are separated and never merged.

## Phase 02

phase: 02
name: clarification
skills: clarification-gate
gate: approval

Blocking gaps become one batch of questions. Non blocking gaps become recorded
assumptions and the work continues.

## Phase 03

phase: 03
name: technology-selection
skills: technology-selection, dependency-selection
gate: none

Every major choice carries its alternatives, the reason they were rejected,
and the trade-off accepted.

## Phase 04

phase: 04
name: architecture-proposal
skills: architecture-proposal, architecture-design, api-design, database-design, decision-records
gate: none

The nine section proposal, sized to the project, written as the technical
contract for implementation.

## Phase 05

phase: 05
name: validation
skills: validation-gate
gate: approval

Hard stop. No production code before this gate returns an approval.

## Phase 06

phase: 06
name: delivery-planning
skills: delivery-planning
gate: none

Work breakdown into atomic tasks with dependencies, affected modules,
validation requirements and tests.

## Phase 07

phase: 07
name: implementation
skills: engineering-orchestrator, implementation-integrity, scope-and-change-control
gate: verification

Each task routed through the engineering suite. No fake functionality, no
silent scope growth, no silent architectural drift.

## Phase 08

phase: 08
name: integration-verification
skills: fullstack-engineering, quality-engineering, testing-quality, api-testing, playwright-automation, accessibility-testing
gate: verification

The layers are exercised together, including the failure paths. A feature that
was never run end to end is not integrated.

## Phase 09

phase: 09
name: devops
skills: devops-core, environment-management, secrets-management, infrastructure-as-code, containerization, ci-cd-pipelines, workflow-automation
gate: verification

Environments, configuration, pipeline. The pipeline runs and fails correctly
before it is trusted.

## Phase 10

phase: 10
name: deployment
skills: deployment-engineering, database-operations
gate: approval

The system runs where it is meant to run. Approval is required because the
first production deployment and any destructive migration are irreversible.

## Phase 11

phase: 11
name: production-verification
skills: production-verification, observability, backup-recovery, incident-response, launch-readiness
gate: verification

The deployed system answers real requests, and a user-facing product also
passes the launch completeness gate. A successful deploy command is not a
verified deployment, and a running system is not a launch-ready product.

## Phase 12

phase: 12
name: documentation
skills: technical-documentation
gate: none

Documentation describes what was built, verified against the code.

## Phase 13

phase: 13
name: handover
skills: client-handover, project-continuity
gate: none

Another team can install, run, operate and extend the project without the
people who built it.

## Phase 14

phase: 14
name: release
skills: release-engineering, release-readiness
gate: approval

Versioning and rollout, then the go or no go verdict with named blockers.

## Sizing

| Project size | Phases 01 to 06 | Phase 07 | Phases 08 to 14 |
|---|---|---|---|
| small | one page total | the bulk of the work | one page total, still executed |
| medium | three to five pages | task by task | a section each |
| large | a document per architecture area | plan driven, parallelised across contracts | full execution with named owners |

Sizing changes the volume of each phase. It never removes one.

## Skipping rules

A phase produces `not applicable` with a written reason, never silence.

| Phase | Legitimately not applicable when |
|---|---|
| 03 | the stack is imposed and documented, the decision is recorded as inherited |
| 09 | the project ships as a library with no runtime environment |
| 10 | the deliverable is source code, and the client deploys it |
| 11 | nothing was deployed by this work |
| 14 | the work is a milestone inside a larger delivery, not a release |

`Phase 05` is never not applicable. There is no project small enough to skip
the architecture approval, only proposals short enough to read in a minute.
