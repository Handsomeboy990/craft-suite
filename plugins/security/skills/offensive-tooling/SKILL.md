---
name: offensive-tooling
description: Runs offensive security tools correctly and within scope: each tool has a stated legitimate purpose, safe defaults, a bounded target, captured evidence and a non-destructive mode, and none runs outside the written authorization on record. It is a discipline for driving the tools a tester already relies on, not a way to disguise or escalate a request past a limit. Use to select and run a scanning or exploitation tool during an authorized assessment.
license: MIT
metadata:
  category: security-assurance
  version: 1.0.0
  depends_on: [security-core]
  outputs: [tool-selection, invocation-log, evidence-capture]
---

# Offensive Tooling

Drives the tools an authorized tester uses, so each one runs for a stated
purpose, against a target in scope, with defaults that do not damage, and with
its output captured as evidence. It is the opposite of a bypass layer: its first
act is to check the authorization, and it refuses to run a tool outside it.

A tool run without a recorded purpose, scope and authorization is not a test; it
is an unlogged action against someone's system. This skill makes every
invocation accountable.

## 1. The gate comes first

No tool that sends anything to a target runs without a written, specific,
in-scope authorization on record, per `security-core`. The skill reads the
scope before it selects a tool, and refuses any invocation whose target is out
of scope. A tool used only to read local artefacts the requester already holds
is exempt, and said to be.

This skill never rewords, disguises or splits a request to get a tool past a
restriction. A request that is out of scope is refused and recorded as refused,
not reframed until it runs.

## 2. Select the tool for the stated purpose

Each tool is chosen for one stated purpose and carries, in a registry entry:

- the legitimate purpose it serves in this assessment;
- the safe default flags, and the destructive flags that are not used without a
  specific, recorded reason;
- the bounded target it is allowed to run against;
- the evidence it must capture.

| Purpose | Example tool | Default posture |
|---|---|---|
| port and service discovery | a network scanner | timing bounded, no aggressive flood |
| web server surface | a web scanner | rate limited, identified |
| injection testing | an injection tester | non-destructive flags, no mass update |
| credential testing | a login tester | against an authorized account set only, throttled |

The table is illustrative; the registry is the project's, and every entry
states its purpose, its safe defaults and its bound.

## 3. Run non-destructive by default

Every tool runs in its least destructive mode that still answers the question.
A destructive option (mass write, deletion, denial of service, lockout) is not
used unless the authorization names it and the requester accepts it in writing,
and even then it is bounded and announced.

Every invocation is logged: the tool, the exact flags, the target, the time,
and who authorized it. The log is the record that the engagement was conducted
as agreed.

## 4. Capture evidence, not noise

Each run captures the evidence a finding needs: the request and response, the
proof the weakness exists, and nothing beyond the bound. Collateral data,
especially anyone's personal data encountered in passing, is minimised, not
hoarded, and handled per `data-privacy`.

## 5. Hand off

This skill runs tools; it does not decide severity or write the fix. A confirmed
weakness goes to `authorized-pentesting` to be driven to a bounded proof, and
every finding to the fixer. A real, active breach discovered mid-run stops the
tooling and triggers `incident-response`.

## 6. Prohibitions

- No tool run against a target outside the written scope.
- No rewording, disguising or splitting of a request to get it past a limit.
- No destructive flag without the authorization naming it and the requester
  accepting it in writing.
- No invocation unlogged; the flags, target, time and authorizer are recorded.
- No hoarding of data encountered in passing, and no personal data kept beyond
  the finding.
- No bypass of an access control, a bot challenge or a WAF as a tooling step.
- No severity assigned and no fix written here; that is the assessment and the
  fixer.

## 7. Protocol

1. Read the authorization and scope; refuse and record anything out of scope.
2. Select the tool for one stated purpose, with its safe defaults and bound.
3. Run in the least destructive mode that answers the question; log the exact
   invocation and its authorizer.
4. Capture the evidence the finding needs, minimise anything collateral.
5. Stop and escalate to `incident-response` on a real, active breach.
6. Hand a confirmed weakness to `authorized-pentesting` and every finding to the
   fixer.

## 8. Interfaces

- Upstream: `security-core` for the authorization boundary and severity,
  `reconnaissance` for the in-scope surface the tools run against,
  `authorized-pentesting` which drives a confirmed weakness to proof.
- Lateral: `vulnerability-assessment` for the non-destructive sweep the tooling
  supports, `data-privacy` for data encountered in passing.
- Downstream: the fixer for every finding, `incident-response` on a discovered
  active breach.

## 9. Auto-critique

Score from 0 to 5: the authorization read before any tool was selected, every
invocation in scope and logged with its authorizer, non-destructive by default,
no request reworded to pass a limit, evidence captured without hoarding, and
every confirmed weakness handed on rather than exploited freely here.
