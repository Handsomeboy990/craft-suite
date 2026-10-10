---
name: brand-identity
description: Turns a validated brief into a visual identity a product can be built from: positioning and personality, a logo brief with usage rules, a palette whose contrast pairs are measured in both light and dark themes against WCAG 2.2, a type scale, imagery and iconography direction, a brief tone of voice, a moodboard in which every reference carries its source and licence, and the charter document itself. Signed off by someone other than its author before its tokens go to design-system. Use when a product has no identity, or when one is asked for: a brand, a visual charter, a moodboard.
license: MIT
metadata:
  category: dev-skills
  version: 1.1.0
  depends_on: [engineering-core, design-authenticity]
  outputs: [positioning-statement, logo-brief, logo-usage-rules, measured-palette, type-scale, imagery-direction, voice-brief, moodboard-record, brand-charter, brand-tokens, sign-off-record]
---

# Brand Identity

`design-authenticity` can say where intent is missing. It cannot supply the
intent, because the identity is the project's. This skill is where the project
gets one: a set of decisions, each with its reason, written down before any
screen is judged against them.

An identity is not a logo and a colour. It is a position, a personality that
follows from the position, and the visual and verbal rules that make the
personality recognisable on every surface. Each rule exists because of
something in the brief. A rule that cannot point back to the brief is a
default that was accepted, which is exactly what `design-authenticity` exists
to catch.

## 1. What this skill owns, and what it does not

Owns:

```
positioning and personality   who it is for, what it promises, how it behaves
logo brief and usage rules    what the mark must do, clear space, minimum
                              size, variants, misuse
palette                       roles, both themes, every pair measured
type scale                    families with their licences, roles, steps
imagery and iconography       what is shown, how, and what is never shown
tone of voice, brief          the traits and their limits, enough for a
                              first page of copy
moodboard                     references with source and licence, principles
                              taken, nothing copied
the charter                   the document that holds all of the above
the token handoff             the raw values and their semantic mapping,
                              after sign-off
```

Does not own:

- The components and the token system that consumes the identity. That is
  `design-system`, which receives the tokens after sign-off and never before.
- The full editorial line: audience by format, the promise, pillars,
  vocabulary, what is never said, formats, the review rule. That belongs to
  `editorial-line`, in the documents tree, which extends the voice brief here
  and never contradicts a signed one. A conflict between the two is escalated
  to the design-director agent and the owner; neither skill settles it alone.
- The final drawn logo. This skill writes the brief a designer or the canvas
  works from, and the rules any mark must obey. A mark proposed on the canvas
  is a draft against the brief, not a deliverable by default.
- Trademark clearance. Whether a name or mark is free to use is a legal
  question for the client, flagged and never answered here.
- The sign-off. The author of an identity never signs it off. Section 12.

## 2. Inputs, and what to ask when they are missing

The input is a validated brief: `project-brief`, then `requirements-analysis`
and `clarification-gate` when the work belongs to a project. An identity built
on an unvalidated brief is a guess with a colour palette.

Three facts are required before any visual decision. Without them, stop and
ask, in one grouped batch through `clarification-gate`:

| Missing | Why it blocks | What to ask |
|---|---|---|
| Positioning | personality, palette and type all follow from it | who is it for, what does it promise them that the alternatives do not, and in one sentence why should they believe it |
| Audience | legibility, register and imagery depend on who reads | who decides, who uses, their age range and context of use, the languages and scripts they read |
| Constraints | they remove options before taste does | existing assets to keep, a regulated sector, print as well as screen, budget for font and image licences, deadline, accessibility target if stricter than AA |

The full question set, with what may proceed on a recorded assumption and what
may not, is `resources/brief-intake.md`.

What is never invented, at any point:

- a client fact: history, founding date, team, values, awards, customers;
- a competitor, or a claim about one. Competitors come from the client or
  from `competitive-analysis` with live sources;
- a market figure of any kind;
- a licence. A font, image or icon set whose licence was not read at its
  source is recorded as unknown and is not used in delivered material.

A missing fact becomes a question or a visible placeholder in the charter,
never a plausible sentence.

## 3. Positioning and personality

```
positioning     for <audience> who <need>, <name> is the <frame of reference>
                that <promise>, because <reason to believe>
                every term taken from the brief, quoted or cited
personality     three to five traits, each written as "this, not that",
                where the "not that" is the near miss a default would land on
                    warm, not cute
                    precise, not cold
                    plain spoken, not casual
evidence        for each trait, the line of the brief that justifies it
```

The traits are the test every later rule is held to. A colour, a typeface, a
photograph is kept when it can be argued from a trait, and replaced when it can
only be argued from taste.

## 4. Logo brief and usage rules

The brief states what the mark must do, not what it must look like:

```
must            the jobs: read at favicon size, work in one colour, survive
                a stamp or an embroidery if the brief has physical goods
must not        the near misses: the category cliche, any resemblance to a
                reference brand in the moodboard
variants        primary, horizontal or stacked, mark only, one colour,
                reversed, each with the surface it is for
```

Usage rules, which hold for whatever mark is chosen:

