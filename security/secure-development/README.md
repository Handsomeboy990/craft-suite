# secure-development

Building a system so it resists attack, and hardening one that exists. Nine
skills, governed by [security-core](security-core/), which they refer to and do
not restate.

| Skill | Purpose |
|---|---|
| [security-core](security-core/) | constitution: posture, authorization boundary, severity scale, evidence rule |
| [threat-modeling](threat-modeling/) | assets, adversary, trust boundaries, ranked and decided threats |
| [security-architecture](security-architecture/) | fail-closed structural decisions that constrain the build |
| [authentication-security](authentication-security/) | password storage, login, recovery, MFA, token lifecycle |
| [authorization-design](authorization-design/) | object-level access, enforcement choke point, escalation paths |
| [session-security](session-security/) | cookies, fixation, timeout, revocation, CSRF |
| [rate-limiting](rate-limiting/) | per-endpoint limits by sensitivity, keyed by IP, user and resource cost |
| [dependency-security](dependency-security/) | the supply chain: advisories, reachability, safe upgrades |
| [security-headers](security-headers/) | CSP, HSTS, CORS, and the browser hardening headers |

Start at `security-core`. It depends on nothing and can be used alone.
