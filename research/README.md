# research

General-purpose research for a decision. Five skills that state the question,
find and read the sources, verify what carries weight, compare options, and
write the answer so a reader can act on it and check it.

Distinct from the writing tree's `research-director`, which serves fiction. This
tree answers real questions with real, cited sources.

The tree's constitution is [research-core](research-core/). Every skill refers
to it and none restates it. Two rules never bend: a source is cited only if it
was actually consulted, and a gap is stated honestly rather than filled with a
plausible invention.

| Skill | Runs | Produces |
|---|---|---|
| [research-core](research-core/) | first, always | question, source hierarchy, evidence standard |
| [source-research](source-research/) | to gather | sources found, read, and attributed |
| [source-verification](source-verification/) | on weighty claims | provenance traced, verdicts, confidence |
| [competitive-analysis](competitive-analysis/) | to compare | evidence matrix, trade-offs, conditional recommendation |
| [synthesis-reporting](synthesis-reporting/) | to write up | conclusion-first answer, confidence, gaps |
| [tech-watch](tech-watch/) | at project start, on a rhythm | stack inventory, watch findings, upgrade-and-fix list |

## The pipeline

```
research-core (frame the question)
  -> source-research (find and read)
  -> source-verification (check what matters)
  -> competitive-analysis (when comparing options)
  -> synthesis-reporting (write the answer)
```

`source-research` is the input half, `synthesis-reporting` the output half. A
synthesis with no gathering behind it has nothing to synthesise.

## Relationship to other trees

`report-writing` in `documents/` renders a research finding as a formal document.
`technology-selection` and `dependency-selection` in `engineering/` are
domain-specific research with their own criteria. This tree is the general form.

Full picture: [../README.md](../README.md).
