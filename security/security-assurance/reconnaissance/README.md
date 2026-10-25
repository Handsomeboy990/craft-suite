# reconnaissance

Maps the attack surface of an owned or authorized target, passive first:
subdomains, hosts, services and technologies enumerated from public sources
before anything touches the target, with provenance on every item. Active
enumeration happens only within a written scope, rate limited and logged.

- Inputs: the target, the ownership or written scope, passive public sources.
- Outputs: surface inventory, provenance record, active-scope log.
- Depends on: security-core.
- Lateral: vulnerability-assessment, website-audit.
- Downstream: authorized-pentesting, the fixer.

Passive by default. Nothing active without a written in-scope authorization,
and no surface item recorded without its source.
