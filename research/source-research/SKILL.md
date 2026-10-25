---
name: source-research
description: Finds the sources that answer a research question: builds a search strategy, works down the source hierarchy to primaries, retrieves and actually reads each source, extracts findings with exact attribution and location, and tracks coverage so the search stops when it is saturated rather than when it is tired. The gathering half of research; synthesis-reporting is the other. Use when a question needs sources found and read, not merely searched for.
license: MIT
metadata:
  category: research
  version: 1.0.0
  depends_on: [research-core]
  outputs: [search-strategy, consulted-sources, attributed-findings, coverage-map]
---

# Source Research

Finding sources and reading them are different acts, and the second is where
research is actually done. A list of search results is not research; a set of
sources opened, read, and attributed is. This skill does the gathering, to the
standard `research-core` sets.

## 1. Build the search strategy before searching

```
terms        the vocabulary the answer uses, including the terms of art a domain
             uses that a layperson would not, and the synonyms a source might
sources      where the top-of-ladder answer lives: which registry, which journal,
             which official site, which primary corpus, not just a web search
angles       the question from more than one direction, so a single phrasing does
             not select a single viewpoint
stop rule    what saturation looks like: when new searches return sources already
             seen, the search is done, not when patience runs out
```

## 2. Work down to primaries

A web search lands on aggregators. The work is following them to the source.

```
land         on rung 3 or 4: the article, the summary, the answer
follow       its citations to rung 1 or 2: the paper it cites, the filing it
             quotes, the documentation it paraphrases
read         the primary, not the paraphrase; the paraphrase is often wrong in
             the detail that matters
record       the primary as the source, noting the route that found it
```

A finding whose only source is an aggregator, with no primary behind it, is a
finding to flag as unverified, not to report as established.

## 3. Actually retrieve and read each source

The consulted rule from `research-core` is operational here.

```
retrieve     open the source; a search snippet is not the source
read         the relevant part in full; a title and a snippet mislead
locate       record where in the source the finding is: the section, the page,
             the paragraph, the line, so it can be checked
quote        the exact words when the wording matters; paraphrase accurately when
             it does not, and never blur the two
```

## 4. Extract findings with attribution

```
finding      the specific thing the source establishes, in the researcher's words
attribution  the source, its rung, its date, and the exact location within it
type         fact, inference, or opinion, per research-core
confidence   how firmly the source supports the finding: directly, by
             implication, or as one interpretation
```

## 5. Track coverage

```
map          which parts of the question each source addresses, so gaps are visible
gap          a part of the question no consulted source answers is named, not
             hidden by the parts that are well covered
saturation   the question's parts are each covered by more than one independent
             source where they matter, or the gap is stated
bias         the sources consulted skew toward one viewpoint, one geography, one
             vendor: note it, and seek the missing angle
```

## 6. Prohibitions

- Never report a search result as a source without opening and reading it.
- Never cite an aggregator's paraphrase when the primary was reachable and not
  followed.
- Never record a finding without its exact location in the source.
- Never blur an exact quote and a paraphrase.
- Never stop at the first source that confirms the desired answer.
- Never present a well-covered part of a question as if it covered the gaps.
- Never let the set of sources skew to one viewpoint without noting it.

## 7. Protocol

1. Take the framed question from `research-core`.
2. Build the search strategy: terms, target sources, angles, stop rule.
3. Search, landing on whatever rung, then follow citations down to primaries.
4. Retrieve and read each source in full where it is relevant.
5. Extract findings with exact attribution, location, and type.
6. Map coverage against the question's parts; name the gaps.
7. Continue until saturation or a stated gap; stop then.
8. Hand the consulted sources and attributed findings to `synthesis-reporting`.

## 8. Auto-critique

Score from 0 to 5: strategy built before searching, aggregators followed to
primaries, every source actually retrieved and read, findings attributed with
exact location, quote and paraphrase kept distinct, coverage mapped and gaps
named, source set checked for skew, search stopped at saturation not fatigue.

Threshold: no axis below 3, average at least 4. A reported source that was not
opened, or a finding without a locatable attribution, caps the score until fixed.

## 9. Interfaces

- Upstream: `research-core` frames the question and sets the evidence standard.
- Downstream: `source-verification` checks the findings that matter most,
  `synthesis-reporting` turns the attributed findings into an answer,
  `competitive-analysis` and the career and business skills consume the gathering.
- Lateral: `report-writing` renders the result for a decision.

## 10. Live sources

This skill reads whatever sources the runtime can reach: web search and
retrieval, document stores, code repositories, official registries. It never
substitutes its own prior belief for a source it could have retrieved. When a
needed source is unreachable (paywalled, offline, out of scope, or requiring a
connector that is not configured), it names the source and the obstacle rather
than inventing what the source would have said.

The search and retrieval provider is read from `research_provider` in the
configuration. `built-in` uses the runtime's own search and fetch. `tavily` uses
the hosted Tavily connector (search, extract, crawl, map) through its MCP server
for cleaner, citeable retrieval; when it is selected but not reachable, this
skill falls back to `built-in` and says so. The provider changes how a source is
fetched, never the standard: a source is cited only if it was actually retrieved
and read, whichever provider fetched it.
