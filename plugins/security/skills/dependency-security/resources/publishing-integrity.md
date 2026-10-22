# Publishing integrity

The other side of the supply chain: what a project that publishes a package,
a plugin or a release does so that the people installing it can verify they
received what was published. Section 5 of the skill verifies what is consumed;
this resource makes what is produced verifiable.

## What a release carries

```
checksums   a SHA-256 for every artefact, published with the release and
            listed in a manifest
signature   the manifest or the artefacts signed, with the public key or the
            signing identity documented where users find it, and rotated with
            notice
provenance  where the registry supports it, a provenance attestation that ties
            the published package to the source commit and the build that
            produced it, published from CI rather than a developer's machine
contents    the package holds what the repository holds for that version and
            nothing else: no local file, no secret, no build cache, checked by
            listing the packed contents before publishing
reproduce   the packing command is documented, so anyone can rebuild the
            artefact from the tagged source and compare checksums
```

## Channels the project owns

```
declared    the project states, in its README, every channel it publishes
            through: the registry and the package name, the release page, the
            plugin catalog
warned      a same-named package on a channel the project does not publish to
            is named and warned against, because it skips every check above
reported    a repackaged or impersonating copy is reported to the registry,
            with the evidence of the difference
```

## Records for catalogs and packagers

A catalog or an integration pack that redistributes the package needs, per
version: the checksums, the provenance, the licence and the notices of every
bundled third-party file, and the source commit. Publishing them next to the
release lets a packager verify instead of trusting.

## Installation instructions that verify

The installation guide shows the verification step, not only the install
command: the checksum or signature check for a downloaded artefact, and, for a
self-updating client, that the updater verifies the signed manifest itself,
per `self-updating-software`.

## Before each release

- [ ] Checksums generated and listed in the manifest.
- [ ] Manifest or artefacts signed; key or identity documented.
- [ ] Provenance attestation published where the registry supports it.
- [ ] Packed contents listed and compared with the repository.
- [ ] Owned channels declared; known impersonations warned against.
- [ ] Licences and notices of bundled files included.
