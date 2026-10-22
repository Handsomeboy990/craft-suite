# Example: captions that drifted by the end of a tutorial

A seven minute tutorial for an open-source note-taking app, in four chapters,
assembled from 38 beats.

## The problem

The first cut used captions produced by an automatic transcription of the
final mix. In chapter 1 they matched. By chapter 4 they appeared almost two
seconds after the words, and they spelled the app's command "nt sync" as "and
sink".

Two causes:

```
source      the transcription guessed the words, so a known script was
            replaced by a worse version of itself
timing      the captions were timed to the first render; three beats were
            later lengthened in the timing sheet after the voice durations
            were measured, and nothing re-timed the captions
```

## The fix

```
source      captions rebuilt from the voice-over transcript, beat by beat
timing      each caption's start and end computed from its clip's position in
            the edit decision list, so a lengthened beat moves its captions
lines       broken at phrase boundaries, at most two lines, "nt sync" kept as
            written and shown in the code style of the motion system
check       watched end to end with captions and sound on; two captions
            split where a sentence ran past three seconds
```

## The mix, measured

| Measure | Before | After |
|---|---|---|
| integrated | -21.8 LUFS | -14.1 LUFS |
| true peak | -4.2 dBTP | -1.2 dBTP |

The music bed sat 9 dB under the voice in chapter 3, which the reviewer found
tiring; the ducking was raised to 16 dB under speech for the whole video.

## Chapters

| Start | Chapter |
|---|---|
| 0:00 | Install the app |
| 1:42 | Write and tag a note |
| 3:30 | Sync two devices |
| 5:51 | Restore a deleted note |

The master rendered from the edit decision list with one command, and the
chapter list went to delivery with the caption files.
