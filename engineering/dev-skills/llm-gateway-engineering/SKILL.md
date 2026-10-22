---
name: llm-gateway-engineering
description: Builds the layer between an application or an agent harness and one or more language model providers so it stays correct under real servers: one internal stream shape over several wire formats, a response read by its body rather than its declared type, tool calls kept paired, one failure vocabulary that decides retry and routing, fallback chains that switch only before the first answer, reasoning effort that is measured to bind, availability probes, a local compatible endpoint bound safely, keys redacted, and tests that never touch the network. Only with credentials and terms the operator holds. Use for a provider adapter, a model gateway or proxy, a multi-provider router, a fallback chain, or a local OpenAI or Anthropic compatible endpoint.
license: MIT
metadata:
  category: dev-skills
  version: 1.0.0
  depends_on: [engineering-core]
  outputs: [wire-normalisation, failure-vocabulary, routing-policy, gateway-endpoint, gateway-test-suite]
---

# LLM Gateway Engineering

`llm-integration` builds a feature on a model. This skill builds what sits
under such features when there is more than one model, more than one provider,
or more than one client: the adapter or gateway that speaks each provider's
wire, streams the answer back, decides what a failure means, and routes the
next call. A gateway is shared infrastructure. A defect in it does not break one
feature, it breaks every turn of every conversation that passes through it, and
it usually does so intermittently, under load, in production.

The provider's real behaviour, its endpoints, fields, limits, error shapes and
terms, is read from its current documentation and confirmed by a recorded
request, never coded from memory, per `engineering-core` section 1. Servers
also break their own documentation: a stream labelled as something else, a
field accepted then validated a month later. The gateway is built to survive the
server as it behaves, and every such behaviour is written down with the date it
was observed.

## 1. Access is the operator's, or it is not built

A gateway calls a provider with a credential, under that provider's terms. It is
built only on access the operator legitimately holds: their own key, their own
account, a public offer used as offered, or a self-hosted model.

Refused, whatever the request calls it:

```
impersonation   copying another product's client identity (its user agent,
                its headers, its session format, its declared tools) to reach
                an allowance reserved for that product
evasion         minting or re-encoding identifiers to pass a gate, rotating
                addresses or identities to escape a quota or a region block
pooling         sharing, renting or farming accounts or free credits across
                users the provider did not agree to serve that way
concealment     hiding from the user which provider receives their prompt
```

Each of these bypasses an access control, which `security-core` and the
data-collection boundary refuse in every tree. A free tier is used as the
provider offers it, within its stated limits, and its stated data use (prompts
logged, used for training) is shown to the user before they choose it.

## 2. One internal shape, several wires

Providers expose different wire formats for the same act: a chat completions
shape, a messages shape with typed content blocks, a responses shape with
output items. The gateway translates each into one internal event stream, and
nothing above the adapter knows which wire served the call.

```
events      text delta, reasoning delta, tool call start, tool call argument
            delta, tool call end, usage, stop, error: one vocabulary for every
            wire, so the caller handles one shape
usage       input, cached input, output and reasoning tokens kept disjoint, so
            no token is counted twice when a wire reports a total and a part
stop        the stop reason mapped to one set (complete, length, tool, filter,
            error); a length stop is a truncation and is reported as one
capability  context window, output ceiling, vision, tools, reasoning control:
            read from the provider's listing or its documentation per model;
            an unknown capability is absent, never assumed
choke point every request passes one function that builds the final payload,
            after every other mutation, so a rule applied there applies to
            every lane, every retry and every recovery segment
```

## 3. Read the stream by its body

A server under load can answer a streamed request with a status of 200 and a
declared type that does not match what follows. Trusting the header loses the
turn: the client buffers a live stream as one document, the parse fails, and a
working model is recorded as broken.

```
sniff       read a bounded prefix (a few kilobytes at most) and classify it by
            its shape: event stream frames, a single JSON document, an error
            body, an empty body
replay      hand the sniffed bytes back to the decoder in front of the rest,
            so nothing is buffered beyond the prefix and no token arrives late
late error  an error after the headers were sent is delivered as an in-stream
            error event, with the partial output marked incomplete, not as a
            silent end
timeouts    two of them: time to first byte, and idle time between chunks; a
            long answer that keeps streaming is not killed by a total timeout
            set for short ones
truncation  a length stop, a dropped connection or a missing final event is
            surfaced as truncated, never presented as a complete answer
```

## 4. Keep the conversation valid

