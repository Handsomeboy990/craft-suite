# tech-watch

A standing watch on the stack a project actually uses. At project start and on
a rhythm after, it builds the versioned inventory, then tracks releases,
breaking changes and security advisories that touch exactly those dependencies,
and reports what to adopt, what to fix and what to defer.

- Inputs: the manifests and lockfiles, the official release and advisory
  channels for each dependency.
- Outputs: stack inventory, watch findings, upgrade-and-fix list.
- Depends on: research-core.
- Lateral: dependency-security, dependency-selection, migration-engineering,
  source-verification.
- Downstream: security-audit and the fixer, the implementing engineer,
  project-continuity.

Every item names a dependency, a version, an official source and the one place
in the project it affects. Nothing is reported that is not traced to a live
primary source read on the run's date.
