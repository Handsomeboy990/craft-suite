#!/usr/bin/env python3
"""Read local Claude session data and the installed suite state.

The Control Center never fabricates a metric. This module reads only what the
local files actually contain: session transcripts under the projects directory,
and the skills, agents and configuration that the installer wrote. When a value
cannot be established from those files, it is reported as unavailable, never
guessed.

No third-party dependency. Standard library only.

Sources, and their honesty:
- Sessions, tokens, models, tools and skills come from the assistant records in
  the transcripts. Token counts are the real usage figures the runtime recorded.
- Per-project and per-day breakdowns come from the record's own cwd and
  timestamp.
- Installed skills and agents come from listing the target directories.
- Configuration is read from the config file, which by contract holds no secret;
  this module never reads or emits a credential.
"""

import json
import os
import sys
import glob
import datetime
from collections import Counter, defaultdict

HOME = os.path.expanduser("~")
PROJECTS_DIR = os.environ.get(
    "CLAUDE_PROJECTS_DIR", os.path.join(HOME, ".claude", "projects")
)
SKILLS_DIR = os.environ.get(
    "CLAUDE_SKILLS_DIR", os.path.join(HOME, ".claude", "skills")
)
AGENTS_DIR = os.environ.get(
    "CLAUDE_AGENTS_DIR", os.path.join(HOME, ".claude", "agents")
)
CONFIG_FILE = os.environ.get(
    "CLAUDE_CONFIG_FILE", os.path.join(HOME, ".claude", "craft.config.yaml")
)

# An assistant message whose output exceeds this many tokens is counted as a
# large output. It is a signal to surface, never a judgement: a large output can
# be exactly what the task required. The threshold is documented so the count is
# reproducible.
LARGE_OUTPUT_TOKENS = 4000

# Bounds on the untrusted labels read out of a transcript, so one record cannot
# decide how large a response or a report line is. A label is a name displayed
# in a column 26 characters wide, so 80 is generous; the breakdown lists are
# capped like their neighbours (tools at 30, skills at 60, top_tools at 5) so a
# transcript holding thousands of distinct names cannot grow the JSON payload
# without limit. Every "total" beside these lists stays exact; only the
# breakdown is a top N.
LABEL_MAX_CHARS = 80
AGENT_LIST_MAX = 60
SESSION_AGENT_LIST_MAX = 10


def _short_path(path):
    """Shorten an absolute path to its last two segments for display.

    The full path can be sensitive and is long; the tail is enough to identify
    the file in a finding. No path is followed or opened here.
    """
    if not path:
        return ""
    parts = [p for p in str(path).split("/") if p]
    return "/".join(parts[-2:]) if len(parts) > 2 else str(path)


def _project_name(raw):
    """A readable project name from the transcript directory or a cwd path."""
    if not raw:
        return "unknown"
    base = os.path.basename(raw.rstrip("/"))
    # Transcript directories encode the path with dashes; keep the last segment.
    if base.startswith("-") or "-home-" in base:
        parts = [p for p in base.split("-") if p]
        return parts[-1] if parts else base
    return base


def _parse_ts(ts):
    if not ts:
        return None
    try:
        return datetime.datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return None


# A token holding one of these carries a value rather than a command shape: an
# assignment, a connection string, a URL with credentials, a user@host.
_SIGNATURE_VALUE_CHARS = ("=", ":", "@")


def _signature_token_safe(token):
    """True when a token is a command shape and not a value that may be secret.

    Transcripts record real commands, and a real command carries real secrets:
    an inline assignment, a database URL with its password, an API token in a
    query string. A signature is displayed on the dashboard, returned by the
    JSON endpoint and can reach an exported report, so a token holding a value
    is dropped rather than shortened. Truncating a secret still emits most of it.
    """
    return bool(token) and not any(ch in token for ch in _SIGNATURE_VALUE_CHARS)


def _bash_signature(command):
    """A coarse signature of a shell command, so near-identical commands group.

    The program and, when it is a plain subcommand, the word after it identify
    the shape of the command without capturing its arguments, which is what
    makes two runs count as a repetition of the same kind of work rather than
    two unrelated commands. Any token that carries a value is left out.
    """
    parts = command.strip().split()
    if not parts:
        return "(empty)"
    # A leading VAR=value names the environment, not the command that follows.
    while parts and "=" in parts[0]:
        parts = parts[1:]
    if not parts or not _signature_token_safe(parts[0]):
        return "(redacted)"
    sig = parts[0]
    if (len(parts) > 1 and not parts[1].startswith("-")
            and _signature_token_safe(parts[1])):
        sig += " " + parts[1]
    return sig[:40]


def _median(values):
    if not values:
        return 0
    s = sorted(values)
    n = len(s)
    mid = n // 2
    if n % 2:
        return s[mid]
    return (s[mid - 1] + s[mid]) // 2


