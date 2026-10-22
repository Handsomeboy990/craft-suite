---
name: video-assembly
description: Assembles a project video from its sources into a cut that plays right: an edit decision list built from the timing sheet that places the captures, the motion layers and the voice clips, cuts on action and on breath, music licensed and ducked under speech, the mix measured to a loudness target and a true-peak ceiling, captions built from the voice transcript and timed to the real audio, a chapter list for tutorials, and the whole cut rendered by one command with ffmpeg or the composition tool. Use to edit, mix, caption and render a demo, presentation, short or tutorial from its captures, motion and narration.
license: MIT
metadata:
  category: media
  version: 1.0.0
  depends_on: [video-core]
  outputs: [edit-decision-list, mix, caption-files, chapter-list, master-cut]
---

# Video Assembly

Assembly is where the parts become a video, and where they most often stop
agreeing: a clip runs long, a caption drifts, music buries a sentence. This
skill builds the cut from an edit decision list, so the edit is source too,
per `video-core` section 4, and it measures what it cannot judge by eye or ear.

## 1. The edit decision list

```
from        the timing sheet of `video-scripting`, updated by the measured
            durations of `voice-over`
places      per beat: the capture take and its in and out points from the
            capture log, the motion layers, the voice clip, any music cue
format      a text file the render reads: a Remotion master composition, an
            ffmpeg filter script, or the project's own tool's project file
            kept as text where it can be
one change  a changed beat changes its lines in the list and nothing else
```

## 2. The cut

```
action      cut on a completed action, not mid-gesture; a capture holds a
            moment after its result appears
breath      a voice clip starts and ends on a breath, never on a clipped
            syllable
gaps        waiting in a capture is cut out; the cut is clean or covered by a
            motion element, and a cut that changes what a viewer would
            conclude is labelled, per `video-core` section 2
sync        the action on screen lands on the word that names it, within a
            few frames
```

## 3. Music and sound

```
licence     every track and sound effect has a licence that allows this use,
            recorded with its source in the rights record; no track from a
            platform's library outside that platform's terms
role        music supports the pace and stops being noticed; none under a
            tutorial's dense explanation unless very low
ducking     music is lowered under speech by a clear margin (a common rule is
            15 dB or more) with short fades, then returns between lines
effects     interface sounds only where they help (a click, a notification
            the product makes), never invented
```

## 4. The mix, measured

```
target      the destination's current loudness specification, read on its
            published page with the date; absent one, about -14 LUFS
            integrated and a true peak of -1 dBTP, per `video-core` section 6
measure     the integrated loudness, the loudness range and the true peak of
            the final mix, measured with a loudness meter (ffmpeg's EBU R128
            measurement, or equivalent) and recorded
correct     a two-pass normalisation to the target, then measured again; a
            limiter only to hold the true peak
stems       voice, music and effects kept as separate stems, so a later
            change remixes rather than re-records
```

## 5. Captions from the transcript

```
source      the exact transcript from `voice-over`, never an automatic
            transcription of the mix when the script is known
timing      each caption timed to the real audio of its clip, in lines short
            enough to read (two lines at most, a few seconds each), broken at
            phrase boundaries
formats     WebVTT and SubRip files for players and platforms; burned-in
            captions for shorts, styled from the motion system, inside the
            platform safe area
check       a person watches with the captions on and the sound on, and
            fixes every drift and every mismatch with the voice
```

## 6. Chapters

For a tutorial, a chapter list with start times and titles that name the task
of each chapter, written for the destination's chapter format, and matching
the storyboard's chapters.

## 7. Render

```
one command the master cut renders from the edit decision list with one
            documented command, at the format's frame size and frame rate
master      a high-quality master (an intermediate or a high-bitrate file)
            kept with the sources; delivery encodes from it
versions    the tool versions and the commit of the sources are recorded with
            the master
prereq      the render tools are verified installed before a render is
            promised; ffmpeg's absence is reported with what to install
```

## 8. Prohibitions

- No music or sound without a licence for this use.
- No caption file that differs from the voice.
- No mix delivered without a loudness and true-peak measurement.
- No unlabelled cut that changes what the viewer would conclude.
- No master that cannot be re-rendered from the edit decision list.

## 9. Protocol

1. Read the timing sheet, the measured voice durations, the capture log, the
   zoom map and the motion renders.
2. Write the edit decision list beat by beat.
3. Cut on action and breath; label any cut that changes meaning.
4. Place licensed music, duck it under speech, add only real interface sounds.
5. Measure the mix, normalise in two passes, measure again, keep the stems.
6. Build captions from the transcript, timed to the audio; burn them in for
   shorts; write chapters for tutorials.
7. Watch with captions and sound; fix drift.
8. Render the master with one command and record the versions.

## 10. Auto-critique

Score from 0 to 5: the edit is a text decision list read by the render; cuts
land on action and breath and none misleads; picture and word are in sync;
music and effects are licensed and ducked; the mix is measured and within
target; captions come from the transcript and match the audio; chapters match
the storyboard; the master renders from one command.

Threshold: no axis below 3, average at least 4. Unlicensed music, or captions
that say something the voice does not, scores 0 overall.

## 11. Interfaces

- Upstream: `video-core`; `video-scripting`, `screen-capture`,
  `motion-design` and `voice-over` for every input.
- Lateral: `accessibility-testing` for caption and contrast checks.
- Downstream: delivery in this tree, which encodes from the master.
