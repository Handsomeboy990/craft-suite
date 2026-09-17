# Example: a breadth-driven task, decomposed before dispatch

A request: "our error messages are inconsistent across the API, standardize
them." Exploration finds twenty three endpoints with their own ad hoc error
shapes, across four route groups.

## Without decomposition

One dispatch reads all twenty three handlers, rewrites all of them, and hands
back one large diff for review. The reviewer receives twenty three
simultaneous changes with no natural grouping, edit churn is high because the
shared error helper is discovered and revised twice partway through, and the
handoff note has to summarize twenty three unrelated call sites in one block.

## With decomposition

`task-complexity` classifies the task HIGH, driven by breadth (23 files, 4
route groups) with no security or irreversibility signal. Per its section 6,
a breadth-driven HIGH decomposes cleanly:

```
1  design the shared error helper and its shape, one dispatch, MEDIUM
2  apply it to route group A, one dispatch, LOW, reads the helper's contract
   from step 1's handoff rather than re-deriving it
3  apply it to route group B, one dispatch, LOW, same reuse
4  apply it to route group C, one dispatch, LOW, same reuse
5  apply it to route group D, one dispatch, LOW, same reuse
6  one review pass across the four diffs together
```

Each of steps 2 through 5 reads the helper's contract once, from step 1's
handoff, instead of re-deriving it four times. Each is reviewable on its own,
sized to one route group instead of the whole surface. The edit churn that
came from discovering the helper's shape mid task in the undecomposed version
does not recur, because the shape was fixed once in step 1 before any call
site was touched.
