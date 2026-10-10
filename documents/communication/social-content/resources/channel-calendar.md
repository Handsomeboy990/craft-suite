# Channel plan, calendar and format sheet

The intake questions, the channel plan, the cadence derivation, the calendar
template and the format sheet. Filled with the client, versioned with the
social content plan.

## 1. Intake questions

Sent once, grouped, through `clarification-gate`. Questions already answered
for `editorial-line` or `brand-identity` are not asked again; their answers
are quoted.

```
To confirm before the calendar is drawn. Each question says why it is asked.

1. Which social accounts does the brand have today, on which networks, and
   who holds each login? (We plan per account; we never hold a login.)
2. Do you want to open or close any account? Why?
3. Who will write posts, take photographs, and answer comments? How many
   hours a week can each give, and on which days is nobody available?
   (The cadence comes from this, not from a rule.)
4. Who may answer a comment or a message in the brand's name? Who decides
   on a complaint? Who speaks to a journalist? Who handles a legal or a
   safety matter, including out of hours?
5. Which dates matter to you this period: openings, closures, holidays,
   events? (We only use dates you give us or that we can cite.)
6. What do you want to know after a few months of posting? (We measure that
   question, not whatever a dashboard shows.)
7. Which hashtags or accounts do you already use or want to avoid?

We do not invent an audience figure, a testimonial or a result, and we do
not publish, schedule or reply from your accounts: we hand each post to you.
```

What may proceed on a recorded assumption, marked not blocking: the order of
pillars in the first period, the time of day of a slot, the template of a
recurring post. What may not: a channel, a capacity, a reply authority, a
date, any fact in a caption.

## 2. Channel plan

```
| Channel | Account | Why (reader need, from the line) | Holder | Kept or left out, and why |
|---------|---------|----------------------------------|--------|---------------------------|
|         |         |                                  |        |                           |
```

## 3. Cadence, derived

```
CADENCE   <channel>, <date>

Capacity          <the client's answer, quoted>
Cost per post     drafting <h>, visual <h>, review <h>, approval <h>,
                  replies it brings <h>; estimated with <role>
Hours available   <per week, per the answer>
Cadence           <posts per period>, rounded down
Three-month test  can the client hold this without the agent? yes | no
                  if no, the lower cadence: <...>
```

## 4. Calendar

One table per channel, one row per slot. Every cell filled; a blank cell is
a post nobody owns.

```
| Date | Channel | Pillar | Format | Brief | Drafter | Approver | State |
|------|---------|--------|--------|-------|---------|----------|-------|
|      |         |        |        |       |         |          |       |
```

States: `brief`, `drafted`, `in review`, `approved`, `handed over`, `held`.
A `held` row names what it waits for.

Rules:

- Pillars rotate; no pillar appears twice in a row on one channel unless the
  line has fewer pillars than slots.
- A date taken from outside the client is cited with its source, or not
  used.
- A slot that falls on a day the client said nobody is available is moved,
  not filled.

## 5. Format sheet

One row per format actually used. A value is written only if it was read at
the network's own help, developer or publishing page; otherwise the field
stays a field.

```
| Network | Format | Specification | Checked on | Source (network's own page) |
|---------|--------|---------------|------------|-----------------------------|
|         |        | [TO CHECK at publication: <what>] |  |                     |
```

Before each handover, any row checked before the calendar's first
publication date is checked again, or the handover carries "check on the
day" for it.

Accessibility, whatever the network makes optional:

```
image           alt text written for what the image is for
video           captions for any speech; no information carried by sound alone
text in image   repeated in the caption
hashtags        each word capitalised so a screen reader can separate them
links           described, never "click here"
```
