---
name: reverse-engineering
description: Investigates how a compiled or obfuscated artifact behaves when its source is not available, on a target the requester owns or is authorized in writing to analyse: native binaries, JavaScript and Electron bundles, .NET assemblies and running behaviour, analysed locally, with the evidence and the limits stated behind every conclusion. Drives an external reverse-engineering MCP when one is configured, and degrades to documented manual method when it is not. Use to understand an owned or authorized artifact's behaviour, never to defeat a protection or lift protected IP.
license: MIT
metadata:
  category: security-assurance
  version: 1.0.0
  depends_on: [security-core]
  outputs: [behaviour-model, evidence-trail, limits-statement]
---

# Reverse Engineering

Learns how an artifact behaves when the source is not in hand: a binary, a
minified bundle, an assembly, a running process. It works from evidence a reader
can check, states what it could not establish, and stays inside what the
requester is entitled to analyse. The output is understanding, with its proof
and its limits, not a copy of someone else's protected work.

A conclusion with no artifact reference behind it is a guess. A reverse
engineering pass that does not say what it could not see hides its own blind
spots. This skill records both.

## 1. The gate: entitlement and intent

Analysis runs only on an artifact the requester owns, has built, or is
authorized in writing to analyse, per `security-core`. The purpose is legitimate:
understanding behaviour, finding a vulnerability in one's own software,
diagnosing an incident, confirming what a dependency actually does.

This skill does not defeat a technical protection measure, lift protected
intellectual property, or reproduce a competitor's protected code into the
requester's product. Understanding how an effect works and then building an
original implementation is legitimate; copying the decompiled source is not, and
is refused. A licence or terms of service that forbid reverse engineering are
respected, and the limit is reported rather than worked around.

## 2. Analyse locally

Analysis runs on the local machine, on the artifact as provided. The artifact is
untrusted input: it is examined, never executed outside a controlled, contained
environment, and never with credentials or data it should not reach.

| Target | What is read |
|---|---|
| native binary | symbols, strings, imports, control flow, via a disassembler |
| JavaScript / Electron | modules, imports, the bundle's own unobfuscated structure |
| .NET assembly | types, methods, metadata |
| runtime behaviour | the artifact's own observable calls and outputs, contained |

## 3. Drive the tool, or state its absence

When a reverse-engineering MCP is configured (for example REA, declared in the
configuration as an optional dependency), this skill drives it: it registers the
target, requests the analysis, and reads back the result with its evidence. The
native engines it may use (a disassembler such as Hopper, Ghidra or IDA) are the
operator's existing, licensed installations; this skill does not procure or
install them silently.

When no such tool is configured, the skill degrades to documented manual method
and says so: it states what a configured tool would have added, rather than
pretending the analysis was as deep.

## 4. Every conclusion carries its evidence and its limit

For each finding:

- the artifact reference it rests on (the address, the symbol, the module, the
  call), so another analyst can reach the same place;
- the confidence, and what would raise it;
- the limit: what was obfuscated, stripped, packed or simply not reached, stated
  rather than glossed.

An inference from a pattern is marked an inference. A behaviour not observed is
not asserted.

## 5. Hand off

This skill explains behaviour; it does not fix or exploit. A security weakness it
uncovers goes to `vulnerability-assessment` and the fixer, and to
`authorized-pentesting` only with a confirmed weakness and a written
authorization. An understanding meant to inform a build goes to the engineer,
who writes an original implementation, never a copy of the recovered source.

## 6. Prohibitions

- No analysis of an artifact the requester does not own or is not authorized to
  analyse.
- No defeat of a technical protection measure, and no bypass of a licence or
  terms that forbid reverse engineering; the limit is reported.
- No copying of recovered or decompiled source into the requester's product; the
  build is an original implementation of the understood behaviour.
- No execution of the artifact outside a contained environment, and never with
  data or credentials it should not reach.
- No conclusion without its artifact reference, and no blind spot left unstated.
- No claim of depth a manual pass did not reach when no tool was configured.
- No exploitation here; a weakness is handed to the assessment and the fixer.

## 7. Protocol

1. Confirm entitlement and a legitimate purpose; check the artifact's licence or
   terms for a reverse-engineering restriction, and stop or report if it forbids.
2. Identify the artifact type and set up local, contained analysis.
3. Drive the configured RE tool if present; otherwise proceed by documented
   manual method and record that the tool was absent.
4. Record each conclusion with its artifact reference, confidence and limit.
5. State the blind spots: what was obfuscated, stripped, packed or not reached.
6. Hand a security weakness to `vulnerability-assessment` and the fixer, and an
   understanding to the engineer for an original build.

## 8. Interfaces

- Upstream: `security-core` for the entitlement boundary, `dependency-security`
  when the artifact is a dependency whose real behaviour is in question,
  `threat-modeling` for which behaviour matters.
- Lateral: `vulnerability-assessment` for a weakness the analysis surfaces,
  `data-privacy` for any personal data encountered inside the artifact.
- Downstream: the fixer and `authorized-pentesting` for a confirmed weakness,
  the implementing engineer for an original build informed by the understanding.

## 9. Auto-critique

Score from 0 to 5: entitlement and a licence check confirmed before analysis,
work kept local and contained, the configured tool driven or its absence stated
honestly, every conclusion carrying its artifact reference and confidence, the
blind spots named, no protected source copied into a build, and every weakness
handed on rather than exploited here.
