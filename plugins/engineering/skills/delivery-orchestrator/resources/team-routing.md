# Team routing

How the chief turns a request into the smallest complete team. Every one of
the thirty-three agents under `agents/` appears here by its exact name, in
exactly one team, with the condition that brings it in. No agent is invented,
and none is unreachable.

The chief is `delivery-orchestrator`. It sits above every agent and every
team. It does not implement, it does not approve its own architecture, and it
is the only role that holds the fourteen phase gates.

## 1. Command structure

```
delivery-orchestrator                      the chief: phases, gates, verdict
  chief's staff                            serve the chief, lead no team
  domain lead                              owns one domain's result
    specialist agents                      do the work inside the boundary
  independent gates                        report to the chief, belong to no team
```

Three rules hold the structure together.

1. **One chief.** No lead becomes a second orchestrator. `principal-engineer`
   leads the engineering team for one multi-surface request; it never holds a
   phase gate.
2. **No lead signs off its own team's work.** Every team's output passes an
   agent outside the team before it counts, per the review gates in
   `agents/README.md`.
3. **Independent gates answer only to the chief.** `final-verifier`,
   `compliance-verifier` and `pr-reviewer` are never dispatched by the team
   whose work they judge.

## 2. The teams

Eight teams plus the independent gates. Thirty-three agents in all.

### Chief's staff, five agents

| Agent | Brought in when | Hands to |
|---|---|---|
| `delivery-manager` | there is a date, a milestone or more than one wave of work | the chief, with slippage, cause and options |
| `requirements-analyst` | phase 01 and 02 of any project; any slippage traced to unclear scope | `software-architect`, or the chief with the question batch |
| `codebase-cartographer` | a repository too large to re-read per dispatch, before any parallel wave on it | `checkup`, `source-of-truth`, `principal-engineer`, every implementer with callers and blast radius |
| `checkup` | an inherited or unfamiliar codebase before the first change | the chief or `principal-engineer` with the risk map |
| `source-of-truth` | documentation and code may disagree; before a lead plans on documented facts | `documentation-engineer`, and the chief with the canonical fact record |

### Engineering team, lead `principal-engineer`, seven agents

| Agent | Brought in when | Hands to |
|---|---|---|
| `principal-engineer` | lead: a request spans several surfaces, or specialists disagree | the specialists, `qa-engineer` for the gate, the chief with the verdict |
| `software-architect` | phases 03 and 04; any change control that touches the architecture | the chief with the approval package; after approval, the implementers |
| `backend-engineer` | endpoint, service, job, integration | `security-engineer`, `qa-engineer`, `frontend-engineer` with the contract |
| `frontend-engineer` | page, component, client state, once the contract is fixed | `ui-ux-engineer`, `qa-engineer`, `playwright-engineer` |
| `database-engineer` | schema, migration, backfill, index, production data operation | `backend-engineer`, `performance-engineer`, `release-engineer` |
| `performance-engineer` | a measured symptom or a stated budget, never speculation | the owning implementer, `qa-engineer` for the regression |
| `site-template-engineer` | a client site template and its back office | `security-engineer`, `ui-ux-engineer`, `devops-engineer` |

### Design team, lead `design-director`, four agents

| Agent | Brought in when | Hands to |
|---|---|---|
| `design-director` | lead: design is owned across a product, not one screen | `design-research`, `ui-ux-engineer`, `design-verification`, the chief with sign-off |
| `design-research` | direction is needed from real references | `ui-ux-engineer`, `frontend-engineer`, then `design-verification` |
| `ui-ux-engineer` | any visual or interaction work, before and after the build | `frontend-engineer` |
| `design-verification` | after a UI is built, before a public page ships | `ui-ux-engineer`, `frontend-engineer`, `compliance-verifier` |

### Quality team, lead `qa-engineer`, two agents

| Agent | Brought in when | Hands to |
|---|---|---|
| `qa-engineer` | lead: any behaviour change, any release, any QA campaign | the implementer with findings, `release-engineer` when the gate passes |
| `playwright-engineer` | a browser surface exists and tooling exists or is justified | `qa-engineer`, `release-engineer`, `frontend-engineer` for an accessibility defect |

