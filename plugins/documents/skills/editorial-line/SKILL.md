---
name: editorial-line
description: Turns a validated brief, and a signed brand identity when one exists, into an editorial line every writer of the brand can follow: the audience and what it already knows, the promise in one sentence, a few editorial pillars with what each covers and never covers, tone and vocabulary with words kept and refused and examples rewritten, what is never said, the formats from site pages to newsletters, and the review rule that says who approves what before publication. Never invents a client fact, a statistic, a testimonial, a competitor or an audience figure. Use for an editorial line, a tone of voice, a content charter or a style guide for what a brand publishes.
license: MIT
metadata:
  category: communication
  version: 1.2.0
  depends_on: [document-core]
  outputs: [intake-record, audience-profile, promise-statement, editorial-pillars, vocabulary-list, never-said-list, format-specifications, review-matrix, editorial-line-document, quality-gate-record]
---

# Editorial Line

An editorial line is the document that lets a stranger write for a brand
without asking the brand what to say. It names who reads, what they are
promised, which subjects the brand speaks on and which it leaves alone, which
words it uses and which it refuses, what it never says, in which formats, and
who approves before anything goes out.

It is a professional document under `document-core`. Its reader is not the
brand's audience but whoever writes for the brand: a copywriter, a site
builder filling a content file, a community manager drafting a post, the
client's own staff. Every rule here is written for that reader, and every
fact in it is the client's, quoted, or marked as a gap.

## 1. What this skill owns, and what it does not

Owns:

```
audience            who reads, what they already know, what they need,
                    per format when the formats reach different readers
promise             what the reader gets, in one sentence the client confirmed
pillars             three to five subjects, each with what it covers, what it
                    never covers, and the reader need it answers
tone and vocabulary traits applied to words, register per output language,
                    words kept, words refused, examples rewritten
never said          claims, comparisons, sensitive topics, promises the client
                    cannot keep
formats             site pages, articles, newsletters, and social posts as a
                    downstream, each with its purpose, length and cadence
review rule         who drafts, who approves what, before publication, and
                    what happens on refusal
the document        the editorial line itself, gated and versioned
```

Does not own:

- The visual identity and its brief tone of voice. That is `brand-identity`,
  governed by `design-authenticity` and signed off by the design-director
  agent. This skill extends the voice brief into a full line; it never
  replaces it. Section 3.
- The calendar per channel, the formats and sizes per network, captions,
  moderation and measurement. That is `social-content`, downstream of this
  skill, which applies the line to social channels and never edits it.
  Section 9 here holds the rules a social post must follow; a rule a post
  needs that the line does not hold comes back here as a question.
- Writing the site copy itself. The line governs it; the copy is written in
  `site-template-generation` or `frontend-engineering` against it.
- Search optimisation. Keywords chosen for ranking come from `seo-engineering`
  and are held to the vocabulary here, never the reverse.
- Legal review of a claim. Whether a claim is lawful in a regulated sector is
  a question for the client's qualified adviser, flagged and never answered.
- Publication. Section 10.

## 2. Inputs, and what to ask when they are missing

The input is a validated brief: `project-brief`, then `requirements-analysis`
and `clarification-gate` when the work belongs to a project. Add the signed
charter of `brand-identity` when one exists, and the client's existing
material when there is any: a site, past newsletters, a leaflet.

Three facts are required before any rule is written. When one is missing,
stop and ask, once, in one grouped batch through `clarification-gate`:

| Missing | Why it blocks | What to ask |
|---|---|---|
| Audience | register, vocabulary and formats all follow from it | who reads, what they already know, what they come for, what they misunderstand today, which languages they read |
| Offer | the promise and the pillars are made from it | what the client actually does, the one thing promised, the conditions attached to it |
| Constraints | they remove claims and subjects before tone does | a regulated sector, subjects the client refuses, claims already made in writing, who approves on the client side, how often the client can really publish |

