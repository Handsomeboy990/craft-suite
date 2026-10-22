# llm-gateway-engineering

Builds the layer between an application or an agent harness and one or more
language model providers: one internal stream over several wire formats, a
response read by its body, tool calls kept paired, one failure vocabulary that
decides retry and routing, fallback chains, reasoning effort measured to bind,
availability probes, a safe local compatible endpoint, and a test suite that
never touches the network.

- Inputs: the providers and the operator's credentials and terms, each
  provider's current documentation, one recorded request and response per
  wire, the clients that will call the gateway.
- Outputs: the wire normalisation, the failure vocabulary, the routing policy,
  the local endpoint, the fixture test suite.
- Depends on: engineering-core.

`llm-integration` builds a feature on a model; this skill builds what sits under
many features when several models, providers or clients share one layer. A
defect there breaks every conversation intermittently, under load, so the
gateway is built for servers as they behave: a stream labelled as something
else is read by its first bytes, an interrupted tool call is repaired before it
poisons the session, and a timeout never demotes a working model.

It is built only on access the operator holds. Copying another product's client
identity to reach its allowance, rotating identities around a quota, pooling
accounts or hiding which provider receives a prompt are refused, because each
bypasses an access control.

No configuration field: provider keys are secrets and follow
`secrets-management`, and provider choice belongs to the project.
