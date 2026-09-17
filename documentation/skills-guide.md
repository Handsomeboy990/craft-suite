# Skills guide

Directory of the 163 skills. One line each: what it does, and when to open it.

Every skill's own `README.md` carries its inputs, outputs, dependencies and
configuration in four lines. This file is the index; the READMEs are the
contracts.

## Choosing by situation

| Situation | Skill |
|---|---|
| I am starting anything significant | `project-brief` |
| I finished something and want it checked | `self-critique` |
| I must validate a whole product before launch | `quality-engineering` |
| I need to know what to re-run after a fix | `regression-testing` |
| The API works and I do not trust it | `api-testing` |
| I want the defects tests do not find | `exploratory-testing`, `bug-hunting` |
| Someone asked whether it is accessible | `accessibility-testing` |
| I am authorised to test the security of a running system | `security-testing` |
| Users are hammering my login or my forms | `rate-limiting` |
| I need HTTPS, or a certificate is about to expire | `tls-certificates` |
| I am building an admin panel or back-office | `admin-console` |
| I want to know what happens when a provider fails | `reliability-testing` |
| I have findings and need a report | `test-reporting` |
| I am designing an endpoint anyone else will call | `api-design` |
| I am about to create a table | `database-design` |
| The structure fights me every time I change it | `refactoring` |
| I inherited a codebase with no tests | `legacy-code` |
| We must move off this framework, database or provider | `migration-engineering` |
| Everyone complains about the code and nobody agrees | `technical-debt` |
| This choice will be questioned in two years | `decision-records` |
| It is slow and someone said cache it | `caching-strategy` |
| This work does not belong in the request | `background-jobs` |
| It must update live | `realtime-systems` |
| Users upload files | `file-handling` |
| Money moves | `payment-engineering` |
| We are launching in a second language | `internationalization` |
| The public pages must be found | `seo-engineering` |
| Every screen looks slightly different | `design-system` |
| We hold personal data | `data-privacy` |
| Nobody can answer a question from our data | `analytics-instrumentation` |
| This must ship disabled, or needs a kill switch | `feature-flags` |
| We must provision infrastructure | `infrastructure-as-code` |
| Production is down | `incident-response` |
| I am starting a novel | `novel-architect` |
| I do not know where to cut my chapters | `chapter-architect` |
| My scene is flat | `scene-builder` |
| Every character speaks alike | `dialogue-master` |
| My protagonist is dull | `character-psychologist` |
| My setting reads like a brochure | `immersion-director` |
| I am writing about a real trade or period | `research-director` |
| I have lost track of the dates | `timeline-manager` |
| I no longer know who knows what | `continuity-manager` |
| My middle sags | `story-doctor` |
| My text is correct but flat | `literary-editor` |
| Is this publishable | `literary-critic` |
| I am delivering a manuscript | `publication-review` |
| A partner must integrate with our API | `technical-writing` |
| A customer cannot find how to do something | `user-documentation` |
| Leadership must decide | `report-writing` |
| A formal letter has to be sent | `administrative-writing` |
| Four deliverables must look like one set | `document-design` |
| The client wants a PDF | `pdf-production` |
| I have a coding task | `engineering-orchestrator` |
| I have never seen this codebase | `project-exploration` |
| I have a bug | `debugging` |
| It is slow | `performance-engineering` |
| Is it safe to ship | `release-readiness` |
| I have a specification, not a task | `delivery-orchestrator` |
| Something must be deployed | `devops-core` |
| I want scheduled jobs or integrations through a workflow tool | `workflow-automation` |
| Is the deployment actually working | `production-verification` |
| Is the website actually ready to launch | `launch-readiness` |
| My site looks like every other AI-generated site | `design-authenticity` |
| I want motion that reads as designed, not hover-everywhere | `animation` |
| I have a URL and want everything wrong with the site | `website-audit` |

## shared, 2 skills

Depend on nothing. Callable from any tree, usable alone.

| Skill | What it does |
|---|---|
| `project-brief` | frames work before it starts: inspects, asks the decision-critical questions in one batch, records assumptions, writes the working agreement |
| `self-critique` | reviews finished work from the roles that will receive it, checks it against the request, fixes what it finds, re-reviews |

## writing, 42 skills

### core, 14