The full question set, with what may proceed on a recorded assumption and what
may not, is `resources/intake-questions.md`.

What is never invented, at any point, under section 5 of `document-core`:

- a client fact: history, founding date, team, values, awards, customers,
  results;
- a statistic, a percentage, a count of customers, a satisfaction score;
- a testimonial, a quotation, a review, or a customer's name;
- a competitor, or a claim about one. Competitors come from the client or
  from `competitive-analysis` with live sources;
- an audience figure: size, age distribution, reach, open rate, share of a
  market.

A missing fact becomes a question or a visible marker in the line, for
example `[TO CONFIRM: what happens when a part is not in stock, held by the
co-op secretary]`, never a plausible sentence. A line that tells writers to
quote a figure nobody supplied has moved the invention one step downstream.

## 3. The brand identity, and what happens when they disagree

The line extends the voice brief of `brand-identity`, section 8 of that skill.
Three states, each with its rule:

| Identity | Rule |
|---|---|
| signed | its traits, register, words and never-said list are inputs, quoted with the charter version; the line may add to them and may not contradict them |
| drafted, not signed | its voice brief is a draft input, quoted with its version and marked unsigned; the line records every point it depends on, and is re-checked when the identity is signed |
| none | the line is built from the brief alone, says so on its cover, and names `brand-identity` as the step that will give the voice its visual counterpart |

A conflict is any rule in the line that a signed or drafted identity says
otherwise: a trait the line softens, a word one keeps and the other refuses, a
register that differs, a claim one permits and the other forbids. When one is
found:

1. Record it in the line's open questions, quoting both sides and their
   sources.
2. Escalate it to the design-director agent, which owns the identity, and to
   the owner or client who accepts the brand.
3. Leave the conflicting rule out of the line until they decide. Neither side
   is picked silently, and the line is not delivered as final while a
   conflict is open.
4. Record the decision and its source. If it changes the identity, the change
   goes back through `brand-identity` and a new sign-off; this skill never
   edits a charter.

## 4. Audience

The audience profile of `document-core` section 3 is built twice, because two
readers are involved: the writer who applies the line, and the brand's
reader whom the writer addresses. The line is structured for the first and
describes the second.

For the brand's reader:

```
who reads           in the client's own words, quoted
what they know      what can be assumed, and what must be explained every time
what they need      the question they arrive with, per format
what they misread   the misunderstanding the client meets today, quoted
where they read     phone, desk, print, inbox, a counter
languages           every output language, each with its own register
```

No size, share or demographic figure is written unless the client supplied it
with its source. "Most of our customers are older" is the client's statement
and is quoted as one; "62 percent are over 55" is a statistic and needs its
source or is left out.

## 5. The promise

One sentence: what the reader gets from what the brand publishes, not what the
brand sells. It is confirmed by the client, quoted with the date, and every
pillar must serve it.

```
promise     <reader> gets <benefit> from <the brand's publications>,
            because <the reason the client can stand behind>
test        could a competitor sign this sentence unchanged? then it is
            not a promise, it is a category
```

When the brand identity holds a positioning sentence, the promise is derived
from it and cites it. The two are different sentences: the positioning says
why choose the brand, the promise says why read it.

## 6. Editorial pillars

Three to five. Fewer than three gives writers nothing to rotate; more than
five is a list of everything the brand could say, which is no line at all.

Each pillar carries:

```
name            two or three words, the reader's vocabulary
covers          the subjects, concretely
never covers    the near misses a writer would drift into, and why
reader need     which need from section 4 it answers
evidence        the line of the brief or the answer that justifies it
formats         where it appears, from section 9
```

"Never covers" is the half that does the work. A pillar called "maintenance
tips" that does not exclude repairs the reader must never attempt alone will,
within three posts, publish one.

## 7. Tone and vocabulary

Traits come from the identity when it exists, from the brief when it does not.
Each is applied to words, with a sentence that does it and one that does not,
in the output language.

