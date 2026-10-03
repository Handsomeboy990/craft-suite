---
name: accessibility-remediation
description: Fixes an interface that an accessibility audit has already found barriers in: triage of the findings, a decision rule per barrier family written from WCAG 2.2, native elements before ARIA, the intent questions escalated to a person instead of guessed, and every change handed back to the verify loop of accessibility-testing, which alone closes a finding. Never verifies its own fix. Use when there is an audit report, a list of violations or a set of accessibility findings to work down.
license: MIT
metadata:
  category: dev-skills
  version: 1.0.0
  depends_on: [engineering-core, accessibility-testing, frontend-engineering]
  outputs: [triage-plan, remediation-record, escalation-list, verification-handback]
---

# Accessibility Remediation

An audit with dozens of violations and a deadline invites the fastest route to
a quiet scanner: an empty `alt`, a role on a div, a label nobody can see. Each
of those takes an automated rule to zero and leaves the person the finding
named exactly where they were. This skill is the other route: decide what the
barrier is, choose the fix that removes it for that person, and let someone
else measure whether it did.

It fixes. It does not find barriers, which `accessibility-testing` does, and it
never closes a finding. A finding is closed only when the verify loop of
`accessibility-testing` returns the outcome class "fixed", run by an agent
other than the one that made the change.

## 1. What this skill owns, and what it does not

```
owns          triage of the findings, the decision per barrier family, the
              change, the escalation questions, the remediation record, the
              hand-back to verification
does not own  finding barriers                accessibility-testing
              the checks that grade a fix     accessibility-testing, written
                                              and proven before the first fix
              closing a finding               the verify loop's outcome class
              building new screens            frontend-engineering
              tokens and shared components    design-system
              the answer to an intent question  a person: the owner, the
                                              author, the designer
```

The checks that grade the remediation are not this skill's to write, read for
answers, or edit. A fixer who can tune the grader verifies nothing.

## 2. Inputs, and when not to start

Start only with:

- findings in the shape of `accessibility-testing` section 9: criterion,
  location, barrier, who meets it, evidence;
- the target (WCAG 2.2 AA unless the project states another);
- checks for those findings, written and proven able to fail by the verifier
  (`accessibility-testing` `resources/verify-loop.md` section 4), with a
  recorded fingerprint such as a hash or a commit;
- the source of intent: the specification, the content brief, the design.

When the findings are only a scanner export, they are not findings yet: send
them to `accessibility-testing` first. When no checks exist, ask the verifier
for them and wait; do not write your own and grade yourself with them.

## 3. Triage

Work down the report in this order, and write the order down before the first
change:

```
1  blocking findings: the task cannot be completed by that person at all
2  findings that share a root cause: one component, one token, one pattern
   used in many places, fixed once at the source
3  findings on the critical flow, by the number of people who meet them
4  the rest
```

For each finding, record the barrier family (section 5), the rule that
applies, whether an intent question blocks it (section 6), and the layer the
fix belongs to: the instance, the component, or the token. A fix that belongs
to a shared component goes through `design-system`; patching every instance
of a broken component multiplies the defect's owners.

Templates: `resources/remediation-record.md`.

## 4. Native elements before ARIA

The rule: when a native HTML element can do the job, the fix is that element.
ARIA is added only for a relationship or a state HTML cannot express, and a
custom widget with ARIA is built only when a person has decided the native
element is not acceptable.

The reason it is a rule and not a preference is the custom select. Given
`listbox` and `option` roles over a set of divs, it satisfies a scanner and
still cannot be focused, opened, moved through with arrow keys, searched by
typing, dismissed with Escape, or read back with its value, until every one of
those behaviours is written by hand and kept working. A native `select` has
all of them, in every browser and assistive technology, the moment it is on
the page. ARIA changes what is announced; it never adds what the element does.

```
1  the native element, with its native behaviour
2  the native element, restyled within what the platform allows
3  the native element plus the least ARIA for what HTML cannot say:
   aria-describedby, aria-invalid, aria-expanded on a disclosure button,
   aria-current
4  a custom widget with the full keyboard pattern, only on a recorded
   decision that 1 to 3 are unacceptable, and with checks for every key
```

Replacing an existing custom widget with a native element changes how it looks
or behaves, so the replacement is put to a person (section 6) with the native
element as the recommendation. Meanwhile no ARIA layered over the old widget
ships as the fix.

