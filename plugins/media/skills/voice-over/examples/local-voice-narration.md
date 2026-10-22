# Example: a local voice that said the product's name wrong

The narration of the volunteer scheduling demo, with `media.voice_provider` set
to `local` and `media.voice_model` empty, video language English.

## Resolution

No engine was installed at first. The skill stopped and said so, naming two
open engines that run locally, rather than falling back to a hosted service.
After the owner installed one, the resolution recorded the engine version, an
English voice installed with it and that voice's licence. The voice imitates no
real person.

## What the first render got wrong

| Beat | Problem | Fix |
|---|---|---|
| 1 | "Planify" said "plan-IF-ee" | lexicon entry with the engine's phoneme input, checked in the sentence |
| 5 | "4x" said "four ex" | the script's on-screen text keeps "4x"; the spoken line reads "four times faster" |
| 3 | the whole script rendered at once, so beat 3 started on a falling pitch left over from beat 2 | one clip per beat, rendered sentence by sentence |
| 7 | the clip ran 3.4 s over its beat | the sentence was shortened in the script, not sped up |

## Durations after the fixes

| Beat | Planned (s) | Rendered (s) | Action |
|---|---|---|---|
| 1 | 4.6 | 4.4 | none |
| 3 | 7.4 | 7.9 | beat lengthened by 0.5 s in the timing sheet |
| 7 | 3.2 | 3.3 | none |

The measured rate was 156 words a minute against 150 planned, close enough
that only beat 3's timing changed. The transcript went to assembly with the
masters, and the captions were built from it.
