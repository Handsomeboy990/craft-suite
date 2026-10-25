---
name: adversarial-review
description: A structured contradiction of finished work and the decisions behind it: a challenger attacks the claim, the design, the choice or the verdict until it is either defended with evidence or conceded as a defect, with a stop rule that forbids both rubber stamping and obstruction. Use to pressure-test any non trivial decision, any orchestrator or lead verdict, and any result another agent is about to call done.
license: MIT
metadata:
  category: dev-skills
  version: 1.0.0
  depends_on: [engineering-core]
  outputs: [challenges, rebuttal-record, standing-verdict]
---

# Adversarial Review

Contests work the way the reviewer who disagrees on principle contests it: not
to be difficult, but because a decision nobody argued against was never tested.
The challenger assumes the result is wrong and tries to show it. The author
holds the result only by answering with evidence, not with authority or
repetition.

A contradiction with no concrete failure behind it is noise. A defence that
rests on seniority, on effort already spent, or on saying the same thing louder
is not a defence. This skill is the referee between the two.

## 1. Entry condition

Runs on request, and on any of these by default:

- a non trivial design, architecture or technology decision;
- a verdict issued by a lead, an orchestrator or a final verifier;
- a result an agent is about to hand back as done;
- a number, a benchmark or a claim that a later decision will rely on.

Skipped only for the mechanical and reversible: a rename, a formatting pass, a
change already covered by a passing test that the challenger can read.

## 2. The two roles

| Role | Holds | Wins by |
|---|---|---|
| Challenger | the burden of naming a concrete failure | making the author change the work or the claim |
| Author | the burden of answering with evidence | making the challenger concede on that evidence |

Neither wins by outranking the other. The orchestrator and the lead hold no
privilege here: their verdicts enter as claims to be defended like any other.
The challenger is not the author of the work under review, and does not review
its own challenge.

## 3. Protocol

1. **State the claim under test** in one sentence, as the author would. If the
   challenger cannot state it fairly, it is not ready to attack it.
2. **Attack it** with the four lines of section 4, each as a concrete scenario,
   never as a doubt. "This is fragile" is not a challenge; "this drops the last
   event when the queue is full, here is the input" is.
3. **Author answers** each challenge with evidence of section 6: a run, a
   citation, a counter scenario, or a concession.
4. **Resolve each challenge** to one of the three outcomes of section 5.
5. **Repeat** until every open challenge is resolved and the challenger raises
   no new concrete scenario. The stop rule of section 7 bounds this.
6. **Record** the standing verdict and the rebuttal trail, section 8.

## 4. The four lines of attack

### Line 1, the claim is false

One question: for which real case is the stated result simply not true?

- the counterexample the claim did not consider;
- the benchmark run under conditions the claim will not meet in use;
- the "it works" that was never executed, or executed on the happy path only;
- the figure with no source, or a source that does not say what is claimed.

### Line 2, the reasoning does not hold

One question: does the conclusion follow, even granting the premises?

- the premise assumed and never checked against the repository or the data;
- the step that smuggles in the conclusion;
- the comparison that changed one variable and silently changed three;
- the generalisation from one observation.

### Line 3, the alternative was not considered

One question: what was rejected, and was it rejected for a reason or by default?

- the simpler option dismissed without a stated cost;
- the dependency added where the platform already does it;
- the pattern chosen by habit, not by fit to this constraint;
- the decision that would differ if one stated assumption were false.

### Line 4, the cost was understated

One question: what does this choice cost later, that the author did not price?

- the migration, the lock in, the operational burden deferred to future work;
- the failure mode that is rare now and certain at scale;
- the second order effect on the next change forced through this code;
- the token, time or money cost measured optimistically.

## 5. Resolving a challenge

| Outcome | Meaning | Who moves |
|---|---|---|
| upheld | the author showed the challenge is answered | challenger concedes, in writing |
| conceded | the author agrees the work or claim must change | author changes it, then re-enters |
| open | neither evidence settles it yet | escalates per section 7 |

A challenge is never left to stand unresolved and unspoken. Silence does not
close it.

## 6. What counts as evidence

Ranked. A lower rank does not beat a higher one.

1. a command run in this repository, with its observed output;
2. a primary source cited exactly, saying what it is claimed to say;
3. a reproducible scenario the other side can run;
4. a worked counterexample, concrete and checkable;
5. a stated, falsifiable assumption both sides accept.

Not evidence: seniority, the amount of work already done, confidence, "it is
standard", "trust me", or restating the claim.

## 7. The stop rule

The review must end, and must not end by exhaustion or by rank.

- A challenge resolves to `upheld` the moment the author meets it with rank 1
  or 2 evidence that the challenger cannot answer with a concrete scenario.
- A challenge resolves to `conceded` the moment the author cannot meet it and
  has no higher evidence to bring.
- A challenge stays `open` only while both sides are still producing new
  concrete scenarios or new evidence. The instant one side only repeats, that
  side has lost that challenge.
- A challenge still genuinely `open` after both sides have spent their evidence
  is escalated to the human with both positions stated in one screen, never
  decided by whoever is more senior or more insistent.

The challenger may not block delivery on a `note` level disagreement, and the
author may not ship over an `open` challenge at `blocker` or `major`.

## 8. Severity and record

Challenges carry the severity of the defect they would prove, on the shared
scale: `blocker`, `major`, `minor`, `note`. Severity comes from the consequence
if the challenge is right, never from how forcefully it was argued.

```
Claim      the result or decision under test, one sentence
Challenge  the concrete failure asserted, with its input or scenario
Line       false | reasoning | alternative | cost
Severity   blocker | major | minor | note
Answer     the evidence the author brought, by rank
Outcome    upheld | conceded | open
```

The standing verdict states, in one line, what survived, what was changed, and
what escalated.

## 9. Interfaces

- Upstream: `engineering-core`, `code-review-protocol`, `self-critique-protocol`,
  and any lead or orchestrator verdict submitted for challenge.
- Lateral: `dependency-selection` and `technology-selection` for decision
  challenges, `security-audit` and `performance-engineering` for depth behind a
  correctness or cost challenge, `testing-quality` for the evidence a challenge
  demands.
- Downstream: `validation-gate` and `release-readiness` when the standing
  verdict gates delivery, `project-continuity` for the rebuttal record,
  `git-workflow` once the conceded changes are made.

## 10. Prohibitions

- No challenge without a concrete failing scenario or a missing piece of
  evidence. A vague doubt is not raised.
- No defence by authority, seniority, sunk effort, or repetition.
- No concession extracted by persistence alone: only evidence concedes a
  challenge.
- No infinite loop: a side that stops producing new scenarios or evidence has
  lost that point, and the review moves on.
- No private verdict: every resolved challenge is recorded with its outcome.
- No reviewing one's own work as the challenger, and no lead overruling an
  outcome by rank instead of evidence.
- No weakening of a mandatory gate to end the argument faster.

## 11. Auto-critique

Score from 0 to 5: every challenge backed by a concrete scenario, evidence
ranked honestly, no defence by authority accepted, outcomes recorded, the stop
rule applied rather than exhaustion or rank, severity drawn from consequence,
and the escalation left to the human where evidence genuinely ran out.
