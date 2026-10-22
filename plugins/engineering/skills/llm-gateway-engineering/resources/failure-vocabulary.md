# Failure vocabulary

The single table every lane of a gateway classifies its failures through. The
class alone decides retry, routing and the message; no lane keeps a private
rule. The signals are the usual ones; the provider's documentation and a
recorded failure decide which signal a given provider actually sends.

## Classes

| Class | Typical signals | Retry | Routing effect | Told to the user |
|---|---|---|---|---|
| `auth` | 401; 403 naming the credential; a key rejected on the listing call | none | the lane is unusable until the operator acts; its models stay listed, marked | which credential, and where to set it |
| `refused` | the provider states the model is unavailable to this caller; 404 for that model id | none | the model leaves routing, stays listed with the reason and the time | the model is not offered by the provider right now |
| `region` | 403 naming a location; a documented region error | none | the model moves to a region-limited group; re-probed when the egress changes | the model is not available from this network |
| `quota` | 429; an allowance error; a documented limit body | after the stated delay, else a cooldown | none on the model; the lane cools down | the limit, and when it resets if stated |
| `transient` | 5xx; timeout to first byte; idle timeout; connection reset; DNS failure | bounded, with backoff and jitter, before any output | none | only if retries are exhausted: the provider did not answer |
| `invalid` | 400 on the request shape; a rejected field or value | none | none | an internal error; the refusal body is logged for the fix |
| `truncated` | length stop; missing final event; connection lost after output | none | none | the answer is incomplete, said explicitly |
| `filtered` | a content filter stop or refusal | none | none | the provider declined this content |

## Rules that hold across classes

```
one table   a new lane maps its signals into these classes; it never adds a
            private retry rule beside them
statement   only `refused` and `region` change a model's standing; both are
            statements about the model, the others are about this moment
output      no class retries after the first output delta of the attempt
finite      backoff values are resolved to plain finite numbers before they
            reach a scheduler, and the attempt count is bounded
evidence    every classification stores the status, the first bytes of the
            body and the time, so a misclassification can be found later
unknown     a signal that matches no class is `transient` for one retry, then
            surfaced and logged as unclassified, so the table grows from it
```

## Fallback chains under the vocabulary

| Failure on a link | Before first content delta | After content |
|---|---|---|
| `transient`, `quota`, `refused`, `region`, `auth` | next link | surfaced, the answer marked incomplete |
| `invalid` | surfaced: the next link would receive the same invalid request | surfaced |
| `filtered` | surfaced: switching to evade a filter is not a fallback | surfaced |
| `truncated` | not applicable | surfaced, marked incomplete |

Reasoning deltas are not content for this table: a link that only reasoned
before failing is replaced.
