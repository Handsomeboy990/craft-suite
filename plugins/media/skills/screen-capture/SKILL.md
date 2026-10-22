---
name: screen-capture
description: Records the real product for a project video so every take is clean, repeatable and true: a capture environment the owner agreed to, seeded demo data and a fresh browser profile so no secret or personal data reaches a frame, scripted journeys driven by Playwright at a fixed resolution and device scale, a visible and smooth cursor, deliberate pacing, zoom targets recorded as coordinates rather than baked in, terminal and code captures sized to be read, every take logged with the build it ran against, and a frame review before anything leaves the capture. Use to film an application, a site, a terminal, an IDE or a mobile view for a demo, a presentation, a short or a tutorial.
license: MIT
metadata:
  category: media
  version: 1.0.0
  depends_on: [video-core]
  outputs: [capture-environment, capture-scripts, raw-takes, capture-log, zoom-map]
---

# Screen Capture

The capture is the evidence that the project works, so it is taken from the
running project, never mocked, per `video-core` section 2. It is also where a
secret or a stranger's data most easily slips into a video. This skill makes
every take scripted, repeatable at the same pixels, and clean before it is
recorded.

## 1. The capture environment

```
agreed      the build, the environment and the accounts used are the ones the
            owner agreed to in the rights record; a production instance with
            real users is never filmed without that agreement in writing
data        seeded demo data, fictional or the owner's own, set up by a script
            so every take starts from the same state; names and emails use
            reserved example domains
profile     a fresh browser profile per take: no other tab, no bookmarks bar,
            no extensions, no saved logins, no notifications, no autofill
machine     notifications silenced, desktop and dock hidden, the system clock
            either hidden or set to a neutral time, the menu bar free of
            personal items
secrets     tokens, keys and passwords are entered from the environment, never
            typed on screen, and never visible in a URL, a header panel or a
            terminal history
```

## 2. Scripted journeys

A journey is code, so a retake is a re-run and the script edit changes one
step, per `video-core` section 4.

```
driver      Playwright drives the browser for web captures, with recording at
            a fixed viewport and device scale factor (1920x1080 at scale 1 for
            16:9, 1080x1920 for 9:16, or a 2x scale captured and downscaled
            when text must stay sharp after a zoom)
steps       one function per storyboard beat, named after it, reading the
            timing sheet from `video-scripting`
pacing      a deliberate wait after each visible change, long enough for the
            narration of that beat; typing at a human speed, not instantly
cursor      a visible cursor that moves along a smooth path to its target and
            pauses before a click; a click is shown (a ring or a press state)
real        every result shown comes from the running project; a step that
            fails is fixed in the project or the data, never faked in the
            capture
```

Where the reference tool cannot drive the surface (a native app, a mobile
device, a game), the capture is still scripted where the platform allows it
and otherwise performed from a written run sheet, with the same environment
rules.

## 3. Zoom and emphasis are data, not pixels

```
zoom map    each zoom is recorded as a time range and a rectangle in capture
            coordinates, from the element the script interacted with, so the
            motion step can animate it and a re-capture keeps it aligned
resolution  a zoom above 1.5x is captured at a higher device scale so the
            enlarged text stays sharp
highlights  outlines, arrows and callouts are added in motion design over
            the clean capture, never drawn into the product's interface
```

## 4. Terminals, code and editors

```
size        a font size that stays legible on the smallest target screen at
            the video's frame: large enough for a phone when the video is a
            short
theme       a high-contrast theme, the same across every take
prompt      a short, neutral prompt with no user name, host name or path that
            reveals anything
pace        commands appear at a readable speed; long output is trimmed by
            the command, not hidden by a cut that changes what it showed
```

## 5. The capture log

```
take        an identifier, the beat, the date and time
build       the project's commit or version, and the environment
script      the capture script and its commit
result      kept or discarded, and why
```

## 6. The frame review

Before a take leaves the capture, it is reviewed at the capture resolution for
anything that must not appear: a token, a password field revealed, an email or
name that is not demo data, an internal URL, a notification, another
application, a personal file name. A take with one is discarded and
re-captured, not blurred afterwards, unless the owner agrees to a blur
recorded in the log.

## 7. Prohibitions

- No capture of an environment the owner did not agree to.
- No real personal data, secret or internal URL in a recorded take.
- No step faked in the capture when the project fails it.
- No zoom baked into the raw take.
- No take kept without its build and script in the log.

## 8. Protocol

1. Read the rights record and the timing sheet; confirm the environment and
   accounts with the owner.
2. Seed the demo data by script and prepare a clean machine and a fresh
   profile.
3. Write one capture function per beat, at the format's resolution, with
   pacing, a visible cursor and human typing.
4. Record each beat; log the take with its build and script.
5. Record the zoom map from the interacted elements.
6. Review every kept take frame by frame for anything section 6 forbids.
7. Hand the takes, the log and the zoom map to motion design and assembly.

## 9. Auto-critique

Score from 0 to 5: the environment is the agreed one; data is seeded and
fictional or the owner's; no secret or personal data in any frame; every
journey is scripted and repeatable; pacing and cursor are readable; zooms are
data and text stays sharp; terminal and code are legible at the smallest
screen; every take is logged with its build; the frame review was done.

Threshold: no axis below 3, average at least 4. A kept take that shows a real
secret or a real person's data, or a result the project did not produce,
scores 0 overall.

## 10. Interfaces

- Upstream: `video-core`, for permission, truthfulness and the frame rules;
  `video-scripting`, for the timing sheet.
- Lateral: `playwright-automation` for the browser driving and the selectors,
  `secrets-management` for keeping credentials off screen, `data-privacy` for
  what counts as personal data.
- Downstream: motion design and assembly in this tree, which read the takes,
  the log and the zoom map.
