---
name: reconnaissance
description: Maps the attack surface of a target the requester owns or is authorized in writing to test, passive first: subdomains, hosts, exposed services and technologies, enumerated from public and passive sources before anything touches the target, with provenance recorded for every finding. Active probing happens only within a written scope, rate limited and identified. Use to establish the surface before a vulnerability assessment or an authorized test.
license: MIT
metadata:
  category: security-assurance
  version: 1.0.0
  depends_on: [security-core]
  outputs: [surface-inventory, provenance-record, active-scope-log]
---

# Reconnaissance

Builds the map an assessment or an authorized test works from: what exists,
where, and reachable how. It starts passive, from sources that never touch the
target, and crosses into active enumeration only inside a written scope. Every
item it records carries where it came from, so a later finding can be trusted.

Reconnaissance that guesses a host is wrong is worse than a gap: it sends the
next phase at something that is not there, or not the requester's. A surface
item is recorded only with its source and the method that found it.

## 1. The gate: ownership or a written scope

Passive reconnaissance, from third-party sources that never contact the target,
is permitted on a target the requester states they own or are authorized to
assess. Active enumeration, anything that sends a packet to the target or its
infrastructure, requires a written, specific, in-scope authorization on record,
per `security-core`. No scope, no active step: the skill stays passive or stops.

The scope names the domains, the IP ranges and the hosts in bounds, and what is
explicitly out. A discovered asset outside that scope is recorded as out of
scope and never probed.

## 2. Passive first

Before anything touches the target, enumerate from passive and public sources:

- subdomains from passive aggregators and certificate transparency, with a tool
  built for passive enumeration (for example `subfinder` and the wider
  ProjectDiscovery family used in their passive modes);
- DNS records, published registration data, and public certificate records;
- technologies and versions declared in public responses already collected,
  never by probing;
- exposed assets indexed by public search services, read from the index.

Passive sources have their own licences and usage limits; respect them, and
record which source each item came from.

## 3. Active enumeration, only within scope

With authorization on record, and only against in-scope assets:

- resolve and validate discovered names, eliminating wildcards;
- probe for live hosts and open services, rate limited and identified by a
  stated user agent or source, never a flood;
- fingerprint services and technologies from their own responses.

Every active action is logged with its time, its target and its parameters, so
the engagement is reconstructable. A target that rate-limits, challenges or
signals load is backed off from, not pushed through.

## 4. Record the surface and its provenance

The output is a surface inventory where every entry carries:

- the asset (host, service, technology, version);
- the method that found it (passive source named, or active step logged);
- whether it is in scope or out;
- the confidence, and what would raise it.

A surface item with no provenance is not recorded. An assumption is marked as
an assumption, never promoted to an observed asset.

## 5. Hand off

Reconnaissance finds surface; it does not judge it or exploit it. The inventory
goes to `vulnerability-assessment` for the non-destructive sweep, and to
`authorized-pentesting` only when a confirmed weakness and a written
authorization justify active exploitation. Nothing here proves impact.

## 6. Prohibitions

- No active step without a written, in-scope authorization on record.
- No probing of an asset discovered to be out of scope, or not the requester's.
- No surface item recorded without its source or method.
- No bypass of a bot challenge, a WAF or an access control to enumerate; a
  barrier is recorded, not defeated.
- No flooding: every active request is rate limited and identified.
- No exploitation and no proof of impact here; that is `authorized-pentesting`.
- No assumption presented as an observed asset.

## 7. Protocol

1. Confirm the gate: ownership for passive, a written in-scope authorization
   for anything active. Record it, or stay passive.
2. Enumerate passively from public and third-party sources; never touch the
   target yet.
3. If and only if authorized, resolve, validate and probe in-scope assets, rate
   limited and logged.
4. Record every asset with its source or active step, its scope status and its
   confidence.
5. Separate in-scope from out-of-scope; mark out-of-scope assets untouched.
6. Hand the inventory to `vulnerability-assessment`, and to `authorized-pentesting`
   only with a confirmed weakness and authorization.

## 8. Interfaces

- Upstream: `security-core` for the authorization boundary and the severity
  scale, `threat-modeling` for which surface matters.
- Lateral: `vulnerability-assessment` which sweeps the surface this maps,
  `website-audit` when the target is a site reached from its URL.
- Downstream: `authorized-pentesting` for active exploitation of a confirmed
  weakness under authorization, the fixer for anything already evident.

## 9. Auto-critique

Score from 0 to 5: the gate confirmed before any active step, passive sources
exhausted before touching the target, every active action rate limited, logged
and in scope, every surface item carrying its provenance, out-of-scope assets
recorded untouched, and no assumption promoted to an observed asset.
