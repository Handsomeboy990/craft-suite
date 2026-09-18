#!/usr/bin/env python3
"""Token Optimization Advisor.

Analyses the real session evidence collected by reader.py and identifies
concrete, evidence-based opportunities to make future work more token efficient.
It never invents a finding: every finding is backed by counts that actually
appear in the transcripts, and a session with no qualifying signal produces no
findings and a perfect efficiency score.

The advisor is deterministic and explainable. Given the same input it produces
the same output, and every number in a finding is either measured or, when it
is an estimate, labelled as one with its method.

Design notes:
- The advisor returns language-neutral findings: a category, a severity, and the
  measured evidence. The user interface holds the English and French templates
  and interpolates the evidence, so no user-facing prose lives here.
- Findings describe observed patterns. They never assert that a pattern caused
  waste; they state what happened and what could reduce repetition next time.

Scoring, stated exactly so it can be checked:
- Every analysed session starts at 100.
- Each finding subtracts its severity penalty: critical 25, high 15, medium 8,
  low 4, informational 1.
- A session score is floored at 0.
- The overall optimization score is the integer mean of the session scores.
- With no analysable sessions the score is reported as null, not 100, because
  absence of data is not evidence of efficiency.
"""

SEVERITY_PENALTY = {
    "critical": 25,
    "high": 15,
    "medium": 8,
    "low": 4,
    "informational": 1,
}
SEVERITY_ORDER = ["critical", "high", "medium", "low", "informational"]

# Detection thresholds, documented so every finding is reproducible. Each is a
# floor: below it, no finding is raised, because the evidence is insufficient.
REPEATED_READ_MIN = 3          # a file read at least this many times in a session
REPEATED_READ_MEDIUM = 6       # at or above this, the finding is medium not low
EDIT_CHURN_MIN = 4             # a file edited at least this many times
EDIT_CHURN_MEDIUM = 8
BASH_REPEAT_MIN = 5            # a command shape repeated at least this many times
BASH_REPEAT_MEDIUM = 30
LARGE_OUTPUT_MIN = 3           # this many large outputs in a session to flag
LOW_CACHE_RATIO = 0.5         # below this cache-reuse ratio, context churned
LOW_CACHE_MIN_CREATION = 200_000  # only when meaningful cache was created
BROAD_MESSAGES = 120          # a very long single session
BROAD_TOOL_TYPES = 6          # touching many kinds of tool
BROAD_FILES = 25              # and many distinct files
CROSS_SESSION_MIN = 3         # a project re-explored in this many sessions
CROSS_SESSION_READS = 8       # each with at least this many reads

# Agent dispatch thresholds. What the telemetry records is which subagent was
# dispatched, under which model, how often, and whether dispatched work left
# any transcript record. It does not record the task's complexity, nor what a
# direct action would have cost, so the advisor cannot prove that an agent was
# unnecessary or that a model tier was too strong. These detections therefore
# report measurable dispatch patterns and, like every other finding here, never
# assert that the pattern caused waste.
AGENT_FANOUT_MIN = 4          # same agent dispatched this many times in a session
AGENT_FANOUT_MEDIUM = 8       # at or above this, the finding is medium not low
AGENT_LIGHT_SESSION_TOKENS = 15_000  # work tokens below which a session is light


def _severity_max(a, b):
    return a if SEVERITY_ORDER.index(a) <= SEVERITY_ORDER.index(b) else b


