# Agent dispatch

Who runs a plan when it is executed by agents rather than inline in one
session. This file applies the chief's map to the categories and plan steps
of this skill; it does not restate the map.

The canonical sources, read before this file and never contradicted by it:

```
team map, leads, minimum teams     delivery-orchestrator resources/team-routing.md
dispatch record, modes, surfaces,  delivery-orchestrator resources/parallel-dispatch.md
waves, conflict check
handoff evidence, ladder, stops    delivery-orchestrator resources/handoff-and-escalation.md
handoff block                      agents/handoff-protocol.md
```

When this file and the chief's resources disagree, the chief's resources win,
and this file is corrected.

## 1. Category to lead

The lead follows `team-routing.md` section 3. One surface: the owning
implementer leads itself. Two or more implementer surfaces: `principal-engineer`
leads. A category whose team row names a domain lead keeps that lead whatever
the surface count. The minimum team of every row includes `qa-engineer` for
any behaviour change and `final-verifier` before done.

| Category | Lead | Joins only when its condition holds |
|---|---|---|
| EXPLORATION | the chief's staff: `checkup`, or `codebase-cartographer` when the repository is large | `source-of-truth` when documentation exists |
| ARCHITECTURE | `software-architect` | `database-engineer` for the data model, `researcher` for a contested claim |
| FRONTEND | `frontend-engineer` | `ui-ux-engineer` for visual output, `playwright-engineer` for a browser surface |
| BACKEND | `backend-engineer` | `security-engineer` on user scoped data, `database-engineer` for a schema change |
| FULLSTACK | `principal-engineer` | `backend-engineer` and `frontend-engineer` across the fixed contract, `ui-ux-engineer`, `playwright-engineer` |
| DATABASE | `database-engineer` | `backend-engineer` for the code that reads it, `performance-engineer` on a measured cost, `data-collection-engineer` when the data is gathered from external sources |
| API | `backend-engineer` | `security-engineer` on user scoped data, `documentation-engineer` for the reference |
| AUTHENTICATION | `backend-engineer` | `security-engineer`, always: its condition is met by the category |
| SECURITY | `security-engineer` | `penetration-tester` only with written authorization on record, the owning implementer for each fix |
| VALIDATION | `backend-engineer` | `security-engineer` |
| DEBUGGING | the owning implementer of the defect's surface | `principal-engineer` when the defect crosses surfaces |
| PERFORMANCE | `performance-engineer`, with a measurement only | the owning implementer for the fix |
| UI_UX | `ui-ux-engineer`; `design-director` when design is owned across a product | `frontend-engineer`, `design-research`, `design-verification` |
| TESTING | `qa-engineer` | `playwright-engineer` for a browser surface |
| BROWSER_AUTOMATION | `playwright-engineer` | `qa-engineer` for the gate |
| DOCUMENTATION | `documentation-engineer` | `source-of-truth` when docs and code may disagree |
| GIT | `pr-author` | `pr-reviewer`, never the author |
| RELEASE | `release-engineer` | `qa-engineer`, `security-engineer` before release |
| REFACTORING | the owning implementer | `principal-engineer` when several surfaces move |
| DEPENDENCY | the owning implementer | `security-engineer` for the audit of the new tree |
| QUALITY_CAMPAIGN | `qa-engineer` | `playwright-engineer`, `penetration-tester` only with authorization on record |
| ACCESSIBILITY | `ui-ux-engineer` | `frontend-engineer` for the remediation, `playwright-engineer` |
| REGRESSION | `qa-engineer` | `playwright-engineer` |
| MIGRATION | `principal-engineer` when several surfaces move, otherwise the owning implementer | `database-engineer` when data moves, `checkup` on inherited code |
| LEGACY | the chief's staff: `checkup`, `codebase-cartographer` when large | the owning implementer once the risk map exists |
| INCIDENT | `incident-responder`, for the duration of the response | the owning implementer, `qa-engineer`, `release-engineer` |
| INFRASTRUCTURE | `devops-engineer` | `ci-cd-engineer` for pipeline work, `security-engineer` for secrets and exposure |
| PAYMENTS | `backend-engineer`; `principal-engineer` when the client changes too | `security-engineer`, always, `database-engineer` |
| JOBS | `backend-engineer` | `devops-engineer` for scheduling and observability in an environment |
| REALTIME | `principal-engineer` | `backend-engineer`, `frontend-engineer`, `security-engineer` for channel authorization |
| FILES | `backend-engineer` | `security-engineer`, always: uploads meet its condition |
| I18N | `frontend-engineer`; `principal-engineer` when server strings change too | `ui-ux-engineer` |
| SEO | `frontend-engineer` | `performance-engineer` on a measured budget |
| DESIGN_SYSTEM | `design-director` when across a product, otherwise `ui-ux-engineer` | `frontend-engineer`, `design-verification` |
| PRIVACY | `backend-engineer`; `principal-engineer` when several surfaces hold copies | `security-engineer`, `database-engineer` |
| CACHING | `performance-engineer`, with a measurement only | `backend-engineer` for the cache itself |
| ANALYTICS | `principal-engineer` when client and server both emit, otherwise the owning implementer | `security-engineer` for the personal data review |
| FEATURE_FLAGS | the owning implementer | `release-engineer` for the rollout |
| SITE_TEMPLATE | `site-template-engineer` | `ui-ux-engineer`, `security-engineer`, `qa-engineer`, per its team row |

