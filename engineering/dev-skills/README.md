# dev-skills

Senior full-stack engineering skill system. Fifty four skills that let an agent
work on a production codebase the way an experienced engineer does: read
before writing, verify before claiming, and finish the whole vertical slice
rather than the part that demonstrates well.

Stack agnostic by construction. Every skill reads the project it is given and
adapts to it. None of them assume a framework, a database, an authentication
mechanism or a folder layout.

## Language

The content of `dev-skills` is written in English, unlike the rest of this
repository. These skills produce code, commit messages, branch names, pull
requests and technical documentation, all of which are English by the rule in
`engineering-core` section 6. Writing the instructions in the language of
their output keeps the two consistent.

The constitution of the repository still applies to every file here: no emoji,
no em dash.

## The skills

### Foundation

| Skill | Responsibility |
|---|---|
| `engineering-core` | the eight laws, evidence rule, certainty vocabulary, definition of done |
| `project-exploration` | turns an unfamiliar repository into verified facts |
| `engineering-orchestrator` | classifies the task, composes the plan, enforces the gates |
| `task-complexity` | one complexity classification, read by every routing decision |
| `model-routing` | model tier, and where a lever exists effort, from the classification |
| `token-optimization` | keeps context and output proportional to the task, during the work |

### Design

| Skill | Responsibility |
|---|---|
| `architecture-design` | the smallest architecture that serves the product |
| `ui-ux-engineering` | the rendered experience, specified before it is built |
| `design-authenticity` | the generic-defaults cluster, and the intentionality test |
| `animation` | motion that is intended: the technique ladder, cheap properties, reduced motion |
| `dependency-selection` | whether a library is added, replaced, upgraded or refused |

### Implementation

| Skill | Responsibility |
|---|---|
| `frontend-engineering` | client side features, five states, accessibility |
| `backend-engineering` | handlers, services, data, transactions, jobs |
| `fullstack-engineering` | the vertical slice and the contract both sides share |

### Verification

| Skill | Responsibility |
|---|---|
| `input-validation` | every external value, validated at the trusted boundary |
| `security-audit` | twenty four point sweep, fixes plus manual actions |
| `debugging` | root cause with a file, a line and a mechanism |
| `testing-quality` | the right layer, ten mandatory cases, tests that can fail |
| `playwright-automation` | browser journeys, responsive and keyboard proof |
| `performance-engineering` | measure, fix the dominant cost, prove the delta |
| `code-review-protocol` | five passes, then fix what it finds and verify it |

### Delivery

| Skill | Responsibility |
|---|---|
| `technical-documentation` | documentation that matches the implementation |
| `project-continuity` | a handoff the next session can resume from |
| `git-workflow` | identity, atomic commits, history hygiene, pull requests |
| `release-readiness` | nine gates and a go or no go verdict |

### Domain surfaces

Loaded when the request names one of them, and left alone otherwise.

| Skill | Responsibility |
|---|---|
| `api-design` | the contract, before the endpoint exists |
| `database-design` | schema, constraints and indexes from access patterns |
| `caching-strategy` | whether to cache at all, then where and how it expires |
| `background-jobs` | queues, retries, idempotency, scheduled work |
| `realtime-systems` | live features that survive a real network |
| `file-handling` | uploads, storage, processing, delivery |
| `payment-engineering` | flows that stay correct when money moves |
| `internationalization` | more than one language and region |
| `seo-engineering` | the technical half of search visibility |
| `design-system` | tokens, component contracts, themes, adoption |
| `data-privacy` | what is held, for how long, and deletion that works |
| `analytics-instrumentation` | product measurement designed before it is emitted |
| `feature-flags` | flags with a lifecycle, and the removal that closes it |
| `admin-console` | the privileged back-office, bounded by role and on the record |
| `llm-integration` | a feature on a language model: contract, evals, grounding, guardrails |

### Change and continuity

| Skill | Responsibility |
|---|---|
| `refactoring` | structure changed, behaviour proven unchanged |
| `legacy-code` | safe change in code nobody trusts |
| `migration-engineering` | moving a running system in reversible steps |
| `technical-debt` | debt measured, ranked, paid inside real work |
| `decision-records` | why the system is built this way, immutably |

### Quality

| Skill | Responsibility |
|---|---|
| `quality-engineering` | coordinates a campaign and issues the verdict |
| `api-testing` | the contract, verified past the first 200 |
| `exploratory-testing` | designed exploration under a charter |
| `bug-hunting` | systematic adversarial testing of a working feature |
| `regression-testing` | what to re-run, and what was excluded |
| `accessibility-testing` | keyboard first, scanner last |
| `security-testing` | authorized dynamic testing of the real controls |
| `reliability-testing` | behaviour when a dependency fails |
| `test-reporting` | findings, severity, evidence, one verdict |

## How the system runs

`engineering-core` loads first and is never restated by the others.
`engineering-orchestrator` classifies the request, composes a plan from
`engineering-orchestrator/resources/execution-plans.md`, drops the steps that
have no purchase on the project, and enforces the gates that never drop.

```
request -> engineering-core
        -> engineering-orchestrator
             classify, locate the surface
        -> project-exploration
             establish the facts
        -> the selected skills, in order
        -> the mandatory gates
        -> completion verdict
```

The plan is the smallest complete one. A typo fix is four steps; a payment
endpoint is eleven. Both are correct.

## Mandatory gates

Never dropped to save time:

| Gate | Applies when |
|---|---|
| exploration before decision | any unread code is touched |
| validation before persistence | new external input reaches storage or an effect |
| authorization before exposure | any new route or query returning user scoped data |
| security review before merge | auth, payments, uploads, user content, permissions, secrets, dependencies |
| test before done | any behaviour change |
| review before delivery | any code the agent wrote |
| continuity before handoff | any session that changed the repository |
| author check before commit | every commit |

## Structure

Every skill follows the repository convention:

```
skill-name/
  SKILL.md      metadata block, numbered protocol, auto-critique, interfaces
  README.md     summary, inputs, outputs, dependencies
  examples/     at least one worked example
  resources/    at least one checklist, grid or template
```

## Validation

```
bash tests/validate-structure.sh      structure and metadata of all skills
bash tests/validate-rules.sh          constitution rules on every markdown file
bash tests/validate-orchestration.sh  plans, references and routing scenarios
```

The third script is specific to this system. It verifies that every task
category has a plan, that every plan step names a real skill directory, that
the mandatory gates appear where they are required, and that the five
reference scenarios route correctly.

## Reading order for a newcomer

1. `engineering-core/SKILL.md`, the rules everything else assumes.
2. `engineering-orchestrator/SKILL.md` and its execution plans.
3. `project-exploration/SKILL.md`, since nothing may be guessed.
4. The skill for the task at hand.
