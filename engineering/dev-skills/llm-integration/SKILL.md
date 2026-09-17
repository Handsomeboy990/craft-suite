---
name: llm-integration
description: Builds a feature on a language model so it is correct, bounded and affordable: the prompt and the structured output designed as a contract, an evaluation set that can fail before launch and after every change, retrieval that grounds the answer, cost and latency budgeted, streaming and timeouts, and guardrails against injection, a leaked system prompt, a hallucinated fact and a truncated answer. Reads the provider's real API rather than coding from memory. Use for any chatbot, extraction, classification, summarisation, agent or retrieval feature.
license: MIT
metadata:
  category: dev-skills
  version: 1.0.0
  depends_on: [engineering-core]
  outputs: [prompt-contract, evaluation-set, retrieval-design, cost-latency-budget, llm-guardrails]
---

# LLM Integration

A language model is a non-deterministic dependency that costs money per call,
can be talked into ignoring its instructions, and will state a wrong answer
with the same confidence as a right one. A feature built on one is engineered
around those three facts, not in spite of them. This skill builds the feature
so it is correct enough to trust, bounded in cost and behaviour, and testable.

The provider's real behaviour, its models, limits, parameters and pricing, is
read from the provider's own current documentation, never coded from memory,
per `engineering-core` section 1. A model identifier or a token price recalled
from memory is a guess, and guesses about a paid, versioned API are expensive.

## 1. The prompt and the output are a contract

Treat the prompt as an interface, not a suggestion.

```
inputs      what the user or the system supplies, and where it is placed in
            the prompt, with the untrusted part clearly separated from the
            instruction
output      a defined shape: for anything a program consumes, a structured
            output (the provider's structured-output or tool-use mechanism),
            not free text a regex hopes to parse
system      the instruction that sets the role and the rules, kept apart from
            the user content, and never assumed to be secret from a determined
            user
version     the prompt is versioned like code, because a change to it changes
            the behaviour of every call
```

## 2. Evaluate, before launch and after every change

A prompt with no evaluation set is untested code. The model is
non-deterministic, so the test is a set of cases scored, not a single run.

```
build       a set of representative inputs with their expected properties: the
            right extraction, the correct class, a summary that keeps the key
            fact, a refusal where a refusal is right
score       automatically where the property is checkable, and with a rubric
            or a stronger model as a judge where it is not, stated as such
gate        a prompt or model change runs the set and is compared, not shipped
            on a good vibe from one example
regress     the set grows every time a real failure is found, so the same
            failure cannot return unseen
```

## 3. Ground the answer when it must be factual

A model asked for a fact it was not given will invent one. Retrieval gives it
the fact.

```
retrieve    fetch the relevant documents and put them in the context, so the
            answer is drawn from them, not from the model's memory
cite        have the answer point to what it used, so a wrong answer is
            traceable and a reader can check
bound       when retrieval finds nothing relevant, the honest answer is that it
            does not know, not a confident fabrication
scope       retrieval reads only what the user is allowed to see; the same
            authorization as any query applies to what enters the context
```

## 4. Budget cost and latency

Every call costs tokens and time, and both scale with the context.

```
cost        estimate tokens in and out per call at the real price, and the
            volume; a feature that is fine at ten calls is a bill at ten
            thousand
context     send what the task needs, not the whole history and every document;
            the largest cost is usually an oversized context
cache       cache what repeats: a stable system prompt through the provider's
            prompt cache, a repeated retrieval, an identical request
latency     budget the response time; a large context and a large output are
            the two slow parts, and streaming hides latency it does not remove
```

## 5. Stream, time out, and fail gracefully

```
stream      stream the output where a user waits, so the first token is fast
            even when the last is not
timeout     every call has a timeout and a decided behaviour when it is hit,
            because a model call can hang
retry       a transient error retries with backoff, a bounded number of times;
            a content refusal does not retry, it is handled
degrade     when the model is unavailable, the feature has a stated fallback,
            not a spinner forever
```

## 6. Guardrails, because the input is hostile and the output is unverified

| Threat | The guardrail |
|---|---|
| Prompt injection | untrusted content is separated from instructions and never trusted to carry commands; the model is told the user content is data, and privileged actions are gated outside the model, not by asking it nicely |
| Leaked system prompt | the system prompt is assumed discoverable; no secret, no key, no rule that must stay hidden lives in it |
| Hallucination | a factual answer is grounded (section 3) or marked uncertain; a claim the feature acts on is verified, not taken on the model's word |
| Truncated output | the output length is bounded and the truncation is detected and handled, not shipped as a complete answer that stops mid-sentence |
| Unsafe or off-task output | the output is validated against its contract before use, and a moderation or a policy check runs where the surface needs it |
| Cost blowout from abuse | the endpoint is rate limited per user, per `rate-limiting`, because a model call is an expensive operation |

## 7. Prohibitions

- No model identifier, parameter or price coded from memory; the provider's
  current documentation is read.
- No program parsing free text where a structured output was available.
- No prompt shipped or changed without its evaluation set run.
- No factual feature without grounding or an honest do-not-know.
- No secret in the system prompt, which is assumed discoverable.
- No privileged action performed because the model asked for it; the
  authorization is outside the model.
- No model call endpoint without a rate limit and a cost estimate.

## 8. Protocol

1. Define the prompt as a contract: inputs placed and separated, a structured
   output shape, a versioned system prompt with no secret.
2. Build the evaluation set with expected properties, and score it.
3. If the feature is factual, ground it with retrieval scoped to what the user
   may see, and make it say it does not know when retrieval is empty.
4. Estimate the cost and the latency at the real price and volume, size the
   context down, and cache what repeats.
5. Stream where a user waits, set a timeout and a fallback, retry only
   transient errors.
6. Apply the section 6 guardrails, and rate limit the endpoint as an expensive
   operation.
7. Read the provider's current API documentation for every model, limit and
   price; verify against it rather than from memory.

## 9. Auto-critique

Score from 0 to 5: the output is a structured contract where a program
consumes it, an evaluation set exists and gates changes, a factual feature is
grounded or honestly uncertain, cost and latency are budgeted at the real
price, guardrails against injection and a leaked prompt and a truncated output
are present, privileged actions are gated outside the model, and no API detail
was coded from memory.

Threshold: no axis below 3, average at least 4. A privileged action performed
on the model's say-so, or a factual feature with no grounding and no
uncertainty, scores 0 overall, because the first is an injection away from
abuse and the second ships confident fabrication.

## 10. Interfaces

- Upstream: `engineering-core`, which requires reading the provider's real API
  rather than memory.
- Lateral: `input-validation` for the untrusted input and the output contract,
  `rate-limiting` for the endpoint, `authorization-design` for the retrieval
  scope and the gated actions, `caching-strategy` for the repeated calls,
  `data-privacy` for what personal data enters a prompt or a log,
  `analytics-instrumentation` for the quality and cost measurement.
- Downstream: `observability` for the cost, latency and failure signals,
  `security-audit` before a model-backed feature ships.
