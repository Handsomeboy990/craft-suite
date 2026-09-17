#!/usr/bin/env python3
"""Deterministic tests for the agent-dispatch telemetry collector in reader.py.

No test framework dependency: plain assertions, run with python3. Each
scenario writes its own throwaway transcript fixture under a temporary
directory, points reader.PROJECTS_DIR at it, and reads back the aggregate the
collector produced. The central guarantee under test is the privacy boundary:
a dispatch's prompt and description are never read, stored or returned, no
matter what they contain.

    python3 control-center/test_reader.py
"""

import contextlib
import io
import json
import os
import re
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import reader  # noqa: E402

PASS = 0
FAIL = 0


def check(name, cond):
    global PASS, FAIL
    if cond:
        PASS += 1
    else:
        FAIL += 1
        print("FAIL  " + name)


def _rec(rtype, sid, ts, **extra):
    """A minimal transcript record of the given type, with the fields
    read_transcripts actually looks at. Extra keys are merged in last so a
    test can override anything, including top-level isSidechain."""
    r = {
        "type": rtype,
        "sessionId": sid,
        "timestamp": ts,
        "cwd": "/tmp/fixture-project",
        "gitBranch": "",
    }
    r.update(extra)
    return r


def _assistant(sid, ts, content=None, model="claude-sonnet-5", usage=None, **extra):
    return _rec(
        "assistant", sid, ts,
        message={
            "model": model,
            "usage": usage or {"input_tokens": 1, "output_tokens": 1},
            "content": content or [],
        },
        **extra,
    )


def _dispatch_block(subagent_type=None, model=None, prompt=None, description=None,
                     name="Task"):
    """A tool_use block shaped like a real agent dispatch. subagent_type and
    model are the only two keys the collector may read; prompt and
    description are included here specifically so the tests can prove they
    are never read back out."""
    inp = {}
    if subagent_type is not None:
        inp["subagent_type"] = subagent_type
    if model is not None:
        inp["model"] = model
    if prompt is not None:
        inp["prompt"] = prompt
    if description is not None:
        inp["description"] = description
    return {"type": "tool_use", "name": name, "input": inp}


def write_fixture(root, project, session_id, records):
    """Write one session's records as a transcript file, one JSON value or
    raw line per line, matching the real *.jsonl layout under a project dir."""
    d = os.path.join(root, project)
    os.makedirs(d, exist_ok=True)
    path = os.path.join(d, session_id + ".jsonl")
    with open(path, "w") as fh:
        for rec in records:
            if isinstance(rec, str):
                fh.write(rec + "\n")  # a raw, possibly malformed line
            else:
                fh.write(json.dumps(rec) + "\n")
    return path


def write_subagent_fixture(root, project, session_id, agent_name, records):
    """Write a dispatched agent's own transcript where the runtime puts it:
    <project>/<sessionId>/subagents/agent-*.jsonl, one level deeper than the
    session transcript it belongs to."""
    d = os.path.join(root, project, session_id, "subagents")
    os.makedirs(d, exist_ok=True)
    path = os.path.join(d, agent_name + ".jsonl")
    with open(path, "w") as fh:
        for rec in records:
            if isinstance(rec, str):
                fh.write(rec + "\n")
            else:
                fh.write(json.dumps(rec) + "\n")
    return path


def read_with_fixture(build):
    """Run build(root) to populate a temp PROJECTS_DIR, then read it back.

    reader.PROJECTS_DIR is a module attribute read at call time by
    read_transcripts, so pointing it at a fixture directory is enough; no
    subprocess or environment juggling is needed.
    """
    with tempfile.TemporaryDirectory() as root:
        build(root)
        original = reader.PROJECTS_DIR
        reader.PROJECTS_DIR = root
        try:
            return reader.read_transcripts()
        finally:
            reader.PROJECTS_DIR = original