A conversation is a sequence the provider validates on every call. One invalid
turn can make every later request in the same session fail.

```
pairing     every tool call has exactly one result before the next model turn;
            an interrupted call gets an explicit error result added before
            sending, never a silent drop that leaves an orphan
fields      provider fields required on a follow-up turn (a reasoning field, a
            signature, an item id) are preserved exactly, including an empty
            string where one was sent; a field that was absent is not invented
order       role order and content block rules per wire are enforced in the
            translation, so a valid internal history is a valid wire history
repair log  each repair is counted and logged by kind, so a client that keeps
            producing orphans is found rather than silently patched forever
```

## 5. One failure vocabulary

Every failure, from every wire and every lane, is classified once into a class
that decides three things: whether to retry, what it does to routing, and what
the user is told. `resources/failure-vocabulary.md` holds the full table.

```
auth        bad or missing credential: no retry, the lane is unusable until
            the operator acts, the message says which credential
refused     the provider states the model is unavailable to this caller: no
            retry, the model leaves routing and stays listed with the reason
            and the time it was observed
region      refused for the caller's location: no retry, the model moves to a
            separate region-limited group, re-probed when the egress changes
quota       rate or allowance exhausted: retry after the provider's stated
            delay when it gives one, otherwise a cooldown; never removes the
            model
transient   server error, timeout, connection reset: bounded retry with
            backoff and jitter; never removes the model
invalid     the request itself is wrong: no retry, a defect to fix, the body
            of the refusal kept for the fix
```

Only a statement about the model changes the model's standing. A server error,
a timeout or a quota window is a statement about this moment, and a gateway that
demotes a model on one of them empties its own catalog under load.

Retry policy values are resolved to plain finite numbers before they reach any
scheduler. A retry happens only before the first output delta of the attempt:
after visible output, a retry would duplicate text the user has already seen
and, worse, a tool call that may already have run.

## 6. Fallback chains

A chain is an ordered list of models served under one name. It is resolved
inside the adapter, so callers dial it like any model.

```
switch      a link that fails before its first content delta is discarded and
            the next link starts; after content, the failure is surfaced, not
            hidden by a switch that would restart the answer; an invalid
            request or a content filter is surfaced at once, because the next
            link would receive the same request
reasoning   reasoning deltas do not count as content: a link that reasons for a
            minute then hits a quota is exactly the case to fail over
capacity    the chain advertises the intersection of its links: the smallest
            context window, tools only if every link has tools
strategy    fallback always starts at the head; rotation starts at the next
            link and stays there for a stated number of turns, so a
            conversation is not spread across providers turn by turn
record      every call records which link served it and why each earlier link
            was skipped
```

## 7. Reasoning effort that binds

An effort control the provider ignores is a placebo in the interface. Two kinds
of control exist, and each is used only where it is verified.

```
levels      a model that declares effort levels gets exactly those levels,
            sent in the field the provider defines; a level the model rejects
            or ignores is not offered
budget      a model without levels gets an output-token ceiling per rung; the
            ceiling is raised where reasoning and the visible answer share one
            limit and thinking cannot be turned off
verified    each control is measured on a sample: reasoning tokens must move
            with the setting; a control that does not move is removed and the
            date of the measurement recorded
shown       the value actually sent is recorded per call and shown to the user
            next to the choice
```

## 8. Availability probes

```
cheap       a probe uses the listing or a minimal request, never a full
            generation, unless only a generation can tell; its cost is stated
classified  a probe result goes through the section 5 vocabulary: a transient
            failure keeps the model, a refusal removes it with the reason
egress      availability is measured from the caller's own network exit, and
            reclassified when the exit changes
never empty if every model refuses in one round, nothing is hidden: a picker
            with zero entries is worse than one with entries that may fail
paced       probes run on an interval with jitter, and stop when the gateway
            is idle
```

## 9. The local endpoint

A gateway often exposes a local endpoint compatible with a common client
format, so other tools on the machine can use it.

```
bind        loopback by default; a network bind is an explicit opt-in that
            states who on the network can then reach it
key         a generated key, required on every call, stored with
            owner-only permissions, rotatable, and displayed as a short
            fingerprint after first display
management  the routes that change settings or reveal keys are separate
            from inference routes and check the request's origin, per
            `session-security`
honest      an endpoint the gateway cannot serve faithfully is not
            advertised; a token count computed locally is labelled an
            estimate
recipes     connection instructions are generated from the port that actually
            bound and the key actually required, not from defaults
```

