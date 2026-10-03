# The verify loop: measuring whether a fix helped

Used whenever a remediation comes back from `accessibility-remediation`, or
any change claims to have fixed an accessibility finding. The question is not
whether the scanner is quieter. It is whether the person the finding named can
now do what they could not.

## 1. Outcome classes

Every remediated finding ends in exactly one class:

| Class | Meaning |
|---|---|
| fixed | the barrier check passes, no regression, nothing lost |
| scanner gamed | the scanner is clean but the barrier check fails, and a change was made |
| regression | the barrier check may pass, but something that worked before no longer does |
| not fixed | the barrier check still fails |
| escalated | a judgement of intent the verifier cannot make; handed to a person |

"Scanner gamed" requires that something was changed. An untouched component the
scanner never flagged is a scanner blind spot, not gaming, and is reported as an
open finding.

Report two rates side by side: the share of findings the scanner now reports as
clean, and the share in the class fixed. The gap between them is the progress
that would ship without helping anyone, and it is the number this loop exists
to produce.

## 2. Common ways to game a scanner

Each takes an automated rule to zero and leaves the user no better off, or
worse:

```
alt=""               on an image that carries information: the rule passes and
                     the information is deleted
generic name         alt="icon", aria-label="button", link text "click here":
                     a name that says nothing
role without behaviour  role="button" on an element that takes no focus and
                     ignores Enter and Space: the user is told a control
                     exists and cannot use it
ARIA over the wrong element  listbox and option roles on divs that still
                     cannot be operated by keyboard, instead of a native select
outline: none        focus reachable, indicator styled away
colour forked        one text colour darkened outside the design tokens to
                     pass contrast, diverging from the system
live region added late  a region inserted at the same moment as its message,
                     which many screen readers never announce
```

Each has a direct check in section 3; the scanner alone never decides.

## 3. The loop, after every change

Run in this order, on the rendered interface, re-mounting or reloading the
component or page before each check so no check depends on what an earlier one
did (a Tab and Enter that dismissed a banner, a dialog left open):

```
1  barrier check    the specific barrier the finding named is gone, checked as
                    the person meets it: the status word reaches the
                    accessibility tree, the control is reached by Tab and
                    operated by Enter or Space, the error is announced and
                    associated, focus enters and returns from the dialog
2  universal layer  on every remediated surface, whatever the finding was:
                    focus indicator visible on every focusable element (2.4.7)
                    target size at least 24 by 24 CSS pixels, or the spacing
                    exception (2.5.8)
                    reflow at 320 CSS pixels with no horizontal page scroll
                    (1.4.10)
                    any added motion respects reduced motion (2.3.3, level
                    AAA, held here because section 7 of the skill requires it)
3  preservation     content and behaviour that worked before still work: no
                    text removed, no handler lost, no state reset
4  scanner          the automated scan, last, reconciled with 1 to 3
```

A failure at any step stops the claim of a fix. The finding goes back to
remediation with the failing step named, and the loop runs again after the next
change.

## 4. A check that cannot fail measures nothing

Before a hand-written check is trusted to grade a remediation:

- run it against the unremediated surface: it must fail where the barrier is,
  and pass where the surface was already fine (a preservation check);
- run it against a known-correct fix: it must pass;
- run it against at least one known gaming fix from section 2: it must fail.

Record the floor (the surface before any change) and, where a reference fix
exists, the ceiling. A run is then read against a floor known to be what it is
and a ceiling known to be reachable, so a shortfall belongs to the remediation,
not to the measuring.

## 5. The checks stay apart from the fix

The checks that grade a remediation are written, and proven as in section 4,
before the remediation is attempted, and the one making the fix does not edit
them. A fix verified by a check its author adjusted to pass has verified
nothing. When a check is wrong, it is corrected as its own change, re-proven
against section 4, and every earlier result graded by it is re-run.

The same applies to automation handed to `playwright-automation`: the keyboard
and focus test is committed before or separately from the fix it guards, and it
is seen failing before it is seen passing.

## 6. Escalate intent

Some fixes depend on what the author meant, not on syntax:

- whether an image informs or decorates (its alt is the information, or empty);
- whether a custom widget should become a native element;
- which of two labels is the one a person would recognise;
- whether a time limit, an animation or an auto-advance is essential.

When the source and the specification do not settle it, the finding is
escalated to a person with the question stated, not answered by a guess that
happens to satisfy the scanner. An escalation is an outcome, not a failure.

## 7. Limits, stated in every report

Write down what the measurement did not cover, so a reader can tell measured
from assumed:

```
engines      which browser engines the checks ran in
AT           whether a real screen reader was used, which, on which flow;
             an accessibility tree read from the DOM is an approximation
             and is not reported as a screen reader pass
keyboard traps  whether intended traps (a modal) were told apart from
             defects, and how
not measured cognitive load, reading level, error recovery, and anything
             else outside the checks run
sample       which flows and components; findings elsewhere are not implied
```