| Skill | What it does |
|---|---|
| `writing-constitution` | the non-negotiable rules and the conformity grid |
| `novel-architect` | premise, dramatic question, structure, arcs, reveal schedule, outline |
| `chapter-architect` | chapter breakdown, entry and exit values, worked titles |
| `scene-builder` | objective, escalating conflict, costly outcome, irreversibility |
| `narrator` | person, focalisation, tense, distance, free indirect speech, voice |
| `dialogue-master` | French dialogue typography, incises, subtext, voice differentiation |
| `character-psychologist` | the seven field core, access layers, behavioural translation, arcs |
| `world-builder` | material constraint, geography, economy, power, special systems |
| `immersion-director` | nine sensory and cultural channels, dosage, anti-exoticism |
| `research-director` | research needs, depth levels, sources, anachronism control |
| `continuity-manager` | eight registers, per-chapter updates, eight-pass audit |
| `timeline-manager` | master and reader chronologies, ellipses, flashbacks |
| `saga-architect` | volume question against saga question, long memory, narrative debts |
| `screenwriter` | pitch, treatment, breakdown, screenplay, adaptation |

### genres, 15

| Skill | Dominant requirement |
|---|---|
| `thriller` | temporal pressure |
| `mystery` | fairness of the clues |
| `detective` | procedural accuracy |
| `horror` | economy of showing |
| `fantasy` | necessity of the fantastic |
| `dark-fantasy` | absence of complacency |
| `science-fiction` | depth of consequences |
| `cyberpunk` | material density |
| `historical-fiction` | documentary accuracy |
| `romance` | strength of the internal obstacle |
| `adventure` | consistency of attrition |
| `dystopian` | credibility of the system |
| `political-fiction` | absence of manicheism |
| `espionage` | coherence of the betrayal |
| `magical-realism` | non-astonishment held |

### poetry, 5

| Skill | What it does |
|---|---|
| `poet` | French prosody, image, sound, seven-step composition |
| `sonnet` | fourteen lines, rhyme arrangements, the volta |
| `haiku` | brevity, season marker, the cut |
| `free-verse` | a constraint invented per poem and held |
| `prose-poetry` | a block, four cohesion forces, closure by displacement |

### quality, 8

| Skill | What it does |
|---|---|
| `self-critique-protocol` | eleven axes, quoted evidence, numeric thresholds |
| `story-doctor` | structural diagnosis, symptom to cause, repair plan |
| `rewriting-engine` | six rewrite modes, salvage rules |
| `literary-editor` | six style passes, editorial note, cut log |
| `proofreader` | five correction passes, French typography |
| `beta-reader` | simulated reading, drop-off points, no prescription |
| `literary-critic` | weighted grid, decision scale, one recommendation |
| `publication-review` | seven checks, written decision, publication dossier |

## documents, 7 skills

| Skill | Category | What it does |
|---|---|---|
| `document-core` | documentation | audience model, language layers, evidence rule, quality gate |
| `technical-writing` | documentation | architecture documents, API references, installation and operational guides |
| `user-documentation` | documentation | guides, manuals, help articles, support material |
| `report-writing` | documentation | status, audit, incident and options reports |
| `administrative-writing` | administrative | letters, notices, attestations, minutes, applications |
| `document-design` | publishing | hierarchy, typography, tables, page furniture, metadata |
| `pdf-production` | publishing | engine selection, generation, render verification |

## engineering, 79 skills

### dev-skills, 53

