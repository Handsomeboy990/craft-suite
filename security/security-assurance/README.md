# security-assurance

Finding what is wrong in a system that exists. Three skills: one non-intrusive
and broad, one active and tightly gated, and one that audits a whole site from
its URL and spans both.

| Skill | Purpose | Gate |
|---|---|---|
| [vulnerability-assessment](vulnerability-assessment/) | a structured, non-destructive sweep of an owned system, ranked findings, remediation plan | ownership or a written scope |
| [authorized-pentesting](authorized-pentesting/) | active exploitation to prove impact from a confirmed finding | written, specific, in-scope authorization on record |
| [website-audit](website-audit/) | a URL-driven audit across front, back, security, performance, accessibility and design | passive on any URL, active only on an owned or authorized target |

All three refer to [../secure-development/security-core](../secure-development/security-core/)
for the authorization boundary and the severity scale.

`authorized-pentesting` is the only skill in the suite that crosses into
offensive technique. Its first step is always the authorization gate, and the
refusal on a system without authorization is not negotiable by rephrasing.