`security-engineer` joins whenever the security review gate of `SKILL.md`
section 4 applies, whatever the row says. A row never removes an agent whose
condition in `team-routing.md` section 2 is met.

## 2. Plan step to agent

Which agent runs a plan step when the step is dispatched. The mode column
follows `parallel-dispatch.md` section 2; a reviewer that may also fix is a
write dispatch, whatever this column says.

| Plan step | Agent | Mode |
|---|---|---|
| `project-exploration`, `codebase-mapping` | the dispatched implementer for its own slice; `codebase-cartographer` on a large repository; `checkup` on inherited code | read |
| `requirements-analysis`, `clarification-gate` | `requirements-analyst`, in phases 01 and 02, or when slippage traces to unclear scope | write, documents only |
| `delivery-planning` | `delivery-manager`, when there is a date, a milestone or more than one wave of work | write, documents only |
| `architecture-design`, `decision-records` | `software-architect` for a boundary or contract; the owning implementer for one module's internals | write, documents only |
| `api-design` | `backend-engineer`, one writer of the contract file | write |
| `database-design`, `database-operations` | `database-engineer` | write |
| `backend-engineering`, `input-validation`, `background-jobs`, `payment-engineering`, `file-handling`, `realtime-systems`, `llm-integration`, `data-privacy` | `backend-engineer` | write |
| `frontend-engineering`, `font-loading`, `animation`, `internationalization`, `seo-engineering` | `frontend-engineer` | write |
| `accessibility-remediation` | `frontend-engineer`, never the agent that runs the verify loop on the same findings | write; each fix handed back to `accessibility-testing` |
| `fullstack-engineering` | `principal-engineer`, which splits it into server and client dispatches across the contract | lead |
| `ui-ux-engineering`, `template-selection`, `design-system` | `ui-ux-engineer` | write, specification or tokens |
| `design-authenticity` | `design-research` before the build, `design-verification` after it | read |
| `brand-identity` | `design-director` owns it and signs off; `design-research` drafts the moodboard, `ui-ux-engineer` the palette, type and tokens; never signed off by the agent that drafted it | write, documents and tokens; nothing to `design-system` before sign-off |
| `accessibility-testing` | `ui-ux-engineer`, with `playwright-engineer` for the rendered checks | read |
| `security-audit` | `security-engineer` | read; fixes go back to the owner |
| `security-testing` | `penetration-tester`, only with written authorization on record | read, bounded proofs |
| `website-audit` | `web-auditor`, when a live site is audited from its URL; active testing only with written authorization on record | read; fixes go back to the owner |
| `testing-quality`, `api-testing`, `regression-testing`, `quality-engineering`, `exploratory-testing`, `bug-hunting`, `reliability-testing`, `test-reporting` | `qa-engineer` | write for tests, read for findings |
| `playwright-automation` | `playwright-engineer` | write for specs, read for runs |
| `performance-engineering`, `caching-strategy` | `performance-engineer` | read for the baseline, write for the fix |
| `code-review-protocol` | `qa-engineer` for the task gate, `pr-reviewer` on the pull request | read |
| `technical-documentation` | `documentation-engineer` | write |
| `project-continuity` | the wave's named integrator: the note is a hot file | write, serial |
| `git-workflow` | each write dispatch commits on its own branch; `pr-author` opens the pull request | write |
| `release-readiness`, `release-engineering`, `feature-flags` rollout | `release-engineer` | write |
| `launch-readiness` | `compliance-verifier`, at phase 11 of a user-facing web product | read; fixes go back to the owner |
| `devops-core`, `infrastructure-as-code`, `environment-management`, `secrets-management`, `deployment-engineering`, `observability` | `devops-engineer` | write |
| `ci-cd-pipelines` | `ci-cd-engineer` | write |
| `incident-response`, `production-verification` during an incident | `incident-responder` | write |
| `production-verification` after a rollout | `release-engineer` | read |
| `site-template-generation`, `admin-console` on a site template | `site-template-engineer` | write |
| `legacy-code`, `refactoring`, `technical-debt`, `migration-engineering`, `debugging`, `dependency-selection` | the owning implementer of the surface | write |

## 3. What the dispatch adds to the plan

A plan that runs on agents carries, on top of `SKILL.md` section 8:

```
Team:      lead, then each agent with the condition that brought it in
Left out:  each agent whose absence a reader would question, with the reason
Waves:     per parallel-dispatch.md section 4, each dispatch with its mode
           and its declared write surface
Integrator: the one agent that owns the hot files of each wave
```

Two dispatches of one wave whose write surfaces intersect are not a wave;
they are sequenced, the second starting from the first's committed state.