### Security team, lead `security-engineer`, three agents

| Agent | Brought in when | Hands to |
|---|---|---|
| `security-engineer` | lead: auth, payments, uploads, permissions, user content, secrets, before release | `qa-engineer`, `devops-engineer`, `release-engineer` |
| `penetration-tester` | written, specific, in-scope authorization is on record, never otherwise | `security-engineer` for every finding, the chief at every verification step |
| `web-auditor` | a live site is to be audited from its URL | the owning fixer, the chief at every registration step, `compliance-verifier` |

### Operations team, lead `devops-engineer`, four agents

| Agent | Brought in when | Hands to |
|---|---|---|
| `devops-engineer` | lead: environments, secrets, containers, deployment, observability | `security-engineer`, `release-engineer`, `documentation-engineer` |
| `ci-cd-engineer` | the pipeline is to be created, repaired or gated | `qa-engineer`, `security-engineer`, `release-engineer`, `devops-engineer` |
| `release-engineer` | phase 14, or any ship, deploy, release or version request | the chief with the verdict, `documentation-engineer` for notes |
| `incident-responder` | production is degraded or data is at risk; it leads the response for its duration | `qa-engineer`, `release-engineer`, `principal-engineer` for action items |

### Documentation team, lead `documentation-engineer`, one agent

| Agent | Brought in when | Hands to |
|---|---|---|
| `documentation-engineer` | phase 12, and whenever behaviour, a contract or setup changed | `release-engineer`, the chief with the handover package |

### Research team, lead `researcher`, two agents

| Agent | Brought in when | Hands to |
|---|---|---|
| `researcher` | lead: a question needs real, cited sources; a claim must be checked before a decision | the chief with the answer and the evidence trail, `software-architect` |
| `data-collection-engineer` | structured data must be gathered from external sources lawfully | `researcher`, `backend-engineer` or `database-engineer` when it feeds a build |

### Independent gates, four agents

| Agent | Brought in when | Answers to |
|---|---|---|
| `pr-author` | work is complete and verified and must become a pull request | `pr-reviewer`, then the chief with the link |
| `pr-reviewer` | any pull request, before it merges, never one it authored | the chief and whoever holds the merge |
| `compliance-verifier` | phase 11 of a user-facing web product | the chief with the launch verdict |
| `final-verifier` | the last step before the chief reports anything done | the chief, whose verdict it is the last word on |

Count check: 5 + 7 + 4 + 2 + 3 + 4 + 1 + 2 + 4 = 32 agents in teams, plus
`delivery-orchestrator` itself, 33.

## 3. Request to team

The first column is what the request is. The team is who leads it; the
minimum is who runs on every instance; the rest join only when their
condition in section 2 is met.

| Request | Governing skill | Lead | Minimum team |
|---|---|---|---|
| a project, spec, PRD, client brief | `delivery-orchestrator` | the chief | `requirements-analyst`, `software-architect`, `delivery-manager` when dated, then per phase |
| one multi-surface engineering request | `engineering-orchestrator` | `principal-engineer` | the implementers of the touched surfaces, `qa-engineer`, `final-verifier` |
| one single-surface change | `engineering-orchestrator` | the implementer itself | `qa-engineer`, `final-verifier` |
| inherited or unfamiliar codebase | `project-exploration`, `codebase-mapping` | the chief | `codebase-cartographer` when large, `checkup`, `source-of-truth` when docs exist |
| design across a product | `design-authenticity` | `design-director` | `design-research`, `ui-ux-engineer`, `design-verification`, `frontend-engineer` |
| a brand identity, a visual charter, a moodboard | `brand-identity` | `design-director` | `design-research` for the moodboard, `ui-ux-engineer` for the palette, type and tokens |
| a client site template | `site-template-generation` | `site-template-engineer` | `ui-ux-engineer`, `security-engineer`, `qa-engineer` |
| a QA campaign, validating a product | `quality-engineering` | `qa-engineer` | `playwright-engineer` when there is a browser surface |
| threat model, audit, hardening | `security-core` | `security-engineer` | `qa-engineer` for the tests that encode each fix |
| authorized active testing | `authorized-pentesting` | `security-engineer` | `penetration-tester`, only with the authorization on record |
| audit a live site from its URL | `website-audit` | `web-auditor` | the owning fixers, per finding |
| environment, pipeline, deployment, secret | `devops-core` | `devops-engineer` | `ci-cd-engineer` for pipeline work, `release-engineer` for any rollout |
| production degraded | `incident-response` | `incident-responder` | the owning implementer, `qa-engineer`, `release-engineer` |
| release or ship | `release-readiness` | `release-engineer` | `qa-engineer`, `final-verifier` |
| launch of a user-facing web product | `launch-readiness` | the chief | `compliance-verifier`, `security-engineer`, `design-verification` |
| performance symptom with a measurement | `performance-engineering` | `performance-engineer` | the owning implementer, `qa-engineer` |
| docs drifted from code | `technical-documentation` | `documentation-engineer` | `source-of-truth` |
| a research question with cited sources | `research-core` | `researcher` | `data-collection-engineer` when data must be gathered |
| schedule at risk | `delivery-planning` | `delivery-manager` | the chief, who decides |
| finished work to a pull request | `git-workflow` | `pr-author` | `pr-reviewer`, never the author |

