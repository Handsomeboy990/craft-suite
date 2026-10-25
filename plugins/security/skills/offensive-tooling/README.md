# offensive-tooling

Runs offensive tools correctly and within scope: each has a stated purpose,
safe defaults, a bounded target, captured evidence and a non-destructive mode,
and none runs outside the authorization on record. A discipline for driving the
tools, not a way to disguise or escalate a request past a limit.

- Inputs: the authorization and scope, the surface from reconnaissance, the
  tool registry.
- Outputs: tool selection, invocation log, evidence capture.
- Depends on: security-core.
- Lateral: reconnaissance, vulnerability-assessment, data-privacy.
- Downstream: authorized-pentesting, the fixer, incident-response.

The gate is read before a tool is selected. An out-of-scope request is refused
and recorded, never reworded until it runs.