def capture_report(build):
    """Run build(root) to populate a temp PROJECTS_DIR, then capture the text
    print_report() writes to stdout for it.

    The honest-zero wording ("none recorded" rather than a bare 0) lives only
    in the printed report, not in the read_transcripts() aggregate, so it can
    only be checked by running the report itself. SKILLS_DIR, AGENTS_DIR and
    CONFIG_FILE are pointed at empty paths for the duration so the report is
    not affected by whatever happens to be installed on the machine running
    the test.
    """
    with tempfile.TemporaryDirectory() as root:
        build(root)
        originals = (reader.PROJECTS_DIR, reader.SKILLS_DIR,
                     reader.AGENTS_DIR, reader.CONFIG_FILE)
        reader.PROJECTS_DIR = root
        reader.SKILLS_DIR = os.path.join(root, "_no_skills")
        reader.AGENTS_DIR = os.path.join(root, "_no_agents")
        reader.CONFIG_FILE = os.path.join(root, "_no_config.yaml")
        buf = io.StringIO()
        try:
            with contextlib.redirect_stdout(buf):
                reader.print_report()
        finally:
            (reader.PROJECTS_DIR, reader.SKILLS_DIR,
             reader.AGENTS_DIR, reader.CONFIG_FILE) = originals
        return buf.getvalue()


def _field(report_text, label):
    """The value printed after a "Label   value" line, or None if absent."""
    m = re.search(r"^" + re.escape(label) + r"\s*(.+)$", report_text, re.MULTILINE)
    return m.group(1).strip() if m else None


AD_KEYS = {"total", "by_agent", "by_model", "sidechain_records"}


def dispatch_blocks(usage):
    """Every agent_dispatches block in a collected structure: the aggregate
    one, and one per session."""
    return [usage["agent_dispatches"]] + [
        s["agent_dispatches"] for s in usage["sessions"]]


def holds_only_counts_and(block, allowed_labels):
    """True when a dispatch block holds the four documented keys and nothing
    else, and every string in it is a label the collector is allowed to emit.

    This is a whitelist, deliberately. Asserting that a known secret string is
    absent only catches a leak that copies it verbatim; a leak that truncates
    it, encodes it or files it under an innocent key name would pass that
    assertion while emitting most of the secret, which is the same trap
    _signature_token_safe in reader.py already warns about. Asserting the
    shape instead fails on any field that was not supposed to be there,
    whatever it is called and whatever it holds.
    """
    if set(block) != AD_KEYS:
        return False
    if not isinstance(block["total"], int):
        return False
    if not isinstance(block["sidechain_records"], int):
        return False
    for key in ("by_agent", "by_model"):
        for entry in block[key]:
            if not isinstance(entry, (list, tuple)) or len(entry) != 2:
                return False
            label, count = entry
            if not isinstance(label, str) or not isinstance(count, int):
                return False
            if label not in allowed_labels:
                return False
    return True


# 1. No dispatches: the honest zero, not a made-up figure.
def build_none(root):
    write_fixture(root, "proj", "s1", [
        _assistant("s1", "2026-01-01T00:00:00Z", content=[]),
        _rec("user", "s1", "2026-01-01T00:00:01Z"),
    ])


u = read_with_fixture(build_none)
ad = u["agent_dispatches"]
check("none: total is 0", ad["total"] == 0)
check("none: by_agent empty", ad["by_agent"] == [])
check("none: by_model empty", ad["by_model"] == [])
check("none: sidechain_records is 0", ad["sidechain_records"] == 0)
check("none: session count matches", len(u["sessions"]) == 1)
s_ad = u["sessions"][0]["agent_dispatches"]
check("none: session total is 0", s_ad["total"] == 0)
check("none: session by_agent empty", s_ad["by_agent"] == [])