| Skill | What it does |
|---|---|
| `engineering-core` | the non-negotiable engineering rules |
| `engineering-orchestrator` | classifies a task and composes the smallest complete plan |
| `task-complexity` | one complexity classification, read by every routing decision |
| `model-routing` | model tier, and effort where a lever exists, from that classification |
| `token-optimization` | context and output proportional to the task, during the work |
| `project-exploration` | maps an unfamiliar codebase before any change |
| `architecture-design` | the smallest architecture that serves the product |
| `ui-ux-engineering` | the rendered experience, states, accessibility |
| `design-authenticity` | detects generic AI-default design, tests for intent |
| `animation` | motion that reads as designed: technique ladder, cheap props, reduced motion |
| `dependency-selection` | twelve point evaluation before adding a library |
| `frontend-engineering` | pages, components, state, forms, the five UI states |
| `backend-engineering` | handlers, services, authorization, transactions, jobs |
| `fullstack-engineering` | a feature across every layer, contract first |
| `input-validation` | every external input treated as hostile |
| `security-audit` | twenty four point sweep of the real implementation |
| `debugging` | reproduction, evidence, root cause, verified fix |
| `testing-quality` | the right test layer, tests that can actually fail |
| `playwright-automation` | browser verification of real journeys |
| `performance-engineering` | baseline, bottleneck, targeted fix, proven delta |
| `code-review-protocol` | senior review that finds defects and fixes them |
| `technical-documentation` | documentation living in the codebase |
| `project-continuity` | leaves the project resumable by someone else |
| `git-workflow` | identity, atomic commits, delegation boundaries, pull requests |
| `release-readiness` | nine gates, then a go or no go verdict |
| `api-design` | the contract before the endpoint exists |
| `database-design` | schema, constraints, indexes from access patterns |
| `refactoring` | structure changed, behaviour proven unchanged |
| `legacy-code` | safe change in code nobody trusts |
| `migration-engineering` | moving a running system, in reversible steps |
| `technical-debt` | debt measured, ranked and paid inside real work |
| `decision-records` | why the system is built this way, immutably |
| `caching-strategy` | whether to cache, where, keyed by what, invalidated how |
| `background-jobs` | queues, retries, idempotency, scheduled work |
| `realtime-systems` | live features that survive a real network |
| `file-handling` | uploads, storage, processing and delivery, safely |
| `payment-engineering` | flows that stay correct when money moves |
| `internationalization` | more than one language and region, done properly |
| `seo-engineering` | the technical half of search visibility |
| `design-system` | tokens, component contracts, themes, adoption |
| `data-privacy` | what is held, for how long, and deletion that works |
| `analytics-instrumentation` | events designed from the questions they answer |
| `feature-flags` | flag types, rollout, stale detection, removal |
| `admin-console` | the privileged back-office: least-privilege roles, audit log, server-side authz |
| `quality-engineering` | coordinates a whole quality campaign and its verdict |
| `api-testing` | an HTTP surface against its contract, past the 200 |
| `exploratory-testing` | designed exploration under a charter and a time box |
| `bug-hunting` | systematic adversarial testing of a working feature |
| `regression-testing` | what to re-run, and what was deliberately excluded |
| `accessibility-testing` | keyboard first, scanner last |
| `security-testing` | authorized dynamic testing of the real controls |
| `reliability-testing` | what happens when a dependency fails |
| `test-reporting` | findings, severity, evidence, lifecycle, one verdict |

### delivery-skills, 11

| Skill | What it does |
|---|---|
| `delivery-orchestrator` | fourteen phases, four approval gates, completion verdict |
| `requirements-analysis` | a specification into an implementable engineering spec |
| `clarification-gate` | what must be asked, once, in one grouped batch |
| `technology-selection` | the stack, with a written justification per decision |
| `architecture-proposal` | the formal proposal, sized to the project |
| `validation-gate` | the firm stop before any production code |
| `delivery-planning` | ordered atomic tasks with dependencies and milestones |
| `implementation-integrity` | forbids and detects fake functionality |
| `scope-and-change-control` | protects an approved scope from silent drift |
| `launch-readiness` | the completeness gate for a user-facing web product before launch |
| `client-handover` | the delivery package another team can take over |

### devops-skills, 15

| Skill | What it does |
|---|---|
| `devops-core` | environment ladder, configuration, blast radius, destructive protocol |
| `environment-management` | the variable inventory and drift detection |
| `secrets-management` | credential lifecycle, rotation, leak handling |
| `containerization` | whether a container is warranted, and how to build it |
| `ci-cd-pipelines` | a pipeline that fails for the right reasons |
| `deployment-engineering` | a verified artefact running in a target environment |
| `database-operations` | migrations, backfills, indexes, production safety |
| `observability` | logs, health, metrics, alerts on user impact |
| `backup-recovery` | a backup is untested until a restore has been performed |
| `production-verification` | proves a deployed system works, by exercising it |
| `release-engineering` | versioning, tagging, changelog, rollout, hotfix path |
| `infrastructure-as-code` | infrastructure in code, state, plans, drift |
| `incident-response` | declaration to postmortem, mitigation before diagnosis |
| `workflow-automation` | opt-in workflows through an external engine like n8n, connector never invented |
| `tls-certificates` | the TLS certificate over its whole life, key never leaked |

### agents, 16

`delivery-orchestrator`, `principal-engineer`, `requirements-analyst`,
`software-architect`, `frontend-engineer`, `backend-engineer`,
`database-engineer`, `security-engineer`, `qa-engineer`,
`playwright-engineer`, `ui-ux-engineer`, `devops-engineer`,
`performance-engineer`, `documentation-engineer`, `release-engineer`,
`incident-responder`.

Public contracts in `agents.md`. An agent is a role: it names the skills it
uses and restates none of them.

## security, 12 skills

### secure-development, 9

- `security-core`: constitution. Defensive posture, the authorization boundary,
  the severity scale, the evidence rule, fix-and-verify. Depends on nothing.
