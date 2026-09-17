<!--
Base branch: dev. Never main.
main receives only release pull requests from dev, opened by a maintainer.
Remove any section that does not apply rather than filling it with none.
-->

## Summary

What changed and why, in a few lines.

## Implementation

The decisions a reviewer needs, including what was rejected and why.

## Validation

All three must pass. Paste the last line of each.

```
bash tests/validate-structure.sh
bash tests/validate-rules.sh
bash tests/validate-orchestration.sh
```

## Checklist

- [ ] Base branch is `dev`.
- [ ] The five validation scripts pass.
- [ ] The staged diff was read in full.
- [ ] No secret, no `.env`, no local agent configuration.
- [ ] No emoji, no em dash, in any file.
- [ ] Any new skill has its four mandatory elements and its metadata.
- [ ] Any new skill is listed in its category index and in
      `documentation/skills-guide.md`.
- [ ] `README.md` and `README.fr.md` still say the same thing.
- [ ] Counts are correct wherever they appear.
- [ ] `CHANGELOG.md` has an entry.
- [ ] `CONTINUITY.md` reflects the new state if the change is structural.
- [ ] No `Co-authored-by`, and no mention of an AI, an assistant or a tool
      anywhere in the commits or in this description.

## Risks

What could break, and how it would show.

## Follow up

Named, with why it was not done here.