| Rule | How it is stated |
|---|---|
| Clear space | in units of an element of the mark, for example the cap height of the wordmark, never in pixels alone |
| Minimum size | in pixels for screen and millimetres for print, checked by rendering the mark at that size, not by assertion |
| Colour versions | which palette colours, on which grounds, in each theme |
| Grounds | the permitted backgrounds, each measured against the mark, section 5 |
| Misuse | a list with an example of each: stretched, recoloured outside the palette, effects added, rotated, outlined, rebuilt in another typeface, placed on a busy image without the reversed version, clear space cropped |

Text that is part of a logo is exempt from WCAG 2.2 SC 1.4.3. The charter
still measures the mark against each permitted ground and records it, and
treats a ground below 3:1 as refused. That 3:1 is a house rule, labelled as
such, not a claim about the standard.

## 5. Palette and measured contrast

Colours are chosen by role, then by hue. A palette is a set of jobs: ground,
raised ground, ink, muted ink, action, the colour on action, focus, a control
edge, the brand accents, and the states that need their own colour.

Both themes are defined completely. Dark is designed, not derived by inverting
light, because an inverted brand accent is usually a different colour with a
different meaning.

Every pair that will carry text or a meaningful graphic is measured, in each
theme, and the ratio is computed, never typed:

| Use | WCAG 2.2 | Minimum |
|---|---|---|
| body text | SC 1.4.3, AA | 4.5:1 |
| large text, at least 24px, or 18.66px bold | SC 1.4.3, AA | 3:1 |
| control boundary, focus indicator, meaningful graphic | SC 1.4.11, AA | 3:1 |
| body text, enhanced | SC 1.4.6, AAA | 7:1 |
| large text, enhanced | SC 1.4.6, AAA | 4.5:1 |

The ratio is compared unrounded: 4.499:1 fails 4.5:1. A pair below its
threshold is either restricted to a use whose threshold it meets, or given a
companion colour for the failing use. Both are recorded. Colour is never the
only carrier of meaning (SC 1.4.1), so a status colour comes with a text or a
shape.

The procedure, the formula, the pair table template and a reference script are
`resources/palette-contrast.md`. A ratio in the charter is the output of that
script or of an equivalent measurement, quoted; a ratio nobody computed is
removed.

## 6. Type scale

```
families        one or two, each with its licence read at the source:
                web embedding, self-hosting, and document embedding if the
                charter or other PDFs carry it
coverage        every script and character the audience reads, checked
                against the font, not assumed from its name
roles           display, heading, body, small print, numerals if they matter
scale           a stated ratio and base, the steps listed, with line height
                per step
weights         the few actually used, and what each is for
floor           the smallest size body text may take on screen and in print
fallback        the system stack that holds the layout while the font loads
```

A default typeface is allowed when it is argued from a trait. Geist with no
reason is the tell `design-authenticity` names; Geist with a reason is a
decision. Loading and metric-matched fallbacks belong to `font-loading`
downstream.

## 7. Imagery and iconography

```
photography     subjects, light, framing, colour treatment, the people shown
                and how, and what is never shown
illustration    whether there is any, its style, and who may produce it
icons           one family, one stroke and grid, its licence, sizes, and the
                rule for an icon without a label
alt text        the principle: what the image is for, not what it contains
truthfulness    an image presented as the client's people, premises or
                product is of the client's people, premises or product;
                a generated or stock image is never passed off as one
```

The last line is not taste. A stock photograph captioned as the team is the
same defect as an invented testimonial, and it goes to
`implementation-integrity` as one.

## 8. Tone of voice, brief

Enough for the first page of copy, and no more:

```
traits          the personality traits as they apply to words, each with
                one sentence that does it and one that does not
register        how the audience is addressed, in each output language
words           a short list used, a short list avoided, with the reason
never said      claims the brand does not make, the first being any claim
                it cannot prove
```

The full editorial line is downstream, section 1: `editorial-line`. The brief
names it as the next step when the project has a content programme, and a
change the line asks of the voice comes back here for a new sign-off.

## 9. Moodboard

A moodboard is a record of direction, not a collage of other people's work.
Each reference carries:

```
id, what it is, where it lives (URL or location), its author or owner,
its licence or terms as stated at the source, the date it was checked,
the principle taken from it, and what is explicitly not taken
```

Rules:

- A reference with no source is removed.
- A reference whose licence was not found is recorded as unknown, used for
  direction only, and linked rather than reproduced in anything shared.
- Nothing is copied from a reference brand: no palette lifted whole, no mark
  derived from another mark, no layout cloned. A reference in the client's own
  market is recorded as a distance reference, with what the identity must
  differ from.
- The principle is stated in the abstract, as the design-research agent does:
  reference, inspiration, pattern and implementation kept apart.

The record template is `resources/moodboard-record.md`.

## 10. The charter

The charter is the document that holds sections 3 to 9, in the order a reader
applies them, with every measured ratio quoted and every licence cited. Its
outline is `resources/charter-outline.md`.