# 2. Several dispatches across agents, across two sessions.
def build_several(root):
    write_fixture(root, "proj", "sA", [
        _assistant("sA", "2026-01-01T00:00:00Z", content=[
            _dispatch_block(subagent_type="backend-engineer", model="sonnet"),
        ]),
        _assistant("sA", "2026-01-01T00:00:01Z", content=[
            _dispatch_block(subagent_type="backend-engineer"),
            _dispatch_block(subagent_type="frontend-engineer"),
        ]),
    ])
    write_fixture(root, "proj", "sB", [
        _assistant("sB", "2026-01-01T00:00:00Z", content=[
            _dispatch_block(subagent_type="backend-engineer"),
        ]),
    ])


u = read_with_fixture(build_several)
ad = u["agent_dispatches"]
by_agent = dict(ad["by_agent"])
check("several: total is 4", ad["total"] == 4)
check("several: backend-engineer count", by_agent.get("backend-engineer") == 3)
check("several: frontend-engineer count", by_agent.get("frontend-engineer") == 1)
by_session = {s["id"]: s["agent_dispatches"] for s in u["sessions"]}
check("several: sA total is 3", by_session["sA"]["total"] == 3)
check("several: sB total is 1", by_session["sB"]["total"] == 1)
check("several: sA by_agent", dict(by_session["sA"]["by_agent"]) ==
      {"backend-engineer": 2, "frontend-engineer": 1})
check("several: sB by_agent", dict(by_session["sB"]["by_agent"]) ==
      {"backend-engineer": 1})
# The Agent tool name variant (alongside Task) is genuinely exercised in
# scenario 3/4 below (build_models uses name="Agent"), not here: none of
# these dispatch blocks use that name, so no check for it belongs in this
# scenario.


# 3 & 4. A dispatch with an explicit model, and one with no model key at all.
def build_models(root):
    write_fixture(root, "proj", "s1", [
        _assistant("s1", "2026-01-01T00:00:00Z", content=[
            _dispatch_block(subagent_type="backend-engineer", model="opus", name="Task"),
            _dispatch_block(subagent_type="qa-engineer", name="Agent"),  # no model key
        ]),
    ])


u = read_with_fixture(build_models)
ad = u["agent_dispatches"]
by_model = dict(ad["by_model"])
check("models: explicit model recorded", by_model.get("opus") == 1)
check("models: absent model recorded as default", by_model.get("default") == 1)
check("models: Agent tool name also counted", dict(ad["by_agent"]).get("qa-engineer") == 1)
check("models: total is 2", ad["total"] == 2)


# 5. Sidechain counting: evidence that dispatched work actually produced
# messages, independent of the dispatching block. Only a literal boolean
# True counts; a non-boolean truthy value (a string, a 1) is not the shape
# the runtime writes and must not be silently treated as equivalent.
def build_sidechain(root):
    write_fixture(root, "proj", "s1", [
        _assistant("s1", "2026-01-01T00:00:00Z", content=[
            _dispatch_block(subagent_type="backend-engineer"),
        ]),
        _rec("assistant", "s1", "2026-01-01T00:00:01Z", isSidechain=True,
             message={"model": "claude-sonnet-5", "usage": {}, "content": []}),
        _rec("user", "s1", "2026-01-01T00:00:02Z", isSidechain=True),
        _rec("user", "s1", "2026-01-01T00:00:03Z", isSidechain=False),
        _rec("user", "s1", "2026-01-01T00:00:04Z"),  # field absent
        _rec("user", "s1", "2026-01-01T00:00:05Z", isSidechain=1),  # non-boolean truthy
        _rec("user", "s1", "2026-01-01T00:00:06Z", isSidechain="true"),  # non-boolean truthy
    ])


u = read_with_fixture(build_sidechain)
ad = u["agent_dispatches"]
# 2 is the correct count only if the two non-boolean truthy records above
# (isSidechain=1 and isSidechain="true") are excluded; a broken, merely-
# truthy check would report 4 here instead.
check("sidechain: aggregate count is 2, non-boolean truthy excluded",
      ad["sidechain_records"] == 2)