## 4. Domains with no agent team

Four trees have skills but no agent: `writing/`, `documents/` beyond technical
documentation, `career/` and `opportunity/`. The chief does not invent an
agent for them. It loads the tree's constitution itself and runs that tree's
mandatory gate:

| Request | Constitution | Gate the chief holds |
|---|---|---|
| fiction, poetry, screenplay, revision | `writing-constitution` | `self-critique-protocol`, then at least one revision skill |
| delivered document, report, letter, PDF | `document-core` | the eight-point gate, eleven when paginated |
| editorial line, tone of voice, content charter | `document-core`, then `editorial-line` | the eight-point gate; the review rule accepted by the client; any conflict with the brand identity escalated to `design-director` and the owner, never settled |
| content calendar, social posts, moderation policy | `document-core`, then `social-content` | the eight-point gate; a signed or explicitly provisional editorial line as input, or `editorial-line` first; every post handed over with its exact content, never published by an agent; visual questions to `design-director` |
| job search, CV, cover letter, interview | `career-core` | every listing and deadline cited from a live source or withheld |
| ideas, hackathons, clients, markets | `opportunity-core` | a ranked few with reasoning, never a long list |

When one of these needs engineering, research or security work, that part is
routed to its team in section 3, and the rest stays with the chief.

`documents/communication/` is in this case until the community-manager agent
planned by ADR 0006 exists: the chief holds `editorial-line` and
`social-content` itself, drafts but never publishes, schedules or replies from
a real account, and brings in `design-director` only for a conflict with the
identity or a visual question on a post. Site copy written against the line
goes to the team that builds the site, in section 3.

## 5. Composing the smallest complete team

Never run a whole chain by reflex. The procedure:

1. Read the request literally and classify it with section 3. Two rows that
   compete: take the one with the stricter gates.
2. Size it once with `task-complexity`. The tier is read by every later
   decision, never re-derived by each.
3. Start from the minimum team of the row. Add an agent only when its
   condition in section 2 is met by this request, and write the condition
   down.
4. Add the independent gates the work reaches: `final-verifier` always before
   done; `pr-author` and `pr-reviewer` when a pull request is the outcome;
   `compliance-verifier` when a web product launches.
5. Name every agent left out whose absence a reader might question, with the
   reason, the way `engineering-orchestrator` names dropped steps.
6. Route a model for every dispatch with `model-routing`.

Two failure modes, equally bad: thirty-three agents on a typo, and a payment
endpoint without `security-engineer`. The second is never an optimisation; it
is a missing gate.

## 6. Disagreement between teams

| Disagreement | Resolved by |
|---|---|
| security or correctness | the stricter position, always |
| style or convention | the project convention |
| design intent versus implementation cost | `design-director` and `principal-engineer` together; unresolved goes to the chief |
| schedule versus a gate | the gate holds; the chief moves scope or date, `resources/handoff-and-escalation.md` section 4 |
| a change to the approved architecture | change control, `scope-and-change-control`, with the human when significant |
