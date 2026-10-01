# decisions

Architecture decision records: one file per decision that is expensive to
reverse, numbered, dated, and never edited after acceptance. A decision that
changes is superseded by a new record, not rewritten, so the reasoning that
held at the time survives.

Format and rules: the `decision-records` skill
(`engineering/dev-skills/decision-records/`). File naming:
`NNNN-short-kebab-title.md`. Status values: `proposed`, `accepted`,
`superseded`, `rejected`.

| Record | Status | Decision |
|---|---|---|
| `0001-resource-library-structure.md` | accepted | skill trees stay at root; a top-level `libraries/` holds shippable code |
| `0002-ui-primitive-base.md` | accepted | Radix UI as the headless primitive base for `libraries/ui`, behind the suite's own component API |