check("sidechain: session count is 2", u["sessions"][0]["agent_dispatches"]["sidechain_records"] == 2)


# 6. Malformed records must be skipped, not fatal, and must not break the
# collector's counts for the records that are well formed.
def build_malformed(root):
    write_fixture(root, "proj", "s1", [
        "{not valid json,,,",
        _assistant("s1", "2026-01-01T00:00:00Z", content=[
            _dispatch_block(subagent_type="backend-engineer"),
        ]),
        # A tool_use block whose input is not a dict at all.
        _assistant("s1", "2026-01-01T00:00:01Z", content=[
            {"type": "tool_use", "name": "Task", "input": "not-a-dict"},
        ]),
        # A tool_use block whose input is a dict but has no subagent_type.
        _assistant("s1", "2026-01-01T00:00:02Z", content=[
            {"type": "tool_use", "name": "Task", "input": {}},
        ]),
        # message.content is a bare string rather than a list of blocks.
        _rec("assistant", "s1", "2026-01-01T00:00:03Z",
             message={"model": "claude-sonnet-5", "usage": {}, "content": "oops"}),
        # A record that is valid JSON but not an object.
        "[1, 2, 3]",
        # Records whose sessionId is not a string. It is used as a dictionary
        # key, so an unhashable one would end the whole collection.
        _rec("assistant", {"not": "a string"}, "2026-01-01T00:00:04Z",
             message={"model": "claude-sonnet-5", "usage": {}, "content": []}),
        _rec("user", ["also", "not"], "2026-01-01T00:00:05Z"),
    ])


try:
    u = read_with_fixture(build_malformed)
    crashed = False
except Exception as exc:  # noqa: BLE001  the test asserts this path is never hit
    crashed = True
    u = None
    print("FAIL  malformed: read_transcripts raised", repr(exc))
check("malformed: does not crash", not crashed)
if u is not None:
    ad = u["agent_dispatches"]
    check("malformed: only the one well-formed dispatch is counted", ad["total"] == 1)
    check("malformed: agent recorded", dict(ad["by_agent"]) == {"backend-engineer": 1})
    check("malformed: unusable session id creates no session",
          [s["id"] for s in u["sessions"]] == ["s1"])


# 6b. A dispatch recorded under an unusable session id. It is still a real
# dispatch, so it counts in the run total; it simply belongs to no session.
def build_unhashable_sid(root):
    write_fixture(root, "proj", "s1", [
        _assistant("s1", "2026-01-01T00:00:00Z", content=[
            _dispatch_block(subagent_type="backend-engineer"),
        ]),
        _rec("assistant", {"not": "a string"}, "2026-01-01T00:00:01Z",
             message={"model": "claude-sonnet-5", "usage": {},
                      "content": [_dispatch_block(subagent_type="orphan-agent")]}),
    ])


try:
    u = read_with_fixture(build_unhashable_sid)
except Exception as exc:  # noqa: BLE001  a crash here is a failure, not an abort
    u = None
    print("FAIL  unhashable sid: read_transcripts raised", repr(exc))
check("unhashable sid: does not crash", u is not None)
if u is not None:
    check("unhashable sid: both dispatches counted in the run total",
          u["agent_dispatches"]["total"] == 2)
    check("unhashable sid: only the real session exists",
          [s["id"] for s in u["sessions"]] == ["s1"])
    check("unhashable sid: the session counts only its own dispatch",
          u["sessions"][0]["agent_dispatches"]["total"] == 1)


# 7. The privacy boundary: prompt and description must never come back out,
# in any shape, anywhere in the collected structure.
SECRET_PROMPT = "sk_live_ABCDEFGHIJKLMNOP-do-not-leak-this"
SECRET_DESCRIPTION = "reset the prod database password to hunter2"


def build_secret(root):
    write_fixture(root, "proj", "s1", [
        _assistant("s1", "2026-01-01T00:00:00Z", content=[
            _dispatch_block(subagent_type="backend-engineer", model="opus",
                             prompt=SECRET_PROMPT, description=SECRET_DESCRIPTION),
        ]),
    ])


