# environment-management

Turns configuration into an inventory: every variable with purpose, format,
requirement and per environment presence, a committed example file that is the
contract, consistent naming, six drift checks in both directions, startup
validation and documentation without values.

- Inputs: the code's configuration reads, the environments.
- Outputs: variable inventory, example file, environment matrix, drift report.
- Depends on: engineering-core, devops-core.
- Lateral: secrets-management, containerization, ci-cd-pipelines.
- Downstream: deployment-engineering, release-readiness, client-handover.

The drift check that pays for itself: compare the required variables against
what the target environment actually exposes, and fail the deploy before it
starts rather than after it has replaced the running version.
