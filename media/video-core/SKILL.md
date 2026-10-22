---
name: video-core
description: Constitution of the media tree, for videos that present a project, often one other people built, as a product demo, a project presentation, a short vertical cut or a step-by-step tutorial, with a voice-over and animation. Holds the permission and attribution the project's owner gives, the truthfulness rule that a video shows what really works and labels what is staged, the four formats and their targets, a pipeline where every artefact is source that re-renders the video, captions and safe motion on every video, measured audio, the output language and voice source from the configuration, and the gate every video passes before it is handed over, never published by an agent. Load before any demo video, presentation video, screencast, tutorial video or social video cut.
license: MIT
metadata:
  category: media
  version: 1.0.0
  depends_on: []
  outputs: [video-brief, rights-record, format-target, render-command, video-gate-result]
---

# Video Core

The rules every video skill obeys and none restates. A video about a project
is a claim about that project, made in moving pictures and a confident voice,
to people who cannot check it while it plays. It is held to the same truth as
a written report, and it usually concerns work someone else did.

It is loaded first, depends on nothing, and can be used alone.

## 1. Whose project, and who said yes

A video that presents a project others built uses their work, their name and
often their interface, code and data. Before anything is captured:

```
permission  the project's owner agreed, in writing, to this video, its
            format and where it will be shown; the agreement is on record
            with the date and the name of the person who gave it
attribution the authors, the team and the project's licence are credited on
            screen or in the description, as the owner asked
scope       what may appear is agreed: which screens, which data, which
            repository views; anything confidential, unreleased or personal
            stays out, and the owner reviews the cut before delivery
assets      every music track, font, icon, image and stock clip has a licence
            that allows this use, recorded with its source
voice       no synthetic voice imitates a real person, and no recorded voice
            is used without that person's written consent
```

A project the owner has not agreed to is not filmed. A public repository is
not consent to be presented under someone else's narration.

## 2. Show what works, label what does not

```
real        the demo shows the project running; a mockup, a prototype or a
            concept is labelled as such on screen, for as long as it is shown
data        demo data is fictional or the owner's own, and labelled as demo
            data where a viewer could take it for real usage
claims      no invented metric, user count, testimonial, benchmark or
            partnership; every figure spoken or shown has a source the owner
            confirmed
edits       a cut that removes waiting is normal; a speed-up, a skipped
            failure or a retaken step that changes what a viewer would
            conclude is disclosed on screen ("sped up 4x", "second attempt")
screens     no secret, token, private message, personal data or internal URL
            is visible in any frame, including the blurred background of a
            zoom and the browser's own interface
```

## 3. Four formats

| Format | Purpose | Length | Frame | Captions |
|---|---|---|---|---|
| demo | show the product working on one real journey | 60 to 180 s | 16:9, 1920x1080 | timed track, optional burn-in |
| presentation | tell the project: problem, approach, architecture, result, team | 2 to 5 min | 16:9, 1920x1080 | timed track |
| short | one idea for a social feed, understood without sound | 15 to 60 s | 9:16, 1080x1920 | burned in |
| tutorial | teach a task step by step, findable by chapter | as long as the task, chapters of 1 to 4 min | 16:9, 1920x1080 | timed track, chapters |

The length is a target the script is written to, not a limit discovered in
the edit. A destination with its own rules (a platform, a jury, an event) is
read at its current published page, with the date, and overrides the table.

## 4. Every artefact is source

The video is the output of a build, not a file edited by hand until it looks
right.

```
sources     the brief, the script with its timings, the storyboard, the
            capture scripts, the motion compositions, the voice-over text and
            its pronunciation lexicon, the edit decision list, the caption
            files, the asset licences: all text or code, all versioned
render      one documented command re-renders the final video from those
            sources; a change to the script re-renders, it is not patched
            into an exported file
reference   the reference pipeline is Remotion for composition and motion,
            Playwright for captures of the product, ffmpeg for assembly,
            loudness and encoding; another stack is used when the project
            already has one, with the same artefacts
versions    each delivered cut has a version and the commit of the sources
            that produced it
```

## 5. Accessibility on every video

```
captions    every video has captions generated from the final script and
            timed to the final voice, checked by a human against the audio;
            shorts have them burned in
text        on-screen text stays long enough to read twice and is legible
            on the smallest target screen, with contrast meeting the
            accessibility minimum for text
flashes     no content flashes more than three times in any one second
motion      motion serves the explanation; a decorative loop does not run
            under narration that needs attention
narration   what matters on screen is said: the narration names the action
            being taken, so the video works for someone who cannot see it
```

