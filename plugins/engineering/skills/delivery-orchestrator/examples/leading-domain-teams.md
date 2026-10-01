# Example: the chief leading three teams to a date

## The brief

> Our clinic's site needs online appointment booking: patients pick a
> practitioner and a slot, get a confirmation email, and staff see the day's
> bookings in the back office. The site launches in four weeks with the new
> brand.

Phases 01 to 05 ran as `delivery-phases.md` describes. The architecture was
approved, quoted in the checklist, before anything below was dispatched. This
example starts at phase 06 and shows only what the chief does as the leader of
teams: composing them, dispatching in waves, holding the date and the gates
together.

## Composing the team

Classified with `resources/team-routing.md` section 3: a project, with a
user-facing launch. Sized medium with `task-complexity`.

```
Chief           delivery-orchestrator
Staff           delivery-manager        a four week date
                requirements-analyst    done at phase 02, released
Engineering     principal-engineer      lead, booking spans server and client
                software-architect      done at phase 04, recalled only for
                                        change control
                database-engineer       slots and bookings tables
                backend-engineer        booking endpoint, confirmation email job
                frontend-engineer       booking flow, back office day view
Design          design-director         lead, the new brand
                ui-ux-engineer          booking flow states
                design-verification     before the public page ships
Security        security-engineer       patient data, the back office surface
Quality         qa-engineer             lead
                playwright-engineer     the booking journey
Operations      devops-engineer         mail provider secrets, deployment
                release-engineer        phase 14
Documentation   documentation-engineer  phase 12, the booking section of the
                                        existing handbook
Gates           pr-author, pr-reviewer, compliance-verifier, final-verifier
```

Named as left out, with the reason:

```
codebase-cartographer   the repository is small enough to read per dispatch
checkup                 the site was built by this team last year, the map
                        in the continuity note is current
penetration-tester      no authorization was given, and none was asked for
                        to meet a launch date
performance-engineer    no measurement and no budget were stated
researcher, data-collection-engineer, web-auditor, site-template-engineer,
design-research, ci-cd-engineer, incident-responder, source-of-truth: none
of their conditions in team-routing.md section 2 is met by this brief
```

Thirty-three agents were available to a reflex. Twenty-one take part, and each
of the twelve left out has a written reason.

## The waves

```
Wave 0  read     principal-engineer      plan the slices, map the surfaces
Wave 1  write    database-engineer       migrations/ and src/db/schema.ts
        write    backend-engineer        contracts/booking.ts only
        write    design-director         tokens/brand.css only
Wave 2  write    backend-engineer        src/api/booking/**, src/jobs/mail/**
        write    frontend-engineer       src/app/book/**, src/app/admin/day/**
        write    ui-ux-engineer          specification only, no source file
Wave 3  write    backend-engineer,       README route table, CHANGELOG,
                 named integrator        package manifest and lock file
Wave 4  read     security-engineer, qa-engineer, playwright-engineer,
                 design-verification     in parallel, on the landed base
Wave 5  write    pr-author, then pr-reviewer
```

Wave 1 is three writers in parallel because their surfaces share nothing.
`backend-engineer` writes only the contract in wave 1, so wave 2 can split
server and client across it.

## The conflict that did not reach a pull request

In wave 2, both `backend-engineer` and `frontend-engineer` added a date
library. Their handoff blocks each listed the package manifest under
`Known issues`, as `parallel-dispatch.md` section 3 requires, instead of
editing it.

```
Detected   two requests for the manifest, a hot file, in one wave
Decision   one library for both, the one already approved in the stack
           decision; dependency-selection was not rerun, the stack covered it
Applied    wave 3, by the named integrator, one commit
Verified   both branches rebased on the integrator's commit, suites rerun:
           api 41 passing, web 27 passing
```

Had each agent edited the manifest, the second pull request would have
conflicted on the lock file, and the resolution would have been a guess about
which library the other side's code expected.

## The date and the gate

End of week three, `delivery-manager` reported:

```
Slippage   back office day view, 3 days, cause: the security review found
           that staff could list bookings of other clinics; the fix needs a
           tenant filter in every query of the module
Options    1 rescope: launch patient booking, ship the day view a week later;
             staff use the email confirmations meanwhile
           2 resequence: none left, the critical path is this module
           3 add time: launch on day 31
           4 add help: none, the fix is in one module and one writer
Not an option
           launching with the review finding open
```

Options 1 and 3 change what the user approved, so the chief stopped and asked
once, with the consequence of each. The user chose option 1. The scope
document and the checklist were updated through `scope-and-change-control`.

The security gate was not shortened. The tenant filter shipped with a test
that fails when one clinic can read another's bookings.

## Before anything was called done

```
code-review-protocol     review report, two blockers fixed, test run observed
production-verification  a real booking made on the deployed site, email
                         received in the clinic's test inbox
launch-readiness         compliance-verifier: ready, with the day view
                         recorded as a scheduled follow up
final-verifier           reproduced the suites, the booking, the review
                         closure; verdict done for the patient booking scope
```

Delivery verdict: `Delivered` for the approved, rescoped release, with the
day view as a named follow up. Not `Delivered` for the original scope, and the
report says so.
