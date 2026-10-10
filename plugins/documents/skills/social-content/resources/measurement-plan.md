# Measurement plan

What is counted, from which source, and what each count can and cannot show.
Written from the client's questions, not from a dashboard.

## 1. Questions first

```
| Question, in the client's words | Signal | Source | Read on | Baseline |
|---------------------------------|--------|--------|---------|----------|
|                                 |        |        |         | none yet |
```

A baseline is the first real reading, with its date. Until it exists, the
cell says "none yet". A target is the client's, quoted, or there is none; no
"industry benchmark" is supplied by the agent.

## 2. Attribution limits

| Signal | Source | Can attribute | Cannot attribute |
|---|---|---|---|
| followers | the network's analytics | how many accounts follow, by the network's definition on the date read | who they are, whether they are customers, whether they see the posts |
| likes, reactions | the network's analytics | that an account reacted | that the person read, agreed, or will act |
| impressions, reach | the network's analytics | what the network says it displayed, by its own definition, which can change | that anyone looked at the post, or that the count is comparable across networks |
| comments, messages | the account itself | what people wrote | that the people who did not write felt the same |
| link clicks | a tagged link, or the network | clicks on that link that kept the tag | the visit that came later by typing the address, or the person who called instead |
| a code or a counter question | the client's own records | people who used the code or answered the question | the people who came because of a post and did not say so |
| bookings, sales | the client's own records | that they happened | that a post caused them, unless a code or a tagged link ties them |

Followers, likes, reactions and impressions are **vanity metrics**: reported,
labelled as such, and never presented as customers, sales or satisfaction.

## 3. Rules

- Every figure in a report is read from a named source on a stated date.
  None is estimated, extrapolated or rounded up.
- A platform's count proves what the platform counted. Its definition is
  quoted with the date read, because networks change them.
- Counts from two networks are not added or compared as if they meant the
  same thing.
- A tagged link or a pixel on the client's site goes through
  `analytics-instrumentation` and `data-privacy` before it is added. The
  agent does not add tracking to measure a post.
- A period with too few readings to say anything says so.

## 4. Report, per period

```
MEASUREMENT   <period>, <channel>

Question          <the client's>
Read              <each figure, its source, its date>
Labelled vanity   <which of the above>
Shows             <what the figures support, in one or two sentences>
Does not show     <what they cannot attribute, from section 2>
Next              <one change to the plan, or none>
```
