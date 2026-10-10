# Example: an identity for a fictional repair co-op

**Fictional client.** Tidewell Cycle Co-op does not exist. Its brief, its
answers, its people and its town are invented for this example and labelled
as such. Everything else is real: the two typefaces and their licences were
read at their sources on 2026-10-10, and every contrast ratio below is the
output of `contrast-run/contrast.py`, run on the pair files beside it.

## The brief, and what it did not say

The brief, as received: "We fix bikes. We need a logo and a website. Make it
look professional." It named no audience, no promise and no constraint, so
nothing visual was decided. One batch of questions went out, per
`resources/brief-intake.md`. The answers, quoted from the fictional client:

```
1 who        "People who ride to work and can't be without the bike for a
             week. A lot of them are older. Some have never had a bike
             serviced before."
2 promise    "Same-day repair if it's in by ten, and we show you what we
             did and why."
3 instead    "The chain store at the retail park. Cheap, but you wait ten
             days and nobody explains anything."
4 keep       "The name. Nothing else, we never had a logo."
5 elsewhere  "A sign over the door, a stamp for the receipts, maybe a
             T-shirt."
6 languages  "English."
7 budget     "Nothing for fonts or photos."
8 accepts    "Mara, she's the co-op's secretary." (fictional)
```

Answer 3 names no brand, and none was looked up: the distance reference is
the client's description, not a researched competitor. Answer 7 limits every
font and image to free licences, read at the source.

## Positioning and personality

```
positioning   For commuters who cannot be without their bike, Tidewell is
              the repair workshop that has it back the same day and shows
              you what was done, because the work is explained at the
              counter, not hidden on an invoice.            (answers 1, 2)

traits        plain spoken, not casual       (2: "show you what we did")
              steady, not slow               (2: same day)
              warm, not cute                 (1: first-time customers)
              legible first, not decorative  (1: older riders)
```

"Legible first" was the trait that decided most of what follows.

## Moodboard record

| Id | Reference | Where | Author or owner | Licence or terms, as stated at the source | Checked | Principle taken | Not taken | Kind |
|---|---|---|---|---|---|---|---|---|
| R1 | the co-op's own workshop photographs (fictional) | supplied by the client | Tidewell Cycle Co-op (fictional) | written permission from the co-op, in the intake record (fictional) | 2026-10-10 | daylight, hands at work, the part being explained | nothing excluded | direction |
| R2 | Atkinson Hyperlegible, specimen and repository | https://github.com/googlefonts/atkinson-hyperlegible | Braille Institute of America | "licensed under the SIL Open Font License, Version 1.1" (OFL.txt) | 2026-10-10 | letterforms told apart at low vision: the trait "legible first" | nothing excluded | direction |
| R3 | Source Serif, repository | https://github.com/adobe-fonts/source-serif | Adobe | "licensed under the SIL Open Font License, Version 1.1", with Reserved Font Name "Source" (LICENSE.md) | 2026-10-10 | a sturdy text serif for headings: the trait "warm" | nothing excluded | direction |
| R4 | a printed tide table, as a layout reference (fictional) | https://example.org/tide-table (fictional) | the fictional harbour office | not found | 2026-10-10 | dense, tabular, read at a glance | the image itself: linked only, never reproduced | direction |
| R5 | the chain store at the retail park | the client's answer 3 | not named by the client | not applicable, no image used | 2026-10-10 | none | the discount look: saturated red and yellow, price as the headline, a wait nobody explains | distance |

R4 has no licence found, so it appears on the board as a link and nowhere as
an image. R5 is a description, so it carries no image at all.

## Logo brief

```
must        read at 16px as a favicon; work in one colour as a rubber stamp
            on receipts and over the door; be embroidered on a T-shirt
            (answer 5), so no hairlines and no gradients
must not    a bicycle silhouette or a gear, the two category defaults;
            anything resembling R5
variants    primary (wordmark and mark), mark only, one colour, reversed
clear space the cap height of the wordmark's T, on every side
min size    mark only: 16px on screen, 8mm in print; wordmark: 96px wide,
            25mm in print; each to be checked by rendering once a mark
            exists, not asserted now
grounds     tide on paper (6.49:1) and ink on paper (14.35:1) in light;
            tide on night (9.35:1) and ink on night (14.93:1) in dark; all
            above the house rule of 3:1, from the measured table below
misuse      stretched, recoloured outside the palette, outlined, shadowed,
            rotated, set in another typeface, placed on a photograph
            without the reversed version, clear space cropped
```

## Palette, measured

Roles first: paper and paper-raised as grounds, ink and ink-muted, tide as
the action colour, rust as the warm accent, focus, control-edge. The dark
theme was chosen separately: night is not black, and tide was re-chosen
lighter for a dark ground rather than inverted.

Round 1, `python3 contrast.py pairs-round1.csv`, exit status 1. The one
failing row, as printed (full output in `contrast-run/output-round1.txt`):

```
| light | rust #C4512B | paper #F7F4EE | text | 4.19:1 | FAIL | fail |

1 pair(s) below the AA threshold of their use.
```

Rust at 4.19:1 passes large text (3:1) and fails body text (4.5:1). Both exits
were taken and recorded: rust `#C4512B` is restricted to large text and
graphics in the light theme, and a companion `rust-text #A8431F` was added for
any rust text at body size. The companion created two new pairs, so the whole
table was measured again.

Round 2, `python3 contrast.py pairs-round2.csv`, exit status 0, pasted
unchanged from `contrast-run/output-round2.txt`:

