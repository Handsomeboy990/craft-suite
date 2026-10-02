# ADR 0005: an accessibility remediation skill, no new agent

Date: 2026-10-02
Status: proposed
Supersedes: none

Roadmap item 8.4, second task. The owner accepts or rejects this record; until
then nothing it describes is acted on. It runs the `technology-selection` order,
question 1 first (is anything new required at all, or does something existing
already do this), on the evidence recorded in
`docs/architecture/SECURITY_REFERENCES.md`. This record builds nothing: a yes
is a later, count-changing change with its own review.

## Context

The roadmap asks whether the suite gains a remediation skill and agent that fix
an accessibility surface and verify that the fix helped people using assistive
technology, not merely that it silenced a scanner.

What the suite has today, read in this session:

- `accessibility-testing` (`engineering/dev-skills/`) finds barriers: keyboard
  first, scan last, findings mapped to a criterion, a barrier and a person.
  As of the change that adds this record (version 1.1.0) it also verifies a
  remediation: the verify loop in `resources/verify-loop.md`, outcome classes
  (fixed, scanner gamed, regression, not fixed, escalated), checks proven able
  to fail, and checks held apart from the fix.
- `frontend-engineering` is the named downstream for remediation. It builds
  pages and components with accessibility applied while building; it has no
  procedure for working down an existing audit report, and no decision rules
  per barrier family for fixing a surface someone else built.
- `ui-ux-engineering` and `design-system` set targets and tokens; neither fixes
  an audited surface.
- Agents: `frontend-engineer` implements client work and applies accessibility
  while building; `ui-ux-engineer` sets measured accessibility targets;
  `design-director` holds accessibility as a floor; `design-verification` and
  `compliance-verifier` verify with `accessibility-testing`. None owns remediation of an
  audited surface, and none needs to own verification of it, which
  `accessibility-testing` already carries.

What `curb` measured, read first-hand (`Handsomeboy990/curb`, no licence file,
patterns only):

- On twelve seeded components, the scanner fix rate was 100 percent for a
  single direct prompt and for the six-level agent alike; the verified fix rate
  was 66.7 percent against 91.7 percent. Every real difference lived in checks
  the scanner cannot run.
- The gain is attributed, level by level, mostly to two mechanisms: written
  decision rules per barrier family (where the rules were specific, the agent
  was right) and the verify loop that made those rules stick. The loop alone
  confirmed suspicions; it did not discover new ones.
- The one failure no level fixed, a custom select given listbox roles, was
  fixed by a person in minutes by replacing it with a native element. The
  rules had said only "prefer a native element".
- Its integrity boundary keeps the fixer from seeing or editing the checks that
  grade it. Its stated lesson: an agent that verifies its own work against a
  tool inherits the tool's blind spots and grows more confident, not more
  correct.

Forces:

- The verify half of the capability now exists in `accessibility-testing`. The
  missing half is the remediation procedure: triage of an audit report, the
  decision rule per barrier family, native element before ARIA, the intent
  questions that must be escalated rather than guessed, and the hand-back to
  verification.
- A new skill is not free: it changes the skill count (168), touches the count
  table in `AGENTS.md` and `README.md`, `tests/validate-counts.sh`, the
  category index of `engineering/dev-skills`, the routing in `AGENTS.md` and
  `engineering-orchestrator`, the `--dev` plugin bundle, and the skills list of
  at least one agent.
- A new agent costs as much again (33 agents, `agents/` index, model routing,
  plugin agents) and must not duplicate a role that already exists.
- The request that would route to it is real and distinct: "here is an audit
  with dozens of violations and a deadline", now common for teams selling into
  the European Union since the European Accessibility Act applied in June 2025.

## Options

1. **A remediation skill and a dedicated agent** (for example an
   accessibility engineer that fixes and verifies).
   Cost: two count changes, a new routing row, model routing for the agent.
   Rejected for the agent half. An agent that both fixes and verifies its own
   fix is exactly the arrangement `curb`'s integrity boundary exists to prevent,
   and the suite already separates the fixer (`frontend-engineer`) from the
   verifiers (`design-verification` and `compliance-verifier`, both of which
   name `accessibility-testing` among their skills). A third role that merges them weakens a boundary
   for no capability gained.
2. **A remediation skill, no new agent.** A skill in `engineering/dev-skills`
   (working name `accessibility-remediation`) that turns `accessibility-testing`
   findings into fixes, by barrier family, native element first, with an
   explicit escalation list for intent, and hands every fix back to the verify
   loop of `accessibility-testing`. `frontend-engineer` gains it in its skills
   list; verification stays with the existing verifying agents.
   Cost: one count change (168 to 169) and its dependents, one routing row, one
   line in an existing agent. The skill must ship with a worked example
   measured through the verify loop, so its own claim is a measurement.
3. **No new skill: put the remediation rules in a resource of
   `frontend-engineering` or of `accessibility-testing`.**
   Cost: none in counts. Rejected because neither home fits.
   `frontend-engineering` is loaded for every component build; a remediation
   playbook inside it is not routed when the request is "fix this audit", and
   the routing table is how the suite finds procedures. Inside
   `accessibility-testing` it would put the fixer's rules in the verifier's
   skill, the merge option 1 was rejected for, one level down.
4. **A bare no.** Record that the verify loop now in `accessibility-testing`
   is enough.
   Cost: the part of `curb`'s gain that came from decision rules is left out,
   and the remediation of an audited surface stays an unrouted improvisation
   by `frontend-engineering`. `curb`'s own baseline shows what that looks
   like: a third of apparent fixes gamed the scanner.

## Decision

Option 2, proposed: the suite gains an accessibility remediation skill and no
new agent. Deciding criterion: fit with the suite's roles. The capability
`curb` measured is two halves, rules that fix and a loop that verifies; the
verifying half belongs to the skill that already verifies, and the fixing half
needs its own routable procedure, carried by the agent that already fixes.

What the later change must hold to, so that a yes does not weaken a gate:

- the skill depends on `accessibility-testing` and never closes a finding
  itself; closure is the verify loop's outcome class "fixed";
- the decision rules are written per barrier family from WCAG 2.2 and the
  suite's own criteria map, in original wording; nothing is taken from `curb`;
- the escalation list (image intent, native replacement of a custom widget,
  essential timing or motion) is explicit, and an escalation is a valid
  outcome;
- native elements before ARIA, stated as a rule, with the custom select as the
  reason it is a rule;
- a worked example measured through the verify loop ships with the skill,
  reporting the scanner-clean and fixed rates side by side;
- `frontend-engineer` gains the skill; no agent both fixes and verifies.

Reopening trigger: a delivered project where remediation volume shows the
fixer and verifier split to be a bottleneck, or an owner decision to offer
accessibility remediation as a service with its own lead. Either reopens the
agent question through a record that supersedes this one.

## Consequences

Positive: the remediation of an audited surface gets a routed, gated procedure;
the verifier and the fixer stay separate roles; the suite's claim about
remediation will rest on a measurement, not a description.

Negative: one more skill to maintain, and the count, routing and plugin changes
that come with it. A user who expects a single "accessibility agent" finds two
roles instead; accepted, because the split is what keeps the verification
honest.

Operational: building the skill is a separate change, with its own review, the
count updates, `bash plugins/build.sh` and the six validation scripts. This
record authorises nothing beyond proposing it.

## Reversal cost

Low while proposed: nothing is built. After the skill lands, removing it means
reversing one count change and one routing row; the verify loop it relies on
lives in `accessibility-testing` and is unaffected either way.
