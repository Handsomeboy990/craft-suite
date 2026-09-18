# security

Defensive security and authorized assurance. Twelve skills that build a system
harder to attack, assess what is wrong in one that exists, and, under written
authorization only, prove impact. The posture is defensive; offensive technique
lives in exactly one gated skill.

The tree's constitution is [secure-development/security-core](secure-development/security-core/).
Every skill refers to it and none restates it. Two rules never bend: no
offensive action without written, specific, in-scope authorization on record,
and no audit ever concludes that a system is secure. It reports which checks
were run, with which results, on which revision.

| Category | Skills | Question it answers |
|---|---|---|
| [secure-development](secure-development/) | 9 | how a system is built and hardened so it resists attack |
| [security-assurance](security-assurance/) | 3 | what is wrong in a system that exists, without breaking it |

## secure-development

| Skill | Runs | Produces |
|---|---|---|
| [security-core](secure-development/security-core/) | first, always | posture, authorization decision, severity scale |
| [threat-modeling](secure-development/threat-modeling/) | before design | ranked threats, each mitigated, accepted or transferred |
| [security-architecture](secure-development/security-architecture/) | before code | fail-closed structural decisions with downstream constraints |
| [authentication-security](secure-development/authentication-security/) | on identity flows | password, login, recovery, MFA and token findings and design |
| [authorization-design](secure-development/authorization-design/) | on access rules | object-level access closed, escalation paths walked |
| [session-security](secure-development/session-security/) | on sessions | cookie policy, rotation, timeout, revocation, CSRF defence |
| [dependency-security](secure-development/dependency-security/) | on the supply chain | advisories re-ranked by reachability, safe upgrades |
| [security-headers](secure-development/security-headers/) | on web responses | CSP, HSTS, CORS and the hardening headers, verified live |
| [rate-limiting](secure-development/rate-limiting/) | on abusable endpoints | a limit per endpoint by cost, keyed unforgeably, over the real control |

## security-assurance

| Skill | Runs | Produces |
|---|---|---|
| [vulnerability-assessment](security-assurance/vulnerability-assessment/) | on an owned system | a non-intrusive sweep, ranked findings, remediation plan |
| [authorized-pentesting](security-assurance/authorized-pentesting/) | inside authorization only | proof of impact from a confirmed finding, then remediation |
| [website-audit](security-assurance/website-audit/) | on a URL, passive anywhere, active on authorization | a site audit across front, back, security, performance, accessibility, design |

## Relationship to the engineering tree

The engineering tree already carries `security-audit` (the twenty-four-point
code-level sweep) and `security-testing` (authorized dynamic testing), and
twelve engineering execution plans call them. Those stay where they are. This
tree governs their posture and severity scale through `security-core`, and adds
the design-time and assurance skills around them. Installing the security tree
pulls `security-audit` and `security-testing` with it, so the domain is
complete on its own.

Full picture: [../README.md](../README.md). Architecture:
[../documentation/architecture.md](../documentation/architecture.md).
