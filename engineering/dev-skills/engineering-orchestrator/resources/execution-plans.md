# Canonical execution plans

One plan per task category. Machine checkable format: a `category:` line
followed by a single `plan:` line whose steps are separated by `->`. Every
step is the exact directory name of a skill in `dev-skills/`.

These are starting points, not scripts. The orchestrator adapts them under the
rules of `SKILL.md` sections 3, 4 and 5, and states every adaptation.

`engineering-core` is implicit in every plan and never listed.
`engineering-orchestrator` is the caller and never lists itself.
`task-complexity`, `model-routing` and `token-optimization` are implicit in
every plan as well: the orchestrator consults them before composing and
dispatching the plan, and they are never listed as a plan step, the same way
`engineering-core` is never listed.

## EXPLORATION

category: EXPLORATION
plan: project-exploration -> technical-documentation -> project-continuity

Answer a question about the codebase. No code changes, so no test or review
gate. Documentation only when the answer is worth keeping.

## ARCHITECTURE

category: ARCHITECTURE
plan: project-exploration -> architecture-design -> api-design -> database-design -> dependency-selection -> decision-records -> technical-documentation -> project-continuity

Design work with no implementation yet. `dependency-selection` runs only when
the design implies a new library.

## FRONTEND

category: FRONTEND
plan: project-exploration -> ui-ux-engineering -> frontend-engineering -> animation -> input-validation -> testing-quality -> playwright-automation -> accessibility-testing -> performance-engineering -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

`input-validation` covers client side form constraints and any server action
the page introduces. `playwright-automation` is dropped when the repository
has no browser tooling and the change does not justify adding it.

## BACKEND

category: BACKEND
plan: project-exploration -> architecture-design -> backend-engineering -> llm-integration -> input-validation -> security-audit -> testing-quality -> performance-engineering -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

`architecture-design` is dropped for a change confined to one existing module.
`security-audit` is never dropped when the endpoint returns user scoped data.

## FULLSTACK

category: FULLSTACK
plan: project-exploration -> architecture-design -> api-design -> fullstack-engineering -> backend-engineering -> admin-console -> ui-ux-engineering -> frontend-engineering -> input-validation -> security-audit -> testing-quality -> playwright-automation -> accessibility-testing -> regression-testing -> performance-engineering -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow -> release-readiness

The widest plan. `release-readiness` runs only when the request is to ship.

## DATABASE

category: DATABASE
plan: project-exploration -> database-design -> backend-engineering -> database-operations -> testing-quality -> performance-engineering -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

Migrations are treated as production changes: reversibility, ordering and
index impact are decided before writing the migration file.

## API

category: API
plan: project-exploration -> api-design -> backend-engineering -> input-validation -> security-audit -> testing-quality -> api-testing -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

Contract changes require the documentation step, never optional here.

## AUTHENTICATION

category: AUTHENTICATION
plan: project-exploration -> architecture-design -> security-audit -> backend-engineering -> input-validation -> testing-quality -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

`security-audit` runs before implementation as well as after, because the
threat model constrains the design.

## SECURITY

category: SECURITY
plan: project-exploration -> security-audit -> security-testing -> debugging -> backend-engineering -> input-validation -> testing-quality -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

`debugging` establishes exploitability before anything is changed. The fix
skill is chosen by surface: `backend-engineering`, `frontend-engineering` or
`fullstack-engineering`.

## VALIDATION

category: VALIDATION
plan: project-exploration -> input-validation -> backend-engineering -> testing-quality -> security-audit -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

## DEBUGGING

category: DEBUGGING
plan: project-exploration -> debugging -> backend-engineering -> testing-quality -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

Exploration is dropped only when every file involved was already read in this
session. The fix skill follows the surface of the defect.

## PERFORMANCE

category: PERFORMANCE
plan: project-exploration -> performance-engineering -> debugging -> caching-strategy -> backend-engineering -> testing-quality -> regression-testing -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

