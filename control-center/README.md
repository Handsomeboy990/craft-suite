# Control Center

An optional local dashboard for the suite. It reads the session data, skills,
agents and configuration that already exist on your machine, and shows them:
usage, tokens, models, tools, skills, projects and system health.

It is optional. Every skill works without it. Nothing here is required to
install, configure or use a single skill.

## What it is, and is not

- Zero dependency. Python 3 standard library and one HTML file. No `pip install`,
  no `npm install`, no build step, no lockfile, no `node_modules`.
- Local first. The server binds to `127.0.0.1` only. Nothing it shows leaves the
  machine. It opens no outbound connection.
- Honest. Every figure is read from local files. Token counts are the real usage
  figures recorded in your transcripts. When a metric cannot be established, it
  is shown as unavailable, never invented.

## Running it

```bash
bash install.sh --control-center
```

It finds a free port in a dedicated range (7317 upward, chosen to avoid the
usual development ports), prints the URL, and opens your browser. Stop it with
Ctrl-C.

Options:

```bash
bash install.sh --control-center --no-browser     # do not open a browser
bash install.sh --control-center --port 7400      # ask for a specific port
```

If the requested port is taken, the next free one in the range is used and the
chosen port is printed. A port is never assumed free; the binding is attempted.

Run it directly without the installer, from inside the repository:

```bash
python3 control-center/server.py --no-browser
```

## The command-line report

For the same data without a browser:

```bash
bash install.sh --report            # a text summary
python3 control-center/reader.py --json   # the full data as JSON
```

## What it shows

| Section | Source | Notes |
|---|---|---|
| Dashboard | transcripts | sessions, the four token components, optimization score, cache reuse |
| Sessions | transcripts | per session, filterable and searchable; select a row for full detail |
| Analytics | transcripts | fresh input, output and messages per day, with a date range |
| Optimization | transcripts | the Token Optimization Advisor: score, patterns, findings |
| Usage | transcripts | tool calls and explicit skill invocations |
| Projects | transcripts | work tokens grouped by the project each session ran in |
| Skills | skills directory | what is installed, by category |
| System health | all sources | what the Control Center can see on this machine |
| Privacy | n/a | what is read, and what the tool keeps (nothing of its own) |

Tokens are shown as four real components: fresh input, cache read, cache creation
and output. Cache reads are the same context re-read cheaply on every turn and
sum to billions, so they are shown apart and never folded into a single headline.
Session sizes use work tokens, which is fresh input plus output. The
skill-invocation counts are explicit `Skill`-tool calls only; a skill used
implicitly is not counted, and the page says so rather than guessing.

## The Token Optimization Advisor

The Optimization tab analyses your real session evidence and surfaces concrete,
evidence-based opportunities to reduce unnecessary token consumption. It never
invents a finding: every finding is backed by counts that actually appear in the
transcripts, and a session with no qualifying signal produces none.

It detects repeated exploration of the same files, high edit churn, repeated
command shapes, low context reuse, several large outputs, an over-broad single
session, and a project re-explored across sessions. Each finding states what was
observed, a recommendation, a concrete example and the potential benefit, with a
severity. Most findings are medium or lower by design.

The optimization score is deterministic and explainable: each analysed session
starts at 100, each finding subtracts its severity penalty (critical 25, high 15,
medium 8, low 4, informational 1), floored at 0, and the overall score is the
mean of the session scores. With no analysable data the score is shown as not
available, not 100. The thresholds and the formula are shown in the tab's
Methodology panel. The command line surfaces the same summary in `--report`.

## Reports and export

The Export button generates a report from the loaded data, in the browser, with
no server-side file writing:

- HTML, a standalone styled document
- JSON, the full report object
- CSV, the session table
- PDF, through your browser's print dialog on a print-styled report; choose Save
  as PDF. This is a genuine PDF with no external dependency, not a renamed HTML.

Each report states its period, generation time, data sources, the metrics used,
the data limitations and a privacy note. It contains aggregate statistics and
finding summaries, never raw transcript content.

## Language and theme

The interface is available in English and French, switched live with the language
button and remembered per browser. English is the fallback. The theme follows
your system by default and can be toggled to an explicit light or dark, also
remembered. Both are stored only in your browser and never sent anywhere.

## Privacy

- The server binds to loopback (`127.0.0.1`) and never to a public interface.
- It reads your transcripts and configuration and keeps no separate store of its
  own, so there is nothing of its own to leak or to clear.
- The configuration reader drops any credential-shaped field as defence in depth,
  though by contract the configuration file holds no secret.
- To remove session history, delete the transcript files under your projects
  directory yourself. The Control Center only reads them.

## Files

```
control-center/
  server.py       stdlib HTTP server, loopback only, free-port detection
  reader.py       reads transcripts, installed skills/agents, configuration
  advisor.py      the Token Optimization Advisor, pure and deterministic
  test_advisor.py deterministic advisor tests, no test-framework dependency
  test_reader.py  deterministic reader tests, same convention
  app.html        the single self-contained page, inline CSS and SVG charts
  README.md    this file
```

## Requirements

Python 3.8 or later, already present on most systems. No other dependency. The
server needs no network access and makes no outbound request.