```
traits          each "this, not that", with an example of both
register        how the reader is addressed, per output language: formal or
                familiar address, first person plural or the brand's name
sentences       length, the reading level aimed for, the order of information
kept            the words the brand uses, each with its reason
refused         the words the brand never uses, each with its reason and
                the word used instead
rewrites        at least one sentence per refused word, before and after
mechanics       numbers, dates, prices, units, capitals, the brand's own
                name, in each output language
```

The kept and refused lists are per output language. A list is never
translated word for word: a refused English word may have no equivalent, and a
French register question has no English one. Each language gets its own list,
built from material in that language.

The refused list always carries the terms `document-core` section 6 bans for
every document of the tree, the ones that describe the author's experience
rather than the reader's, and adds the brand's own. Template, categories and
rewrite examples: `resources/vocabulary-kept-and-refused.md`.

## 8. What is never said

Four lists, each concrete enough to apply without asking:

| List | What it holds | Example of the rule |
|---|---|---|
| Claims | anything the client cannot prove from a source it holds: superlatives, guarantees, results, certifications | "the best in town" is never written; a guarantee is written only in the client's wording, from the document that states it |
| Comparisons | any statement about a named or recognisable competitor | the brand describes itself; it never describes the alternative, even when the client does in conversation |
| Sensitive topics | subjects the brand stays out of, and how it answers when asked | politics, a customer's personal situation, an accident, a dispute in progress |
| Promises the client cannot keep | conditions the offer depends on, written with their conditions or not at all | "same day" is written with its cut-off time and what happens when a part must be ordered |

Each list cites its source: the brief, the client's answer, the identity's
never-said list, or a sector rule the client named. A regulated sector adds
its own list, supplied by the client and marked for their adviser, never
recalled from memory.

## 9. Formats

Each format the client will really use gets a specification. A format the
client has no capacity to sustain is not specified; a line that requires a
weekly article from a client who can write one a quarter is wrong by design.

```
format          site page | article | newsletter | social post
purpose         the reader need and the pillar it serves
reader          from section 4, when it differs per format
shape           opening, body, closing, call to action if any
length          a range, stated in words or characters, with its reason
cadence         what the client said it can sustain, quoted
who drafts      from section 10
```

| Format | Downstream |
|---|---|
| site pages | the content file of `site-template-generation`, or the copy in `frontend-engineering`; every page names its pillar |
| articles | written against the line; a factual article passes `document-core` section 5 before review |
| newsletters | one subject per issue, the pillar named; subscription and sending are the client's tools and the client's consent rules |
| social posts | the rules here only: pillar, vocabulary, never said. Channels, sizes, calendar, moderation and measurement belong to `social-content` |

## 10. The review rule

Nothing written under the line is published before it is approved. The line
says who approves what, in a matrix the client accepts:

```
who drafts          the role that writes, agent or person
who reviews         against the line: pillar, vocabulary, never said
who approves        the person who can say yes for the brand, by name of role
what needs more     a claim, a figure, a named person, a photograph of a
                    person, a sensitive topic: the approver plus the source
                    holder, and the client's adviser in a regulated sector
on refusal          the rule broken, quoted, and the draft goes back
record              date, version, approver, for every published piece
```

Two rules hold whatever the matrix says:

- **Nobody approves their own draft.** An agent that drafted a piece never
  approves it, and neither does the session that drafted it.
- **Publication is the owner's act.** No delegation in the configuration
  covers publishing to a site, a mailing list or a social account, so a piece
  is handed over ready, with where it goes, and never published by the agent.
  If the owner later grants it, that is a decision recorded in the
  configuration, not an assumption made here.

Matrix template and the per-piece record: `resources/review-matrix.md`.

## 11. The document

