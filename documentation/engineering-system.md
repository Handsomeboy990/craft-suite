# The engineering skill system

Technical documentation of `engineering/dev-skills`, the code practice layer.

Two layers complete it, documented in `delivery-system.md`:
`engineering/delivery-skills` runs a project from specification to delivery,
and `engineering/devops-skills` governs how the system runs. This document
covers one question: how a change is made correctly.

## 1. Purpose

To let an agent work on a production codebase the way an experienced engineer
does: read before writing, verify before asserting, finish the whole vertical
slice rather than the part that demonstrates well.

The system is stack agnostic. No skill assumes a framework, a database, an
authentication mechanism or a directory layout. Each reads the project it is
given.

## 2. Language

These skills produce code, commit messages, branch names, pull requests and
technical documentation, all in English by rule 6 of `engineering-core`.
Writing the instructions in the language of their output removes a permanent
translation and a source of error.

Since version 2.0.0 that is no longer specific to this tree: all 155 skills are
written in English, and the output language is a configuration decision. See
`configuration.md`.

Rules 1 and 2 of the writing constitution still apply to every file: no emoji,
no em dash.

## 3. The fifty skills

### Foundation

| Skill | Responsibility |
|---|---|
| `engineering-core` | eight laws, the evidence rule, the certainty vocabulary, the definition of done |
| `project-exploration` | turns an unknown repository into verified facts |
| `engineering-orchestrator` | classifies the task, composes the plan, imposes the gates |
| `task-complexity` | one complexity classification, read by every routing decision |
| `model-routing` | model tier, and effort where a lever exists, from that classification |
| `token-optimization` | context and output proportional to the task, during the work |

### Design

| Skill | Responsibility |
|---|---|
| `architecture-design` | the smallest architecture that serves the product |
| `ui-ux-engineering` | the rendered experience, specified before it is built |
| `dependency-selection` | add, replace, upgrade or refuse a library |

### Implementation

| Skill | Responsibility |
|---|---|
| `frontend-engineering` | client features, the five states, accessibility |
| `backend-engineering` | handlers, services, data, transactions, jobs |
| `fullstack-engineering` | the vertical slice and the shared contract |

### Verification

| Skill | Responsibility |
|---|---|
| `input-validation` | every external value, validated at the trust boundary |
| `security-audit` | a twenty-four point sweep, fixes and manual actions |
| `debugging` | root cause with file, line and mechanism |
| `testing-quality` | the right layer, ten mandatory cases, tests that can fail |
| `playwright-automation` | browser journeys, responsive and keyboard proof |
| `performance-engineering` | measure, fix the dominant cost, prove the delta |
| `code-review-protocol` | five passes, then fix and verify |

### Delivery

| Skill | Responsibility |
|---|---|
| `technical-documentation` | documentation matching the implementation |
| `project-continuity` | a handover the next session can resume from |
| `git-workflow` | identity, delegation boundaries, atomic commits, history hygiene |
| `release-readiness` | nine gates and a go or no go verdict |

### Domain surfaces

| Skill | Responsibility |
|---|---|
| `api-design` | the contract before the endpoint exists |
| `database-design` | schema, constraints, indexes from access patterns |
| `caching-strategy` | whether to cache, where, keyed by what |
| `background-jobs` | queues, retries, idempotency, schedules |
| `realtime-systems` | live features that survive a real network |
| `file-handling` | uploads, storage, processing, delivery |
| `payment-engineering` | correctness when money moves |
| `internationalization` | more than one language and region |
| `seo-engineering` | the technical half of search visibility |
| `design-system` | tokens, component contracts, themes |
| `data-privacy` | inventory, retention, erasure that works |
| `analytics-instrumentation` | measurement designed before emission |
| `feature-flags` | flag lifecycle, rollout, and removal |

### Change and continuity

| Skill | Responsibility |
|---|---|
| `refactoring` | structure changed, behaviour proven unchanged |
| `legacy-code` | safe change without a trusted suite |
| `migration-engineering` | moving a running system in reversible steps |
| `technical-debt` | measured, ranked, paid inside real work |
| `decision-records` | the reasoning, kept immutable |

### Quality

| Skill | Responsibility |
|---|---|
| `quality-engineering` | the campaign, its disciplines and its verdict |
| `api-testing` | the contract, past the first 200 |
| `exploratory-testing` | charter, time box, reproducible findings |
| `bug-hunting` | nine families of adversarial interaction |
| `regression-testing` | impact analysis and honest exclusion |
| `accessibility-testing` | keyboard first, scanner last |
| `security-testing` | authorized dynamic verification of controls |
| `reliability-testing` | injected failure, and the four properties |
| `test-reporting` | severity, evidence, lifecycle, one verdict |

## 4. Execution chain

```
request  ->  engineering-core
         ->  engineering-orchestrator
              classification, locating the affected surface
         ->  project-exploration
              establishing the facts
         ->  per plan step: task-complexity, then model-routing
         ->  the selected skills, in order
         ->  the mandatory gates
         ->  completion verdict
```

`engineering-core` loads first and is never copied by the others. The
orchestrator composes the smallest complete plan: a typo fix takes four steps,
a payment endpoint takes eleven. Both are correct.

