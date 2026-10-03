# accessibility-remediation

Works down an accessibility audit: triage of the findings, a decision rule per
barrier family written from WCAG 2.2, native elements before ARIA, intent
questions escalated to a person rather than guessed, and every change handed
back to the verify loop of `accessibility-testing`, which alone closes a
finding.

- Inputs: findings from `accessibility-testing`, the target, checks proven
  able to fail and fingerprinted by the verifier, the source of intent.
- Outputs: triage plan, remediation record, escalation list, the hand-back to
  verification.
- Depends on: engineering-core, accessibility-testing, frontend-engineering.
- Lateral: design-system, ui-ux-engineering, internationalization.
- Downstream: accessibility-testing for verification, playwright-automation,
  test-reporting, code-review-protocol.

Resources: `resources/barrier-family-rules.md` holds the fix and the refused
gaming change for each family; `resources/remediation-record.md` the triage,
escalation and record templates. The example remediates one booking form from
the scanner report and by these rules, measured through the verify loop:
scanner-clean 100 percent against fixed 22 percent for the first, fixed 78
percent with two escalations, then 100 percent once they were answered, for
the second. `examples/booking-form-run/` reproduces it.

The fixer and the verifier are different agents: `frontend-engineer` carries
this skill, and no agent both fixes a finding and verifies it.
