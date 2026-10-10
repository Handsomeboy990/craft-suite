# Publishing handover

The agent drafts. Posting, scheduling, replying, hiding and deleting from a
real account are the owner's acts, or the act of whoever the owner names.

The `delegation` section of the configuration has no field for publishing to
a social network, a scheduler or an account (`config/README.md`), so the
default applies: the step is prepared and handed over, never performed, and
never silently skipped. No vendor tool is required: the owner uses the
network's own app or whichever scheduler they already use.

## 1. Handover record, one per item

```
HANDOVER   <calendar id>, <date prepared>

Item              post | reply | removal
State             approved | provisional: <what must be decided first>
                  | held: <what it waits for>
Channel           <network>, <account>
When              <date and time chosen by the client, time zone>
Exact content     <the caption, character for character>
Hashtags          <as they must appear>
Mentions          <as they must appear>
Links             <each, checked to resolve on <date>>
Assets            <file names, where they are>
Alt text          <per image>
Video captions    <file, or burned in>
Check on the day  <each format value marked TO CHECK, and its source>
Action            <what the owner does, in their own tool: post now,
                  schedule for <when>, reply in thread <link>, hide comment
                  <link>>
Approved by       <role>, <date>, from the review record
Line and identity <versions and states this item was drafted under>
```

## 2. Rules

- An item in state `provisional` or `held` is handed over as such, at the
  top of the batch, with what must be decided. It is never mixed with the
  approved items as if it were ready.
- The exact content is the content. The owner should not have to edit a
  caption to post it; an item that needs editing goes back to review.
- A handover never contains a login, a password, a token or a session link.
- When the owner reports back that an item was posted, the calendar row
  moves to `handed over` with the date; the agent does not verify it by
  logging in.

## 3. Batch cover

```
HANDOVER BATCH   <period>, <date>

Approved, ready         <ids>
Provisional             <ids, and the decision each waits for>
Held                    <ids, and why>
Open questions          <from the plan, with owners>
To check on the day     <format values, with sources>
```
