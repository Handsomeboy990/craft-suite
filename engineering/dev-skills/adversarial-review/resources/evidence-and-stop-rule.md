# Evidence ranking and the stop rule

The two mechanisms that keep the review honest: what settles a point, and how
the review ends without exhaustion or rank.

## Evidence, ranked

A lower rank never beats a higher one.

1. A command run in this repository, with its observed output.
2. A primary source cited exactly, saying what it is claimed to say.
3. A reproducible scenario the other side can run.
4. A worked counterexample, concrete and checkable.
5. A stated, falsifiable assumption both sides accept.

Not evidence: seniority, sunk effort, confidence, "it is standard", "trust me",
or restating the claim.

## The stop rule

- `upheld`: the author meets the challenge with rank 1 or 2 evidence that the
  challenger cannot answer with a concrete scenario.
- `conceded`: the author cannot meet it and has no higher evidence to bring;
  the work or the claim changes, then re-enters.
- `open`: both sides are still producing new scenarios or new evidence. The
  instant one side only repeats, that side has lost that challenge.
- Escalate: a challenge still genuinely open after both sides spent their
  evidence goes to the human, both positions on one screen, never decided by
  rank or by insistence.

## Delivery boundaries

- The challenger may not block delivery on a `note` level disagreement.
- The author may not ship over an `open` challenge at `blocker` or `major`.
- No mandatory gate is weakened to end the argument faster.
