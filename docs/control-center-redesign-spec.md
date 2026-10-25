# Control Center redesign: design and data specification

Date: 2026-10-22. Implements `docs/control-center-redesign-brief.md`, which the
owner confirmed on 2026-10-22. Status: proposed, awaiting the owner's approval
before any code.

## 1. What the data says today

Measured on this machine on 2026-10-22, from `~/.claude/projects`:

| Source | Files | Output tokens | Cache reads |
|---|---|---|---|
| main session transcripts | 257 | 23.8 M | 9.8 B |
| subagent transcripts | 333 | 11.8 M | 15.8 B |

The current reader counts the second row only as dispatch telemetry, not as
consumption. The Control Center therefore shows about two thirds of the output
and well under half of the cache reads that actually happened. Fixing this is
the first deliverable, because every other screen depends on it.

## 2. Data model

### 2.1 Usage records

One normalised record per assistant message, from main and subagent
transcripts alike:

```
session      the main session id (a subagent record carries its parent's)
project      from the record's working directory
agent        null for the main session; the subagent type for a subagent
             record, resolved from the dispatch that started it
model        the model the record states it ran on
day          from the timestamp, in local time
tokens       input, cache write, cache read, output, kept separate
```

Totals, per-day, per-project, per-model and per-agent breakdowns are all sums
over these records, so they agree with each other by construction.

### 2.2 The real model of a dispatch

A dispatch's model is the model recorded in its subagent transcript. The model
requested in the dispatch call is kept beside it as "requested"; "default" is
shown only when the subagent transcript is missing.

### 2.3 Cost

```
pricing:
  source: <URL of the provider's pricing page>
  read_on: <date>
  currency: USD
  models:
    <model id>:
      input: <price per million tokens>
      cache_write: <price per million tokens>
      cache_read: <price per million tokens>
      output: <price per million tokens>
```

A new section of `~/.claude/craft.config.yaml`, documented in
`config/README.md`. It is pre-filled at implementation from the provider's
official pricing page, read that day, with the URL and the date recorded. Cost
is computed per record and token kind. A model absent from the section has no
cost: its tokens are shown and the cost cell says "no price configured". The
interface shows the price source and date wherever a cost appears. Nothing is
ever estimated from a model's name.

### 2.4 Tier conformance

From `engineering/dev-skills/model-routing/resources/agent-tiers.md` when the
repository is found, otherwise from the installed copy:

| Rule kind | Checkable | Expected |
|---|---|---|
| `security-driving-signal` on every dispatch, `independent-verifier-floor` | yes | strongest tier, resolved through the configuration's `model_routing` or the documented default mapping |
| `lead` | no | the session's own model; shown, not judged |
| `table` | no | depends on the slice's classification, which transcripts do not carry; shown as "not checkable" with that reason |

A dispatch is marked "below its floor" only for a checkable rule.

### 2.5 The suite

```
installed     skills and agents in the target directories, with versions
repository    the suite's own trees, found from the configuration or the
              Control Center's own location; absent, this part says so
used          explicit skill invocations and agent dispatches in the selected
              period, with their last use
```

### 2.6 Findings

The advisor keeps its detectors and loses the 0 to 100 score. Each finding
carries:

```
what         the pattern, in one sentence
where        sessions, projects, agents concerned, with links
at stake     tokens, and cost when priced, that the pattern consumed
action       the change that removes it, naming the skill or setting
evidence     the records that show it
```

Findings are ranked by cost at stake when priced, tokens otherwise.

## 3. Screens

One header for all screens: the period (7 days, 30 days, 90 days, all), the
refresh time, refresh, export, language, theme. Every screen reads the period.

The figures in the layouts below are placeholders showing the shape of each
cell, not measurements.

### 3.1 Consumption

