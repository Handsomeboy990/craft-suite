# Tool-output compaction

How to shrink the output of a tool before it enters a model's context, without
losing what the model needs to answer. It applies to an agent reading its own
tool results, and to a gateway that rewrites tool results before sending them,
per `llm-gateway-engineering` section 11. Most of a long context is tool output
nobody needed in full.

## Rules that hold for every filter

```
targets     tool results only: command output, search listings, file dumps,
            logs; never the user's message, never the instructions
meaning     the compacted text still answers the question the command was run
            for; what was removed is counted and said ("41 unchanged lines")
fail open   a filter that throws, or meets a shape it does not recognise,
            passes the original text through untouched
measured    bytes before and after, per filter and per call, recorded; a
            filter whose saving cannot be shown is removed
reversible  the full output stays available by path when the next step may
            need it, per this skill section 5
```

## Filters by kind of output

| Output | Keep | Drop or fold |
|---|---|---|
| `git diff` | file headers, hunk headers, every added and removed line, a few context lines around each change | long runs of unchanged context, folded to a count; binary file bodies |
| `git status` | changed paths grouped by state | the advice lines git prints about how to stage or restore |
| `git log` | hash, date, author, subject | full bodies, unless the question is about one commit |
| search (`grep`, `rg`) | path, line number, the matching line | identical matches repeated across generated or vendored files, folded to a count per directory |
| `find`, `ls`, `tree` | the paths that answer the question, directory counts | `node_modules`, build output, caches, `.git`, folded to one line each |
| build and test logs | the first error and its location, the summary line, failing test names and their assertion | progress bars, download lines, repeated warnings, folded to one line with a count |
| numbered file dumps | the lines asked for, and the enclosing function or block | the rest of the file, replaced by its line count and the path to read it |
| repeated log lines | the first occurrence and the count | the repeats |

## Prompt shaping is a different thing

Asking the model to answer in fewer words changes its style, not the context it
receives, and it can lose nuance the user needed. It is off by default, opt in
per task, and never applied to a security finding, a gate verdict or an answer
the user must act on.

## Measuring a filter

```
sample      a set of real outputs of each kind, kept as fixtures
saving      bytes before and after per fixture, and the median
fidelity    for each fixture, the question it was run for, asked against the
            compacted text and against the original; the answers must agree
regress     a filter change runs the fixtures again before it ships
```

A filter that saves bytes but changes an answer on any fixture is rejected,
whatever its saving.