No optimisation without a measurement. `performance-engineering` runs first to
produce the baseline, and again at the end to prove the delta.

## UI_UX

category: UI_UX
plan: project-exploration -> ui-ux-engineering -> design-system -> frontend-engineering -> design-authenticity -> animation -> testing-quality -> playwright-automation -> accessibility-testing -> performance-engineering -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

Accessibility and responsive verification live inside `ui-ux-engineering` and
`playwright-automation`; they are not separate steps.

## TESTING

category: TESTING
plan: project-exploration -> quality-engineering -> testing-quality -> api-testing -> playwright-automation -> regression-testing -> test-reporting -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

## BROWSER_AUTOMATION

category: BROWSER_AUTOMATION
plan: project-exploration -> playwright-automation -> testing-quality -> accessibility-testing -> test-reporting -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

## DOCUMENTATION

category: DOCUMENTATION
plan: project-exploration -> technical-documentation -> code-review-protocol -> project-continuity -> git-workflow

Documentation is reviewed against the implementation it describes, which is
why the review step stays.

## GIT

category: GIT
plan: project-exploration -> project-continuity -> git-workflow

The continuity note is a tracked file, so it is written before the commit that
carries it, not after.

## RELEASE

category: RELEASE
plan: project-exploration -> testing-quality -> regression-testing -> security-audit -> performance-engineering -> test-reporting -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow -> release-readiness

## REFACTORING

category: REFACTORING
plan: project-exploration -> technical-debt -> testing-quality -> refactoring -> regression-testing -> code-review-protocol -> performance-engineering -> technical-documentation -> project-continuity -> git-workflow

Tests come before the refactor, as the behaviour contract that must not move.
A refactor with no covering test is a rewrite in disguise.

## DEPENDENCY

category: DEPENDENCY
plan: project-exploration -> dependency-selection -> security-audit -> testing-quality -> regression-testing -> performance-engineering -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

## QUALITY_CAMPAIGN

category: QUALITY_CAMPAIGN
plan: project-exploration -> quality-engineering -> testing-quality -> api-testing -> playwright-automation -> exploratory-testing -> bug-hunting -> accessibility-testing -> reliability-testing -> security-testing -> regression-testing -> test-reporting -> code-review-protocol -> project-continuity -> git-workflow

A whole product validated rather than one change verified.
`quality-engineering` selects which disciplines apply and drops the rest with
a stated reason. `security-testing` runs only inside a written authorization.

## ACCESSIBILITY

category: ACCESSIBILITY
plan: project-exploration -> accessibility-testing -> ui-ux-engineering -> design-system -> frontend-engineering -> testing-quality -> playwright-automation -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

The audit runs first, because the findings decide what is built.
`design-system` enters only when the fix belongs to a shared component.

## REGRESSION

category: REGRESSION
plan: project-exploration -> regression-testing -> testing-quality -> api-testing -> playwright-automation -> test-reporting -> project-continuity -> git-workflow

Selection is derived from the diff. The layers below the browser run first,
since a failure there makes the browser results uninterpretable.

## MIGRATION

category: MIGRATION
plan: project-exploration -> legacy-code -> migration-engineering -> database-design -> backend-engineering -> testing-quality -> database-operations -> regression-testing -> decision-records -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

`legacy-code` is dropped when the source system is well covered.
`database-design` and `database-operations` are dropped for a migration that
does not move data.

## LEGACY

category: LEGACY
plan: project-exploration -> legacy-code -> debugging -> testing-quality -> refactoring -> technical-debt -> regression-testing -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

Characterization tests come before any structural change, which is why
`testing-quality` precedes `refactoring` here.

## INCIDENT

category: INCIDENT
plan: incident-response -> observability -> debugging -> testing-quality -> regression-testing -> production-verification -> technical-documentation -> project-continuity -> git-workflow

