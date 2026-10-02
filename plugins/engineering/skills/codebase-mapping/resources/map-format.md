# Map format reference

The suite does not impose a tool. It imposes a shape, so that any agent can
read any map. Adapt file names to the project's convention; keep the fields.

## Layout

```
docs/codebase-map/
  INDEX.md             the subsystem list, read first
  STAMP.md             commit, date, tools, exclusions
  nodes/
    <subsystem>.md     one per subsystem
  wiring.json          the symbol graph, committed or regenerated per decision
```

## INDEX.md

```
# Codebase map

Built at <commit>, <date>. Stale nodes: <none | list>.

| Node | Path | Purpose |
|---|---|---|
| billing | services/billing | charges, refunds, invoices, provider webhooks |
| auth | packages/auth | sessions, tokens, role checks |
```

## nodes/<subsystem>.md

```
# <subsystem>

Purpose        <one sentence>                       (summary, from <file:line>)
Entry points   <route, export, command, consumer>   <file:line each>
Surface        <symbols used by other nodes>         <file:line each>
Owns           <tables, files, state>                <file:line each>
Depends on     <node (edges)>, ...
Used by        <node (edges)>, ...
Tests          <path>, run with <command>
Conventions    <path of each governing instruction file> | none
Key files      <path>: <why it matters>
Freshness      fresh at <commit> | stale since <commit>: <files>
```

## wiring.json

```json
{
  "commit": "<sha>",
  "symbols": [
    { "id": "billing.charge", "kind": "function", "file": "services/billing/charge.ts", "line": 12, "node": "billing" }
  ],
  "edges": [
    { "from": "api.checkout", "to": "billing.charge", "kind": "calls", "file": "apps/api/checkout.ts", "line": 48, "source": "parsed" }
  ]
}
```

`kind` is one of `defines`, `imports`, `calls`, `implements`, `reads`,
`writes`. `source` is `parsed` or `heuristic`, and never omitted.

## STAMP.md

```
Commit       <sha>
Built        <date>
Wiring by    <tool and version, or "pattern search, heuristic">
Summaries    <none | model pass, marked inline>
Excluded     dependencies, build output, vendored and generated code, <other>
Policy       wiring committed | regenerated locally (decision record <ref>)
```

## Freshness check, as commands

```
git diff --name-only <stamped-commit> -- .     tracked files changed since the stamp
git ls-files --others --exclude-standard       new files git does not track yet
```

The first command alone misses a file that was never committed, which is
exactly how a new subsystem first appears. Run both. Map each path to its node
through INDEX.md, mark those nodes stale, and answer from the source for them
until they are regenerated. A path no node claims is a sign the boundaries
moved: rebuild rather than patch.

A changed or new convention file, an `AGENTS.md` added under a package for
example, marks every node it governs stale, since their `Conventions` field
no longer lists what applies.

## What never goes in any layer

Secret values, credentials, environment values, personal data, source bodies.
A node may say "reads the provider key from configuration at
config/payments.ts:7"; it never repeats the key.
