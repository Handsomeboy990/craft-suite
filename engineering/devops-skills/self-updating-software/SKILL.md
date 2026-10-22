---
name: self-updating-software
description: Builds the updater of software that runs on machines its makers do not control, a desktop app, a CLI, an editor or host plugin, an agent, so an update can never leave an installation broken: whether to self-update at all or stand down for a package manager, a signed manifest verified against a key the installed copy already holds, a download staged and hashed, a backup, an atomic replace, a read-back and a health check with automatic rollback, recovery after an interrupted update, staged rollout and withdrawal of a bad version, consent and release notes, a feed rendered as untrusted content, and an end-to-end test from earlier versions. Use for any in-app update, auto-update, self-update, hot reload of installed code or update channel.
license: MIT
metadata:
  category: devops-skills
  version: 1.0.0
  depends_on: [engineering-core, devops-core, release-engineering]
  outputs: [update-decision, update-manifest, update-transaction, rollout-and-withdrawal-plan, updater-test-suite]
---

# Self-Updating Software

`release-engineering` decides how a version is cut and rolled out.
`deployment-engineering` puts it on servers the team controls. This skill is
for the third case: the software is already installed on someone else's
machine and replaces itself. The updater is the most privileged code the
product ships, because it rewrites the product. A defect in it can break every
installation at the same moment, including the code that would have fetched the
fix.

The rule that governs every section: at every instant, either the old version
or the new version is installed and runs. Never a mixture, never neither.

## 1. Decide whether the software updates itself at all

```
managed     when a package manager, an app store, a system image or an
            integration pack owns the installed files, the software does not
            update itself: the updater, the update feed and any hot reload
            stand down, because two writers to one directory corrupt it
detect      the distribution mode is declared at install time (a setting, a
            marker file the packager writes) and read at start; it is never
            guessed from the path
self        only an installation the software placed itself, in a directory
            it owns, is self-updated
both        when both exist, the documentation says which one a user should
            choose and what each loses
```

## 2. The manifest

The updater acts on a manifest, never on a bare download link.

```
fields      version, release date, for each artefact its URL, size and
            SHA-256, the minimum and maximum compatible host or runtime
            version, the minimum version the update can start from, release
            notes, a rollout fraction, and a withdrawn list
signed      the manifest is signed; the verifying public key is embedded in
            the installed copy, never fetched with the manifest it verifies
rotation    the next public key is shipped in a release before it is used, so
            a key can be rotated without stranding installations
sources     a primary and a fallback source may serve the same signed
            manifest; the signature, not the source, makes it trusted
versions    a manifest whose version is lower than the installed one is
            refused, so an attacker cannot replay an old vulnerable release
```

## 3. The update transaction

Each step either completes or leaves the installed version untouched.

```
stage       download into a staging directory on the same filesystem as the
            installation, so the final move is a rename, not a copy
verify      check size and SHA-256 of every artefact against the signed
            manifest; any mismatch discards the stage
space       check free space before downloading and before replacing; a full
            disk is a clean refusal, not a half-written file
backup      move or copy the current version aside, with its version recorded
journal     write a marker that says an update is in progress, from which
            version, to which version
replace     swap in the new version with an atomic rename where the platform
            allows; where it does not, replace file by file from a manifest of
            files and keep the backup until the read-back passes
read back   re-hash the installed files against the manifest
health      load the new version and run a defined health check: it starts,
            it reads its configuration, it answers one internal request
commit      on success, remove the journal marker and keep one backup
rollback    on any failure from backup to health, restore the backup, record
            the reason, and report it to the user
```

Interrupted updates are the normal case on machines that sleep, lose power or
get killed. At start, a journal marker means the last update did not commit:
the software restores the backup or completes the verified replace, then
removes the marker, before running anything else.

## 4. Activation and data

```
restart     the safe default: the new version takes effect at the next start
hot reload  only where the host provides a reload sequence; the updater
            follows that sequence exactly (purge, re-import, re-register) and
            rolls back on failure the same way it would on a restart
data        configuration and stored data migrate with a versioned step that
            runs after the backup and is reversible, or the update keeps a copy
            of the data it changed; a rollback restores both code and data
downgrade   a rollback to the previous version is supported; a downgrade the
            data migration cannot reverse is refused with the reason
```

