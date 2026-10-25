# Example: a verdict that is contested, defended and partly conceded

A lead has declared a change done: a background worker that retries failed
webhook deliveries. The verdict under test: "Delivery is now reliable, retries
are in place, done."

The challenger is a different agent. It does not review its own work.

## Claim under test

Stated fairly, as the author would: failed webhook deliveries are retried with
backoff, so a transient downstream outage no longer loses an event.

## Challenge 1

Line: cost. Severity: major.

> When the downstream is down for an hour, the worker retries every failed
> event on the same schedule. At the current rate that is about 40,000 events
> all retrying together the moment it recovers, a thundering herd that can take
> the downstream back down. Input: outage from 10:00 to 11:00, steady traffic.

Author answer: brings the code. Backoff is per event with jitter, and a run of
the test `retry_jitter_spreads_load` shows retries spread across the window,
not aligned. Evidence rank 1.

Outcome: **upheld**. The challenger concedes in writing: jitter answers the
herd. Backoff is not aligned.

## Challenge 2

Line: false. Severity: blocker.

> "No event is lost" is not true across a worker restart. The retry queue is in
> memory. Input: worker receives 200 failures, is redeployed, the queue is
> gone. Those 200 are never retried and never surfaced.

Author answer: concedes. The queue is a process local array; a restart drops
it. There is no test for restart because the behaviour was never considered.

Outcome: **conceded**. The author changes the work: the retry queue moves to
the durable store, and a restart test is added. The claim re-enters review as
"retries survive a worker restart", now backed by a run of that test.

## Challenge 3

Line: alternative. Severity: note.

> A managed queue with native retry would remove this worker entirely. Was it
> rejected for a reason?

Author answer: cites the working agreement: no new infrastructure dependency
for this milestone, decided with the owner. The simpler-looking option was
rejected for a stated reason, not by default. Evidence rank 2.

Outcome: **upheld** at note level. Recorded, not blocking.

## Standing verdict

One blocker was real and is fixed; the lead's "done" was premature. Two
challenges were met with evidence. The alternative was rejected for a recorded
reason. The change re-enters the final gate with the restart case covered.

Rubber stamping would have shipped an in-memory queue called reliable. Endless
contradiction would have reopened the jitter point after it was proven; the
stop rule closed it the moment rank 1 evidence met it.
