---
name: video-scripting
description: Turns a project and a brief into the script and storyboard a video is built from, for a demo, a presentation, a short or a tutorial: the one takeaway, a structure per format, narration written to be heard at a measured speaking rate so its length is known before anything is recorded, every claim tied to a source the owner confirmed, a storyboard where each beat has its picture, its words, its duration and its on-screen text, and a timing sheet the capture, motion, voice and edit all read. Use before capturing or animating anything for a project video.
license: MIT
metadata:
  category: media
  version: 1.0.0
  depends_on: [video-core]
  outputs: [video-script, storyboard, timing-sheet, claim-list, pronunciation-list]
---

# Video Scripting

A video is planned on paper or it is planned in the edit, where every change
costs a re-capture. This skill fixes what the video says, in what order, with
which picture, and for how long, before a frame is recorded. The script is the
source every other media skill reads, per `video-core` section 4.

## 1. The takeaway first

```
one line    the single thing a viewer must remember, in one sentence the
            owner agrees with; every beat is judged by whether it serves it
audience    what they already know, what they do not, and what they will do
            after watching: try the product, join the project, fund it,
            follow a step
cut         anything that serves neither the takeaway nor the next action is
            cut from the script, not from the edit
```

## 2. A structure per format

| Format | Structure |
|---|---|
| demo | the problem in one sentence; the product doing the main job on one real journey, start to finish; one strength shown, not listed; where to get it |
| presentation | the problem and who has it; why existing answers fall short; the approach; how it works, with one architecture picture; what it achieved, with confirmed figures; the team and the credits; the ask |
| short | a first second that states the point; one idea; one picture that proves it; the call to action on screen; readable with the sound off |
| tutorial | what the viewer will be able to do; what they need first; one chapter per task, each ending in a visible result; recap and next step |

A tutorial step is something the viewer can do and see, never a feature
described.

## 3. Narration written to be heard

```
rate        narration is timed at a measured speaking rate for the video's
            language and voice, about 140 to 160 words a minute for English
            narration, measured again on the first synthesis or reading; the
            script states the rate it was timed at
length      the word count sets the length: a 90 second demo carries about
            220 words of narration, not 400
sentences   short, one idea each, in the active voice, written for the ear:
            no parenthesis, no list read aloud, no abbreviation a voice will
            mispronounce without a lexicon entry
action      the narration names what happens on screen as it happens, so the
            video works without the picture, per `video-core` section 5
silence     a pause is written in where the picture must carry the moment, with
            its duration
```

## 4. Claims tied to sources

Every factual sentence (a figure, a capability, a comparison, a result) is
listed with its source and the owner's confirmation, per `video-core`
section 2. A sentence whose source is missing is rewritten to what can be
shown or confirmed, or removed.

## 5. The storyboard

One row per beat.

```
beat        a number and a name
picture     what is on screen: a capture of a named step, an animated title,
            a diagram, a code view, a face card, with the frame (16:9 or 9:16)
words       the narration for that beat, exactly
on screen   any text shown, at most what can be read twice in the beat
duration    seconds, from the word count at the stated rate plus any written
            pause
source      for a capture, the journey step it comes from; for a diagram, what
            it draws; for a claim, its line in the claim list
```

The sum of the durations is the length, and it must fall within the format's
target or the destination's rule.

## 6. The timing sheet and the lexicon

```
timing      beat, start, end, duration, picture kind: the sheet the capture,
            motion, voice and edit skills all read, so a change to the script
            changes one file
lexicon     every name, acronym, product term and code identifier the voice
            must say, with how it is said, for the voice-over skill
```

## 7. Prohibitions

- No script that the owner has not reviewed against the takeaway and the
  claims.
- No claim without a confirmed source.
- No narration longer than its beat allows at the stated rate.
- No feature listed in narration that the picture does not show.
- No tutorial step that ends without a visible result.

## 8. Protocol

1. Read the brief and the rights record from `video-core`; write the takeaway
   and the audience's next action.
2. Choose the structure of the format from section 2.
3. Write the narration for the ear at a stated rate, naming each on-screen
   action.
4. List every claim with its source, and get the owner's confirmation.
5. Build the storyboard beat by beat, and check the total length against the
   target.
6. Produce the timing sheet and the pronunciation lexicon.
7. Have the owner review the script and the storyboard before any capture.

## 9. Auto-critique

Score from 0 to 5: one takeaway the owner agrees with; the structure fits the
format; narration written for the ear at a stated, measured rate; every claim
sourced and confirmed; every beat with picture, words, text and duration; the
total length within target; the timing sheet and lexicon complete; the owner
reviewed it.

Threshold: no axis below 3, average at least 4. A script that carries an
unconfirmed figure, or narrates a feature the picture never shows, scores 0
overall, because the video built from it would assert what it cannot prove.

## 10. Interfaces

- Upstream: `video-core`, for the brief, the rights record and the formats.
- Lateral: `pitch-and-demo` for the story of a live pitch the video echoes,
  `technical-writing` for a tutorial that also ships as a written guide.
- Downstream: the capture, motion, voice-over and assembly skills of this
  tree, which read the timing sheet.