def _session_findings(session):
    """Findings for one session, each backed by real evidence. Pure."""
    e = session.get("evidence") or {}
    findings = []
    sid = session.get("id")

    # 1. Repeated exploration: the same file read several times.
    repeated = e.get("repeated_reads") or []
    if repeated:
        top = repeated[0]["count"]
        sev = "medium" if top >= REPEATED_READ_MEDIUM else "low"
        findings.append({
            "category": "repeated-exploration",
            "severity": sev,
            "session_id": sid,
            "evidence": {
                "files": repeated,
                "reads_total": e.get("reads_total", 0),
                "reads_unique": e.get("reads_unique", 0),
                "top_count": top,
            },
        })

    # 2. Edit churn: the same file edited many times, a sign of iteration.
    churn = e.get("churned_files") or []
    if churn:
        top = churn[0]["count"]
        sev = "medium" if top >= EDIT_CHURN_MEDIUM else "low"
        findings.append({
            "category": "edit-churn",
            "severity": sev,
            "session_id": sid,
            "evidence": {
                "files": churn,
                "edits_total": e.get("edits_total", 0),
                "top_count": top,
            },
        })

    # 3. Command repetition: the same command shape run many times.
    rbash = e.get("repeated_bash") or []
    if rbash:
        top = rbash[0]["count"]
        sev = "medium" if top >= BASH_REPEAT_MEDIUM else "low"
        findings.append({
            "category": "command-repetition",
            "severity": sev,
            "session_id": sid,
            "evidence": {
                "commands": rbash,
                "bash_total": e.get("bash_total", 0),
                "top_count": top,
            },
        })

    # 4. Low cache reuse: context was rebuilt rather than reused. Only raised
    # when a meaningful amount of cache was actually created, so a tiny session
    # is never flagged.
    cr = session.get("cache_read", 0)
    cc = session.get("cache_creation", 0)
    base = cr + cc
    if base and cc >= LOW_CACHE_MIN_CREATION:
        ratio = cr / base
        if ratio < LOW_CACHE_RATIO:
            findings.append({
                "category": "low-cache-reuse",
                "severity": "low",
                "session_id": sid,
                "evidence": {
                    "cache_reuse_ratio": round(ratio, 3),
                    "cache_read": cr,
                    "cache_creation": cc,
                },
            })

    # 5. Large outputs: several unusually large generations. Informational: a
    # large output can be exactly what the task needed. Never a judgement of
    # content, only a count to surface.
    large = e.get("large_outputs", 0)
    if large >= LARGE_OUTPUT_MIN:
        findings.append({
            "category": "large-output",
            "severity": "informational",
            "session_id": sid,
            "evidence": {
                "large_outputs": large,
                "output_max": e.get("output_max", 0),
                "output_median": e.get("output_median", 0),
            },
        })

    # 6. Broad scope: one very long session touching many tool types and files,
    # a signal that several concerns were handled in a single uncontrolled pass.
    msgs = session.get("messages", 0)
    ttypes = session.get("tool_types", 0)
    files_touched = e.get("reads_unique", 0) + e.get("edits_unique", 0)
    if msgs >= BROAD_MESSAGES and ttypes >= BROAD_TOOL_TYPES and files_touched >= BROAD_FILES:
        findings.append({
            "category": "broad-scope",
            "severity": "medium",
            "session_id": sid,
            "evidence": {
                "messages": msgs,
                "tool_types": ttypes,
                "files_touched": files_touched,
            },
        })

    # 7 to 9. Agent dispatch patterns. Absent from older data, so every read is
    # defensive and a session with no dispatch produces no finding.
    ad = session.get("agent_dispatches") or {}
    dispatches = ad.get("total", 0) or 0
    by_agent = ad.get("by_agent") or []
    sidechain = ad.get("sidechain_records", 0) or 0

    # 7. Fan out: the same agent dispatched repeatedly in one session. States
    # the count; whether the repetition was warranted is not measurable here.
    if by_agent:
        name, count = by_agent[0][0], by_agent[0][1]
        if count >= AGENT_FANOUT_MIN:
            findings.append({
                "category": "agent-fan-out",
                "severity": "medium" if count >= AGENT_FANOUT_MEDIUM else "low",
                "session_id": sid,
                "evidence": {
                    "agent": name,
                    "top_count": count,
                    "dispatches_total": dispatches,
                    "agents": [{"agent": a, "count": c} for a, c in by_agent[:5]],
                },
            })

    # 8. An agent was dispatched in a session that did little measured work.
    # This is the closest the data comes to "a lighter path would have done",
    # and it is still only a correlation, not a verdict.
    work = session.get("work_tokens", 0) or 0
    if dispatches >= 1 and work < AGENT_LIGHT_SESSION_TOKENS:
        findings.append({
            "category": "agent-on-light-session",
            "severity": "low",
            "session_id": sid,
            "evidence": {
                "dispatches": dispatches,
                "work_tokens": work,
                "threshold": AGENT_LIGHT_SESSION_TOKENS,
            },
        })

    # 9. Dispatches happened but no dispatched work left a transcript record.
    # Informational on purpose: a missing record can mean the subagent
    # transcripts are not on this disk, not that the work never ran.
    if dispatches >= 1 and sidechain == 0:
        findings.append({
            "category": "dispatch-without-recorded-work",
            "severity": "informational",
            "session_id": sid,
            "evidence": {
                "dispatches": dispatches,
                "sidechain_records": sidechain,
            },
        })

    return findings