u = read_with_fixture(build_secret)
dumped = json.dumps(u, default=str)
check("secret: prompt text absent from output", SECRET_PROMPT not in dumped)
check("secret: description text absent from output", SECRET_DESCRIPTION not in dumped)
check("secret: key 'prompt' absent from output", '"prompt"' not in dumped)
check("secret: key 'description' absent from output", '"description"' not in dumped)
check("secret: dispatch itself still counted", u["agent_dispatches"]["total"] == 1)
check("secret: agent name still counted",
      dict(u["agent_dispatches"]["by_agent"]) == {"backend-engineer": 1})
check("secret: model still counted",
      dict(u["agent_dispatches"]["by_model"]) == {"opus": 1})
# A leak does not have to be verbatim. A collector that kept the first 40
# characters of the prompt under a harmless key name would pass every check
# above while emitting all but one character of the credential, so the
# assertions below test the emitted shape rather than the absence of one
# string: a distinctive fragment, and a whitelist of what a dispatch block is
# allowed to contain at all.
check("secret: no fragment of the prompt survives", SECRET_PROMPT[:12] not in dumped)
check("secret: no fragment of the description survives",
      SECRET_DESCRIPTION[:12] not in dumped)
check("secret: every dispatch block holds only counts and known labels",
      all(holds_only_counts_and(b, {"backend-engineer", "opus"})
          for b in dispatch_blocks(u)))
# The printed report is the other way this data reaches a human, and it is
# built from the same structure, so it is checked rather than assumed.
report_secret = capture_report(build_secret)
check("secret: prompt absent from the printed report", SECRET_PROMPT not in report_secret)
check("secret: prompt fragment absent from the printed report",
      SECRET_PROMPT[:12] not in report_secret)
check("secret: description absent from the printed report",
      SECRET_DESCRIPTION not in report_secret)


# 8. Determinism: same fixture, byte-identical output.
a = json.dumps(read_with_fixture(build_several), default=str, sort_keys=True)
b = json.dumps(read_with_fixture(build_several), default=str, sort_keys=True)
check("deterministic output", a == b)


# 9. The honest-zero requirement, checked where it actually lives: the
# printed report. read_transcripts() reporting total == 0 is necessary but
# not sufficient; the report text must read "none recorded", never a bare 0,
# per the Control Center's contract against a metric that looks measured but
# was not.
report_zero = capture_report(build_none)
check("report: zero dispatches read 'none recorded'",
      _field(report_zero, "Agent dispatches") == "none recorded")
check("report: zero sidechains read 'none recorded'",
      _field(report_zero, "Sidechain records") == "none recorded")

# 10. The counterpart: once a real dispatch exists, the report must show the
# real count, not fall back to the placeholder text.
report_some = capture_report(build_sidechain)  # 1 dispatch, 2 sidechain records
check("report: nonzero dispatches show the real count",
      _field(report_some, "Agent dispatches") == "1")
check("report: nonzero sidechains show the real count",
      _field(report_some, "Sidechain records") == "2")


# 11. subagent_type that is not a string. str() on a nested object renders
# that object whole, which would carry back out exactly the keys this
# collector refuses to read, so a non-string value is not a dispatch at all.
NESTED_SECRET = "postgres://admin:hunter2@db.internal:5432/prod"


def build_nonstring(root):
    write_fixture(root, "proj", "s1", [
        _assistant("s1", "2026-01-01T00:00:00Z", content=[
            # An object that smuggles a prompt in through subagent_type.
            {"type": "tool_use", "name": "Task",
             "input": {"subagent_type": {"name": "x", "prompt": NESTED_SECRET}}},
            # A list doing the same.
            {"type": "tool_use", "name": "Task",
             "input": {"subagent_type": ["backend-engineer", NESTED_SECRET]}},
            # A number, which names no agent.
            {"type": "tool_use", "name": "Task", "input": {"subagent_type": 7}},
            # The one well formed dispatch, which must still be counted.
            _dispatch_block(subagent_type="backend-engineer"),
        ]),
    ])


