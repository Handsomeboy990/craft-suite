# llm-integration

Builds a feature on a language model so it is correct, bounded and affordable:
the prompt and the structured output designed as a contract, an evaluation set
that can fail before launch and after every change, retrieval that grounds the
answer, cost and latency budgeted, streaming and timeouts, and guardrails
against injection, a leaked system prompt, a hallucinated fact and a truncated
answer.

- Inputs: the feature, its inputs and expected outputs, and the provider's
  current API documentation.
- Outputs: the prompt contract, the evaluation set, the retrieval design, the
  cost and latency budget, the guardrails.
- Depends on: engineering-core.

A language model is a non-deterministic dependency that costs money per call,
can be talked into ignoring its instructions, and states a wrong answer with
the same confidence as a right one. The feature is engineered around those
three facts: the output is a structured contract a program can consume, the
prompt is tested by an evaluation set that gates every change, a factual answer
is grounded by retrieval or says it does not know, the cost and latency are
budgeted at the real price, and privileged actions are gated outside the model
rather than performed because the model asked. The provider's models, limits,
parameters and prices are read from its current documentation, never coded from
memory, because a guess about a paid, versioned API is expensive.
