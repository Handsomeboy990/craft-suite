# Example: the baseline watch at project start

A project is a Next.js application with a Postgres database. The watch runs
right after the stack is chosen, before the first feature.

## 1. Inventory, from the lockfile

| Dependency | Installed | Support status |
|---|---|---|
| next | 15.2.1 | current |
| react / react-dom | 19.0.0 | current |
| postgres (pg) | 8.11.3 | current |
| node | 20.11 LTS | maintenance until 2026-04 |

Direct and transitive both read from the lockfile, not assumed.

## 2. Signals, each from the primary source

- **pg 8.11.3**: the project's advisory database lists an advisory against
  `< 8.11.5` (SQL parsing). Affected range includes 8.11.3. Fixed in 8.11.5.
- **next 15.2.1**: the official releases show 15.2.4 is out, a patch release;
  the changelog lists a middleware redirect fix, no breaking change.
- **node 20**: the release schedule shows 20.x enters maintenance soon and
  22.x is the active LTS; not urgent, but dated.
- **react 19**: no applicable advisory; a model recollection of a "use" hook
  change is not reported, because no primary release note was retrieved for it.

## 3. Report

**Fix now**
- `pg` 8.11.3 -> 8.11.5. Advisory [id], affects the query builder in
  `lib/db.ts`. Handed to the fixer.

**Plan**
- `node` 20 -> 22 before 20 leaves maintenance (2026-04). Migration cost small;
  by-when recorded.

**Defer**
- `next` 15.2.1 -> 15.2.4, a patch with no breaking change; adopt at the next
  dependency pass. Benefit small, recorded so it is not lost.

Run dated, sources listed. The next watch is a diff against this baseline.

The stack was not called "clear": the report states that the release feeds and
advisory databases for next, react, pg and node, named, showed exactly these
items as of the run date.