def _safe_label(value):
    """A bounded, single-line label from a transcript string, or None.

    A label taken from a transcript is printed in the terminal report and
    returned by the JSON endpoint, so it is treated as untrusted text:

    - Only a real string is accepted. str() on a nested object would render
      that object whole, which would re-import through the back door the very
      fields a collector deliberately does not read.
    - Non-printable characters are dropped and whitespace runs are collapsed.
      A newline or a terminal escape inside a recorded name draws extra lines
      in the report, and padding imitates its aligned columns; a report that
      can be made to show a figure it did not measure is a report that
      displays a fabricated metric.
    - The result is bounded. A recorded string has no length limit of its own,
      and an unbounded one would be carried verbatim into every response.

    This is the same reasoning as _bash_signature's own 40 character bound and
    _short_path's shortening, applied to a label rather than to a command.
    """
    if not isinstance(value, str):
        return None
    # Runs of whitespace collapse to one space. Dropping the newline alone
    # stops a label from drawing a second line, but a label padded with spaces
    # still imitates this report's own aligned columns inside the line it is
    # printed on, so the alignment is taken away from it too.
    cleaned = " ".join("".join(
        ch for ch in value if ch.isprintable()).split())
    if not cleaned:
        return None
    return cleaned[:LABEL_MAX_CHARS]


def _agent_dispatch_from_input(name, inp):
    """(subagent_type, model) for an agent dispatch tool call, or None.

    A dispatch is a tool_use block named Task or Agent (both names appear in
    the wild). Its input also carries a prompt and a description, and those
    can hold anything the user typed, including a credential. This function
    reads exactly two keys, subagent_type and model, and nothing else, so
    there is no code path here by which the prompt or the description could
    reach a session count, the JSON output or the printed report.

    Both keys go through _safe_label, so a value that is not a plain string,
    or that carries control characters or unbounded length, is rejected rather
    than stringified. A block whose subagent_type is not a usable string is
    not a well formed dispatch and is not counted at all: counting it would
    require inventing a name for it. A model key that is absent means the
    agent ran under its own default and is recorded as "default"; a model key
    that is present but unusable is recorded as "unknown", because "default"
    would assert something the record does not show.
    """
    if name not in ("Task", "Agent"):
        return None
    if not isinstance(inp, dict):
        return None
    agent = _safe_label(inp.get("subagent_type"))
    if not agent:
        return None
    raw_model = inp.get("model")
    if raw_model is None or raw_model == "":
        model = "default"
    else:
        model = _safe_label(raw_model) or "unknown"
    return agent, model


_MODEL_LABELS = {}


def _model_label(raw):
    """_safe_label for a model name, remembered per raw value.

    A transcript repeats the same few model names on tens of thousands of
    records, and cleaning each one character by character dominated the read
    time; the result for a given string never changes.
    """
    if not isinstance(raw, str) or not raw or raw == "<synthetic>":
        return None
    label = _MODEL_LABELS.get(raw)
    if label is None and raw not in _MODEL_LABELS:
        label = _safe_label(raw)
        if len(_MODEL_LABELS) < 1000:
            _MODEL_LABELS[raw] = label
    return label


def _usage_kinds(usage):
    """(input, cache write, cache read, output) from a usage block, as ints.

    The four kinds are priced differently and mean different things, so they
    are kept apart from the first record onwards and never merged into a
    single "tokens" figure until a reader asks for one. A missing or malformed
    count is a zero, which is what the record shows.
    """
    if not isinstance(usage, dict):
        return 0, 0, 0, 0

    def num(key):
        value = usage.get(key)
        return int(value) if isinstance(value, (int, float)) and value > 0 else 0

    return (num("input_tokens"), num("cache_creation_input_tokens"),
            num("cache_read_input_tokens"), num("output_tokens"))


def _subagent_meta(transcript_path):
    """(agent type, requested model) from a subagent transcript's meta file.

    The runtime writes agent-<id>.meta.json beside agent-<id>.jsonl. Like a
    dispatch call, it also carries a free-text description, which can hold
    anything the user typed, so exactly two keys are read and nothing else:
    agentType and model, both through _safe_label. A missing or unreadable
    meta file names no agent; its usage is still counted, as "unattributed".
    """
    meta_path = transcript_path[:-len(".jsonl")] + ".meta.json"
    try:
        with open(meta_path, "r", errors="replace") as fh:
            meta = json.load(fh)
    except (OSError, ValueError):
        return None, None
    if not isinstance(meta, dict):
        return None, None
    return _safe_label(meta.get("agentType")), _safe_label(meta.get("model"))


