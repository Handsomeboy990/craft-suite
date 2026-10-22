---
name: voice-over
description: Produces the narration of a project video from its script, in the voice source the configuration names: a local open speech synthesis engine by default, a hosted voice service under its terms, or a person reading. Resolves and verifies the engine and voice before promising audio, applies the pronunciation lexicon, renders one clip per beat so a script change re-renders one line, measures each clip's real duration against the timing sheet, edits for natural pacing, refuses any voice that imitates a real person, records a human reader only with written consent and a recording guide, and delivers clean, loudness-measured tracks with their exact transcript. Use for any narration, voice-over or spoken audio of a demo, presentation, short or tutorial.
license: MIT
metadata:
  category: media
  version: 1.0.0
  depends_on: [video-core]
  outputs: [voice-resolution, voice-clips, duration-report, narration-track, transcript]
---

# Voice Over

The voice carries most of what a viewer understands, and a synthetic voice
that stumbles on the project's own name undoes the rest. This skill turns the
script into narration that is clear, correctly pronounced, timed to the
picture, and produced from source, so a changed sentence re-renders one clip.

## 1. Resolve the voice source

From `video-core` section 7.

```
local       the default: an open speech synthesis engine running on this
            machine, nothing sent anywhere. The engine and the voice are
            checked installed before any audio is promised, with their
            versions and the voice's licence recorded; absent any, the skill
            says which to install and stops
cloud       a hosted voice service, used only when the configuration says so,
            under its current terms, with the script sent to it; its key is
            read from the environment under `secrets-management`, never from
            the configuration file
recorded    a person reads; the skill produces the timed script and the
            recording guide of section 5, and processes the takes
voice       `media.voice_model` names it; empty with `local`, a voice is
            chosen among those installed for the video's language, and the
            choice is recorded
imitation   no voice imitating a real person, by cloning or by a description
            of that person, whatever the provider allows
```

## 2. Pronunciation

```
lexicon     the lexicon from `video-scripting`: every product name, acronym,
            code identifier and proper noun with how it is said, applied
            through the engine's own mechanism (phonemes, a substitution
            list, or a respelled script) and recorded
numbers     figures, dates, units and versions written out as they should be
            said ("version 2.4" said "two point four"), per language
checked     every lexicon entry is listened to in context once; a mistake is
            fixed in the lexicon, not by re-rolling the synthesis until it
            sounds right
```

## 3. One clip per beat

```
render      one audio clip per storyboard beat, named after it, from the
            beat's exact words, so a change to beat 4 re-renders beat 4 only
measured    each clip's real duration is measured and compared with the beat's
            planned duration; the difference is reported, and the script, the
            beat or the speaking rate is adjusted, never the audio stretched
            beyond a small, stated tolerance
rate        the speaking rate stated in the script is checked against the
            first clips and corrected in the timing sheet if the voice runs
            faster or slower
pauses      the pauses written in the script are rendered as silence of that
            length, not left to the engine
```

## 4. A natural read

```
sentences   synthesis by sentence or by beat, not by the whole script at
            once, so intonation resets where the meaning does
emphasis    stress marked only where the engine supports it, and checked by
            ear
breaths     no clipped first syllable, no trailing artefact, a few
            milliseconds of room tone at each edge for clean edits
consistency the same voice, rate and settings for every clip of one video
```

## 5. A human reader

```
consent     the reader's written consent for this recording and its use,
            dated, on the rights record
guide       the script with beat numbers and target durations, the lexicon,
            the tone in one line, and how to mark a retake
room        a quiet, soft room; a constant distance to the microphone; no
            processing in the recorder
takes       one file per beat or a slate per beat; the best take per beat
            chosen and logged
```

## 6. Clean, measured tracks

```
clean       noise reduction and de-essing only as much as the recording
            needs, never enough to make the voice sound processed
loudness    each clip normalised to a consistent level, and the narration
            track measured; the final mix target belongs to assembly, per
            `video-core` section 6
format      uncompressed or lossless masters, 48 kHz, kept with the sources
transcript  the exact words of every clip, which the caption step uses
```

## 7. Prohibitions

- No audio promised before the engine and voice are verified installed, or the
  hosted service and its key are confirmed.
- No voice imitating a real person.
- No human recording without the reader's written consent.
- No cloud voice when the configuration says `local`, and no script sent to a
  service the configuration does not name.
- No audio stretched beyond the stated tolerance to hide a timing problem.
- No clip whose words differ from the transcript.

## 8. Protocol

1. Resolve the provider and the voice from the configuration; verify the
   engine, the voice and its licence, or the service and its key.
2. Apply the lexicon and spell out numbers for the video's language.
3. Render one clip per beat, with the written pauses.
4. Measure each clip against the timing sheet; adjust the script or the
   timing, not the audio.
5. Listen to every clip once in full; fix pronunciation in the lexicon.
6. For a human reader: get consent, send the guide, log the takes, choose the
   best per beat.
7. Clean and level the clips; deliver the masters, the narration track and the
   transcript.

## 9. Auto-critique

Score from 0 to 5: the voice source follows the configuration and was
verified; no imitation and consent where a person reads; the lexicon applied
and every name said right; one clip per beat; durations measured and
reconciled with the timing sheet; a natural, consistent read; clean, levelled
masters; a transcript that matches the audio exactly.

Threshold: no axis below 3, average at least 4. A voice that imitates a real
person, or a script sent to a service the configuration does not name, scores
0 overall.

## 10. Interfaces

- Upstream: `video-core` for the voice rules and the configuration;
  `video-scripting` for the script, the timing sheet and the lexicon.
- Lateral: `secrets-management` for a hosted service's key, `data-privacy`
  when a script contains anything personal, `internationalization` for a
  second language.
- Downstream: assembly in this tree, which places the clips on the timeline
  and builds the captions from the transcript.