## 5. Decision rules by barrier family

Written from WCAG 2.2 and the suite's own criteria map
(`accessibility-testing` `resources/criteria-map.md`). The full tables, with
the fix ladder and the gaming fix to refuse in each family, are in
`resources/barrier-family-rules.md`.

```
images and non-text   1.1.1, 1.4.5
  decide the image's job from the source. Informs: the information goes in
  the alternative or in adjacent text, and a fact everybody needs goes in
  visible text. Decorates: alt="" and nothing else. Acts, inside a link or a
  button: name the action, not the picture. Text in an image: real text.
  The job is not stated anywhere: escalate.

names                 4.1.2, 2.5.3, 2.4.6
  a visible label first, and the accessible name starts with the visible
  words. An icon-only control is named by its action and its object, unique
  among its repeated siblings; the icon is hidden from the tree.

roles and keyboard    2.1.1, 2.1.2, 4.1.2
  the element follows the behaviour: it goes somewhere, a link with an href;
  it does something, a button. A click handler on a div is replaced, not
  given a role. No positive tabindex, ever.

forms                 1.3.1, 3.3.1, 3.3.2, 3.3.3, 1.3.5, 4.1.3
  a visible label tied to its field; a placeholder is an example, never the
  label. An error is text, tied to its field, flagged invalid, and reached:
  focus moves to the first invalid field or to a summary that links to it.
  The value survives the failed submit. A live region exists before the
  message it will carry.

focus                 2.4.7, 2.4.11, 2.4.3, 1.4.11
  never remove an indicator without a stronger one; show it on keyboard
  focus, at 3 to 1 against what surrounds it, never hidden under a sticky
  bar. The tab order follows the reading order; a dialog takes focus, keeps
  it, and returns it to its trigger.

contrast and colour   1.4.3, 1.4.11, 1.4.1
  fix at the token, through design-system, never with a one-off colour;
  measure the rendered pair in every theme. Colour that carries meaning gets
  a second carrier: text, an icon, a pattern.

dynamic and custom    4.1.2, 4.1.3, 2.1.1
  section 4 decides the element. A status message lives in a region present
  at load. A disclosure is a button with aria-expanded. A dialog is the
  platform dialog or the project's accessible primitive.

layout and targets    1.4.4, 1.4.10, 1.4.12, 2.5.8
  fix in the layout, not by hiding content: no fixed widths that force
  horizontal scroll at 320 CSS pixels, targets at least 24 by 24 or spaced.

time and motion       2.2.1, 2.2.2, 2.3.1, 2.3.3
  moving content gets a pause control, motion honours reduced motion, a time
  limit can be extended. Whether the timing or the motion is essential:
  escalate.
```

## 6. Escalation

Some fixes depend on what the author meant, not on the markup. These are
always put to a person when the source and the specification do not settle
them:

```
image intent           does this image inform, decorate, or act
native replacement     may this custom widget become a native element
essential timing       is this time limit, auto-advance, animation or motion
or motion              essential to the activity, or may it be paused, removed
                       or reduced
the recognisable label which of two candidate labels the people using the
                       product would recognise
```

An escalation states the finding, the question, the options with what each
costs, the recommendation, and what stays as it is meanwhile. It is a valid
outcome, reported as escalated: not as fixed, not as a failure. No guess that
happens to satisfy the scanner is shipped while the question is open; an
`alt=""` on an image whose purpose nobody stated is a guess.

## 7. Making the change

- The smallest change at the right layer: the component rather than its
  instances, the token rather than the colour.
- One finding, or one root cause, per commit, the finding identifiers in the
  message, so the verifier can map each change to what it claims to fix.
- Never edit, skip or read the checks for the answer. A check that looks
  wrong is reported to the verifier, who corrects it as its own change and
  re-runs every result it graded.
- Never fix the test instead of the interface, and never fix only the
  scanner-visible half of a finding.
- A defect noticed outside the report is recorded as a new finding for the
  verifier, not folded silently into another change.
- A keyboard walk of your own change is a smoke test before hand-back. It
  closes nothing.

## 8. The record and the hand-back

Every finding leaves this skill in one of three states, never "fixed":