u = read_with_fixture(build_nonstring)
dumped = json.dumps(u, default=str)
ad = u["agent_dispatches"]
check("nonstring: nested value absent from output", NESTED_SECRET not in dumped)
check("nonstring: nested value fragment absent", NESTED_SECRET[:14] not in dumped)
check("nonstring: only the well formed dispatch counted", ad["total"] == 1)
check("nonstring: only the well formed agent recorded",
      dict(ad["by_agent"]) == {"backend-engineer": 1})
check("nonstring: shape holds", all(
    holds_only_counts_and(b, {"backend-engineer", "default"})
    for b in dispatch_blocks(u)))


# 12. A model key that is present but not a usable string is recorded as
# unknown. Recording it as "default" would assert that the agent ran under its
# own default, which the record does not show.
def build_bad_model(root):
    write_fixture(root, "proj", "s1", [
        _assistant("s1", "2026-01-01T00:00:00Z", content=[
            {"type": "tool_use", "name": "Task",
             "input": {"subagent_type": "backend-engineer",
                       "model": {"prompt": NESTED_SECRET}}},
        ]),
    ])


u = read_with_fixture(build_bad_model)
dumped = json.dumps(u, default=str)
check("bad model: nested value absent from output", NESTED_SECRET not in dumped)
check("bad model: recorded as unknown, not as default",
      dict(u["agent_dispatches"]["by_model"]) == {"unknown": 1})


# 13. An enormous subagent_type. A recorded string has no length limit of its
# own, and it is carried into every /api/data response and every session
# block, so the collector bounds it.
def build_huge(root):
    write_fixture(root, "proj", "s1", [
        _assistant("s1", "2026-01-01T00:00:00Z", content=[
            _dispatch_block(subagent_type="A" * 200000),
        ]),
    ])


u = read_with_fixture(build_huge)
labels = [name for name, _ in u["agent_dispatches"]["by_agent"]]
check("huge: dispatch still counted", u["agent_dispatches"]["total"] == 1)
check("huge: label bounded", labels and len(labels[0]) <= reader.LABEL_MAX_CHARS)
check("huge: session label bounded too", all(
    len(name) <= reader.LABEL_MAX_CHARS
    for b in dispatch_blocks(u) for name, _ in b["by_agent"]))


# 14. Control characters in subagent_type. The report prints the label in a
# fixed width column; a newline or a terminal escape inside the label draws
# lines the report never measured, which is a fabricated metric by another
# route.
FORGED = ("backend-engineer\n    Sessions              999999\n"
          "    Input tokens          \x1b[31mFAKE\x1b[0m")


def build_forged(root):
    write_fixture(root, "proj", "s1", [
        _assistant("s1", "2026-01-01T00:00:00Z", content=[
            _dispatch_block(subagent_type=FORGED),
        ]),
    ])


u = read_with_fixture(build_forged)
labels = [name for name, _ in u["agent_dispatches"]["by_agent"]]
check("forged: dispatch still counted", u["agent_dispatches"]["total"] == 1)
check("forged: no control character in the label",
      labels and all(ch.isprintable() for ch in labels[0]))
check("forged: label is a single line",
      labels and "\n" not in labels[0] and "\r" not in labels[0])
report_forged = capture_report(build_forged)
check("forged: no escape sequence reaches the report", "\x1b" not in report_forged)
# The forged text survives as ordinary characters inside one label, which is
# correct: the label is what the transcript recorded and the report shows it.
# What must not happen is that it becomes a line, or a column, of its own.
check("forged: no forged line is drawn",
      not re.search(r"^\s*Sessions\s+999999\s*$", report_forged, re.MULTILINE))
