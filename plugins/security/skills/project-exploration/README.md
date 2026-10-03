# project-exploration

Converts an unfamiliar repository into verified facts: stack detection from
manifests and lockfiles, repository shape, seven maps (routes, data, auth,
boundaries, integrations, tests, delivery), convention extraction, end to end
flow tracing with failure paths.

- Inputs: the repository, the task statement.
- Outputs: project map, stack report, convention report, flow traces.
- Depends on: engineering-core.
- Downstream: architecture-design, all implementation skills, security-audit,
  testing-quality, project-continuity.

Three depth levels: L1 targeted, L2 feature slice, L3 full census. The level
is declared before exploration starts.

Instruction files are read before conventions are inferred: the root one
first, then every one found between a touched file and the root, since a
package often keeps its own rules next to its code.
