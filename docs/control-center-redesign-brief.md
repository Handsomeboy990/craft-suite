# Control Center redesign: working agreement

Date: 2026-10-22. Owner: Lauret Chacha. Status: proposed, awaiting the owner's
confirmation. Once confirmed it governs the redesign; a later change is
recorded here with its date and reason.

## Objective

Rebuild the local Control Center so that every screen answers one of four
decisions the owner takes, with the number that informs it and the action it
suggests, in a dense, sober operations interface, without adding a dependency
and without ever showing a figure the local files do not support.

## What exists, and what stays

The current Control Center was inspected on 2026-10-22: `control-center/`,
`documentation/control-center.md`, `docs/control-center-evolution.md`, a
browser pass over its ten tabs, and its test suites.

| Part | State | Kept |
|---|---|---|
| `reader.py`: local transcripts, installed skills and agents, configuration; standard library only | works; 74 tests pass | yes, extended |
| `advisor.py`: per-session findings and a score | works; 37 tests pass; the score is 100 minus finding penalties averaged across sessions, so 99 means "few findings", not "efficient" | findings kept, score replaced |
| `server.py`: loopback only, read only, one derived-data clear route | works | yes |
| `app.html`: ten tabs, no console error | generic layout, centred and narrow, volumes without actions | replaced |
| Agent dispatches | 330 of 351 shown as "default" because the model is read from the dispatch call, not from what ran | fixed |

Existing behaviour that must not regress: loopback only, read only, nothing
leaves the machine, no third-party dependency, no fabricated metric, an empty
state shown as empty rather than as zero, English and French, light and dark.

## The four decisions, and what each screen must answer

| Decision | The question the screen answers | Evidence it uses |
|---|---|---|
| Reduce consumption | where do tokens and money go, and which repeated waste is worth fixing first | usage per session, project, model and day; the advisor's findings ranked by tokens or cost at stake, each with its action |
| Choose models | which model really served each session and each agent, and did each dispatch follow the tier rule of `model-routing` | the model recorded in each subagent's own transcript; the agent's tier rule from `agent-tiers.md` |
| Clean the suite | which skills and agents are used, which never are, and how the installation differs from the repository | invocations and dispatches from the transcripts; the installed directories; the repository's own trees when it is found |
| Follow projects | which projects are active, how much work and cost each takes, and when each was last worked on | the transcripts' working directory and timestamps |

A screen that serves none of these is cut. Every figure states its source on
hover or in a note; every recommendation states the evidence and the expected
saving where one can be computed.

## Cost

Shown in tokens and in US dollars side by side. The price per model and per
token kind (input, cache write, cache read, output) is read from a `pricing`
section of the suite configuration, each entry with its source and the date it
was read. It is pre-filled from the provider's official pricing page, consulted
on the day of implementation. A model with no configured price shows tokens
only and says the price is missing; no cost is ever estimated without a
configured price.

## Design

Dense and sober: full width, a technical typeface for figures, numbers aligned
in tables, colour reserved for meaning (a warning, a saving, a failed rule),
few cards, keyboard operable, both themes, the reduced-motion preference
honoured, and the contrast minimum met. The design pass follows
`ui-ux-engineering` and `design-authenticity`, and the result is checked in a
real browser at 1440 and 1024 pixels.

## Deliverables

- A rebuilt `app.html`, organised by the four decisions plus a sources and
  privacy page.
- `reader.py` extended: the real model of every subagent, per-model and
  per-token-kind usage, skill and agent usage against what is installed, the
  repository's trees when found.
- `advisor.py` reworked: findings ranked by tokens and cost at stake, each with
  its action; the single 0 to 100 score removed.
- A `pricing` configuration section, documented in `config/README.md`.
- Tests for every new reading and every new finding; the existing suites still
  pass.
- `documentation/control-center.md` and its French twin updated, and a short
  record of the redesign in `docs/control-center-evolution.md`.

## Definition of done

- Each of the four decisions has a screen that answers its question from real
  local data, verified against the transcripts on this machine.
- No agent dispatch is shown as "default" when its subagent transcript records
  the model.
- Costs appear only for models with a configured price, with the price's
  source and date visible.
- All test suites pass, including the new ones, and the six repository
  scripts pass.
- A browser pass at 1440 and 1024 pixels, light and dark, shows no console
  error, no horizontal scroll, legible figures, and keyboard access to every
  control.
- The owner has used it and confirmed it answers the four questions.

## Out of scope

- Sending any data anywhere, accounts, or remote access.
- A build step or a third-party dependency, in Python or in the page.
- Editing transcripts, the configuration or the installation from the
  interface, beyond the existing clear-derived-data action.
- Real-time streaming; a refresh on demand is enough.

## Assumptions, decided without an explicit answer

- The single reader is the owner, on this machine. Default: yes.
- The interface keeps English and French. Default: yes.
- The terminal report (`install.sh --report`) is kept and follows the same
  four decisions. Default: yes.
- "Choose models" compares each dispatch with the tier rule of
  `agent-tiers.md` by agent name only; it cannot see a slice's complexity
  classification, and says so on screen.

## Next steps

1. The owner confirms this agreement, or corrects it.
2. A design and data specification, with screen layouts, presented for approval
   before any code.
3. The build, behind its tests, then the browser pass and the owner's own use.