When the charter is delivered as a document, a PDF, a printed guide, a shared
file, `document-core` governs its delivery: its eight point gate, eleven when
paginated, with `document-design` for the layout and `pdf-production` for the
render. When it lives in the repository beside the tokens, it is technical
documentation of the product and is reviewed with the code.

## 11. Where the identity is drafted

No vendor tool is required. Three paths, in order of preference when available:

```
canvas          the identity board, the moodboard and a first prototype
                drafted on the Claude Design canvas, a Design artifact the
                agent creates and fills from the validated brief
owner link      the owner pastes the brief into claude.ai/design and hands
                back the link; the agent reads the bundle back and works from
                it, it never claims the generation as its own
repository      none of the above available: a tokens file and the charter
                document in the repository, the moodboard record as a table
                of links, and the logo brief for whoever draws the mark
```

Whatever the path, the canvas is a draft and the repository is the record. The
signed charter and the signed tokens live in the repository, so the identity
survives the tool. Tokens may be synchronised into `libraries/ui` through
`/design-sync`, which the owner starts; the agent never starts it on its own
initiative, and does not treat a synchronised value as signed off unless the
signed record says so.

## 12. Sign-off, and the handoff to design-system

Sign-off is a gate. Nothing goes to `design-system` before it.

```
who signs       design-director, the owning agent, for the suite's standard
who never signs whoever drafted the identity, agent or session; no one signs
                off their own identity
what is signed  the charter version, the token file version, the contrast
                output it quotes, and the list of open questions, which may
                be non empty only if each is marked as not blocking
client          where there is a client, the client's acceptance of their own
                brand is recorded as well; one never stands in for the other
refusal         names the decision still owed, per section, concretely
```

After sign-off, the tokens are handed over as raw values plus a semantic
mapping for each theme, in the shape `design-system` expects. The handoff
template, including the mapping onto the `libraries/ui` token names, is
`resources/token-handoff.md`. A later change to a brand value comes back
through this skill and a new sign-off; `design-system` does not edit a brand
value on its own.

## 13. Prohibitions

- Never invent a client fact, a competitor, a market figure or a licence.
- Never type a contrast ratio that was not computed, and never round one up
  to meet a threshold.
- Never define the dark theme by inverting the light one.
- Never copy a reference brand's mark, palette or layout, and never present a
  copy as original.
- Never reproduce a moodboard image whose licence does not permit it.
- Never use a font, image or icon whose licence was not read at its source.
- Never pass off a generated or stock image as the client's own people,
  premises or product.
- Never hand tokens to `design-system` before sign-off, and never sign off an
  identity you drafted.
- Never make a rule that cannot point back to the brief.

## 14. Protocol

1. Confirm the brief is validated; if positioning, audience or constraints
   are missing, ask once, grouped, per section 2 and
   `resources/brief-intake.md`.
2. Write the positioning and the personality traits, each traced to the
   brief.
3. Build the moodboard record: every reference sourced and licence-noted, the
   principle taken, what is not taken.
4. Write the logo brief and the usage rules.
5. Choose the palette by role for both themes, list every pair, and measure
   them per `resources/palette-contrast.md`. Fix or restrict every failing
   pair, then measure again.
6. Set the type scale, with each family's licence and coverage checked.
7. Write the imagery and iconography direction, and the voice brief.
8. Assemble the charter per `resources/charter-outline.md`, quoting the
   measured output and citing every licence.
9. Draft on the canvas or the owner's link where available, or in the
   repository, per section 11.
10. Submit for sign-off per section 12. On refusal, return to the named
    section.
11. After sign-off, hand the tokens to `design-system` per
    `resources/token-handoff.md`, and run `design-authenticity` on the first
    surface built with them.

## 15. Auto-critique

Score from 0 to 5: every rule traced to the brief, nothing invented, every
contrast pair measured in both themes with the output quoted, dark designed
rather than inverted, every reference sourced and licence-noted, nothing
copied from a reference brand, licences read for every font, image and icon,
the voice brief kept brief and the downstream named, sign-off by someone other
than the author before any token left.

Threshold: no axis below 3, average at least 4. A charter that states a
ratio nobody computed scores 0 on the third axis and is not submitted for
sign-off until the ratio is measured.

## 16. Interfaces

- Upstream: `engineering-core`, `project-brief`, `requirements-analysis`,
  `clarification-gate`, `competitive-analysis` for any competitor named.
- Governed by: `design-authenticity`, whose intentionality test every rule
  here must pass.
- Downstream: `design-system` for the tokens after sign-off, `font-loading`
  for the chosen families, `ui-ux-engineering` and `frontend-engineering` for
  the surfaces, and `editorial-line` for the full verbal identity, which
  extends the voice brief and never contradicts a signed one.
- Lateral: `accessibility-testing` for contrast on the rendered surfaces,
  `dependency-selection` for font and icon licences, `implementation-integrity`
  for imagery passed off as real, `document-core`, `document-design` and
  `pdf-production` when the charter is delivered as a document.
- Owned and signed off by: the design-director agent, named without backticks
  here because it is not a skill. The drafting is dispatched to the
  design-research agent for the moodboard and to the ui-ux-engineer agent for
  the palette, type and tokens.