## 5. Rollout and withdrawal

```
staged      a new version reaches a stated fraction of installations first,
            chosen by a stable installation identifier, then widens on the
            health signals of that fraction
withdraw    a bad version is added to the manifest's withdrawn list: it is
            never installed again, and an installation running it is offered
            the next good version first
security    a version below a stated minimum is marked unsafe; the user is
            told why and the update is offered with priority, never forced
            silently
signals     update success, failure step and rollback reason are the only
            telemetry the updater needs, sent only where the user agreed
```

## 6. Consent and transparency

```
policy      the user chooses between notify, download, and install; the
            default is stated in the documentation
notes       every offered update shows its version and release notes before
            it is installed
network     a metered or offline connection defers the download; offline is
            a normal state, not an error
scope       an update that widens permissions, adds a network destination or
            changes what data leaves the machine says so before it installs
```

## 7. The update channel is an attack surface

```
code        nothing executes from the update channel unless it passed the
            signed manifest and the hash check
feeds       an announcement or news feed delivered through the same channel
            is untrusted content: rendered as text or through a strict
            allowlist, never as script, and never able to trigger an install
            on its own
packaging   the project states which distribution channels are its own; a
            same-named package elsewhere is warned against, because it skips
            the signature the updater relies on
records     integrity and provenance records for each release are published
            next to it, so a packager or a catalog can verify what it ships
```

## 8. Test the update, not only the version

```
matrix      every release is updated to from the last supported versions, not
            only installed fresh
faults      a fixture update server serves each failure: a corrupted
            artefact, a wrong signature, a replayed older manifest, a full
            disk, a process killed mid-replace, a health check that fails
asserted    each fault ends with the previous version installed and running,
            or the new one fully, and with the reason recorded
managed     a managed installation is started with the updater disabled and
            the test asserts it never writes to its own directory
```

`resources/update-transaction-checklist.md` lists the checks per step.

## 9. Prohibitions

- No self-update of an installation a package manager or a store owns.
- No unsigned manifest, no key fetched with the manifest it verifies, no
  manifest older than the installed version accepted.
- No artefact used before its hash matches the signed manifest.
- No replace without a backup and a journal marker, and no start that ignores
  a leftover marker.
- No update committed before the read-back and the health check pass.
- No forced silent install, and no update that widens permissions without
  saying so first.
- No content from an announcement feed rendered as script or able to install.
- No release shipped without the update tested from earlier versions and
  through the fault set.

## 10. Protocol

1. Decide the distribution mode and make managed installations stand down.
2. Define and sign the manifest, embed the public key, plan the key rotation.
3. Build the transaction: stage, verify, space, backup, journal, replace, read
   back, health, commit, rollback, and recovery at start.
4. Choose activation by restart or the host's reload sequence, with data
   migration that rolls back with the code.
5. Add staged rollout, withdrawal and a minimum safe version.
6. Expose the update policy, release notes and the scope disclosure to the
   user.
7. Treat the feed as untrusted content and publish integrity records.
8. Run the update matrix and the fault set in the release pipeline.

## 11. Auto-critique

Score from 0 to 5: managed installations stand down; the manifest is signed
with an embedded key and refuses replays; every artefact is hashed before use;
the transaction keeps one whole version installed at every instant, including
after an interruption; the health check gates the commit and failure rolls
back code and data; rollout and withdrawal exist; the user sees and chooses;
the feed cannot execute; the update is tested from earlier versions and
through every fault.

Threshold: no axis below 3, average at least 4. An update path that can leave
an installation with neither version working, or code executed from the
channel without a verified signature, scores 0 overall: the first can break
every installation at once, the second hands them to whoever controls the
channel.

## 12. Interfaces

- Upstream: `engineering-core`, `devops-core` for blast radius and the
  destructive action protocol, `release-engineering` for the versioning and
  rollout the manifest carries.
- Lateral: `secrets-management` for the signing key, `dependency-security` for
  integrity on the consuming side, `feature-flags` for kill switches inside the
  product, `backup-recovery` for the data the update migrates,
  `ci-cd-pipelines` for the update matrix in the pipeline.
- Downstream: `observability` for the update success and rollback signals,
  `release-readiness`, which does not pass a release whose update path was not
  tested.