## 5. Mandatory gates

Never abandoned to save time.

| Gate | Applies when |
|---|---|
| exploration before decision | unread code is touched |
| validation before persistence | an external input reaches storage or an effect |
| authorization before exposure | a route or a query returns a user's data |
| security review before merge | auth, payments, uploads, user content, permissions, secrets, dependencies |
| test before done | any behaviour change |
| review before delivery | any code written by the agent |
| continuity before handover | any session that changed the repository |
| author check before commit | every commit |

A gate can be satisfied by evidence rather than by running a whole skill. An
existing test, executed, red before and green after, satisfies the test gate.

## 6. Task categories

Thirty eight classification categories, each with a canonical plan in
`engineering/dev-skills/engineering-orchestrator/resources/execution-plans.md`.

The twenty general categories:

EXPLORATION, ARCHITECTURE, FRONTEND, BACKEND, FULLSTACK, DATABASE, API,
AUTHENTICATION, SECURITY, VALIDATION, DEBUGGING, PERFORMANCE, UI_UX, TESTING,
BROWSER_AUTOMATION, DOCUMENTATION, GIT, RELEASE, REFACTORING, DEPENDENCY.

The eighteen surface categories, each naming a domain with its own failure
modes:

QUALITY_CAMPAIGN, ACCESSIBILITY, REGRESSION, MIGRATION, LEGACY, INCIDENT,
INFRASTRUCTURE, PAYMENTS, JOBS, REALTIME, FILES, I18N, SEO, DESIGN_SYSTEM,
PRIVACY, CACHING, ANALYTICS, FEATURE_FLAGS.

Every plan begins with `project-exploration`, with one deliberate exception:
INCIDENT begins with `incident-response`, because production is restored
before the codebase is understood. `tests/validate-orchestration.sh` check 4
encodes that exception rather than tolerating it.

The plan format is machine readable, which is what allows
`tests/validate-orchestration.sh` to verify their coherence.

## 7. Dependency graph

```
engineering-core
      |
      +-- project-exploration
      |         |
      |         +-- engineering-orchestrator
      |         |
      |         +-- architecture-design --+
      |         +-- ui-ux-engineering ----+
      |         +-- dependency-selection -+
      |                                   |
      |                    +--------------+
      |                    |
      |         backend-engineering   frontend-engineering
      |                    |                 |
      |                    +-- fullstack-engineering
      |                                |
      +-- input-validation ------------+
      |                                |
      +-- security-audit -- security-testing
      +-- debugging                    |
      +-- testing-quality -------------+
      |         |                      |
      |         +-- playwright-automation -- accessibility-testing
      |         +-- api-testing        |
      |         +-- reliability-testing|
      |                                |
      +-- quality-engineering ---------+
      |         |                      |
      |         +-- exploratory-testing
      |         +-- bug-hunting        |
      |         +-- regression-testing |
      |         +-- test-reporting     |
      |                                |
      +-- performance-engineering -----+
                                       |
                     code-review-protocol
                                |
      technical-documentation <--+--> project-continuity
                                |
                          git-workflow
                                |
                        release-readiness
```

`shared/self-critique` sits alongside `code-review-protocol` rather than
inside this graph. It selects the review panel and enforces the loop, then
delegates the depth here.

## 8. Validation

```bash
bash tests/validate-structure.sh      structure and metadata of the 155 skills
bash tests/validate-rules.sh          the repository-wide prohibitions
bash tests/validate-orchestration.sh  plans, references and scenarios
bash tests/validate-plugins.sh        plugin bundles in sync with the trees
bash tests/validate-model-routing.sh  routing fixtures against the tier table
```

The third script covers the eight trees and the agents. It verifies that every
task category has a plan, that every step names an existing skill, that the
mandatory gates appear where they are required, that plan ordering is
coherent, that no engineering skill is orphaned, that `depends_on` and cross
references resolve, and that the five reference routing scenarios hold.

It also covers the fourteen delivery phases, the fourteen agent definitions,
the document pipeline and the independence of `shared/`. The thirteen checks
are listed in `tests/README.md`.

The reference scenarios:

| Scenario | Category | Subsequence verified |
|---|---|---|
| A, bug in an API | DEBUGGING | exploration, debugging, backend, tests, review |
| B, new page | FRONTEND | exploration, UI/UX, frontend, validation, tests, playwright, performance, review |
| C, payment endpoint | BACKEND | exploration, architecture, backend, validation, security, tests, review |
| D, authentication review | SECURITY | exploration, security, review, documentation, with tests present |
| E, complete feature | FULLSTACK | the twelve steps of the vertical slice |

## 9. Extending

Adding an engineering skill:

1. create the directory in `engineering/dev-skills/` with its four mandatory
   elements;
2. declare `category: dev-skills` in the metadata block;
3. refer to `engineering-core` without copying it;
4. include a numbered `Protocol` section, an `Auto-critique` section and an
   `Interfaces` section;
5. add it to at least one execution plan, or check 7 reports it as an orphan;
6. update `engineering/dev-skills/README.md`, `skills-guide.md` and this file;
7. run the five validation scripts.
