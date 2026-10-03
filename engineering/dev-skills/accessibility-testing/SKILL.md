---
name: accessibility-testing
description: Verifies that a product can actually be operated by keyboard, by assistive technology and at reduced vision: focus order and visibility, semantics and names, form labelling and error announcement, dialogs and live regions, contrast, zoom and reflow, motion preferences and target size. Automated scans are the floor, never the verdict. Use whenever a user interface exists.
license: MIT
metadata:
  category: dev-skills
  version: 1.2.0
  depends_on: [engineering-core, quality-engineering]
  outputs: [accessibility-findings, keyboard-report, criteria-coverage, remediation-list]
---

# Accessibility Testing

An automated scan finds a minority of accessibility defects, and none of the
ones that make a product unusable: focus that disappears, a dialog you cannot
leave, a form whose errors are never announced. Those are found by operating
the product without a mouse.

This skill is not dropped because nobody asked. It is dropped only when there
is no user interface.

## 1. The target

Take it from the project: a stated policy, a contractual level, a component
library's claim, or the regulation the client is subject to. When nothing is
stated, work to WCAG 2.2 level AA and say that is what was applied.

Record the target in the report. `accessible` with no reference means nothing.

## 2. Order of passes

```
1  keyboard, the whole critical flow, no mouse at all
2  structure and semantics
3  forms and error handling
4  dynamic content: dialogs, menus, live regions, async updates
5  visual: contrast, zoom, reflow, motion, target size
6  assistive technology, on the critical flow
7  automated scan, last
```

The scan runs last on purpose. Run first, it anchors the session on the
findings a tool can produce and the session stops there.

## 3. The keyboard pass

The single highest yield activity in this skill. Full sheet in
`resources/keyboard-pass.md`.

```
Tab through the flow: does focus reach every interactive element
Is the focus indicator visible on every one of them, including custom controls
Does the focus order match the visual order
Can every action be triggered by Enter or Space, as its role implies
Does Escape close what it opened, and return focus to the trigger
Is there a skip link, or another way past a long navigation
Does focus ever leave the page, or land on something invisible
Does focus ever get trapped where it should not be
After an asynchronous update, where does focus go
```

A control that cannot be reached by Tab is a defect regardless of what a
scanner says, and a control with no visible focus is unusable even when it is
reachable.

## 4. Structure and semantics

```
one main landmark, and content that lives inside landmarks
headings that describe the structure, in order, no level skipped for styling
lists marked up as lists, tables as tables with headers
buttons that are buttons and links that are links, by behaviour and by element
every image: meaningful alternative text, or empty alt when decorative
every control: an accessible name that matches its visible label
language declared on the document, and on any passage in another language
page title unique and descriptive per view
```

The button and link rule is not pedantry: a link that acts as a button cannot
be activated with Space, and a div that acts as a button cannot be activated
at all.

## 5. Forms

```
every field has a programmatically associated label, not a placeholder
required fields are marked in the accessible name, not only in colour
errors are associated with their field
errors are announced when they appear, not only rendered
focus moves to the first invalid field, or to a summary that links to it
the field keeps its value after a failed submit
instructions and format requirements are available before the error, not after
grouped controls have a group name, radio sets included
```

## 6. Dynamic content

```
dialog          focus moves in, is trapped while open, returns to the trigger
                on close, and the background is inert
menu            opens, is navigable by arrow keys, closes on Escape
tabs            arrow keys move between tabs, the panel is associated
accordion       state is exposed, not implied by an icon
toast or alert  announced through a live region, with a duration a person can
                actually read, and reachable if it carries an action
async update    the user learns that content changed, without a visual scan
infinite scroll there is a keyboard path to what lies beyond the scroll
```

## 7. Visual and physical

```
contrast: text against its actual background, in both themes, including
  disabled states, placeholder text and text over images
information never carried by colour alone
zoom to 200 percent: nothing lost, nothing overlapping
reflow at 320 CSS pixels wide: no horizontal scrolling of the page
line spacing and letter spacing overrides do not clip content
target size adequate for touch, with adequate spacing
motion respects the reduced motion preference, and nothing flashes rapidly
content that moves or auto-advances can be paused
```

## 8. Assistive technology

Use one screen reader on the critical flow. Which one is a project decision;
the point is that a real one is used at least once.

```
does the page announce what it is, on arrival
are landmarks and headings usable for navigation
does every control announce its role, name and state
do errors and status messages reach the user
is anything announced twice, or announced as unlabelled
can the whole critical flow be completed
```

If no screen reader is available in the environment, say so in the report and
do not imply the pass happened.

## 9. Reporting a finding

