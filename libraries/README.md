# libraries

Shippable code a project installs and runs, as opposed to the skills, which
are knowledge an agent reads. A skill under a domain tree teaches how a library
is built and kept honest; the library here is the artefact that teaching
produces.

Why this sits apart from the skill trees, and not under them, is recorded in
`docs/decisions/0001-resource-library-structure.md`. The direction it serves is
`docs/architecture/RESOURCE_LIBRARY.md`.

## The contract every library obeys

One subdirectory per library, self-contained, so it can be installed and
licensed without the rest of the repository.

```
libraries/<name>/
  LICENSE            the library's own licence, because it ships on its own
  README.md          what it is, how a project installs it, what it depends on
  <code>             the components or modules, each with its test and its doc
```

- `LICENSE` is present and names real terms. A library a project installs has
  to state them without reading the whole suite.
- `README.md` starts with `# <name>` and states purpose, install, and
  dependencies.
- Every component or module carries its own test and its own documentation
  page. A resource with no test is not finished, per `code-review-protocol`.
- The code is an original implementation. A reference project is studied for
  its patterns, never copied; the rule is in
  `docs/architecture/RESOURCE_LIBRARY.md`. Where a small amount of permissively
  licensed code is genuinely reused, its licence and origin are recorded
  against it, per `dependency-selection`.
- No secret, credential, environment value or personal data, per the
  repository rules.

## The gate

A CI step checks this contract: every `libraries/<name>/` has a `LICENSE` and a
`README.md`. It is empty-safe, so it passes while no library has landed yet,
and it tightens into a full build-and-test step as the first library arrives
with its own tooling.

## What is here

Nothing yet. The first library is the UI library, phase 8.1 of
`docs/ROADMAP.md`: design tokens, accessible primitives, and a restrained
motion layer, with the duplicated site-example code consolidated into it.