```
+-----------------------------------------------------------------------------------+
| Consumption  last 30 days                                    refreshed 17:05      |
| total cost  $ 1,234.56   output 35.6 M   cache read 25.6 B   cache write 0.71 B   |
| fresh input 0.19 M       subagents: 41% of cost              price: <source, date>|
+------------------------------------------+----------------------------------------+
| Cost per day, stacked by token kind      | Where it went                          |
| (bars, 30 days, values on hover and in   | project      cost    share  sessions   |
|  a table below for keyboard and screen   | ...          ...     ...    ...        |
|  readers)                                | agent        cost    share  dispatches |
+------------------------------------------+----------------------------------------+
| Findings, ranked by cost at stake                                                 |
| # | finding                         | where          | at stake | action          |
| 1 | repeated full-file reads        | 14 sessions    | $ 210    | ...token-opt... |
+-----------------------------------------------------------------------------------+
| Heaviest sessions: date, project, duration, cost, output, main or with agents     |
+-----------------------------------------------------------------------------------+
```

### 3.2 Models

```
+-----------------------------------------------------------------------------------+
| Models  last 30 days                                                              |
| model            messages   output    cache read   cost     share of cost         |
+------------------------------------------+----------------------------------------+
| Dispatches by agent                      | Tier conformance                       |
| agent  n  real model(s)  requested  cost | checkable dispatches  n                |
|                                          | below their floor     n  (list)        |
|                                          | not checkable         n  (why)         |
+------------------------------------------+----------------------------------------+
| Same work, other model: for each agent, cost per dispatch by model where the      |
| agent ran on more than one model, measured, not projected                         |
+-----------------------------------------------------------------------------------+
```

### 3.3 Suite

```
+-----------------------------------------------------------------------------------+
| Suite  installed 175 skills, 34 agents   repository 183 skills, 37 agents         |
| missing from the installation: 8 skills, 3 agents  -> bash install.sh --<scope>   |
+------------------------------------------+----------------------------------------+
| Skills by tree: installed, used in the   | Agents: installed, dispatched, last    |
| period, never used, last use             | dispatch, real models                  |
+------------------------------------------+----------------------------------------+
| Never used in 90 days (candidates to uninstall from this machine, never deleted   |
| by the interface)                                                                 |
+-----------------------------------------------------------------------------------+
```

### 3.4 Projects

```
+-----------------------------------------------------------------------------------+
| Projects  last 30 days                                                            |
| project   last worked   sessions   active days   output   cost   agents   trend   |
+-----------------------------------------------------------------------------------+
| Selected project: sessions over time, cost per day, its top findings              |
+-----------------------------------------------------------------------------------+
```

### 3.5 Sources and privacy

What each figure is read from, the files and counts read, the price section and
its date, what is not readable and why, and the existing clear-derived-data
action. Nothing here is new data; it is the evidence behind the other four.

## 4. Design system

```
layout       full width, a 12 column grid, 16 px gutters; panels are
             sections with a title line and a hairline rule, not shadowed cards
type         the system interface font for text; the system monospace,
             tabular figures, for every number; no web font, no download
scale        12, 13, 14, 16, 20 px; numbers in tables right aligned
colour       neutral greys for structure; one accent for interaction;
             semantic colours only: warning (below floor, missing price),
             saving (an action's gain); contrast at least 4.5:1 for text, both
             themes
charts       inline SVG drawn by the page, each with a table twin
interaction  every table sortable, keyboard operable, focus visible; a row
             links to its evidence; no animation beyond a 150 ms state change,
             none with reduced motion
widths       designed for 1440, verified at 1024 and 1920
```

## 5. Tests

- Reader: subagent records counted once and attributed to the right session,
  project, agent and model; per-kind token sums; real model over requested;
  orphan subagent transcripts; empty directories.
- Cost: priced and unpriced models, a missing section, a malformed entry
  refused, totals equal the sum of records.
- Tier conformance: each rule kind, a missing `agent-tiers.md`.
- Findings: each detector's tokens and cost at stake, ranking.
- Server and page: the existing checks, plus a browser pass at 1440 and 1024,
  light and dark, no console error, keyboard reach of every control.

## 6. Build order, one pull request each

1. Reader: subagent consumption, per-kind tokens, real dispatch models, the
   suite's repository view, with tests. The current page keeps working and
   already shows corrected totals.
2. Pricing section and cost computation, with tests and documentation.
3. Advisor: findings with what is at stake and the action; score removed.
4. The new page, the four screens and sources, and the terminal report.
5. Documentation, both languages, and the redesign record.
