---
name: social-content
description: Turns an editorial line, signed or explicitly provisional, into the community manager's working set for a brand's social channels: a calendar per channel at a cadence the client can sustain, post formats and sizes per network checked against the network's current specification on the day and cited, captions held to the line, visual posts drafted under the signed identity, a moderation and reply policy with an escalation matrix, a measurement plan that states what it can and cannot attribute, and a handover record for every post. Drafts and never publishes, schedules or replies from a real account. Never invents an audience, an offer, a testimonial, a reach, engagement, follower or market figure. Use for a content calendar, social posts, captions or a moderation policy.
license: MIT
metadata:
  category: communication
  version: 1.1.0
  depends_on: [document-core, editorial-line]
  outputs: [intake-record, channel-plan, channel-calendar, format-sheet, post-briefs, caption-drafts, visual-post-drafts, moderation-policy, escalation-matrix, measurement-plan, handover-records, quality-gate-record]
---

# Social Content

Social content is the editorial line applied, post by post, to channels the
brand does not control: a network decides the formats, the order in which
people see a post, and what its analytics report. This skill is the community
manager's method for working inside that: which channels, at which cadence,
in which formats, with which words, who answers whom when people reply, and
what the numbers afterwards can and cannot say.

It is a professional document under `document-core`, downstream of
`editorial-line`. Its reader is whoever runs the brand's accounts: the
client's staff, a member, a community manager. Every post in it is a draft
handed to that reader; none is published by the agent.

## 1. What this skill owns, and what it does not

Owns:

```
channel plan        which channels, why each, and which are left out
calendar            per channel, at the cadence the client said it can
                    sustain, each slot with its pillar and its owner
format sheet        per network, the formats used and their specification,
                    each checked at its live source on a stated date
post briefs         per post: pillar, reader need, format, visual, caption,
                    sources, consents, approver
captions            drafted against the line: pillar, vocabulary, never said
visual posts        drafted on the canvas or as files, under the signed
                    identity, decided by the design-director agent
moderation          what is answered, by whom, within what time, what is
                    escalated, what is never done
measurement         what is counted, from which source, and what it can and
                    cannot attribute
handover            per post, the exact content and the action for the owner
the document        the social content plan itself, gated and versioned
```

Does not own:

- The editorial line: audience, promise, pillars, tone, vocabulary, what is
  never said, the review rule. That is `editorial-line`. This skill applies
  it and never edits it; a rule a post needs that the line does not hold goes
  back to `editorial-line` as a question. Section 3.
- The visual identity. That is `brand-identity`, signed off by the
  design-director agent. A visual post is drafted under it; a visual question
  the identity does not answer is the design-director agent's to decide.
  Section 7.
- Paid advertising: budgets, targeting, bids. A paid post is planned only as
  a handover to the owner, never configured here.
- Legal review: a competition, a regulated claim, a sponsored post's
  disclosure rule. Flagged for the client's qualified adviser, never answered.
- Publishing, scheduling, and replying from a real account. Section 10.

## 2. Inputs, and what to ask when they are missing

The input is an editorial line in one of two states:

| Line | Rule |
|---|---|
| signed (accepted) | quoted with its version; every caption is held to it |
| explicitly provisional | quoted with its version and marked provisional; every post that depends on an open point of the line is held provisional too, and none is handed over as ready |

No line at all is not an input. Stop and route to `editorial-line`; a calendar
built without one invents the voice, the pillars and the never-said list in
the posts themselves.

Besides the line, three facts are required before a calendar is drawn. When
one is missing, stop and ask, once, in one grouped batch through
`clarification-gate`:

| Missing | Why it blocks | What to ask |
|---|---|---|
| Channels | the calendar, the formats and moderation are per channel | which accounts exist today, on which networks, who holds the login, which the client wants to open or close |
| Capacity | the cadence follows from it, never from a generic rule | who writes, who photographs, who answers, how many hours a week, which days nobody is available |
| Reply authority | moderation cannot be written without it | who may answer in the brand's name, who decides on a complaint, who speaks to the press, who handles a legal or safety matter |

Answers already given to `editorial-line` or `brand-identity` are reused and
quoted, not asked again. The full question set is in
`resources/channel-calendar.md`, section 1.

What is never invented, at any point, under section 5 of `document-core`:

- the audience, or anything about it: who follows, how many, their age,
  where they are;
- an offer, a price, a date, an opening hour, a condition;
- a testimonial, a review, a quotation, a customer's name or photograph;
- a figure: reach, impressions, engagement rate, follower count, growth,
  conversion, market size, a benchmark "for the sector";
- a network specification. A size, a length limit or a duration not read at
  the network's live source on a stated date is a field to fill, not a
  number.

A missing fact is a question or a visible marker, for example
`[TO CONFIRM: Saturday opening hours, held by the co-op secretary]`, never a
plausible sentence in a caption.

