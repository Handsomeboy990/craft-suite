# Agent tier rules

The tier rule for every one of the thirty-four agents of the chief's team
map, `delivery-orchestrator`'s `resources/team-routing.md`, in the same
teams. No agent is dispatched without a rule here, and no rule here
contradicts `SKILL.md` sections 3 to 6 or `tier-table.json`.

## 1. The rule every row starts from

An agent never sets its own tier. A dispatch routes on the classification of
its slice, produced once by `task-complexity` when the slice was cut, through
the table of `SKILL.md` section 3, then the overrides of section 5. The rows
below name only what the role adds: the override its brought-in condition
always fires, or the signal that usually drives its slices.

```
table        the slice's classification through SKILL.md section 3
override id  an entry of tier-table.json override_conditions, fired by the
             role's own condition on every dispatch of that agent
lead         a lead plans the whole request, so its dispatch routes on the
             request classification, not on one slice
```

A test pass or a browser journey that gates a change carries the driving risk
signal of that change, per `task-complexity`
`resources/sizing-to-composition.md` section 1: a CRITICAL change is never
gated by a pass classified LOW. An independent gate is held by
`independent-verifier-floor` whatever its own reproduction steps rate.

## 2. Rules by team

### The chief

| Agent | Tier rule |
|---|---|
| `delivery-orchestrator` | not routed: it is the orchestrating session, whose model only the human sets, `SKILL.md` section 1; run as a subagent, it is a lead |

### Chief's staff

| Agent | Tier rule |
|---|---|
| `delivery-manager` | table, on the planning slice |
| `requirements-analyst` | table; ambiguity (signal 5) usually drives it, and conflicting requirements rate HIGH |
| `codebase-cartographer` | table; `large-mechanical-output` when the pass is a bulk refresh with no judgment inside it |
| `checkup` | table, on the inspection of the code the next change touches |
| `source-of-truth` | table; `factual-error-on-verification` and `contradiction-with-sources` are its usual escalations |

### Engineering

| Agent | Tier rule |
|---|---|
| `principal-engineer` | lead |
| `software-architect` | table; a boundary or a public contract rates signal 3 HIGH, so phases 03 and 04 usually route strongest |
| `backend-engineer` | table; `security-driving-signal` on any auth, payment, upload, permission or secret slice |
| `frontend-engineer` | table; `security-driving-signal` on a client slice of an auth or payment flow |
| `database-engineer` | table; a production data operation or an irreversible migration rates signals 9 and 11 at least HIGH |
| `performance-engineer` | table, on the measured symptom |
| `site-template-engineer` | table; `security-driving-signal` on the back office authentication, upload and message slices |

### Design

| Agent | Tier rule |
|---|---|
| `design-director` | lead |
| `design-research` | table |
| `ui-ux-engineer` | table |
| `design-verification` | table, on the slice it verifies |

### Quality

| Agent | Tier rule |
|---|---|
| `qa-engineer` | lead for a campaign; for a gate, table on the gate slice, which carries the change's driving risk signal |
| `playwright-engineer` | table, on the journey slice, which carries the change's driving risk signal |

### Security

| Agent | Tier rule |
|---|---|
| `security-engineer` | `security-driving-signal`, every dispatch: its condition is a security signal |
| `penetration-tester` | `security-driving-signal`, every dispatch, and only with written authorization on record |
| `web-auditor` | `security-driving-signal` when the audit includes its security passes; table otherwise |

### Operations

| Agent | Tier rule |
|---|---|
| `devops-engineer` | table; `security-driving-signal` on a secrets slice |
| `ci-cd-engineer` | table; `security-driving-signal` when the pipeline handles secrets or deployment credentials |
| `release-engineer` | table; production impact (signal 11) usually drives it |
| `incident-responder` | table, which rates signal 11 CRITICAL during an incident: strongest for the duration of the response |

### Documentation

| Agent | Tier rule |
|---|---|
| `documentation-engineer` | table; `large-mechanical-output` for a bulk regeneration of reference pages |

### Research

| Agent | Tier rule |
|---|---|
| `researcher` | lead for a research request; `uncited-claim` and `contradiction-with-sources` are its usual escalations |
| `data-collection-engineer` | table; `security-driving-signal` when the gathered data holds personal data; `large-mechanical-output` for a bulk gather against a fixed schema |

### Communication

| Agent | Tier rule |
|---|---|
| `community-manager` | table, on the line or the plan slice; `uncited-claim` and `factual-error-on-verification` are its usual escalations. An author, never an independent gate: `independent-verifier-floor` does not apply, and whoever reviews its drafts is routed on that review slice |

### Independent gates

| Agent | Tier rule |
|---|---|
| `pr-author` | table, on the packaging slice |
| `pr-reviewer` | `independent-verifier-floor` |
| `compliance-verifier` | `independent-verifier-floor` |
| `final-verifier` | `independent-verifier-floor` |

Count check: 1 + 5 + 7 + 4 + 2 + 3 + 4 + 1 + 2 + 1 + 4 = 34.

## 3. What no row allows

- A lighter tier for a security, authentication, payment or irreversible
  slice because the agent is usually light, `SKILL.md` section 5.
- An independent gate routed lighter than the dispatch whose work it
  verifies.
- An agent's frontmatter default standing in for a resolved model, `SKILL.md`
  section 7 step 6.
