# Evaluation and guardrails reference

The two parts of an LLM feature that are most often skipped and most often the
reason it fails in production.

## The evaluation set

A prompt with no evaluation set is untested code, made worse because the model
is non-deterministic, so one good example proves nothing.

```
represent   the set mirrors real inputs, including the awkward ones: empty,
            adversarial, ambiguous, out of scope, in another language
expect      each case states the property the output must hold, not an exact
            string: the right field extracted, the correct class, the key fact
            kept in the summary, a refusal where refusal is right
score       automatic where checkable (a field matches, a class is right); a
            rubric or a stronger model as a judge where it is not, and labelled
            as a judged score, not a measured one
gate        every prompt or model change runs the set and is compared before it
            ships; a change that regresses a case is not shipped on one good
            example
grow        every real failure becomes a case, so it cannot return unseen
```

## The guardrails, by threat

| Threat | What happens without it | The guardrail |
|---|---|---|
| Prompt injection | user content says "ignore your instructions and ..." and the model obeys | untrusted content separated from instructions, treated as data; privileged actions gated outside the model |
| Leaked system prompt | a user extracts the system prompt and finds a key or a rule in it | assume it is discoverable; put no secret in it |
| Hallucination | the model invents a fact and states it confidently | ground factual answers in retrieved context, or mark them uncertain; verify a claim the feature acts on |
| Truncated output | the answer stops mid-sentence and is used as complete | bound the output length, detect truncation, handle it |
| Off-task or unsafe output | the output does something the feature did not intend | validate against the output contract before use; moderate where the surface needs it |
| Cost blowout | an attacker loops the endpoint and runs up the bill | rate limit the endpoint as an expensive operation |

## The rule under all of it

Read the provider's current documentation for the model, the limits, the
parameters and the price. A model identifier, a context window or a token
price from memory is a guess, and this is a paid, versioned API where a guess
costs money or breaks at runtime.