| Theme | Foreground | Background | Use | Ratio | AA | AAA |
|---|---|---|---|---|---|---|
| light | ink #1F2421 | paper #F7F4EE | text | 14.35:1 | pass | pass |
| light | ink #1F2421 | paper-raised #EDE7DC | text | 12.80:1 | pass | pass |
| light | ink-muted #545C57 | paper #F7F4EE | text | 6.28:1 | pass | fail |
| light | ink-muted #545C57 | paper-raised #EDE7DC | text | 5.60:1 | pass | fail |
| light | on-tide #FFFFFF | tide #1E5F74 | text | 7.13:1 | pass | pass |
| light | tide #1E5F74 | paper #F7F4EE | text | 6.49:1 | pass | fail |
| light | rust-text #A8431F | paper #F7F4EE | text | 5.48:1 | pass | fail |
| light | rust-text #A8431F | paper-raised #EDE7DC | text | 4.89:1 | pass | fail |
| light | rust #C4512B | paper #F7F4EE | large-text | 4.19:1 | pass | fail |
| light | control-edge #7D857F | paper #F7F4EE | non-text | 3.45:1 | pass | n/a |
| light | focus #1E5F74 | paper #F7F4EE | non-text | 6.49:1 | pass | n/a |
| dark | ink #ECE8E0 | night #121614 | text | 14.93:1 | pass | pass |
| dark | ink #ECE8E0 | night-raised #1C221F | text | 13.24:1 | pass | pass |
| dark | ink-muted #A9B0AA | night #121614 | text | 8.23:1 | pass | pass |
| dark | ink-muted #A9B0AA | night-raised #1C221F | text | 7.30:1 | pass | pass |
| dark | on-tide #121614 | tide #7FC4D6 | text | 9.35:1 | pass | pass |
| dark | tide #7FC4D6 | night #121614 | text | 9.35:1 | pass | pass |
| dark | rust #E8875F | night #121614 | text | 7.00:1 | pass | pass |
| dark | control-edge #6E7771 | night #121614 | non-text | 3.94:1 | pass | n/a |
| dark | focus #7FC4D6 | night #121614 | non-text | 9.35:1 | pass | n/a |

0 pair(s) below the AA threshold of their use.

Before either round, the script was checked on the two known values in
`resources/palette-contrast.md`: it returned 21.0 for black on white and
4.542 for `#767676` on white.

Not measured, because the charter forbids the combination: rust on
paper-raised in the light theme, and any text on rust.

## Type

```
body        Atkinson Hyperlegible, SIL OFL 1.1, read at the source 2026-10-10
            (R2); argued from "legible first"
display     Source Serif, SIL OFL 1.1 with Reserved Font Name "Source", read
            at the source 2026-10-10 (R3); argued from "warm". Whether a
            subset served from the site counts as a modified version under
            the reserved name is handed to font-loading before any
            subsetting
scale       base 1.125rem (18px) for older readers, ratio 1.25:
            1.125, 1.406, 1.758, 2.197, 2.747 rem; line height 1.6 for body,
            1.2 from the third step up
weights     400 and 700 for body, 600 for display
floor       1rem on screen; 9pt in print
fallback    system-ui stack for body, Georgia then serif for display
coverage    not checked in this draft, see the sign-off below
```

## Imagery, icons, voice

```
photography  the co-op's own photographs only (R1): daylight, hands, the part
             being explained; never a stock photograph presented as the
             workshop or its people
icons        one open-licence outline family with a 24px grid and a 1.5px
             stroke, chosen and its licence read at the source by the
             ui-ux-engineer agent before sign-off; every icon has a text
             label
voice        plain spoken: "Your rear brake pads were worn to the metal. We
             replaced them." Not: "Brakes sorted, you're good to go!"
             Never said: any claim of a guarantee the co-op has not stated
             in writing. The full editorial line is the next step if the
             co-op starts publishing regularly.
```

## Drafting path

No canvas was used for this example. The identity lives in the repository
path, per section 11 of the skill: the charter as a document and a token file
beside it, with the moodboard as the table above.

## Sign-off, round 1

```
SIGN-OFF   Tidewell (fictional), charter v1, tokens v1, 2026-10-10

Drafted by        ui-ux-engineer (palette, type, tokens),
                  design-research (moodboard)
Signed off by     design-director
Client accepts    not yet asked; follows the design-director sign-off
Contrast output   contrast-run/output-round2.txt, exit 0
Open questions    icon family not chosen (blocking)
                  Source Serif subsetting under the reserved name
                  (not blocking: the full file can be served meanwhile)

Verdict           refused
If refused        4.2: coverage of the copy's characters was asserted from
                  the typefaces' names, not checked against the font files.
                  Check it, with the characters the site will use (including
                  the pound sign and typographic quotes), and quote the
                  result.
                  5.3: no icon family is chosen, so no licence was read.
```

The refusal names two sections and the decision each still owes. No token
has gone to `design-system`. The second round, with the coverage check
quoted and the icon licence read, is not shown here; until it exists, the
identity is a draft and says so on its cover.

## What the example shows

- An unanswered brief stopped the work at the first step, and one grouped
  batch of questions restarted it.
- No competitor was researched or named; the distance reference is the
  client's own words.
- Every licence is quoted from its source with a date, and the one reference
  without a licence is linked, never reproduced.
- Every ratio is the script's output. The failing pair was fixed by both
  allowed exits and the whole table measured again.
- The drafter did not sign off, and the sign-off refused on an assertion that
  was not a measurement.