```
ID          A11Y-07
Criterion   WCAG 2.2, 2.4.3 Focus Order, level A
Location    /teams/{id}/members, invitation dialog
Barrier     focus returns to the top of the page after the dialog closes
Who         keyboard and screen reader users
Effect      the user must Tab through 24 elements to resume the task
Evidence    keyboard-pass recording, step 14
Fix         return focus to the triggering button on close
Severity    High: the flow is completable but hostile
```

Severity is about the barrier, not about the effort to fix. Blocking means the
task cannot be completed by that user at all.

## 10. Verifying a remediation

A finding is closed by a measured outcome, not by a quieter scanner. When a fix
comes back, the verify loop in `resources/verify-loop.md` runs on the rendered
interface, re-mounting before each check:

```
1  barrier check    the barrier the finding named is gone, checked as the
                    person meets it
2  universal layer  focus visible, target size, reflow at 320 pixels, reduced
                    motion, on every remediated surface whatever the finding was
3  preservation     nothing that worked before was lost
4  scanner          last, reconciled with the three above
```

Each remediated finding ends as fixed, scanner gamed, regression, not fixed, or
escalated. A clean scan with a failing barrier check after a change is scanner
gaming: `alt=""` on an informative image, a generic name, a role with no
keyboard behaviour, ARIA roles over a div instead of the native element. The
report gives the scanner-clean rate and the fixed rate side by side; the gap
between them is the progress that would ship without helping anyone.

The checks that grade a fix are written before it, are proven able to fail (on
the unremediated surface and on a known gaming fix) and able to pass (on a
correct fix), and are not edited by whoever makes the fix. A check that cannot
fail measures nothing.

Where the right fix depends on intent (does this image inform or decorate,
should this widget become a native element) and the source does not settle it,
the finding is escalated to a person with the question, not resolved by a
guess that satisfies the scanner.

Every report states its limits: the engines used, whether a real screen reader
was used and on what, what was not measured, and the sample covered.

## 11. Prohibitions

- Never report an automated scan as an accessibility test.
- Never claim a screen reader pass that was not performed.
- Never accept a positive scan on a page whose controls cannot be reached by
  Tab.
- Never fix a name or a role only in the test, leaving the interface unchanged.
- Never add ARIA to a native element that already had the semantics.
- Never treat contrast as passing because a design token says so; measure the
  rendered pair.
- Never reduce a finding to `add aria-label` when the underlying element is
  the wrong element.
- Never close a finding because the scanner stopped reporting it; close it on
  the barrier check.
- Never grade a fix with a check that was not first seen failing.
- Never edit a check to make a remediation pass; a wrong check is corrected as
  its own change and every result it graded is re-run.
- Never report an accessibility tree read from the DOM as a screen reader pass.

## 12. Protocol

1. Establish the target and the pages in scope from the contract.
2. Run the keyboard pass on each critical flow, recording every step.
3. Check structure and semantics on each page in scope.
4. Check forms, including the error path, which is where most defects are.
5. Exercise every dynamic component in the flow.
6. Check contrast, zoom, reflow, motion and target size.
7. Run the assistive technology pass on the critical flow, or record that it
   could not be run.
8. Run the automated scan last and reconcile it with what was found manually.
9. Map every finding to a criterion, a barrier and a person.
10. Hand the reproducible ones to `playwright-automation` so they become
    permanent keyboard and focus tests, committed and seen failing before the
    fix they guard.
11. When remediations return, run the verify loop of section 10 on each, and
    report every finding's outcome class, the scanner-clean and fixed rates
    side by side, the escalations, and the limits.

## 13. Auto-critique

Score from 0 to 5: keyboard pass actually performed on the whole flow, focus
management verified on dynamic components, forms and error announcement
covered, contrast measured on rendered pairs, reflow and zoom checked,
assistive technology used or its absence stated, findings mapped to criteria
and to a human consequence, remediations verified by barrier check rather than
by scan, checks proven able to fail, limits stated.

Threshold: no axis below 3, average at least 4. A campaign whose accessibility
evidence is a scanner report scores 0 and is rerun, and so does a remediation
closed on a clean scan alone.

## 14. Interfaces

- Upstream: `quality-engineering` for the target and the scope,
  `ui-ux-engineering` for what the interface was specified to be.
- Lateral: `playwright-automation` to automate keyboard and focus checks,
  `exploratory-testing` for the flows worth checking first.
- Downstream: `accessibility-remediation` for working down the findings,
  carried out with `frontend-engineering`, whose result comes back through the
  verify loop of section 10; `test-reporting` for the findings,
  `technical-documentation` for the accessibility statement.