def _cross_session_findings(sessions):
    """Findings that only appear across sessions, such as a project explored
    from scratch repeatedly. Aggregate, and still evidence-based."""
    findings = []
    by_project = {}
    for s in sessions:
        e = s.get("evidence") or {}
        if e.get("reads_total", 0) >= CROSS_SESSION_READS:
            by_project.setdefault(s.get("project", "unknown"), []).append(s)
    for project, sess in by_project.items():
        if len(sess) >= CROSS_SESSION_MIN:
            findings.append({
                "category": "missing-project-context",
                "severity": "medium",
                "session_id": None,
                "evidence": {
                    "project": project,
                    "sessions": len(sess),
                    "reads_each": sorted(
                        (s["evidence"]["reads_total"] for s in sess), reverse=True
                    )[:5],
                },
            })
    return findings


def analyze(data):
    """Analyse the reader's usage data and return the advisor result.

    Returns a dict with the optimization score, the per-session findings, the
    aggregate findings, the recurring patterns, the top opportunities and the
    methodology, so the interface can render all of it and the report can quote
    it. When there is no data, findings are empty and the score is null.
    """
    usage = (data or {}).get("usage") or data or {}
    sessions = usage.get("sessions") or []

    session_reports = []
    all_findings = []
    for s in sessions:
        f = _session_findings(s)
        score = 100
        for item in f:
            score -= SEVERITY_PENALTY.get(item["severity"], 0)
        score = max(0, score)
        session_reports.append({
            "session_id": s.get("id"),
            "project": s.get("project"),
            "tokens_total": s.get("work_tokens", s.get("tokens_total", 0)),
            "score": score,
            "findings": f,
        })
        all_findings.extend(f)

    aggregate = _cross_session_findings(sessions)
    all_findings.extend(aggregate)

    # Overall score: mean of session scores, or null when nothing was analysed.
    if session_reports:
        overall = round(sum(r["score"] for r in session_reports) / len(session_reports))
    else:
        overall = None

    # Recurring patterns: how often each category appears, most common first.
    pattern_counts = {}
    for item in all_findings:
        pattern_counts[item["category"]] = pattern_counts.get(item["category"], 0) + 1
    patterns = sorted(
        ({"category": k, "count": v} for k, v in pattern_counts.items()),
        key=lambda x: x["count"], reverse=True)

    # Top opportunities: the highest-severity, strongest-evidence findings, but
    # diversified across categories so the list shows the range of levers rather
    # than ten copies of the single most common pattern. The strongest finding
    # of each category is placed first, in severity order; remaining slots are
    # filled with the next strongest findings overall.
    def opportunity_key(item):
        sev = SEVERITY_ORDER.index(item["severity"])
        strength = (item.get("evidence", {}).get("top_count", 0)
                    or item.get("evidence", {}).get("sessions", 0)
                    or item.get("evidence", {}).get("large_outputs", 0))
        return (sev, -strength)
    ranked = sorted(all_findings, key=opportunity_key)
    top, seen_cat, tail = [], set(), []
    for item in ranked:
        if item["category"] not in seen_cat:
            top.append(item)
            seen_cat.add(item["category"])
        else:
            tail.append(item)
    top.extend(tail)
    top = top[:10]

    severity_counts = {k: 0 for k in SEVERITY_ORDER}
    for item in all_findings:
        severity_counts[item["severity"]] += 1

    return {
        "available": bool(sessions),
        "score": overall,
        "score_method": (
            "Each analysed session starts at 100; each finding subtracts its "
            "severity penalty (critical 25, high 15, medium 8, low 4, "
            "informational 1), floored at 0. The overall score is the integer "
            "mean of the session scores. With no sessions the score is null."
        ),
        "sessions_analysed": len(session_reports),
        "findings_total": len(all_findings),
        "severity_counts": severity_counts,
        "patterns": patterns,
        "top_opportunities": top,
        "aggregate_findings": aggregate,
        "session_reports": session_reports,
        "thresholds": {
            "repeated_read_min": REPEATED_READ_MIN,
            "edit_churn_min": EDIT_CHURN_MIN,
            "bash_repeat_min": BASH_REPEAT_MIN,
            "large_output_min": LARGE_OUTPUT_MIN,
            "low_cache_ratio": LOW_CACHE_RATIO,
            "agent_fanout_min": AGENT_FANOUT_MIN,
            "agent_light_session_tokens": AGENT_LIGHT_SESSION_TOKENS,
        },
    }


if __name__ == "__main__":
    import json
    import os
    import sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import reader
    result = analyze({"usage": reader.read_transcripts()})
    json.dump(result, sys.stdout, indent=2, default=str)
    sys.stdout.write("\n")