The editorial line is delivered as a document and passes the eight point gate
of `document-core` section 7, eleven when paginated, with `document-design`
for the layout and `pdf-production` for the render. Its outline is
`resources/editorial-line-template.md`.

```
output language     the recipient's, stated at the top of the plan;
                    a bilingual brand gets one vocabulary section per language
cover               version, date, status (draft | accepted), the identity it
                    extends with its version and state, who accepts it
open questions      each with its owner and whether it blocks; every marked
                    gap listed
maintenance         owner, last verified date, and the events that invalidate
                    it: a new signed identity, a new offer, a new format, a
                    new language
```

A line is versioned. An accepted line is never edited in place; a change
produces a new version, accepted again.

## 12. Prohibitions

- Never invent a client fact, a statistic, a testimonial, a competitor or an
  audience figure.
- Never contradict a signed identity, and never resolve a conflict with one by
  picking a side silently.
- Never write a claim the client cannot prove, a comparison with a competitor,
  or a promise without its conditions.
- Never translate a vocabulary list word for word into another output
  language.
- Never specify a format at a cadence the client did not say it can sustain.
- Never approve a draft you wrote, and never publish.
- Never deliver the line as final with a blocking question or a conflict open.

## 13. Protocol

1. Load `document-core`. Name both audiences and the output language, per
   section 4 and `document-core` sections 2 and 3.
2. Confirm the brief is validated. If the audience, the offer or the
   constraints are missing, ask once, grouped, per section 2 and
   `resources/intake-questions.md`, and wait.
3. Read the identity, if any, and record its state: signed, drafted or none,
   with its version, per section 3.
4. Write the audience profile and the promise; confirm the promise with the
   client.
5. Write the pillars, each with what it never covers and its evidence.
6. Write tone and vocabulary per output language, with the kept and refused
   lists and the rewrites, per `resources/vocabulary-kept-and-refused.md`.
7. Write the never-said lists, each item with its source.
8. Specify only the formats the client will sustain.
9. Write the review matrix with the client, per `resources/review-matrix.md`.
10. Check every rule against the identity. Record and escalate each conflict
    per section 3; leave the rule out until it is decided.
11. Assemble the document per `resources/editorial-line-template.md`, mark
    every gap, list every open question.
12. Run the gate of `document-core` section 7 and record it; gate 8 runs
    `self-critique`.
13. Deliver with the gate record, the open questions and the conflicts, to the
    approver named in the matrix.

## 14. Auto-critique

Score 0 to 5: both audiences named, nothing invented, promise confirmed and
not signable by a competitor, three to five pillars each with a real "never
covers", vocabulary per output language with rewrites, every never-said item
sourced, formats limited to what the client sustains, review matrix accepted
and self-approval excluded, every conflict with the identity escalated rather
than settled, gate run and recorded.

Threshold: no axis below 3, average at least 4. A line delivered to a client,
which leaves the organisation, averages at least 4.3.

Automatic failure, whatever the average: an invented fact, figure, testimonial
or competitor; a rule that contradicts a signed identity; a conflict settled
without escalation; a gate claimed without a record.

## 15. Interfaces

- Upstream: `document-core`, `project-brief`, `requirements-analysis`,
  `clarification-gate`, `brand-identity` for the voice brief and the
  positioning, `competitive-analysis` for any competitor the client names.
- Governed by: `document-core`, its evidence rule and its gate.
- Downstream: `site-template-generation` and `frontend-engineering` for site
  copy, `seo-engineering` whose keywords are held to the vocabulary, and
  `social-content` for channels, calendar, moderation and measurement, which
  applies the line and never edits it.
- Lateral: `document-design` and `pdf-production` when the line is a paginated
  deliverable, `self-critique` for gate 8, `internationalization` when the
  brand publishes in more than one language.
- Escalation: the design-director agent and the owner, for any conflict with
  the identity.
- Owner: the community-manager agent, which drafts the line and hands it to
  the approver of the review rule; it never approves it and never publishes.
