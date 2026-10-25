# Example: passive map, then one scoped active pass

Target: `example.com`, with a written authorization naming `*.example.com` and
one IP range in scope, and `payments.example.com` explicitly out.

## Passive, before touching anything

- Certificate transparency and a passive subdomain tool return 14 names.
- One, `legacy.example.com`, resolves to an IP outside the authorized range.
  Recorded as out of scope, not probed.
- `payments.example.com` appears; it is named out of scope. Recorded, untouched.

Each name carries its source (the CT log, the aggregator) and a confidence.

## Active, within scope only

With authorization on record, the 11 in-scope names are resolved and probed,
rate limited and identified. Wildcards are eliminated; 7 are live. Services and
versions are fingerprinted from their own responses.

Every active request is logged with its time and parameters. When one host
starts returning 429, the pass backs off rather than pushing through.

## Inventory handed on

7 live in-scope hosts with services and versions, each with provenance; 2
out-of-scope assets recorded and untouched. Handed to vulnerability-assessment.
No impact was proven and nothing was exploited; that is a later phase, under its
own gate.
