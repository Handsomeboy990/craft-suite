---
name: video-delivery
description: Turns a finished master into what each destination needs and hands it over without publishing: export settings read from the destination's current published specification, a vertical short reframed from the source rather than cropped blind, a thumbnail and a title and description that state only what the video shows, caption and chapter files, the attribution text, every file verified by probing its real duration, frame, codec and loudness, the twelve line gate of video-core run with evidence, and a handover package with the render command so the owner can upload, schedule and post it themselves. Use to export, package, verify and hand over a demo, presentation, short or tutorial video.
license: MIT
metadata:
  category: media
  version: 1.0.0
  depends_on: [video-core]
  outputs: [export-set, short-cuts, metadata-text, verification-report, handover-package]
---

# Video Delivery

A video is not finished when it renders. It is finished when each destination
receives a file it accepts, the gate of `video-core` has passed with evidence,
and the owner has everything needed to publish it themselves. An agent never
publishes, per `video-core` section 8.

## 1. Exports per destination

```
spec        the destination's current published specification for container,
            codec, frame size, frame rate, bitrate or quality, audio and
            caption format, read with the date; an event's or a jury's rules
            override a platform's
fallback    absent a specification: H.264 video with AAC audio in MP4, the
            format's frame size and frame rate, a quality setting rather than a
            fixed low bitrate, and the mix's loudness kept
from master every export encodes from the master of assembly, never from
            another export
names       file names carry the project, the format, the language, the
            version and the destination
```

## 2. Shorts from the source

```
reframe     a vertical cut is rebuilt from the sources at 9:16: the capture
            re-framed on the zoom map's regions, the motion layers laid out
            for the vertical frame, the captions burned in inside the
            platform's safe area
not crop    a 16:9 master is not cropped blind to 9:16; the part of the frame
            that matters is chosen per beat
own script  a short has its own script and storyboard from `video-scripting`,
            with its first second stating the point, not a trimmed long cut
```

## 3. Metadata that tells the truth

```
title       says what the video shows, in the video's language, within the
            destination's length; no claim the video does not support
description the takeaway, the project and its owner, the link the owner
            chose, the chapters for a tutorial, and the attribution and
            licence text from the rights record
thumbnail   a frame or a still from the video's own sources, with text the
            video supports; no face, result or interface the video does not
            contain
captions    the caption files, named for the destination, in every language
            delivered
```

## 4. Verification by probing

Every delivered file is probed, not assumed.

```
probe       container, codec, frame size, frame rate, duration, audio
            channels and sample rate, read from the file with a media prober
            (ffprobe, or equivalent) and compared with the specification
loudness    measured on the exported file, which can differ from the master
captions    the caption file's last cue ends before the video does, and the
            burned-in captions are visible inside the safe area
playback    the file opened and played from start to end in a standard
            player, with sound
```

## 5. The gate

The twelve lines of `video-core` section 9 are run against the delivered files,
each with its evidence, and recorded in the verification report. Line 12, a
person who did not make the video watching it end to end at real speed with
sound, is never skipped and never done by the agent that made the cut.

## 6. The handover package

```
files       every export, the caption and chapter files, the thumbnail
text        the title, the description and the attribution, per destination
records     the rights record, the claim list with confirmations, the asset
            licences, the voice resolution
report      the verification report and the gate result
rebuild     the render command, the commit of the sources and the tool
            versions, so the owner can re-render a corrected version
publish     a note stating that uploading, scheduling and posting are the
            owner's, with each destination's upload steps if the owner asked
            for them
```

## 7. Prohibitions

- No export settings invented when the destination publishes its own.
- No short made by cropping a 16:9 master blind.
- No title, description or thumbnail that claims more than the video shows.
- No delivered file that was not probed and played.
- No delivery with a gate line failed or unevidenced.
- No upload, schedule or post by an agent.

## 8. Protocol

1. Read each destination's current specification and record the date.
2. Encode each export from the master; rebuild each short from the sources at
   9:16.
3. Write the title, description, attribution and thumbnail per destination.
4. Probe every file, measure its loudness, check its captions, play it.
5. Run the twelve line gate of `video-core` with evidence; get line 12 from a
   person who did not make the video.
6. Assemble the handover package with the render command and hand it to the
   owner.

## 9. Auto-critique

Score from 0 to 5: exports follow the destinations' current specifications;
shorts are rebuilt, not cropped; metadata claims only what the video shows;
every file probed, measured and played; the gate passed with evidence and an
independent viewer; the handover package is complete and lets the owner
re-render; nothing was published by an agent.

Threshold: no axis below 3, average at least 4. A delivery with a failed or
skipped gate line, or any publication by an agent, scores 0 overall.

## 10. Interfaces

- Upstream: `video-core` for the gate and the handover rule; `video-assembly`
  for the master, the stems, the captions and the chapters; `video-scripting`
  for a short's own script.
- Lateral: `social-content` for the owner's publishing plan and calendar,
  `seo-engineering` for a video embedded on the project's own site.
- Downstream: the owner, who publishes.
