# self-updating-software

Builds the updater of software installed on machines its makers do not control,
so an update can never leave an installation broken: stand down when a package
manager owns the files, a signed manifest verified against an embedded key, a
staged and hashed download, a backup, an atomic replace, a read-back and a
health check with automatic rollback, recovery after an interrupted update,
staged rollout and withdrawal, consent, an untrusted feed, and a test of the
update itself from earlier versions.

- Inputs: the product and where it is installed, its distribution channels,
  the release process from `release-engineering`, the host's reload sequence
  if it has one.
- Outputs: the update decision, the signed manifest, the update transaction,
  the rollout and withdrawal plan, the updater test suite.
- Depends on: engineering-core, devops-core, release-engineering.

The updater rewrites the product, so its one rule is that at every instant
either the old version or the new one is installed and runs. Downloads are
staged on the same filesystem and verified against a signed manifest whose key
the installed copy already holds; the current version is backed up and a
journal marker written before anything is replaced; the new version is read
back and health checked before the update commits, and any failure, including
a power cut mid-replace, ends with the previous version restored. When a
package manager or a store owns the files, the software does not update itself
at all.

No configuration field: the distribution mode is declared by the installer or
the packager, and the signing key is a secret under `secrets-management`.
