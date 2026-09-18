# Delivery demonstration: a link shortener

This is one real run of the fourteen delivery phases from
`engineering/delivery-skills/delivery-orchestrator/resources/delivery-phases.md`,
on a small application: a link shortener. It exists so the delivery process is
visible as artefacts, the way `writing/examples/` shows a finished saga.

The project is deliberately small, so the sizing rule applies: phases 01 to 06
fit on about a page, phase 07 carries the bulk, phases 08 to 14 fit on about a
page, and no phase is removed. The four approval gates (02, 05, 10, 14) are
shown as explicit stops with a recorded answer.

| File | Phases |
|---|---|
| [01-06-specification-and-architecture.md](01-06-specification-and-architecture.md) | requirements, clarification (gate), technology, architecture, validation (gate), delivery plan |
| [07-implementation.md](07-implementation.md) | implementation, task by task through the engineering suite |
| [08-14-verification-and-release.md](08-14-verification-and-release.md) | integration, devops, deployment (gate), production verification, documentation, handover, release (gate) |

## The application, in one sentence

A visitor pastes a long URL and gets a short link; opening the short link
redirects to the original and counts the hit. No accounts in this version.

## What the run is, and is not

It is the deliverable each phase produces, at the size this project justifies,
including the phases that end in `not applicable` with a written reason. It is
not runnable source: the artefacts describe the decisions and the verification,
which is what a worked example of a process preserves.
