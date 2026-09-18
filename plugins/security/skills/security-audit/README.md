# security-audit

Twenty four point sweep of the implementation that exists: identity and
access, input reaching dangerous sinks, session and transport, data exposure,
business logic and abuse, plus standing dependency and configuration checks.

- Inputs: boundary map, the diff or the repository, the declared scope.
- Outputs: security findings, applied fixes, manual action list, threat notes.
- Depends on: engineering-core, project-exploration, input-validation.
- Downstream: testing-quality, code-review-protocol, project-continuity,
  release-readiness.

Every finding carries an attacker path. Everything code can fix is fixed and
verified; everything else goes on a separate manual action list. The audit
never concludes that a system is secure, only that these checks were run on
this revision.