check("forged: the report's own Sessions field is untouched",
      _field(report_forged, "Sessions") == "1")
check("forged: the forged text is not column aligned",
      "Sessions              999999" not in report_forged)


# 15. Many distinct agent names. The breakdown lists are capped like their
# neighbours (tools at 30, skills at 60, top_tools at 5) so one transcript
# cannot decide the size of every response, while the totals stay exact.
def build_many(root):
    write_fixture(root, "proj", "s1", [
        _assistant("s1", "2026-01-01T00:00:00Z", content=[
            _dispatch_block(subagent_type="agent-%04d" % i) for i in range(500)
        ]),
    ])


u = read_with_fixture(build_many)
ad = u["agent_dispatches"]
check("many: total stays exact", ad["total"] == 500)
check("many: aggregate by_agent capped",
      len(ad["by_agent"]) == reader.AGENT_LIST_MAX)
check("many: session by_agent capped",
      len(u["sessions"][0]["agent_dispatches"]["by_agent"])
      == reader.SESSION_AGENT_LIST_MAX)
check("many: session total stays exact",
      u["sessions"][0]["agent_dispatches"]["total"] == 500)


# 16. Sidechain evidence lives in the dispatched agent's own transcript, one
# directory deeper than the session transcripts. A count that never looks
# there is not a measured zero, it is an unlooked-for one, and the report
# would print "none recorded" over evidence that is sitting on disk.
def build_subagent_files(root):
    write_fixture(root, "proj", "s1", [
        _assistant("s1", "2026-01-01T00:00:00Z", content=[
            _dispatch_block(subagent_type="backend-engineer"),
        ], usage={"input_tokens": 10, "output_tokens": 20}),
    ])
    write_subagent_fixture(root, "proj", "s1", "agent-aaa", [
        _rec("user", "s1", "2026-01-01T00:00:01Z", isSidechain=True),
        _assistant("s1", "2026-01-01T00:00:02Z", isSidechain=True,
                   usage={"input_tokens": 7000, "output_tokens": 9000}),
        _rec("user", "s1", "2026-01-01T00:00:03Z", isSidechain=False),
        "{not valid json,,,",
    ])
    write_subagent_fixture(root, "proj", "s1", "agent-bbb", [
        _assistant("s1", "2026-01-01T00:00:04Z", isSidechain=True,
                   usage={"input_tokens": 1, "output_tokens": 1}),
    ])
    # An orphan: a subagent transcript whose session was never seen. It is
    # true in the total and belongs to no session.
    write_subagent_fixture(root, "proj", "s-gone", "agent-ccc", [
        _rec("user", "s-gone", "2026-01-01T00:00:05Z", isSidechain=True),
    ])


u = read_with_fixture(build_subagent_files)
ad = u["agent_dispatches"]
check("subagent files: aggregate sidechain count includes them",
      ad["sidechain_records"] == 4)
sess = {s["id"]: s for s in u["sessions"]}
check("subagent files: only the known session is created", list(sess) == ["s1"])
check("subagent files: count attributed to the dispatching session",
      sess["s1"]["agent_dispatches"]["sidechain_records"] == 3)
# The scope decision, pinned: these files are read for the count and for
# nothing else. Folding their usage into the token and message figures would
# silently change the meaning of every existing number in the dashboard.
check("subagent files: session token figures unchanged",
      sess["s1"]["tokens_out"] == 20 and sess["s1"]["tokens_in"] == 10)
check("subagent files: session message count unchanged",
      sess["s1"]["messages"] == 1)
check("subagent files: aggregate output tokens unchanged",
      u["totals"]["output_tokens"] == 20)
report_sub = capture_report(build_subagent_files)
check("subagent files: the report shows the real count, not 'none recorded'",
      _field(report_sub, "Sidechain records") == "4")


if __name__ == "__main__":
    print("%d passed, %d failed" % (PASS, FAIL))
    sys.exit(1 if FAIL else 0)
