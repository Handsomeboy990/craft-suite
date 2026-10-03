# accessibility-testing

Verifies that the product can be operated without a mouse, with assistive
technology and at reduced vision. Keyboard first, automated scan last.

- Inputs: the accessibility target, the pages and flows in scope, the running
  interface.
- Outputs: accessibility findings mapped to criteria, keyboard report,
  criteria coverage, remediation list.
- Depends on: engineering-core, quality-engineering.
- Lateral: playwright-automation, ui-ux-engineering, exploratory-testing.
- Downstream: accessibility-remediation, frontend-engineering, test-reporting,
  technical-documentation.

The scan runs last so the session is not anchored on what a tool can find.
A remediation is verified by the barrier check, a universal regression layer
and preservation before the scan, with checks proven able to fail; the loop is
in `resources/verify-loop.md`.
Every finding names the criterion, the barrier, and the person who hits it.
