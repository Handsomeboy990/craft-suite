# Roadmap

What is left to build, hardened into phases and ordered by leverage rather
than by wish. Each item states what it is, why it earns its place, its rough
size, what it depends on, and its status. This complements `CONTINUITY.md`,
which records what was done and the live constraints; this file records what
comes next.

Sizes are relative: S is a sitting, M is a focused session, L is several
sessions or a precondition outside the repository.

## Status legend

```
parked      waiting on the user, or on an external step, not on more work here
ready       can start now, no blocker
blocked     needs another item first
```

## Phase 0: foundation hygiene, do first

The one improvement that pays back on every item after it.

| Item | What | Size | Status |
|---|---|---|---|
| Count-consistency check | A `tests/validate-counts.sh` that compares the counts written in the key docs (README, skills-guide, architecture, the tree indexes) against the real directory counts, and fails on drift. This session chased count drift by hand across dozens of files and found `delivery-system` had undercounted devops at eleven for a long time. A check removes that whole class of error. | S | ready |

Rationale: every future skill or agent touches counts in prose. Automating the
check means the next addition cannot silently leave a stale number, and no
future session repeats the manual sweep.

## Phase 1: close the original specification

Three skills named in the original brief that are only covered in pieces inside
other skills, never in their own right.

| Item | What | Size | Status |
|---|---|---|---|
| `rate-limiting` skill | Per-endpoint limits by sensitivity: login, one-time codes, password reset, uploads, search, public forms, keyed by IP, user and resource cost. Today scattered across `input-validation` and `authentication-security`. | M | ready |
| `tls-certificates` skill | Certificate lifecycle: installation, renewal, HSTS, HTTPS enforcement, expiry monitoring, reverse proxy, development versus production certificates. Today `security-headers` and `deployment-engineering` touch fragments; the certificate itself has no owner. | M | ready |
| `admin-console` skill | Back-office architecture: role-based access, permissions, audit logs, user management, operational controls, with no secret exposed to the browser. The original section 22, never built. | M | ready |

Placement: `rate-limiting` in `security/secure-development` or
`engineering/dev-skills`; `tls-certificates` in `engineering/devops-skills`;
`admin-console` in `engineering/dev-skills`. Each is wired into its tree index
and, for the engineering ones, an execution plan or delivery phase.

## Phase 2: the highest-value new capability

| Item | What | Size | Status |
|---|---|---|---|
| `llm-integration` skill | Building features driven by a language model: prompt design, evaluations, retrieval-augmented generation, cost and latency management, guardrails, handling refusals and truncated output. The suite is used to build with Claude and has no skill for building with an LLM. Written against the real API constraints, not from memory. | M | ready |
| `email-deliverability` skill | SPF, DKIM, DMARC, sending-domain configuration, reputation. The "confirmation email on signup" item lives in `launch-readiness` as a check; deliverability itself has no owner. | S | ready |

## Phase 3: harden verification

The three core agents deferred in `multi-agent-assessment.md` section 3, each a
real role with a boundary, plus the one thing this whole layer still needs.

| Item | What | Size | Status |
|---|---|---|---|
| `source-of-truth` agent | Maintains canonical project knowledge and reconciles stale documentation against the code, per the original section 5.2. | M | ready |
| `checkup` agent | Inspects a project before intervention: architecture, debt, risks, safe boundaries, per the original section 5.3. | M | ready |
| `final-verifier` agent | The independent, evidence-only final verification that trusts no previous agent, per the original section 32. | M | ready |
| Exercise the agent layer | The agent layer had never run as subagents before this work, and the new agents (`compliance-verifier`, `design-verification`, `web-auditor`, `pr-author`, `pr-reviewer`) have not been exercised on a real task. Run them, capture the telemetry, confirm the routing and the handoffs hold. | M | ready |

## Phase 4: distribution and telemetry

| Item | What | Size | Status |
|---|---|---|---|
| Per-domain agent packs | Today every agent is bundled in the engineering plugin, so `--security` installs the `website-audit` skill but not the `web-auditor` agent. Split the agents so each domain's pack carries its own, which the suite's own domain-independence rule asks for. | M | ready |
| Control Center agent panel | The agent-dispatch telemetry is collected in `reader.py` and reachable through the report and the JSON, but the browser dashboard has no panel for it yet. Add the panel and its EN and FR strings. | M | ready |
| Advisor agent-level waste | Extend `advisor.py` with a detection for agent-level waste: an agent invoked where a lighter skill would have done, a model tier stronger than the classification justified. Buildable now that the dispatch data exists. | M | blocked, needs the panel or the agent layer exercised for real data |

## Phase 5: proof

The suite documents how work is done; these prove it on real work.

| Item | What | Size | Status |
|---|---|---|---|
| Delivery demonstration project | No worked example exists for the fourteen delivery phases, unlike the writing tree's saga. Run the phases on a small real application and keep the artefacts. | L | ready |
| Documents demonstration set | No worked example for the documents tree either. Produce a three-document set for one subject, exercising the reader split and the PDF render verification. | M | ready |

## Parked and external

Not waiting on work in this repository.

| Item | What | Status |
|---|---|---|
| n8n end to end | The `workflow-automation` skill is delivered, but the n8n MCP server must be configured and authorized interactively by the user, and no workflow has been built or run against a live instance. Exercising it is the user's interactive step. | parked |
| Release to `main` | `dev` carries everything from 3.1.0 to 3.6.0. Promoting to `main` is a release decision for the user; the merge back into `dev` must be a merge commit, not a squash, per `release-branch-and-push-constraints`. | parked |
| Second code owner | `enforce_admins` stays off until `.github/CODEOWNERS` names a second reviewer, because a lone owner cannot approve their own request and turning it on would remove every path to a merge. | parked |

## Recommended order

```
0  count-consistency check        cheap, pays back on everything after it
1  llm-integration                 the highest-value gap for what this repo builds
2  rate-limiting, tls-certificates, admin-console   close the original brief
3  source-of-truth, checkup, final-verifier         harden verification
   and exercise the agent layer on a real task
4  per-domain agent packs, then the Control Center panel
5  the two demonstration projects
```

Phases 2 and 1 can swap by preference; the count check comes first either way,
and the demonstration projects come last because they exercise everything
above them.

## Known limitations carried forward

Recorded so they are chosen, not stumbled into. Detail in `CONTINUITY.md` and
`docs/architecture/`.

- Model routing recommends a model and an effort but cannot enforce the effort
  on an arbitrary dispatch; only model choice is a real lever. Stated in
  `MODEL_ROUTING.md`, not a defect to fix but a boundary to remember.
- The agent layer's review gates and boundaries are a documented discipline,
  not a runtime guarantee; a runtime that grants every subagent full write
  access enforces none of them.
- Counts in prose are maintained by hand until Phase 0 lands.
