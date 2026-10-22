# Update transaction checklist

One line per step of the transaction, with the check that must hold and the
state the installation is left in when it fails. A step with no failure state
written here is not finished.

| Step | Check | On failure |
|---|---|---|
| mode | the distribution mode is self, read from the install marker | managed: no update, the updater stands down |
| fetch | the manifest arrived from a declared source over TLS | try the fallback source; none: retry later, nothing changed |
| signature | the manifest verifies against an embedded public key | discard, record, alert; nothing changed |
| version | manifest version above the installed one, not withdrawn, start version allowed | discard; nothing changed |
| compatible | host or runtime version within the manifest's range | the update is not offered, with the reason |
| space | free space covers the artefacts plus the backup | refuse with the space needed; nothing changed |
| download | into staging on the installation's filesystem | delete the stage; nothing changed |
| hash | size and SHA-256 of every artefact match the manifest | delete the stage; nothing changed |
| backup | current version copied or moved aside, version recorded | stop; the current version is still in place |
| journal | in-progress marker written with from and to versions | stop; remove the backup copy |
| replace | atomic rename, or per file from the file manifest | restore the backup, remove the marker |
| read back | installed files re-hashed against the manifest | restore the backup, remove the marker |
| migrate | data step runs after the backup, reversibly | restore code and data, remove the marker |
| health | the new version starts, reads its configuration, answers one internal request | restore code and data, remove the marker |
| commit | marker removed, one backup kept | the next start sees the marker and resolves it |

## At every start

```
marker present   the last update did not commit: verify the installed files
                 against the target manifest; if they match and the health
                 check passes, commit; otherwise restore the backup; then
                 remove the marker, before anything else runs
marker absent    normal start
```

## Faults the test suite injects

```
corrupted artefact         wrong signature          replayed older manifest
withdrawn version          incompatible host        full disk at download
full disk at backup        killed during replace    killed during migrate
read-back mismatch         failing health check     managed installation
```

Each fault ends with one whole version installed and running, and the reason
recorded.
