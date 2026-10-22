---
name: dependency-security
description: Manages the security of the code a project did not write: knowing what is actually installed including the transitive tree, finding known vulnerabilities and judging their reachability, upgrading safely, pinning and verifying integrity, watching the licence and maintenance risk, and defending against typosquatting and a compromised supply chain. Use before adding a dependency, on a vulnerability alert, and at release readiness.
license: MIT
metadata:
  category: secure-development
  version: 1.1.0
  depends_on: [security-core]
  outputs: [dependency-audit, reachability-assessment, upgrade-plan, supply-chain-notes]
---

# Dependency Security

Most of the code in a running application was written by strangers and pulled in
transitively. A single advisory in a package nobody chose directly can be the
most severe finding in the system. This skill owns the risk of the code the
project did not write.

It complements `dependency-selection`, which decides whether to add a dependency
at all. This skill secures the ones already present and judges the ones a
vulnerability alert names.

## 1. Know what is actually installed

```
lockfile     the truth is the lockfile, not the manifest; it names exact
             versions including the transitive tree
transitive   a direct dependency of five brings a tree of hundreds; the
             vulnerable package is usually one nobody chose
inventory    produce the full resolved list, so an advisory can be checked
             against what is present, not against what was declared
duplicates   the same package at two versions, one patched and one not, is a
             common trap; the vulnerable copy still ships
```

An audit that reads the manifest and not the lockfile misses the transitive
tree, which is where the vulnerabilities live.

## 2. Find the known vulnerabilities

```
scan         the ecosystem's audit tool against the lockfile, plus a database
             lookup for the resolved versions
severity     the advisory's severity is a starting point, re-ranked by
             reachability in this code, per security-core
freshness    run it at add time, in CI, and at release; an advisory published
             after the last scan is not caught by an old report
```

## 3. Reachability decides the real severity

A critical advisory in a code path this application never calls is not a
critical finding for this application. Reachability re-ranks it.

```
reachable        the vulnerable function is called, directly or transitively,
                 on a path an attacker can influence -> the advisory's severity
                 stands or rises
present, unreached   the package is installed but the vulnerable code path is
                 never entered -> lower severity, still upgraded, recorded with
                 the reasoning
dev-only         the vulnerability is in a build or test dependency not shipped
                 to production -> lower severity for the running system, still
                 a risk to the build
```

State the reachability finding, do not assume it. "We do not call that function"
is a claim to verify, because a transitive caller might.

## 4. Upgrade safely

```
patch first   the smallest upgrade that clears the advisory, to limit the blast
              radius of the change
verify        the test suite passes after the upgrade; a security upgrade that
              breaks the app is not shipped, it is fixed
no downgrade  never pin backward to escape a breaking change and re-introduce
              the vulnerability; find the forward path
stuck         when the fix is only in a major version with breaking changes,
              record the decision: upgrade with migration, or accept with a
              named compensating control and an owner
```

## 5. Integrity and pinning

```
pin          exact versions in the lockfile, committed; a floating range means
             a different, unreviewed tree on the next install
verify       integrity hashes in the lockfile, checked on install, so a
             tampered package is rejected
provenance   where the ecosystem supports it, verify the package's provenance
             and signature
private      an internal registry or a vendored copy for the packages a build
             must not fetch from the public internet at deploy time
```

## 6. Supply-chain defences

```
typosquat    verify the package name character by character before adding it;
             a transposed letter is a hostile package
new package   a package published days ago, with one version and no history, in
             a critical position, is a risk to investigate, not to trust
install script   a dependency that runs a script on install has code execution
             on the developer's and the build's machine; know which do
maintenance  an unmaintained package accumulates unpatched advisories; its
             abandonment is itself a security risk, tracked with technical-debt
```

A project that publishes a package, a plugin or a release makes it verifiable
in turn: checksums, a signature, provenance, packed contents checked, its own
channels declared. `resources/publishing-integrity.md`.

## 7. Prohibitions

- Never audit the manifest instead of the lockfile.
- Never rank an advisory by its published severity without judging reachability
  in this code.
- Never downgrade past a fix to dodge a breaking change.
- Never add a dependency without verifying its exact name against typosquatting.
- Never ship a floating version range where a pinned lockfile is possible.
- Never delete an advisory from a report because it is inconvenient; accept it
  with a control and an owner, or fix it.
- Never treat a dev-only vulnerability as harmless; it endangers the build.

## 8. Protocol

1. Produce the full resolved dependency inventory from the lockfile.
2. Scan against the advisory databases; list every hit with its advisory
   severity.
3. For each hit, assess reachability in this code and re-rank per security-core.
4. Plan the smallest upgrade that clears each reachable advisory; verify the
   suite passes.
5. Record any advisory that cannot be fixed now with its compensating control
   and owner.
6. Confirm pinning and integrity verification are in place.
7. Check the additions in scope for typosquatting, newness and install scripts.
8. Wire the scan into CI so new advisories are caught, not just this run.

## 9. Auto-critique

Score from 0 to 5: inventory taken from the lockfile including transitive,
every advisory re-ranked by reachability, upgrades are the smallest that clear
the advisory and verified by the suite, unfixable advisories accepted with a
control and owner, pinning and integrity confirmed, typosquat and install-script
checks done, the scan wired into CI.

Threshold: no axis below 3, average at least 4. A reachable critical advisory
left unaddressed, or an audit that read only the manifest, caps the score until
fixed.

## 10. Interfaces

- Upstream: `security-core` for the severity scale, `dependency-selection`
  decides whether to add a dependency in the first place.
- Downstream: `ci-cd-pipelines` runs the scan as a gate, `release-readiness`
  checks the dependency posture before shipping, `security-audit` includes the
  dependency point in the full sweep.
- Lateral: `technical-debt` for an unmaintained package that cannot be replaced
  yet, `decision-records` for an accepted advisory with a compensating control.
