# devops-skills

Operations system. Fifteen skills covering how a system is provisioned,
configured, built, deployed, observed, recovered, released, and repaired when
it breaks.

Where `dev-skills` governs how code is written, this category governs how it
runs and what happens when it does not.

## Language

English, for the reason stated in `dev-skills/README.md`. The repository
constitution applies to every file: no emoji, no em dash.

## The skills

### Foundation

| Skill | Responsibility |
|---|---|
| `devops-core` | environment ladder, configuration rules, blast radius, destructive protocol |
| `environment-management` | the variable inventory and its drift checks |
| `secrets-management` | credential lifecycle, rotation, leak response |

### Build and ship

| Skill | Responsibility |
|---|---|
| `infrastructure-as-code` | infrastructure in code: state, plans, drift, imports |
| `containerization` | whether a container is warranted, and building it correctly |
| `ci-cd-pipelines` | a pipeline that fails for the right reasons |
| `deployment-engineering` | getting a verified artefact running, on any platform |
| `database-operations` | migrations, locks, backfills, live data safety |

### Run

| Skill | Responsibility |
|---|---|
| `observability` | logs, health, metrics, alerts, redaction |
| `backup-recovery` | a backup is untested until a restore has been performed |
| `production-verification` | proving the deployed system works by exercising it |
| `release-engineering` | versioning, tagging, changelog, rollout, hotfix path |
| `incident-response` | declaration to postmortem, mitigation before diagnosis |

### Automate

| Skill | Responsibility |
|---|---|
| `workflow-automation` | opt-in workflows through an external engine like n8n, no invented connection |

### Secure the transport

| Skill | Responsibility |
|---|---|
| `tls-certificates` | the certificate over its whole life: obtain, enforce, renew, monitor, guard the key |



## The rules that govern the family

From `devops-core`, inherited by all of them and restated by none:

```
The environment ladder is stated honestly, including what the project lacks
Configuration that differs by environment is never hardcoded
A process refuses to start without a required variable
Blast radius is classified before any operation above local
Destructive actions verify their target by reading it back
Every procedure is idempotent
Observability exists before the first production deployment
```

## What each skill refuses

| Skill | Refuses |
|---|---|
| `environment-management` | a real value in any tracked file |
| `secrets-management` | a leak response that deletes before rotating |
| `containerization` | a container that buys nothing, a secret in a layer |
| `ci-cd-pipelines` | weakening a check to obtain green |
| `deployment-engineering` | deploying without a rollback plan |
| `database-operations` | a destructive statement with no count first |
| `observability` | an alert with no written response |
| `backup-recovery` | reporting backups as in place with no rehearsal |
| `production-verification` | reporting success without exercising a path |
| `infrastructure-as-code` | applying a plan nobody read |
| `incident-response` | debugging before mitigating, or naming a person as a cause |
| `release-engineering` | a breaking change released as a minor version |

## Two distinctions worth holding

**`release-readiness` versus `release-engineering`.** The first, in
`dev-skills`, decides whether this revision may ship. The second decides what
the release is called and how it reaches users.

**`deployment-engineering` versus `production-verification`.** The first moves
the artefact. The second proves the moved artefact works. A deploy command
exiting zero satisfies neither.

## Platform agnostic

No skill assumes a provider. `deployment-engineering` carries a target
selection table whose deciding factor is usually the client's operations
capability rather than the technical merits, and `containerization` starts by
asking whether a container is warranted at all.

## Validation

```
bash tests/validate-structure.sh
bash tests/validate-rules.sh
bash tests/validate-orchestration.sh
```