## 3. The line and the identity, and their states

Read both before anything is drafted, and record their state on the cover of
the plan:

| Source | State | Consequence for the posts |
|---|---|---|
| editorial line | signed | captions held to it |
| editorial line | provisional, open conflict or question | every post touching the open point is held; the rest may be drafted, marked provisional |
| brand identity | signed | visual posts drafted under it |
| brand identity | drafted or refused | visual posts are drafts against a draft, marked as such; nothing visual is handed over as final |
| brand identity | none | text posts only, or visuals marked as placeholders; `brand-identity` named as the missing step |

A post never settles a conflict the line left open. If the line holds a
conflict on the social register, as the worked example does, the posts are
written in the register the line does state, the conflicting register is not
tried out "to see how it does", and the calendar is not delivered as final.

## 4. Channels and the calendar

Channels first, each with its reason:

```
channel         the network and the account, as the client named it
why             the reader need from the line it serves, quoted
who reads it    from the line's audience, never from a network's own
                description of its users
holder          who holds the login; the agent never does
left out        each channel the client mentioned and the plan drops, why
```

A channel the client cannot staff is left out, and the plan says so. Two
channels kept are better than five abandoned.

The cadence is derived, never assumed:

```
capacity        the client's answer, quoted: who, how many hours, which days
cost per post   drafting, visual, review, approval, answering the replies
                it brings, estimated with the client
cadence         capacity divided by cost, rounded down, per channel
check           could the client hold this cadence for three months
                without the agent? if not, lower it
```

"Post every day" is not a cadence; it is a generic rule nobody's capacity
was measured against. A cadence of one post a fortnight, held, is a plan.

Each calendar slot carries the date, the channel, the pillar, the format, the
post brief it points to, the drafter, the approver, and the state:
`brief | drafted | in review | approved | handed over | held`. Pillars rotate
so that each returns at a rhythm the line's pillar count allows. Dates the
client named, an opening, a closure, a holiday, are the client's and quoted;
a "national day of" taken from the internet is a fact and is cited or left
out. Template: `resources/channel-calendar.md`.

## 5. Formats and sizes per network

Networks change their formats, sizes, length limits and durations without
notice. A number recalled from memory or copied from an old guide is the
evidence rule broken. So every specification in the plan is written as:

```
network         <name>
format          <the format as the network names it>
specification   <the value>, checked on <date> at <URL of the network's
                own help or developer page>
or              [TO CHECK at publication: <what>, at <where to look>]
```

Rules:

- The source is the network's own help centre, developer documentation or
  publishing tool, never a third-party "cheat sheet". A third-party page may
  point to the network's page; it is never the citation.
- The date is the day the page was read. A specification older than the
  calendar's first publication date is checked again before the handover.
- When the page cannot be reached, the field stays a field. The visual is
  drafted at a ratio the identity allows, and the handover tells the owner
  what to check in the publishing tool on the day.
- Accessibility belongs to the format: alt text for every image, captions on
  every video with speech, no text baked into an image that is not also in
  the caption, hashtags in a form a screen reader can read. These are
  applied whatever the network's tool makes optional.

Template: `resources/channel-calendar.md`, section 3.

## 6. Posts and captions

Every post starts as a brief, and every caption is checked against the line
before review. The brief:

```
pillar          from the line, named
reader need     from the line's audience, quoted
format          from the format sheet
the one thing   what the reader should know or do afterwards
sources         every fact in the caption, with its holder
consents        every person named or shown, recorded where
visual          what is shown, who makes it, under which identity version
caption         the draft
reply plan      what comments the post will likely bring, and who answers
approver        from the line's review rule
```

The caption is held to the line: its vocabulary kept and refused, its
never-said lists, its register for this format. A caption that needs a word,
a claim or a register the line does not give is not written in that word; it
goes back to `editorial-line` as a question.

Specific to social posts, on top of the line:

- **Hashtags and mentions.** Only the ones the client uses or approves. A
  mention of another account is a statement about that account and passes
  the line's comparisons rule.
- **Links.** Each link is checked to resolve before the handover, and points
  to the client's own page when one exists.
- **A person.** Named or shown only with recorded consent, per the line's
  review rule. A customer's bike, receipt or house is a person's data.
- **Trends and sounds.** A trend, a meme or a licensed sound is used only if
  it fits the line's register and its licence permits the brand's use,
  read at the source. The agent does not decide a licence is fine because
  others use it.
- **Competitions and sponsored posts.** Flagged for the client's adviser;
  the rules of the network and the law of the country apply and are not
  recalled from memory.

Brief template and the caption checklist:
`resources/post-brief-and-caption-checklist.md`.

## 7. Visual posts

Visual posts are drafted under the signed identity, never next to it:

