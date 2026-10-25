# reverse-engineering

Investigates how a compiled or obfuscated artifact behaves when its source is
not available, on a target the requester owns or is authorized to analyse:
native binaries, JavaScript and Electron bundles, .NET assemblies and running
behaviour, analysed locally, with the evidence and the limits behind every
conclusion. Drives an external RE MCP (such as REA) when configured, and
degrades to documented manual method when it is not.

- Inputs: the artifact, the entitlement or written authorization, the configured
  RE tool if any.
- Outputs: behaviour model, evidence trail, limits statement.
- Depends on: security-core.
- Lateral: reconnaissance, vulnerability-assessment, dependency-security,
  data-privacy.
- Downstream: the fixer and authorized-pentesting, the implementing engineer.

Understanding, with its proof and its limits, never a copy of protected source
and never the defeat of a protection.
