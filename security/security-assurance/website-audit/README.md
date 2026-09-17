# website-audit

Audits a live website from its URL across front end, back end, security,
performance, accessibility and design. The discipline turns on one line: what
can be observed without touching the system, and what requires written
authorization to probe.

- Inputs: the target URL, and for any active testing, the ownership or written
  authorization record.
- Outputs: the audit scope record, the passive findings, the active findings
  where authorized, and the consolidated report grouped by category.
- Depends on: security-core.
- Run by: the web-auditor agent.

Passive observation, loading pages, following links, rendering the DOM, reading
response headers, measuring performance, checking accessibility, runs on any
public URL, because it does nothing a normal visit does not. Active testing,
anything that probes for a weakness, changes state, or creates an account, runs
only on a target the requester owns or is authorized in writing to test, and
never crosses the scope on the authorization letter.

Getting an authenticated session is the most sensitive step, and the human
holds it. If an account must be created, the audit stops and asks which email
to use and whether verification is required, then waits for the requester to
complete the verification in their own inbox and confirm. It never automates
around a verification step, because defeating verification is abuse, not
testing.

The report never concludes that a site is secure. It states what was run, with
what result, on what date, within what scope, and names what was not tested and
why.