```
canvas          drafted on the Claude Design canvas, a Design artifact the
                agent creates and fills from the post brief
owner link      the owner drafts on claude.ai/design and hands back the
                link; the agent reads it back and works from it
files           no canvas available: image or layout files in the
                repository or the client's folder, with the brief beside
                them
```

No vendor tool is required; the files path always exists. Whatever the path,
the visual uses the identity's palette, type and imagery direction, and its
contrast pairs as measured, never re-asserted. A photograph presented as the
client's people, premises or work is the client's own, with its consent and
permission recorded; a generated or stock image is never passed off as one,
per section 7 of `brand-identity`.

A visual question the identity does not answer, a new template, a crop that
breaks the clear space, a colour on a photograph, is decided by the
design-director agent, not by the drafter.

## 8. Moderation and replies

The moderation policy is written before the first post, because the first
reply arrives with it. It says, per kind of message:

```
kind            question, praise, complaint, criticism, abuse, spam,
                legal, safety, press, personal data shared in public
answered?       yes | no | escalated
by whom         the role, from the reply authority the client named
within          a time the client can hold, in its own hours, quoted
how             the register of the line; public or moved to private
escalated to    the role, and how they are reached out of hours
```

What is escalated, always, and never answered by the drafter of a reply:

| Kind | Escalated to | Why |
|---|---|---|
| complaint about work, money or a refund | the role the client named for complaints | a public reply is a commitment |
| anything legal: a threat, a claim, a dispute in progress | the owner, then the client's adviser | a reply can become evidence |
| safety: an injury, a defect that could hurt someone | the owner, at once | the line's sensitive topics; a person may be at risk |
| press or a public figure | the role the client named for the press | a reply is a statement |
| personal data posted in public | the owner, who hides it if the network allows | the person's data, not the brand's |

What is never done, whatever the pressure:

- deleting or hiding legitimate criticism because it is critical;
- arguing in public, answering sarcasm with sarcasm, or replying twice to
  the same provocation;
- disclosing personal data: an order, an address, a repair, a name the
  person did not give in that thread;
- promising in a reply what the line does not let a post promise;
- replying from a real account as the agent. A reply is drafted and handed
  over, like a post. Section 10.

Hiding or deleting is reserved for what the policy names: spam, abuse,
another person's personal data, content illegal in the client's country.
Each removal is recorded with its reason. Template with the escalation
matrix: `resources/moderation-policy.md`.

## 9. Measurement

Measurement starts from the question, not from what a network's dashboard
displays. For each channel:

```
question        what the client wants to know, in its words
signal          the count that would answer it, and its source: the
                network's own analytics, the client's own records, a
                tagged link
can attribute   what this signal can show
cannot          what it cannot show, and why
baseline        the first real reading, recorded with its date, or none yet
```

The rules:

- **No figure is invented.** No reach, impressions, engagement rate,
  follower count, growth target or "industry benchmark" is written unless it
  was read from a named source on a stated date. A target is the client's,
  quoted, or there is none.
- **Vanity metrics are named as such.** Followers, likes and impressions
  count attention on the network; they are reported, labelled, and never
  presented as customers, sales or satisfaction.
- **A platform's analytics prove what the platform counted**, by its own
  definition, which can change and is stated with the date read. They do not
  prove that a post caused a visit, a booking or a sale.
- **Attribution is stated with its limits.** A tagged link counts clicks
  that kept the tag; a code or a question at the counter counts the people
  who used it or answered; nothing counts the person who saw a post and came
  in a week later without saying so.
- **Tracking is minimal and lawful.** A tagged link or a pixel follows
  `analytics-instrumentation` and `data-privacy`; nothing is added to the
  client's site to measure a post without that review.

The first report after a period says what was read, from where, on which
date, and what it does not show. A plan whose only evidence is "the posts
did well" has measured nothing. Template with the attribution limits table:
`resources/measurement-plan.md`.

## 10. Drafting, and the handover

The agent drafts. It never publishes, schedules, replies, likes, follows,
deletes or hides from a real account, and never holds an account's
credentials.

The `delegation` section of the configuration (`config/README.md`,
`documentation/configuration.md`) has no field for publishing to a social
network, a scheduler or an account, so the default holds: the step is
prepared and handed over, never performed. If the owner ever grants it, that
is a decision recorded in the configuration and a reopening of ADR 0006, not
an assumption made here.

Every post, reply and removal leaves the agent as a handover record:

```
item            post | reply | removal, its id in the calendar
state           approved | provisional (why) | held (why)
where           the channel and the account
when            the date and time the client chose, in its time zone
exact content   the caption as it must appear, character for character;
                hashtags, mentions and links as they must appear
assets          the files, their names, alt text, video captions
check on the day  the specification to re-check in the publishing tool,
                with its source
action          what the owner does: post, schedule, reply, hide, in their
                own tool; no vendor tool is required
approved by     the role and the date, from the review record
```