def read_transcripts():
    """Aggregate the real figures from every transcript. Returns a dict.

    Everything here is derived from records that exist. A transcript with no
    assistant records contributes a session with zero tokens, which is the
    truth, not an omission.
    """
    pattern = os.path.join(PROJECTS_DIR, "*", "*.jsonl")
    files = sorted(glob.glob(pattern))

    sessions = {}          # sessionId -> aggregate
    tools = Counter()
    skills = Counter()
    models = Counter()
    # Agent dispatch telemetry: which subagent was called and how often, under
    # which model, and how much sidechain work is on record as evidence that a
    # dispatch actually produced messages. Built only from subagent_type and
    # model, both bounded and validated; see _agent_dispatch_from_input for the
    # boundary that enforces it.
    agent_dispatches = Counter()
    agent_dispatch_models = Counter()
    agent_dispatch_total = 0
    sidechain_records = 0
    # The usage cube: every assistant message, from a session or from a
    # subagent, summed by day, session, model and agent (None for the session
    # itself), with the four token kinds apart. Every consumption figure the
    # interface shows is a sum over this cube, so the totals, the per-day,
    # per-project, per-model and per-agent views agree by construction.
    cube = defaultdict(lambda: [0, 0, 0, 0, 0])
    agent_usage = {}
    orphan_agent_messages = 0
    skill_last = {}
    agent_last = {}

    def add_usage(day, sid, model, agent, kinds):
        cell = cube[(day, sid, model, agent)]
        for i, value in enumerate(kinds):
            cell[i] += value
        cell[4] += 1
    # per_project is aggregated from the finished sessions after the loop, by
    # session identity; per_day is aggregated per record here.
    per_day = defaultdict(lambda: {"tokens_in": 0, "fresh_in": 0, "tokens_out": 0,
                                   "messages": 0, "sessions": set()})

    totals = {
        "input_tokens": 0,
        "output_tokens": 0,
        "cache_read_tokens": 0,
        "cache_creation_tokens": 0,
        "assistant_messages": 0,
        "agent_assistant_messages": 0,
        "user_messages": 0,
    }

    for path in files:
        project_dir = os.path.basename(os.path.dirname(path))
        try:
            fh = open(path, "r", errors="replace")
        except OSError:
            continue
        with fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    rec = json.loads(line)
                except json.JSONDecodeError:
                    continue
                # A line can be valid JSON and still not be a record: a bare
                # list, number or string. Every record field below is read
                # with .get, which only a mapping supports.
                if not isinstance(rec, dict):
                    continue
                rtype = rec.get("type")
                sid = rec.get("sessionId")
                # The session id is used as a dictionary key. A record whose
                # id is a list or an object would raise on the first lookup
                # and end the whole collection, so a value that is not a
                # string names no session, exactly as a missing one does.
                if not isinstance(sid, str):
                    sid = None
                ts = _parse_ts(rec.get("timestamp"))
                day = ts.date().isoformat() if ts else None
                rec_cwd = rec.get("cwd")

                if sid and sid not in sessions:
                    sessions[sid] = {
                        "id": sid,
                        # A session belongs to one project. Its identity is the
                        # working directory it started in, not the cwd of each
                        # record: a session that runs "cd" into subfolders would
                        # otherwise be split across a dozen false projects.
                        "cwd": rec_cwd,
                        "dir": project_dir,
                        "project": None,
                        "branch": rec.get("gitBranch") or "",
                        "first": ts,
                        "last": ts,
                        "tokens_in": 0,
                        "tokens_out": 0,
                        "cache_read": 0,
                        "cache_creation": 0,
                        "messages": 0,
                        "tools": Counter(),
                        "models": Counter(),
                        # Evidence for the optimization advisor, all from real
                        # tool-call inputs. No inference is stored here, only
                        # counts of what actually happened.
                        "files_read": Counter(),
                        "files_edited": Counter(),
                        "bash_signatures": Counter(),
                        "bash_count": 0,
                        "output_tokens_per_msg": [],
                        # Agent dispatch evidence for this session alone,
                        # mirroring the run's own totals above.
                        "agent_dispatch_total": 0,
                        "agent_dispatches": Counter(),
                        "agent_dispatch_models": Counter(),
                        "sidechain_records": 0,
                        "agent_messages": 0,
                        "agent_tokens_out": 0,
                    }
                if sid:
                    s = sessions[sid]
                    # Record the first real working directory seen; it names the
                    # project more reliably than the encoded transcript folder.
                    if s["cwd"] is None and rec_cwd:
                        s["cwd"] = rec_cwd
                    if ts:
                        if s["first"] is None or ts < s["first"]:
                            s["first"] = ts
                        if s["last"] is None or ts > s["last"]:
                            s["last"] = ts

                # A subagent's own transcript lines carry this flag regardless
                # of their type. The count is evidence that dispatched work
                # actually ran, independent of whether the dispatching block
                # itself is present in this file.
                if rec.get("isSidechain") is True:
                    sidechain_records += 1
                    if sid:
                        sessions[sid]["sidechain_records"] += 1

                if rtype == "user":
                    totals["user_messages"] += 1
                    if day:
                        per_day[day]["messages"] += 0  # user turns not counted as cost
                elif rtype == "assistant":
                    totals["assistant_messages"] += 1
                    msg = rec.get("message") or {}
                    model = msg.get("model")
                    if model and model != "<synthetic>":
                        models[model] += 1
                        if sid:
                            sessions[sid]["models"][model] += 1
                    ti, cc, cr, to = _usage_kinds(msg.get("usage"))
                    add_usage(day, sid, _model_label(model), None, (ti, cc, cr, to))
                    totals["input_tokens"] += ti
                    totals["output_tokens"] += to
                    totals["cache_read_tokens"] += cr
                    totals["cache_creation_tokens"] += cc
                    if sid:
                        sessions[sid]["tokens_in"] += ti + cr + cc
                        sessions[sid]["tokens_out"] += to
                        sessions[sid]["cache_read"] += cr
                        sessions[sid]["cache_creation"] += cc
                        sessions[sid]["messages"] += 1
                        if to > 0:
                            sessions[sid]["output_tokens_per_msg"].append(to)
                    # Per-project totals are aggregated from the finished
                    # sessions after the loop, by session identity, so a session
                    # is not scattered across the folders it visited.
                    if day:
                        per_day[day]["tokens_in"] += ti + cr + cc
                        per_day[day]["fresh_in"] += ti
                        per_day[day]["tokens_out"] += to
                        per_day[day]["messages"] += 1
                        if sid:
                            per_day[day]["sessions"].add(sid)
                    for blk in msg.get("content") or []:
                        if isinstance(blk, dict) and blk.get("type") == "tool_use":
                            tname = blk.get("name") or "?"
                            inp = blk.get("input") or {}
                            tools[tname] += 1
                            if sid:
                                s = sessions[sid]
                                s["tools"][tname] += 1
                                # Real file access and command evidence, used by
                                # the advisor to detect repeated exploration,
                                # edit churn and command repetition.
                                if tname in ("Read", "NotebookEdit") and inp.get("file_path"):
                                    s["files_read"][str(inp["file_path"])] += 1
                                elif tname in ("Edit", "Write") and inp.get("file_path"):
                                    s["files_edited"][str(inp["file_path"])] += 1
                                elif tname == "Bash" and inp.get("command"):
                                    s["bash_count"] += 1
                                    s["bash_signatures"][_bash_signature(str(inp["command"]))] += 1
                            if tname == "Skill":
                                sname = inp.get("skill")
                                if sname:
                                    skills[str(sname)] += 1
                                    sname_label = _safe_label(sname)
                                    if sname_label and ts and (sname_label not in skill_last or ts > skill_last[sname_label]):
                                        skill_last[sname_label] = ts
                            dispatch = _agent_dispatch_from_input(tname, inp)
                            if dispatch:
                                d_agent, d_model = dispatch
                                agent_dispatches[d_agent] += 1
                                agent_dispatch_models[d_model] += 1
                                agent_dispatch_total += 1
                                if ts and (d_agent not in agent_last or ts > agent_last[d_agent]):
                                    agent_last[d_agent] = ts
                                if sid:
                                    sessions[sid]["agent_dispatch_total"] += 1
                                    sessions[sid]["agent_dispatches"][d_agent] += 1
                                    sessions[sid]["agent_dispatch_models"][d_model] += 1

    # A dispatched agent writes its own transcript one level deeper than the
    # session transcripts, under <project>/<sessionId>/subagents/, so the
    # "*/*.jsonl" scan above never sees those records.
    #
    # Their usage is consumption like any other, and since the redesign agreed
    # on 2026-10-22 (docs/control-center-redesign-spec.md) it is counted: in
    # the totals, the per-day and per-model figures, the dispatching session
    # and its project, and the per-agent view, with the model the subagent
    # actually ran on. Before that decision these files only fed a record
    # count, and every consumption figure left out the agents' share of the
    # work. Tool evidence for the advisor stays per session: a subagent's own
    # file reads and commands are not folded into its parent's findings.
    #
    # Each record carries its dispatching session's id. A record is written to
    # one file or the other, never both, so nothing is counted twice.
    sidechain_pattern = os.path.join(PROJECTS_DIR, "*", "*", "subagents", "*.jsonl")
    for path in sorted(glob.glob(sidechain_pattern)):
        agent_type, requested = _subagent_meta(path)
        agent = agent_type or "unattributed"
        try:
            fh = open(path, "r", errors="replace")
        except OSError:
            continue
        with fh:
            entry = agent_usage.setdefault(agent, {
                "transcripts": 0, "messages": 0, "kinds": [0, 0, 0, 0],
                "models": Counter(), "requested": Counter(), "last": None})
            entry["transcripts"] += 1
            if requested:
                entry["requested"][requested] += 1
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    rec = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if not isinstance(rec, dict) or rec.get("isSidechain") is not True:
                    continue
                sidechain_records += 1
                sub_sid = rec.get("sessionId")
                if not isinstance(sub_sid, str):
                    sub_sid = None
                known = sub_sid in sessions if sub_sid else False
                # Only a session the main scan actually saw can carry the
                # count. An orphan subagent transcript still counts in the
                # total, where it is true, and nowhere else.
                if known:
                    sessions[sub_sid]["sidechain_records"] += 1
                if rec.get("type") != "assistant":
                    continue
                msg = rec.get("message")
                if not isinstance(msg, dict):
                    continue
                ts = _parse_ts(rec.get("timestamp"))
                day = ts.date().isoformat() if ts else None
                model = _model_label(msg.get("model"))
                ti, cc, cr, to = _usage_kinds(msg.get("usage"))
                totals["input_tokens"] += ti
                totals["output_tokens"] += to
                totals["cache_read_tokens"] += cr
                totals["cache_creation_tokens"] += cc
                totals["agent_assistant_messages"] += 1
                if model:
                    models[model] += 1
                    entry["models"][model] += 1
                for i, value in enumerate((ti, cc, cr, to)):
                    entry["kinds"][i] += value
                entry["messages"] += 1
                if ts and (entry["last"] is None or ts > entry["last"]):
                    entry["last"] = ts
                if day:
                    per_day[day]["tokens_in"] += ti + cr + cc
                    per_day[day]["fresh_in"] += ti
                    per_day[day]["tokens_out"] += to
                if known:
                    s = sessions[sub_sid]
                    s["tokens_in"] += ti + cr + cc
                    s["tokens_out"] += to
                    s["cache_read"] += cr
                    s["cache_creation"] += cc
                    s["agent_messages"] += 1
                    s["agent_tokens_out"] += to
                    if model:
                        s["models"][model] += 1
                    add_usage(day, sub_sid, model, agent, (ti, cc, cr, to))
                else:
                    orphan_agent_messages += 1
                    add_usage(day, None, model, agent, (ti, cc, cr, to))

    # Shape sessions for output, newest first by last activity. The evidence
    # block carries only real counts; the advisor turns them into findings.
    session_list = []
    for s in sessions.values():
        # Resolve the project name: the basename of the first real working
        # directory, falling back to the transcript folder when no cwd was seen.
        if s["cwd"]:
            s["project"] = os.path.basename(str(s["cwd"]).rstrip("/")) or "unknown"
        else:
            s["project"] = _project_name(s["dir"])
        dur = None
        if s["first"] and s["last"]:
            dur = int((s["last"] - s["first"]).total_seconds())
        total_tok = s["tokens_in"] + s["tokens_out"]
        fresh_in = s["tokens_in"] - s["cache_read"] - s["cache_creation"]
        if fresh_in < 0:
            fresh_in = 0
        # "Work" tokens: fresh input plus generated output. Cache reads, which
        # are the same context re-read cheaply each turn and would otherwise
        # dominate every figure, are excluded so session sizes are comparable.
        work_tok = fresh_in + s["tokens_out"]
        reads = s["files_read"]
        edits = s["files_edited"]
        bash_sigs = s["bash_signatures"]
        out_msgs = s["output_tokens_per_msg"]
        session_list.append({
            "id": s["id"],
            "project": s["project"],
            "branch": s["branch"],
            "start": s["first"].isoformat() if s["first"] else None,
            "end": s["last"].isoformat() if s["last"] else None,
            "duration_seconds": dur,
            "tokens_in": s["tokens_in"],
            "fresh_in": fresh_in,
            "tokens_out": s["tokens_out"],
            "tokens_total": total_tok,
            "work_tokens": work_tok,
            "cache_read": s["cache_read"],
            "cache_creation": s["cache_creation"],
            "messages": s["messages"],
            "agent_messages": s["agent_messages"],
            "agent_tokens_out": s["agent_tokens_out"],
            "tool_calls": sum(s["tools"].values()),
            "tool_types": len(s["tools"]),
            "top_tools": s["tools"].most_common(5),
            "models": s["models"].most_common(3),
            "agent_dispatches": {
                "total": s["agent_dispatch_total"],
                "by_agent": s["agent_dispatches"].most_common(SESSION_AGENT_LIST_MAX),
                "by_model": s["agent_dispatch_models"].most_common(SESSION_AGENT_LIST_MAX),
                "sidechain_records": s["sidechain_records"],
            },
            "evidence": {
                "reads_total": sum(reads.values()),
                "reads_unique": len(reads),
                "repeated_reads": [
                    {"file": _short_path(f), "count": c}
                    for f, c in reads.most_common(5) if c >= 3
                ],
                "edits_total": sum(edits.values()),
                "edits_unique": len(edits),
                "churned_files": [
                    {"file": _short_path(f), "count": c}
                    for f, c in edits.most_common(5) if c >= 4
                ],
                "bash_total": s["bash_count"],
                "repeated_bash": [
                    {"signature": sig, "count": c}
                    for sig, c in bash_sigs.most_common(5) if c >= 5
                ],
                "output_max": max(out_msgs) if out_msgs else 0,
                "output_median": _median(out_msgs),
                "large_outputs": sum(1 for v in out_msgs if v >= LARGE_OUTPUT_TOKENS),
            },
        })
    session_list.sort(key=lambda x: x["end"] or "", reverse=True)

    # Aggregate per project from the finished sessions, by the session's own
    # project identity, so each session counts once toward one project.
    per_project = {}
    for s in session_list:
        p = per_project.setdefault(s["project"], {
            "sessions": 0, "tokens_in": 0, "fresh_in": 0, "tokens_out": 0,
            "messages": 0})
        p["sessions"] += 1
        p["tokens_in"] += s["tokens_in"]
        p["fresh_in"] += s["fresh_in"]
        p["tokens_out"] += s["tokens_out"]
        p["messages"] += s["messages"]
    projects_out = []
    for name, p in per_project.items():
        projects_out.append({
            "name": name,
            "sessions": p["sessions"],
            "tokens_in": p["tokens_in"],
            "fresh_in": p["fresh_in"],
            "tokens_out": p["tokens_out"],
            "messages": p["messages"],
        })
    projects_out.sort(key=lambda x: x["fresh_in"] + x["tokens_out"], reverse=True)

    days_out = []
    for day, d in sorted(per_day.items()):
        days_out.append({
            "date": day,
            "tokens_in": d["tokens_in"],
            "fresh_in": d["fresh_in"],
            "tokens_out": d["tokens_out"],
            "messages": d["messages"],
            "sessions": len(d["sessions"]),
        })

    # Overview statistics over per-session work tokens (fresh input plus output,
    # excluding cheap cache re-reads), so the figures are comparable and not
    # dominated by re-read context.
    session_totals = [s["work_tokens"] for s in session_list]
    largest = sorted(session_list, key=lambda x: x["work_tokens"], reverse=True)[:5]
    smallest = sorted(
        (s for s in session_list if s["work_tokens"] > 0),
        key=lambda x: x["work_tokens"])[:5]
    total_cache_read = totals["cache_read_tokens"]
    total_cache_creation = totals["cache_creation_tokens"]
    cache_base = total_cache_read + total_cache_creation
    overview = {
        "sessions": len(sessions),
        "tokens_total": sum(session_totals),
        "avg_tokens_per_session": (sum(session_totals) // len(session_totals)) if session_totals else 0,
        "median_tokens_per_session": _median(session_totals),
        "cache_reuse_ratio": round(total_cache_read / cache_base, 4) if cache_base else None,
        "largest_sessions": [
            {"id": s["id"], "project": s["project"], "work_tokens": s["work_tokens"]}
            for s in largest
        ],
        "smallest_sessions": [
            {"id": s["id"], "project": s["project"], "work_tokens": s["work_tokens"]}
            for s in smallest
        ],
    }

    project_of = {s["id"]: s["project"] for s in session_list}
    folded = defaultdict(lambda: [0, 0, 0, 0, 0])
    for (day, sid, model, agent), cell in cube.items():
        key = (day, project_of.get(sid) if sid else None, model, agent)
        target = folded[key]
        for i, value in enumerate(cell):
            target[i] += value
    usage_cube = [
        {"day": day, "project": project, "model": model, "agent": agent,
         "input": c[0], "cache_write": c[1], "cache_read": c[2], "output": c[3],
         "messages": c[4]}
        for (day, project, model, agent), c in sorted(
            folded.items(), key=lambda kv: tuple("" if x is None else x for x in kv[0]))
    ]
    agents_out = []
    for name, e in agent_usage.items():
        agents_out.append({
            "agent": name,
            "transcripts": e["transcripts"],
            "messages": e["messages"],
            "input": e["kinds"][0], "cache_write": e["kinds"][1],
            "cache_read": e["kinds"][2], "output": e["kinds"][3],
            "models": e["models"].most_common(),
            "requested": e["requested"].most_common(),
            "last": e["last"].isoformat() if e["last"] else None,
        })
    agents_out.sort(key=lambda a: a["output"], reverse=True)

    return {
        "available": len(files) > 0,
        "transcript_files": len(files),
        "totals": totals,
        "session_count": len(sessions),
        "overview": overview,
        "sessions": session_list,
        "tools": tools.most_common(30),
        "skills": skills.most_common(60),
        "models": models.most_common(),
        "projects": projects_out,
        "days": days_out,
        "large_output_threshold": LARGE_OUTPUT_TOKENS,
        "agent_dispatches": {
            "total": agent_dispatch_total,
            "by_agent": agent_dispatches.most_common(AGENT_LIST_MAX),
            "by_model": agent_dispatch_models.most_common(AGENT_LIST_MAX),
            "sidechain_records": sidechain_records,
        },
        # The redesign's data, added beside the figures above so the current
        # page keeps working while it reads the corrected totals.
        "usage_cube": usage_cube,
        "agent_usage": agents_out[:AGENT_LIST_MAX],
        "orphan_agent_messages": orphan_agent_messages,
        "skill_last_used": {k: v.isoformat() for k, v in skill_last.items()},
        "agent_last_dispatched": {k: v.isoformat() for k, v in agent_last.items()},
    }


def _parse_list_field(value):
    """Parse a metadata list written inline as [a, b, c]."""
    value = value.strip()
    if value.startswith("[") and value.endswith("]"):
        inner = value[1:-1].strip()
        if not inner:
            return []
        return [x.strip() for x in inner.split(",") if x.strip()]
    return [value] if value else []


def read_installed():
    """What the suite has installed, from the target directories.

    The full description and the metadata (category, version, dependencies,
    outputs) are read so the interface can show what a skill is for, not a
    truncated line.
    """
    skills = []
    if os.path.isdir(SKILLS_DIR):
        for name in sorted(os.listdir(SKILLS_DIR)):
            d = os.path.join(SKILLS_DIR, name)
            skill_md = os.path.join(d, "SKILL.md")
            if os.path.isfile(skill_md):
                category = ""
                desc = ""
                version = ""
                depends_on = []
                outputs = []
                try:
                    with open(skill_md, "r", errors="replace") as fh:
                        for ln in fh:
                            stripped = ln.strip()
                            if ln.startswith("description:"):
                                desc = ln.split(":", 1)[1].strip()
                            elif stripped.startswith("category:"):
                                category = stripped.split(":", 1)[1].strip()
                            elif stripped.startswith("version:"):
                                version = stripped.split(":", 1)[1].strip()
                            elif stripped.startswith("depends_on:"):
                                depends_on = _parse_list_field(stripped.split(":", 1)[1])
                            elif stripped.startswith("outputs:"):
                                outputs = _parse_list_field(stripped.split(":", 1)[1])
                            # The metadata block ends at the closing fence.
                            elif stripped == "---" and desc:
                                break
                except OSError:
                    pass
                skills.append({
                    "name": name,
                    "category": category,
                    "version": version,
                    "description": desc,
                    "depends_on": depends_on,
                    "outputs": outputs,
                })
    agents = []
    if os.path.isdir(AGENTS_DIR):
        for name in sorted(os.listdir(AGENTS_DIR)):
            if name.endswith(".md") and name != "README.md":
                agents.append(name[:-3])
    return {
        "skills_dir": SKILLS_DIR,
        "agents_dir": AGENTS_DIR,
        "skills": skills,
        "skill_count": len(skills),
        "agents": agents,
        "agent_count": len(agents),
    }


def read_config():
    """Read the configuration for display. Never emits a secret.

    The configuration contract forbids secrets in this file, so reading it is
    safe. As defence in depth, any line whose key looks credential-shaped is
    dropped rather than displayed.
    """
    if not os.path.isfile(CONFIG_FILE):
        return {"present": False, "path": CONFIG_FILE, "fields": {}}
    secretish = ("token", "secret", "password", "key", "credential", "api")
    fields = {}
    section = None
    try:
        with open(CONFIG_FILE, "r", errors="replace") as fh:
            for ln in fh:
                raw = ln.rstrip("\n")
                if not raw.strip() or raw.strip().startswith("#"):
                    continue
                if not raw.startswith(" ") and raw.endswith(":"):
                    section = raw[:-1].strip()
                    fields[section] = {}
                    continue
                if ":" in raw:
                    k, v = raw.split(":", 1)
                    k = k.strip()
                    v = v.split("#", 1)[0].strip().strip('"')
                    if any(s in k.lower() for s in secretish):
                        continue
                    if section is not None:
                        fields[section][k] = v
    except OSError:
        return {"present": True, "path": CONFIG_FILE, "fields": {}}
    return {"present": True, "path": CONFIG_FILE, "fields": fields}


REPO_DIR = os.environ.get(
    "CRAFT_SUITE_REPO", os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)


def read_repository():
    """The suite's own skills and agents, from its repository, when found.

    The Control Center ships inside the repository, so its parent directory is
    the repository unless CRAFT_SUITE_REPO says otherwise. It is recognised by
    AGENTS.md and install.sh at its root; anywhere else this returns found
    False and the interface says it cannot compare, rather than comparing
    against nothing. Generated plugin bundles and dependencies are skipped, so
    a skill counts once, from its tree.
    """
    root = REPO_DIR
    if not (os.path.isfile(os.path.join(root, "AGENTS.md"))
            and os.path.isfile(os.path.join(root, "install.sh"))):
        return {"found": False, "path": root, "skills": [], "agents": []}
    skills = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames
                       if d not in ("plugins", "node_modules", ".git", ".next", "dist")]
        if "SKILL.md" in filenames:
            rel = os.path.relpath(dirpath, root)
            skills.append({"name": os.path.basename(dirpath), "tree": rel.split(os.sep)[0]})
    agents = sorted(
        os.path.basename(p)[:-3]
        for p in glob.glob(os.path.join(root, "agents", "*", "*.md"))
        if os.path.basename(p) not in ("README.md", "handoff-protocol.md"))
    skills.sort(key=lambda x: (x["tree"], x["name"]))
    return {"found": True, "path": root, "skills": skills, "agents": agents}


