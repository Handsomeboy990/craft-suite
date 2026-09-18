# input-validation

Treats every external value as hostile until validated at the trusted
boundary. Covers the boundary table, per type constraint rules, cross field
and contextual rules, and an adversarial test matrix that becomes real tests.

- Inputs: the change, the boundary map, the project validation system.
- Outputs: validation schemas, boundary report, validation tests.
- Depends on: engineering-core, project-exploration.
- Downstream: testing-quality, security-audit, code-review-protocol.

Client validation is ergonomics. Server validation is the control. A declared
schema that is never parsed at the boundary is worse than no schema, because
it looks safe.