A provisional or held item is handed over as such, with what must be
decided first, never as ready. Template:
`resources/publishing-handover.md`.

## 11. The document

The social content plan is delivered as a document and passes the eight
point gate of `document-core` section 7, eleven when paginated, with
`document-design` for the layout and `pdf-production` for the render:

```
cover               version, date, status (draft | provisional | accepted),
                    the line it applies with its version and state, the
                    identity with its version and state, who accepts it
1 channels          the channel plan
2 calendar          per channel, the first period
3 formats           the format sheet, every value sourced and dated
4 posts             the briefs and drafts for the first period
5 moderation        the policy and the escalation matrix
6 measurement       the plan and its attribution limits
7 handover          the records, one per item
open questions      each with its owner and whether it blocks
maintenance         owner, last verified date, and what invalidates it: a
                    new line or identity version, a channel added or
                    closed, a network changing a format, a change in
                    capacity or reply authority
```

A plan is versioned. An accepted plan is never edited in place; a new period
or a changed rule produces a new version.

## 12. Prohibitions

- Never publish, schedule, reply, like, follow, hide or delete from a real
  account, and never hold an account's credentials.
- Never invent an audience, an offer, a testimonial, or a reach, engagement,
  follower, growth or market figure.
- Never state a network specification that was not read at the network's
  own source on a stated date.
- Never set a cadence the client did not say it can sustain.
- Never write a caption outside the line, and never settle a conflict the
  line left open by trying a register out.
- Never hand over a provisional post as ready.
- Never delete legitimate criticism, argue in public, or disclose personal
  data in a reply.
- Never present a vanity metric as a result, or a platform's count as proof
  of a sale.
- Never approve a draft you wrote.

## 13. Protocol

1. Load `document-core`. Name the reader of the plan, the people who run the
   accounts, and the output language.
2. Read the editorial line and the identity; record each state per section
   3. No line: route to `editorial-line` and stop.
3. If channels, capacity or reply authority are missing, ask once, grouped,
   per section 2 and `resources/channel-calendar.md`, and wait.
4. Write the channel plan, with what is left out and why.
5. Derive the cadence per channel from the client's capacity; draw the
   calendar for the first period.
6. Build the format sheet: read each specification at the network's own
   source, record the date, leave a field where it could not be read.
7. Write a brief per post, then the caption, then run the caption checklist
   of `resources/post-brief-and-caption-checklist.md`.
8. Draft the visuals on the canvas, the owner's link or as files, under the
   identity; send visual questions to the design-director agent.
9. Write the moderation policy and the escalation matrix with the client,
   per `resources/moderation-policy.md`.
10. Write the measurement plan with its attribution limits, per
    `resources/measurement-plan.md`.
11. Mark every post that depends on an open point of the line or the
    identity as provisional or held.
12. Submit drafts to the reviewer and approver of the line's review rule;
    never approve your own.
13. Run the gate of `document-core` section 7 and record it; gate 8 runs
    `self-critique`.
14. Hand over every item per `resources/publishing-handover.md`, with the
    open questions, to the approver named in the line.

## 14. Auto-critique

Score 0 to 5: line and identity states read and recorded, nothing invented,
cadence derived from stated capacity, every specification sourced and dated
or left a field, every caption held to the line, visuals under the identity
with visual questions sent to the design-director agent, moderation policy
with escalation and never-do lists accepted, measurement with attribution
limits and vanity metrics named, every item handed over with its exact
content and state, gate run and recorded.

Threshold: no axis below 3, average at least 4. A plan delivered to a client,
which leaves the organisation, averages at least 4.3.

Automatic failure, whatever the average: an invented figure, testimonial or
specification; a post published, scheduled or replied to by the agent; a
provisional post handed over as ready; a conflict of the line settled in a
post; a gate claimed without a record.

## 15. Interfaces

- Upstream: `document-core`, `editorial-line` for the audience, pillars,
  vocabulary, never-said lists and the review rule, `brand-identity` for the
  visual identity, `project-brief` and `clarification-gate` for the missing
  facts.
- Governed by: `document-core`, its evidence rule and its gate.
- Lateral: `document-design` and `pdf-production` when the plan is a
  paginated deliverable, `self-critique` for gate 8, `analytics-instrumentation`
  and `data-privacy` for any tracked link or pixel, `accessibility-testing`
  for alt text and captions on the rendered visuals, `internationalization`
  when the brand posts in more than one language, `research-core` when a
  date, a trend or a specification must be cited from a live source.
- Escalation: the design-director agent for visual questions and any
  conflict with the identity; the owner for every publication, every
  escalated reply and every conflict the line left open.
- Owner: the community-manager agent, which drafts the plan and every item
  in it and hands each over; it never approves its own draft and never
  publishes, schedules or replies from a real account.