def compare_installation(installed, repository):
    """What the repository holds that this machine has not installed, and the
    reverse. Names only; nothing is installed or removed from here."""
    if not repository.get("found"):
        return {"comparable": False}
    have_skills = {s["name"] for s in installed.get("skills", [])}
    have_agents = set(installed.get("agents", []))
    repo_skills = {s["name"] for s in repository["skills"]}
    repo_agents = set(repository["agents"])
    return {
        "comparable": True,
        "missing_skills": sorted(repo_skills - have_skills),
        "missing_agents": sorted(repo_agents - have_agents),
        "extra_skills": sorted(have_skills - repo_skills),
        "extra_agents": sorted(have_agents - repo_agents),
    }


def collect():
    """The full data object the server serves and the report prints."""
    installed = read_installed()
    repository = read_repository()
    return {
        "generated_at": datetime.datetime.now().isoformat(timespec="seconds"),
        "usage": read_transcripts(),
        "installed": installed,
        "repository": repository,
        "installation_drift": compare_installation(installed, repository),
        "config": read_config(),
        "notes": {
            "token_source": "real usage figures recorded in local transcripts",
            "privacy": "all data is local; nothing is sent anywhere",
        },
    }


def _fmt(n):
    n = int(n)
    if n >= 1_000_000:
        return f"{n/1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n/1_000:.1f}K"
    return str(n)