The only plan that does not begin with exploration: service is restored
first. `debugging` starts once the bleeding has stopped, and
`production-verification` proves the recovery rather than a dashboard.

## INFRASTRUCTURE

category: INFRASTRUCTURE
plan: project-exploration -> devops-core -> infrastructure-as-code -> environment-management -> secrets-management -> ci-cd-pipelines -> deployment-engineering -> production-verification -> technical-documentation -> project-continuity -> git-workflow

`infrastructure-as-code` decides first whether a provisioning tool is
warranted at all.

## PAYMENTS

category: PAYMENTS
plan: project-exploration -> architecture-design -> payment-engineering -> api-design -> database-design -> backend-engineering -> input-validation -> security-audit -> testing-quality -> reliability-testing -> security-testing -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

No step is dropped here except by written decision. `reliability-testing` is
mandatory: the timeout after capture is the defining failure of this surface.

## JOBS

category: JOBS
plan: project-exploration -> architecture-design -> background-jobs -> backend-engineering -> input-validation -> testing-quality -> reliability-testing -> observability -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

Covers queues, workers, schedulers and webhook consumers. `reliability-testing`
verifies duplicate delivery and failure mid job.

## REALTIME

category: REALTIME
plan: project-exploration -> architecture-design -> realtime-systems -> api-design -> backend-engineering -> frontend-engineering -> testing-quality -> reliability-testing -> security-testing -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

`security-testing` is kept because channel authorization is the defect this
surface produces most often.

## FILES

category: FILES
plan: project-exploration -> file-handling -> input-validation -> backend-engineering -> security-audit -> testing-quality -> security-testing -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

Uploads, downloads, media and generated documents. The adversarial matrix of
`file-handling` is run before release, never after.

## I18N

category: I18N
plan: project-exploration -> internationalization -> ui-ux-engineering -> frontend-engineering -> backend-engineering -> testing-quality -> playwright-automation -> accessibility-testing -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

`backend-engineering` stays because mails, documents and error messages are
the surfaces usually left untranslated.

## SEO

category: SEO
plan: project-exploration -> seo-engineering -> frontend-engineering -> performance-engineering -> testing-quality -> playwright-automation -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

Public surfaces only. Verification happens on rendered output, which is why
`playwright-automation` stays in the plan.

## DESIGN_SYSTEM

category: DESIGN_SYSTEM
plan: project-exploration -> ui-ux-engineering -> design-system -> frontend-engineering -> design-authenticity -> animation -> accessibility-testing -> testing-quality -> playwright-automation -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

Tokens are applied to the existing product before any component is rewritten.

## PRIVACY

category: PRIVACY
plan: project-exploration -> data-privacy -> database-design -> security-audit -> backend-engineering -> database-operations -> testing-quality -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

The inventory precedes everything, because erasure and export cannot be built
against an unknown set of copies.

## CACHING

category: CACHING
plan: project-exploration -> performance-engineering -> caching-strategy -> backend-engineering -> testing-quality -> reliability-testing -> observability -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

`performance-engineering` runs first and often ends the plan: most caching
requests are answered by an index or a smaller payload.

## ANALYTICS

category: ANALYTICS
plan: project-exploration -> analytics-instrumentation -> data-privacy -> backend-engineering -> frontend-engineering -> testing-quality -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

`data-privacy` is never dropped here: an analytics event is personal data
until proven otherwise. Business figures are emitted server side, which is why
`backend-engineering` precedes the client work.

## FEATURE_FLAGS

category: FEATURE_FLAGS
plan: project-exploration -> feature-flags -> backend-engineering -> frontend-engineering -> testing-quality -> regression-testing -> release-engineering -> code-review-protocol -> technical-documentation -> project-continuity -> git-workflow

`release-engineering` owns the rollout steps and their thresholds.
`regression-testing` runs on flag removal as well as on flag introduction,
since deleting a branch changes behaviour for whoever was on it.
