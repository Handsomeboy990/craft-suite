# fullstack-engineering

Owns a feature across every layer. Fixes the contract before implementation,
sequences the data layer, server, contract test, client data layer, UI and
journey test, then enforces cross layer consistency on validation, errors,
types, money, dates, empty values, cache invalidation and authorization.

- Inputs: the feature request, architecture decisions, project conventions.
- Outputs: feature contract, layer completion matrix, end to end
  verification.
- Depends on: engineering-core, architecture-design, backend-engineering,
  frontend-engineering.
- Downstream: testing-quality, playwright-automation, code-review-protocol,
  technical-documentation.

Does not replace the frontend and backend skills. It sequences them and holds
the contract they share, including the failure chain both sides must
implement.

Worked examples: `examples/feature-across-layers.md` traces one feature
through every layer; `examples/directory-server-boundary.md` shows a server
boundary declared on each server function, visibility decided on the server,
and an atomic counter.