- `threat-modeling`: assets, adversary, trust boundaries, ranked and decided
  threats. A model that ends in decisions, not a diagram.
- `security-architecture`: fail-closed structural decisions before code, each
  with the downstream constraint it imposes.
- `authentication-security`: password storage, login, recovery, MFA, token
  lifecycle. Authentication only, never authorization.
- `authorization-design`: object-level access, the enforcement choke point,
  privilege-escalation paths. Closes the most common serious web defect.
- `session-security`: cookies, fixation, timeout, revocation, CSRF.
- `dependency-security`: the supply chain, advisories re-ranked by reachability,
  safe upgrades, typosquatting.
- `security-headers`: CSP, HSTS, CORS and the browser hardening headers,
  verified on the live response.
- `rate-limiting`: a limit per endpoint by the cost of abuse, keyed unforgeably
  by IP or user, over the real control not instead of it.

### security-assurance, 3

- `vulnerability-assessment`: a non-intrusive sweep of an owned system, ranked
  findings, a remediation plan.
- `authorized-pentesting`: active exploitation to prove impact, strictly inside
  written authorization. The one gated offensive skill.
- `website-audit`: a URL-driven audit across front, back, security,
  performance, accessibility and design. Passive on any URL, active only on an
  owned or authorized target, human in the loop for registration.

## research, 5 skills

- `research-core`: constitution. Question before search, source hierarchy, the
  consulted-only citation rule, fact versus inference versus opinion. Depends on
  nothing.
- `source-research`: build the search, work down to primaries, read and attribute.
- `source-verification`: trace a claim to origin, test it, catch circular citation.
- `competitive-analysis`: axes from the decision, evidence matrix, trade-offs.
- `synthesis-reporting`: conclusion first, confidence per finding, gaps named.

## career, 7 skills

- `career-core`: constitution. Nothing invented about the world, nothing
  unsupportable claimed about the candidate; reads the `career` config. Depends
  on nothing.
- `career-profile`: the honest profile every other career skill reads.
- `job-search`: real openings from live sources, honest match, real links.
- `cv-engineering`: a CV that survives a parser and an interview, every line true.
- `cover-letter`: a specific, honest letter that earns the interview.
- `interview-preparation`: answers from real experience, drilled with follow-ups.
- `company-research`: a sourced profile, health, culture and red flags.

## opportunity, 9 skills

### ideation, 3

- `opportunity-core`: constitution. Discover, evaluate, recommend; grounding
  rule; the binding constraint. Depends on nothing.
- `ideation-engine`: a diverse, grounded set worth evaluating, not a long list.
- `idea-evaluation`: converge to a ranked few, each with its riskiest assumption
  and cheap test.

### hackathons, 3

- `hackathon-discovery`: real events matched, eligibility and deadlines verified.
- `hackathon-strategy`: read the rubric, scope to finish, demo early, protect the
  submission.
- `pitch-and-demo`: a problem-first pitch and a working demo, honest and rehearsed.

### business, 3

- `client-discovery`: the ideal client profile, real signalled prospects, qualified.
- `lead-research`: a sourced dossier and a grounded, honest outreach draft.
- `market-research`: bottom-up sizing, a real competitor map, an honest assessment.

## Skills that work alone

Ten depend on nothing and can be copied and used on their own:

```
shared/self-critique
shared/project-brief
writing/core/writing-constitution
documents/documentation/document-core
engineering/dev-skills/engineering-core
engineering/devops-skills/devops-core
security/secure-development/security-core
research/research-core
career/career-core
opportunity/ideation/opportunity-core
```

Every other skill declares its dependencies in `depends_on` and in its README.
`tests/validate-orchestration.sh` check 8 verifies that each one resolves.

## Skills that read configuration

| Skill | Fields |
|---|---|
| `git-workflow` | `identity.*`, `git.*`, `delegation.*` |
| `release-engineering` | `git.commit_convention`, `delegation.release_tags` |
| `deployment-engineering` | `engineering.deployment_platform`, `delegation.deployments` |
| `database-operations` | `delegation.database_operations` |
| `dependency-selection` | `engineering.package_manager`, `delegation.dependency_changes` |
| `model-routing` | `model_routing.fast`, `model_routing.balanced`, `model_routing.strongest` |
| `technical-documentation`, `technical-writing` | `language.documentation` |
| the `writing/` tree | `language.creative_output` |
| the `documents/` tree | `language.document_output`, `identity.organization`, `documents.*` |
| the `career/` tree | `career.*` |

Field reference in `config/README.md`.
