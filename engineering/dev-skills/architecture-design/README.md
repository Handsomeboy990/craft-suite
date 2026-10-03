# architecture-design

Designs the smallest architecture that serves the product. Reads the existing
structure, states the forces, assigns single ownership of behaviour and data,
defines boundary contracts, writes the dependency direction down and has the
pipeline enforce it, models failures before implementation, and records the
decision with its reversal cost.

- Inputs: project map, the requested change, the stated constraints.
- Outputs: architecture decision, boundary map, failure model, decision
  record.
- Depends on: engineering-core, project-exploration.
- Downstream: backend-engineering, frontend-engineering,
  fullstack-engineering, dependency-selection.

Does not run for changes confined to one existing module. Contains an explicit
refusal list for premature microservices, single implementation abstractions,
speculative caches and configuration nobody requested.
