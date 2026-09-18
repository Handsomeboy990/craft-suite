# workflow-automation

Builds automation workflows for a project through an external workflow engine
reached over a connector, n8n over its MCP server being the concrete target.
It starts from two refusals: it does not assume a project wants automation, and
it does not pretend to have a connection it has not been given.

- Inputs: the project's stated automation needs, and the connector once the
  user has configured it.
- Outputs: the per-project opt-in record, the connector requirement, the
  workflow definitions, and the verification that each was run.
- Depends on: engineering-core, devops-core.

Automation is opt-in per project and recorded, never a silent default: a
workflow engine is an operational dependency nobody should acquire by
accident. The n8n connection is configured and authorized interactively by the
person running the agent, outside this skill; the skill detects whether it is
present, explains what is missing when it is not, guides the user to the
configuration step, and never simulates access. A workflow that pretends to
have a connection produces something that cannot run and a report that lies.

Every workflow it builds is idempotent, has real failure paths, bounded
retries and timeouts, keeps no secret in its definition, verifies inbound
webhook signatures, and is run and observed before it is called done. The
definition is exported and version controlled, so it is reviewable and
restorable rather than living only in the engine. The n8n specifics are in
`resources/n8n-connector.md`.