## 10. Keys and data

```
storage     provider keys live in the secret store or a file readable by the
            owner only, per `secrets-management`; never in a shared settings
            document, never in the repository
redaction   no API response, log line or error message carries a key; the
            interface shows whether a key is set and its last four characters
content     prompts, tool results and answers are not logged by default;
            usage records carry model, tokens, latency, outcome and lane
disclosure  the user can see which provider serves the model they pick, and
            any data use the provider states for that offer
```

## 11. Context compaction at the choke point

A gateway may reduce what it sends, because the largest cost is usually tool
output nobody needed in full.

```
targets     tool results only: diffs, search listings, directory trees, build
            logs, repeated log lines; never the user's own message
meaning     a compaction keeps what the model needs to answer: file names,
            hunk headers, the failing line, counts of what was dropped
fail open   a filter that throws, or meets a shape it does not know, passes
            the original through; a request never fails because of a saving
measured    bytes before and after, per filter, recorded and visible; a filter
            whose saving cannot be shown is removed
opt in      prompt shaping that changes the model's style is off by default
```

## 12. Test without the network

```
fixtures    recorded responses per wire and per failure class, replayed
            through the decoder: a clean stream, a stream behind a wrong
            declared type, a mid-stream drop, a late error, a length stop
isolated    the test suite points every provider at a closed loopback port,
            so no test can reach a real provider by accident
injected    each failure class of section 5 is injected and its retry and
            routing effect asserted, including an orphan tool call repaired
            before sending
live        a separate probe run by hand against the real providers, recorded
            with its date, confirms the fixtures still match reality
```

## 13. Prohibitions

- No access the operator does not hold: no impersonation, no identity or
  address rotation to escape a limit, no account pooling, no hidden provider.
- No provider endpoint, field, limit or error shape coded from memory.
- No stream classified by its declared type alone.
- No model removed from routing on a transient failure, a timeout or a quota
  window.
- No retry after the first output delta of an attempt.
- No orphan tool call sent to a provider.
- No effort control offered that was not measured to bind.
- No key in a response, a log or the repository; no prompt logged by default.
- No local endpoint bound beyond loopback without an explicit opt-in.
- No test that can reach a real provider.

## 14. Protocol

1. Confirm the access: whose credential, under which terms, and what each
   provider states about data use. Stop on anything section 1 refuses.
2. Read each provider's current documentation and record one real request and
   response per wire, dated.
3. Define the internal event vocabulary and translate every wire to it, with
   disjoint usage and mapped stop reasons, through one payload choke point.
4. Build the decoder to sniff and replay, with first-byte and idle timeouts and
   explicit truncation.
5. Enforce conversation validity: pairing repair, preserved fields, role order.
6. Classify every failure into the section 5 vocabulary and derive retry and
   routing from the class alone, with finite retry values and no retry after
   output.
7. Add fallback chains, effort controls and probes, each measured before it is
   offered.
8. Expose the local endpoint on loopback with a stored, redacted, rotatable key.
9. Write the fixture suite with the network closed, inject every failure
   class, and keep the live probe separate and dated.

## 15. Auto-critique

Score from 0 to 5: access is the operator's and disclosed; the wires are
normalised to one stream with disjoint usage; the stream is read by its body
with both timeouts and explicit truncation; tool calls stay paired; every
failure maps to one class that alone decides retry and routing; no retry follows
output; chains switch only before content; effort controls were measured; keys
are redacted and prompts unlogged; the suite runs with the network closed and
covers every failure class.

Threshold: no axis below 3, average at least 4. Any access refused by section 1,
a model demoted on transient failures, or a retry after a tool call was emitted
scores 0 overall: the first is a security finding, the second empties the
catalog under load, and the third can run a tool twice.

## 16. Interfaces

- Upstream: `engineering-core`, which requires reading the provider's real API
  rather than memory.
- Lateral: `llm-integration` for the features built on the gateway, its
  contracts, evaluations and guardrails; `realtime-systems` for the streaming
  transport; `reliability-testing` for the failure injection;
  `secrets-management` for provider keys; `rate-limiting` for the local
  endpoint; `session-security` for its management routes; `data-privacy` for
  what a prompt may carry and where it goes; `dependency-selection` before
  adopting a provider SDK.
- Downstream: `observability` for the per-lane latency, failure-class and cost
  signals; `security-audit` before the gateway is exposed beyond loopback.