## 6. Measured audio

```
loudness    the final mix is measured, never judged by ear alone: an
            integrated loudness target and a true-peak ceiling taken from the
            destination's current specification, or, absent one, about -14
            LUFS integrated and -1 dBTP for web and social
voice       the voice sits clearly above any music, which is ducked under
            speech
silence     no unintended silence at the start, no clipped first word, no
            cut mid-word
```

## 7. Language and voice from the configuration

```
language    the video's language is `media.video_language`; when it is
            empty, `language.document_output`; captions are in the same
            language, and a second caption track is a deliberate extra
voice       the voice-over source is `media.voice_provider`: `local` (a
            local open speech synthesis engine, the default, nothing sent
            anywhere), `cloud` (a hosted voice service, under its terms, with
            the script sent to it), or `recorded` (a person reads the script)
model       `media.voice_model` names the engine and voice; when it is empty
            for `local`, the voice-over skill chooses one installed for the
            video's language and records which
```

Field reference: `config/README.md`, section `media`.

## 8. Handed over, never published

The agent delivers files and their metadata: the cuts, the caption files, the
chapters, a title and a description written for the destination, the
attribution text, the rights record and the render command. Uploading,
scheduling and posting belong to the owner or the person they name. An agent
never publishes from a real account.

## 9. The video gate

A video is delivered only when every line holds, each with its evidence.

| # | Check | Evidence |
|---|---|---|
| 1 | the owner's permission is on record for this video and destination | the record, dated, with a name |
| 2 | every asset is licensed for this use | the asset list with sources |
| 3 | what is shown runs, or is labelled as staged | the capture log, the labels in the cut |
| 4 | every figure and claim was confirmed by the owner | the claim list, each confirmed |
| 5 | no secret, personal data or internal URL in any frame | a frame-by-frame review at the capture resolution |
| 6 | the length and frame match the format or the destination | the measured duration and dimensions |
| 7 | captions exist, match the voice, and are timed | the caption file, checked against the audio |
| 8 | no flashing above three per second | a review of every fast transition |
| 9 | loudness and true peak measured within target | the measurement output |
| 10 | on-screen text legible on the smallest target screen | a viewing at that size |
| 11 | the video re-renders from its sources with one command | the command and its run |
| 12 | someone other than its maker watched it end to end at real speed, with sound | their name and notes |

## 10. Prohibitions

- No video of a project without its owner's written permission.
- No staged screen, invented figure or undisclosed misleading edit.
- No secret, token or personal data in any frame.
- No unlicensed music, font, image or clip.
- No synthetic voice imitating a real person, no recorded voice without
  consent.
- No video without captions.
- No final mix delivered without a loudness measurement.
- No video that cannot be re-rendered from its sources.
- No publication by an agent.

## 11. Protocol

1. Record the brief: the project, its owner, the format, the destination, the
   audience, the one thing a viewer must take away.
2. Obtain and record the owner's permission and the agreed scope.
3. Read `media.video_language`, `media.voice_provider` and `media.voice_model`;
   apply the defaults of section 7 where empty.
4. Set the format target from section 3 or the destination's current rules.
5. Build every artefact as source, under the reference pipeline or the
   project's own.
6. Run the gate of section 9, line by line, with evidence.
7. Hand over the cuts, captions, metadata, rights record and render command.

## 12. Auto-critique

Score from 0 to 5: permission and scope on record; truthfulness of what is
shown and said; frames clean of secrets and personal data; assets licensed;
the format target met; captions and safe motion; measured audio; the video
re-renders from source; the gate run with evidence; handed over without
publishing.

Threshold: no axis below 3, average at least 4. A video made without the
owner's permission, or one that shows a figure or a working feature that is
not real, scores 0 overall: the first uses someone's work against their will,
the second presents a falsehood as a demonstration.

## 13. Interfaces

- Upstream: none; this constitution depends on nothing.
- Lateral: `pitch-and-demo` for a live pitch the video supports,
  `playwright-automation` for browser captures, `animation` for the motion
  principles a composition shares with an interface, `brand-identity` for the
  project's visual identity, `data-privacy` for anything personal on screen,
  `accessibility-testing` for the caption and contrast checks,
  `secrets-management` for what must never be captured.
- Downstream: `social-content` when a cut is scheduled by the owner.