```
ready for verification   the change, the files, the rule applied
escalated                the question, put to a named person
not attempted            the reason: blocked by another finding, out of scope
                         by decision, no checks yet
```

The record goes to the verifier, who runs the verify loop of
`accessibility-testing` section 10. What comes back is an outcome class per
finding. Scanner gamed, regression and not fixed return here with the failing
step named, and the finding is worked again. The loop ends when every finding
is fixed, escalated, or left open by a recorded decision of the owner.

## 9. Reporting

The report is built from the verifier's results, not from the fixer's
confidence:

```
per finding     outcome class, from the verify loop
side by side    the scanner-clean rate and the fixed rate; the gap between
                them is work that would have shipped without helping anyone
escalations     each question, who holds it, what stays open meanwhile
limits          from accessibility-testing resources/verify-loop.md section 7,
                plus anything about the separation of roles that was not held
```

`examples/booking-form-remediation.md` is a measured run: the same nine
findings remediated from the scanner report alone and by these rules, graded
by checks proven before either.

## 10. Who does what

```
fixes                frontend-engineer, with this skill
writes and runs      ui-ux-engineer with playwright-engineer, with
the checks           accessibility-testing (engineering-orchestrator
                     resources/agent-dispatch.md)
reads the results    design-verification, compliance-verifier
answers escalations  the owner, the author or the designer
```

No agent both fixes a finding and verifies it. When one session must do both,
because no team is dispatched, the separation is held in time and in files:
the checks are written, proven and fingerprinted before the first change, the
fixing work never edits them, and the report states that one author did both.

## 11. Prohibitions

- Never close a finding, or call it fixed; only the verify loop does.
- Never verify your own fix, and never edit the checks that grade it.
- Never add ARIA where a native element would do the job.
- Never put ARIA roles over a custom widget as the fix while its native
  replacement awaits an answer.
- Never write `alt=""` on an image whose purpose is unknown; escalate.
- Never use a generic name: "button", "icon", "image", "click here", a file
  name.
- Never label a field with a placeholder alone, or with a name only a screen
  reader hears when the field has a visible purpose.
- Never remove a focus indicator without a stronger replacement.
- Never pass contrast with a colour outside the tokens.
- Never insert a live region at the moment its message appears.
- Never guess an intent question to empty the report.

## 12. Protocol

1. Confirm the inputs of section 2: findings, target, proven checks with a
   fingerprint, the source of intent. Stop and ask for what is missing.
2. Triage per section 3 and write the order and the layer of each fix.
3. Separate the findings that need an intent answer and send the escalations
   of section 6 at once, in one batch.
4. For each remaining finding, apply the family rule of section 5, native
   element first per section 4, at the layer triage chose.
5. Commit each finding or root cause on its own, identifiers in the message.
6. Walk your own change by keyboard as a smoke test.
7. Write the remediation record of section 8 and hand it to the verifier.
8. Take back each outcome class; rework gamed, regressed and unfixed
   findings, and apply answered escalations as new changes.
9. Repeat 4 to 8 until every finding is fixed, escalated, or left open by
   the owner's recorded decision.
10. Report per section 9, from the verifier's results.
11. Hand the diff to `code-review-protocol`.

## 13. Auto-critique

Score from 0 to 5: inputs confirmed before the first change, triage written
with the layer of each fix, native element chosen wherever one exists, each
fix matched to its family rule, intent questions escalated rather than
guessed, checks untouched, one finding or root cause per commit, record handed
back with no finding called fixed, rework driven by the returned outcome
classes, report giving the scanner-clean and fixed rates side by side.

Threshold: no axis below 3, average at least 4. A finding called fixed by the
fixer, a check edited by the fixer, ARIA roles shipped over a custom widget
whose native replacement was available, or an intent question answered by a
guess is an automatic failure.

## 14. Interfaces

- Upstream: `accessibility-testing` for the findings, the proven checks and
  the verify loop that closes each finding; `ui-ux-engineering` for what the
  interface was specified to be.
- Lateral: `frontend-engineering` for the change itself, `design-system` when
  the fix belongs to a token or a shared component, `internationalization`
  when a name or a label is translated.
- Downstream: `accessibility-testing` again for verification,
  `playwright-automation` for the keyboard and focus tests that keep a fix
  fixed, `test-reporting` for the outcome report, `code-review-protocol`
  before the work is called done.