def print_report():
    data = collect()
    u = data["usage"]
    inst = data["installed"]
    cfg = data["config"]
    line = "-" * 60
    print("Craft Suite, usage report")
    print(f"Generated {data['generated_at']}")
    print(line)
    if not u["available"]:
        print("No local session data found under:")
        print(f"  {PROJECTS_DIR}")
        print("Nothing to report. This is not an error; the suite works without it.")
    else:
        t = u["totals"]
        print(f"Transcript files      {u['transcript_files']}")
        print(f"Sessions              {u['session_count']}")
        print(f"Assistant messages    {t['assistant_messages']}")
        print(f"Input tokens          {_fmt(t['input_tokens'])}")
        print(f"  cache read          {_fmt(t['cache_read_tokens'])}")
        print(f"  cache creation      {_fmt(t['cache_creation_tokens'])}")
        print(f"Output tokens         {_fmt(t['output_tokens'])}")
        print(line)
        print("Models")
        for m, c in u["models"]:
            print(f"  {m:<28} {c}")
        print(line)
        print("Top tools")
        for name, c in u["tools"][:12]:
            print(f"  {name:<28} {c}")
        print(line)
        if u["skills"]:
            print("Skill invocations")
            for name, c in u["skills"][:20]:
                print(f"  {name:<28} {c}")
            print(line)
        ad = u["agent_dispatches"]
        # This counts the dispatch calls recorded in the transcripts. A call
        # the runtime refused, or one that ended in an error, leaves a
        # tool_use block behind too, so the figure is what was called and not
        # a claim about how many agents finished; the sidechain count on the
        # next line is the corroborating evidence for work that actually ran.
        print(f"Agent dispatches      {ad['total'] if ad['total'] else 'none recorded'}")
        print(f"Sidechain records     {ad['sidechain_records'] if ad['sidechain_records'] else 'none recorded'}")
        if ad["total"]:
            print("  by agent")
            for name, c in ad["by_agent"][:12]:
                print(f"    {name:<26} {c}")
            print("  by model")
            for name, c in ad["by_model"][:12]:
                print(f"    {name:<26} {c}")
        print(line)
        print("Projects by work tokens (fresh input plus output)")
        for p in u["projects"][:10]:
            tot = _fmt(p["fresh_in"] + p["tokens_out"])
            print(f"  {p['name']:<28} {p['sessions']} sessions  {tot} tokens")
        print(line)
        # Optimization summary. advisor is imported lazily so the reader stays
        # independent of it; if it is unavailable the report simply omits this.
        try:
            import advisor as _advisor
            adv = _advisor.analyze(data)
            if adv.get("available"):
                score = adv.get("score")
                print("Optimization score    "
                      + (f"{score} / 100" if score is not None else "not available"))
                print(f"  findings            {adv.get('findings_total', 0)}"
                      f" across {adv.get('sessions_analysed', 0)} sessions")
                for pat in adv.get("patterns", [])[:6]:
                    print(f"  {pat['category']:<26} {pat['count']}")
                print(line)
        except Exception:  # noqa: BLE001  the report is useful without it
            pass
    print(f"Installed skills      {inst['skill_count']}  in {inst['skills_dir']}")
    print(f"Installed agents      {inst['agent_count']}  in {inst['agents_dir']}")
    if cfg["present"]:
        ident = cfg["fields"].get("identity", {})
        author = ident.get("author_name", "")
        print(f"Configured author     {author or '(unset)'}")
    else:
        print("Configuration         not written yet (run install.sh --configure)")
    print(line)
    print("All figures are read from local files. Nothing is sent anywhere.")


def main(argv):
    if "--json" in argv:
        json.dump(collect(), sys.stdout, indent=2, default=str)
        sys.stdout.write("\n")
        return 0
    # Default and --report both print the text report.
    print_report()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
