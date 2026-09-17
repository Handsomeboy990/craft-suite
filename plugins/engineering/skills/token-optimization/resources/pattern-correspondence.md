# Pattern correspondence

The seven wasteful patterns, named once, read by two different mechanisms at
two different times. Neither list is the source; `SKILL.md` section 1 is.
This file expands each row with what following the rule looks like in
practice.

## Repeated exploration

Rule: read a file once during exploration; when a later step needs the same
fact, cite the earlier finding rather than reading the file again.

```
wasteful   read auth/session.ts at step 2, read it again identically at
           step 6 to confirm the same thing
proportional   step 6 states "per step 2's reading of auth/session.ts,
           the session cookie is httpOnly and secure already"
```

## Edit churn

Rule: decompose before dispatching, so a single dispatch does not accumulate
edits to the same file across several unrelated concerns.

```
wasteful   one dispatch edits the same component four times as each new
           requirement is discovered mid task
proportional   the requirements are gathered first, per requirements-analysis,
           so the component is edited once with the complete shape
```

## Command repetition

Rule: batch a mechanical command instead of repeating it with small
variations.

```
wasteful   grep for "foo" in file A, then the same grep in file B, then C
proportional   one grep across A, B and C in a single invocation
```

## Low cache reuse

Rule: keep context stable across adjacent steps rather than restructuring it
between every step.

```
wasteful   each step in a sequence restates the project's stack, conventions
           and file layout from scratch
proportional   the stack and conventions are established once, early, and
           referenced by every later step in the same session
```

## Large output

Rule: size output to the question.

```
wasteful   a one-line question answered with a restated plan, a summary of
           context already shared, and a conclusion
proportional   the one line the question asked for
```

## Broad scope

Rule: decompose a single session trying to cover many files, many tool types
and many concerns at once.

```
wasteful   one dispatch explores the codebase, designs the architecture,
           implements three modules and writes the documentation
proportional   exploration, architecture, and each module's implementation
           are separate dispatches, each with the narrower context it needs
```

## Missing project context

Rule: read the canonical project document before re-exploring what it
already answers.

```
wasteful   a new session re-explores the directory layout and the stack a
           previous session already established in project-continuity's note
proportional   the note is read first; exploration covers only what changed
           since it was written
```
