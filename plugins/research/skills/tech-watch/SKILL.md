---
name: tech-watch
description: A standing watch on the stack a project actually uses: at project start and on a rhythm after, it establishes what is installed and at which version, then tracks the releases, the breaking changes and the security advisories that touch exactly those dependencies, and reports what to adopt, what to fix and what to defer, each traced to a live official source. Use at the start of any project and whenever its stack changes.
license: MIT
metadata:
  category: research
  version: 1.0.0
  depends_on: [research-core]
  outputs: [stack-inventory, watch-findings, upgrade-and-fix-list]
---

# Tech Watch

Keeps a project's knowledge of its own stack current, instead of discovering a
critical advisory or a breaking release the day it hurts. It starts from what
the project really runs, not from what is fashionable, and it reports only what
touches those exact dependencies.

A watch that lists the whole ecosystem's news is noise. A watch that names a
version, an advisory id and the one line of the project it affects is a service.
Every item is traced to a live official source, or it is not reported.

## 1. Entry condition

Runs at the start of a project, right after the stack is chosen or discovered,
and then on a rhythm the working agreement sets, and whenever a dependency is
added, removed or upgraded. The start run establishes the baseline the later
runs compare against.

## 2. Establish the stack inventory

Before watching anything, know what to watch. From the manifests and lockfiles,
not from memory:

- every runtime, framework and library the project depends on, direct and
  transitive, with the exact installed version;
- the language and runtime versions, the database and its version, the build
  and deploy tooling;
- the support status of each: current, maintenance, or end of life.

The inventory is the keyed list every later finding attaches to. A finding
about a dependency not in the inventory is out of scope and dropped.

## 3. Work from official sources only

For each watched dependency, consult the primary source, never a summary of it:

- the project's own releases, changelog and migration guides;
- the official security advisory channel for the ecosystem and for the
  dependency (the advisory database, the vendor bulletin, the CVE record);
- the maintainer's deprecation and end-of-life announcements.

A blog, an aggregator or a model's recollection is a pointer to the primary
source, never the source itself, and never the thing cited.

## 4. Triage every signal

Each signal is sorted into one of three, and nothing else is reported:

| Kind | What it is | Carries |
|---|---|---|
| security | an advisory affecting an installed version | the advisory id, the affected range, the fixed version, the severity |
| breaking | a release that changes behaviour the project relies on | the version, the migration cost, what breaks |
| novelty | a capability worth adopting | the version, the benefit, the cost of adopting |

A signal that touches a version the project does not run is noted as not
applicable, with the reason, and never inflated into a finding.

## 5. Report: adopt, fix, defer

The watch ends in a decision list, ranked:

- **Fix now**: a security advisory against an installed version, with the exact
  upgrade or mitigation and the affected code path.
- **Plan**: a breaking change or an end-of-life that will force work, with the
  cost and a by-when.
- **Defer**: a novelty with a stated benefit that does not yet justify its cost,
  recorded so it is reconsidered, not lost.

Each item names the dependency, the version, the source and the one place in
the project it affects. It does not perform the upgrade; it hands the fix list
to the engineer and the security finding to the fixer.

## 6. Prohibitions

- No finding about a dependency not in the inventory.
- No item without a live, official source retrieved and read.
- No severity copied from an aggregator without the primary advisory.
- No novelty reported as urgent, and no security advisory reported as optional.
- No upgrade performed here: the watch reports, the engineer and the fixer act.
- No claim that the stack is clear; only that the watched sources, named, showed
  nothing applicable as of the date of the run.

## 7. Protocol

1. Build the stack inventory from the manifests and lockfiles, with versions.
2. For each dependency, retrieve its official releases and advisory channel.
3. Read each relevant entry; drop what does not touch an installed version.
4. Triage every applicable signal into security, breaking or novelty.
5. Rank into fix now, plan, defer, each with its source and affected path.
6. Record the run's date and the sources consulted, so the next run is a diff.
7. Hand the security items to the fixer and the upgrade items to the engineer.

## 8. Interfaces

- Upstream: `research-core` for the source standard, `project-brief` which
  triggers the baseline run at project start, `project-exploration` for the
  real installed stack.
- Lateral: `dependency-security` for an installed advisory, `dependency-selection`
  for whether to adopt or replace, `migration-engineering` for a breaking
  upgrade's plan, `source-verification` when an advisory's claim is contested.
- Downstream: `security-audit` and the fixer for a confirmed vulnerability,
  the implementing engineer for an upgrade, `project-continuity` for the watch
  record.

## 9. Auto-critique

Score from 0 to 5: the inventory built from manifests rather than memory, every
finding attached to an installed version, every item traced to a primary
official source, the triage honest about severity, the report ranked into fix
now, plan and defer, and nothing claimed clear beyond what the named sources
showed on the run's date.

## 10. Live sources

This skill is only as good as the sources it reads on the day it runs. It reads
the official release feed and the advisory database for each ecosystem in the
inventory, retrieves the primary advisory behind any severity it reports, and
records every source with the date of access. A version number, an advisory id
or a support-status claim that cannot be traced to a live official source is
withheld, never guessed from a model's training.
