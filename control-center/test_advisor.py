#!/usr/bin/env python3
"""Deterministic tests for the Token Optimization Advisor.

No test framework dependency: plain assertions, run with python3. Every fixture
is controlled input, so the advisor's output is predictable. The central
guarantee under test is that the advisor never invents a finding when the
evidence is insufficient, and that its score is deterministic and matches the
documented formula.

    python3 control-center/test_advisor.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import advisor  # noqa: E402

PASS = 0
FAIL = 0


def check(name, cond):
    global PASS, FAIL
    if cond:
        PASS += 1
    else:
        FAIL += 1
        print("FAIL  " + name)


def session(**kw):
    """A session with empty evidence by default; override what a test needs."""
    ev = {
        "reads_total": 0, "reads_unique": 0, "repeated_reads": [],
        "edits_total": 0, "edits_unique": 0, "churned_files": [],
        "bash_total": 0, "repeated_bash": [],
        "output_max": 0, "output_median": 0, "large_outputs": 0,
    }
    ev.update(kw.pop("evidence", {}))
    s = {
        "id": kw.pop("id", "s1"), "project": kw.pop("project", "proj"),
        "messages": 0, "tool_types": 0, "cache_read": 0, "cache_creation": 0,
        "work_tokens": 0, "tokens_out": 0, "fresh_in": 0,
    }
    s.update(kw)
    s["evidence"] = ev
    return s


def analyze(sessions):
    return advisor.analyze({"usage": {"sessions": sessions}})


# 1. No data: score is null, not 100. Absence is not efficiency.
r = analyze([])
check("empty: available false", r["available"] is False)
check("empty: score null", r["score"] is None)
check("empty: no findings", r["findings_total"] == 0)

# 2. A clean session with real activity but no flagged pattern: no findings,
#    perfect score. The advisor does not invent.
clean = session(messages=20, tool_types=3, work_tokens=50000, tokens_out=20000,
                fresh_in=30000, cache_read=900000, cache_creation=100000,
                evidence={"reads_total": 4, "reads_unique": 4, "bash_total": 3})
r = analyze([clean])
check("clean: score 100", r["score"] == 100)
check("clean: no findings", r["findings_total"] == 0)

# 3. Insufficient evidence just below every threshold: still no findings.
just_below = session(
    messages=advisor.BROAD_MESSAGES - 1, tool_types=advisor.BROAD_TOOL_TYPES,
    cache_read=10, cache_creation=advisor.LOW_CACHE_MIN_CREATION - 1,
    evidence={
        "repeated_reads": [],  # a read count of 2 would not be listed by the reader
        "churned_files": [],
        "repeated_bash": [],
        "large_outputs": advisor.LARGE_OUTPUT_MIN - 1,
    })
r = analyze([just_below])
check("below-thresholds: no findings", r["findings_total"] == 0)
check("below-thresholds: score 100", r["score"] == 100)

# 4. Repeated exploration: a file read 6 times -> a medium finding.
rex = session(evidence={
    "reads_total": 10, "reads_unique": 3,
    "repeated_reads": [{"file": "a/b.py", "count": 6}],
})
r = analyze([rex])
cats = [f["category"] for f in r["session_reports"][0]["findings"]]
check("repeated-exploration raised", "repeated-exploration" in cats)
check("repeated-exploration medium at 6", r["session_reports"][0]["findings"][0]["severity"] == "medium")
check("repeated-exploration score 92", r["session_reports"][0]["score"] == 92)  # 100 - 8

# 5. Edit churn below medium threshold -> low, not medium.
churn = session(evidence={
    "edits_total": 5, "churned_files": [{"file": "x.js", "count": 5}],
})
r = analyze([churn])
f = r["session_reports"][0]["findings"][0]
check("edit-churn raised", f["category"] == "edit-churn")
check("edit-churn low at 5", f["severity"] == "low")
check("edit-churn score 96", r["session_reports"][0]["score"] == 96)  # 100 - 4

# 6. Command repetition: 104 repeats -> medium.
cmd = session(evidence={
    "bash_total": 200, "repeated_bash": [{"signature": "cd /x", "count": 104}],
})
r = analyze([cmd])
f = r["session_reports"][0]["findings"][0]
check("command-repetition raised", f["category"] == "command-repetition")
check("command-repetition medium at 104", f["severity"] == "medium")

# 7. Large output is informational, never a fault, and only when >= threshold.
lo = session(evidence={"large_outputs": 5, "output_max": 12000, "output_median": 800})
r = analyze([lo])
f = r["session_reports"][0]["findings"][0]
check("large-output informational", f["severity"] == "informational")
check("large-output score 99", r["session_reports"][0]["score"] == 99)  # 100 - 1

# 8. Low cache reuse only when meaningful cache was created.
low_cache = session(cache_read=50000, cache_creation=1000000)  # ratio ~0.048
r = analyze([low_cache])
check("low-cache raised", any(f["category"] == "low-cache-reuse" for f in r["session_reports"][0]["findings"]))
tiny_cache = session(cache_read=10, cache_creation=100)  # below min creation
r = analyze([tiny_cache])
check("tiny-cache not raised", not any(f["category"] == "low-cache-reuse" for f in r["session_reports"][0]["findings"]))

# 9. Broad scope requires all three signals together.
broad = session(messages=200, tool_types=8,
                evidence={"reads_unique": 20, "edits_unique": 10})
r = analyze([broad])
check("broad-scope raised", any(f["category"] == "broad-scope" for f in r["session_reports"][0]["findings"]))
narrow = session(messages=200, tool_types=2,
                 evidence={"reads_unique": 20, "edits_unique": 10})
r = analyze([narrow])
check("narrow not broad", not any(f["category"] == "broad-scope" for f in r["session_reports"][0]["findings"]))

# 10. Cross-session: a project explored in 3 sessions with enough reads each.
sess = [session(id="a", project="p", evidence={"reads_total": 12}),
        session(id="b", project="p", evidence={"reads_total": 15}),
        session(id="c", project="p", evidence={"reads_total": 20})]
r = analyze(sess)
check("cross-session raised", any(f["category"] == "missing-project-context" for f in r["aggregate_findings"]))
# Only two sessions -> not raised.
r = analyze(sess[:2])
check("cross-session needs 3", not any(f["category"] == "missing-project-context" for f in r["aggregate_findings"]))

# 11. Determinism: same input, byte-identical output.
import json  # noqa: E402
a = json.dumps(analyze([rex, churn, cmd, lo, broad]), default=str, sort_keys=True)
b = json.dumps(analyze([rex, churn, cmd, lo, broad]), default=str, sort_keys=True)
check("deterministic output", a == b)

# 12. Score matches the documented formula for a multi-finding session.
multi = session(evidence={
    "reads_total": 10, "reads_unique": 3, "repeated_reads": [{"file": "a", "count": 6}],  # medium -8
    "edits_total": 9, "churned_files": [{"file": "b", "count": 9}],                        # medium -8
    "large_outputs": 4, "output_max": 9000, "output_median": 700,                          # info -1
})
r = analyze([multi])
check("multi score 100-8-8-1=83", r["session_reports"][0]["score"] == 83)

# 13. Score never negative, floored at 0.
many = {"reads_total": 10, "reads_unique": 1, "repeated_reads": [{"file": "a", "count": 20}]}
heavy = session(messages=300, tool_types=9, cache_read=1, cache_creation=2000000,
                evidence={
                    "reads_total": 40, "reads_unique": 30, "repeated_reads": [{"file": "a", "count": 20}],
                    "edits_total": 40, "edits_unique": 30, "churned_files": [{"file": "b", "count": 20}],
                    "bash_total": 300, "repeated_bash": [{"signature": "cd", "count": 100}],
                    "large_outputs": 10, "output_max": 20000, "output_median": 5000,
                })
r = analyze([heavy])
check("score floored at 0", r["session_reports"][0]["score"] >= 0)


# Agent dispatch detections. Each test isolates one signal: work_tokens is kept
# high unless the light-session case is under test, and sidechain_records is
# kept non zero unless the missing-record case is under test.
def agents(total=0, by_agent=None, sidechain=1):
    return {"total": total, "by_agent": by_agent or [], "by_model": [],
            "sidechain_records": sidechain}


def cats(result):
    reports = result.get("session_reports") or []
    return [f["category"] for f in reports[0]["findings"]] if reports else []


def sev_of(result, category):
    for f in result["session_reports"][0]["findings"]:
        if f["category"] == category:
            return f["severity"]
    return None


# A session with no dispatch at all raises no agent finding, even when small.
r = analyze([session(work_tokens=1000)])
check("no agent finding without dispatches",
      not [c for c in cats(r) if c.startswith("agent-")
           or c == "dispatch-without-recorded-work"])

# Fan out fires at the threshold, low, and escalates to medium.
r = analyze([session(work_tokens=90000,
                     agent_dispatches=agents(5, [["qa-engineer", 5]]))])
check("fan-out raised at 5", "agent-fan-out" in cats(r))
check("fan-out is low at 5", sev_of(r, "agent-fan-out") == "low")

r = analyze([session(work_tokens=90000,
                     agent_dispatches=agents(9, [["qa-engineer", 9]]))])
check("fan-out is medium at 9", sev_of(r, "agent-fan-out") == "medium")

# Below the threshold the advisor stays silent.
r = analyze([session(work_tokens=90000,
                     agent_dispatches=agents(3, [["qa-engineer", 3]]))])
check("no fan-out below threshold", "agent-fan-out" not in cats(r))

# A dispatch in a session that produced little work is flagged; a substantial
# session with the same dispatch is not.
r = analyze([session(work_tokens=1000, agent_dispatches=agents(1, [["x", 1]]))])
check("light session flagged", "agent-on-light-session" in cats(r))
r = analyze([session(work_tokens=90000, agent_dispatches=agents(1, [["x", 1]]))])
check("substantial session not flagged", "agent-on-light-session" not in cats(r))

# Dispatches with no transcript record are informational; with records, silent.
r = analyze([session(work_tokens=90000,
                     agent_dispatches=agents(2, [["x", 2]], sidechain=0))])
check("missing dispatched-work record raised",
      "dispatch-without-recorded-work" in cats(r))
check("missing record is informational",
      sev_of(r, "dispatch-without-recorded-work") == "informational")
r = analyze([session(work_tokens=90000,
                     agent_dispatches=agents(2, [["x", 2]], sidechain=7))])
check("recorded dispatched work is silent",
      "dispatch-without-recorded-work" not in cats(r))

# The new thresholds are published with the others, so a finding is reproducible.
r = analyze([session()])
check("agent thresholds published",
      "agent_fanout_min" in r["thresholds"]
      and "agent_light_session_tokens" in r["thresholds"])


if __name__ == "__main__":
    print("%d passed, %d failed" % (PASS, FAIL))
    sys.exit(1 if FAIL else 0)
