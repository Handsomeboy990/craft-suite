# Example: a two-provider gateway that kept failing in production

A team runs an internal coding assistant. Its gateway calls two providers, here
called provider A (a messages wire) and provider B (a chat completions wire),
with the team's own paid keys under each provider's terms. A chain named `main`
tries A, then B. Three incidents in one week, each intermittent, each blamed on
"the model".

## Incident 1: a working model disappears under load

Symptom: during busy hours, model A1 vanished from the picker for a probe round,
then came back.

Found: under load, provider A sometimes answered a streamed request with status
200 and a declared type of a single JSON document, over an ordinary event
stream. The gateway trusted the header, read the whole body as one document,
failed to parse it, and the probe classified the failure as `refused`. A
statement about one busy moment had been recorded as a statement about the
model.

Fixed:

```
decoder     the first 4 KB are sniffed and classified by shape; the bytes are
            replayed into the event decoder; the header is logged, not trusted
vocabulary  a parse failure on a 200 is `transient` until classified otherwise;
            only the provider's documented unavailable body maps to `refused`
fixture     the recorded mislabelled stream replays through the decoder in the
            suite and must produce the full answer
```

## Incident 2: one conversation that never recovers

Symptom: after a user cancelled during a long file search, every following
message in that conversation failed with a 400, until a new conversation was
started.

Found: the cancelled turn left a tool call with no result. Provider A validates
pairing on every call, so the history was invalid from then on.

Fixed:

```
pairing     before each send, any tool call without a result gets an explicit
            error result ("cancelled by the user") inserted in place
counted     repairs are counted per client; the editor plugin produced most of
            them, and its cancel path was fixed at the source too
fixture     a history with an orphan call is sent through the translator and
            must reach the provider as a valid sequence
```

## Incident 3: duplicated work after a failover

Symptom: a user asked for a refactor; the answer started, stopped, then started
again from the beginning, and a file was written twice.

Found: provider A dropped the connection after emitting a tool call. The chain
treated it as a `transient` failure and restarted the turn on provider B, which
emitted the same tool call again.

Fixed:

```
rule        no retry and no failover after the first output delta; a tool call
            is output; the failure is surfaced and the answer marked incomplete
reasoning   reasoning deltas stay outside that rule: a link that only reasoned
            before failing is replaced, which is the case the chain exists for
record      each call records the serving link and why earlier links were
            skipped, which is how this incident was traced in minutes
```

## What the suite looks like after the week

| Fixture | Asserts |
|---|---|
| clean stream, each wire | one internal event sequence, disjoint usage |
| stream behind a wrong declared type | full answer, model standing unchanged |
| drop before any output | next link serves, the record names both |
| drop after a tool call | no failover, answer marked incomplete |
| orphan tool call in history | valid sequence sent |
| 429 with a stated delay | retry after the delay, model kept |
| documented unavailable body | model leaves routing, listed with the reason |

Every provider points at a closed loopback port in the suite. A separate probe,
run by hand weekly and dated, replays one real request per wire to catch the day
a provider changes its behaviour.
