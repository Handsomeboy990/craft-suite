# Watch checklist

Run at project start, on the agreed rhythm, and on any dependency change.

## Inventory

- [ ] Every direct and transitive dependency read from the lockfile, with its
      exact installed version.
- [ ] Language, runtime, database, build and deploy tooling versions recorded.
- [ ] Support status of each: current, maintenance, end of life.

## Sources

- [ ] Official releases and changelog retrieved for each watched dependency.
- [ ] Official advisory channel checked for each ecosystem and dependency.
- [ ] The primary advisory retrieved behind any severity reported.
- [ ] Every source recorded with its date of access.

## Triage

- [ ] Each signal sorted into security, breaking, or novelty.
- [ ] Signals touching a version not installed marked not applicable, with the
      reason.
- [ ] Severity taken from the primary advisory, not an aggregator.

## Report

- [ ] Fix now: advisory against an installed version, with upgrade and affected
      path.
- [ ] Plan: breaking change or end-of-life, with cost and by-when.
- [ ] Defer: novelty with a stated benefit that does not yet justify its cost.
- [ ] Security items handed to the fixer, upgrade items to the engineer.
- [ ] Run dated; nothing claimed clear beyond what the named sources showed.
