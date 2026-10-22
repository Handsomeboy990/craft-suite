# screen-capture

Records the real product for a project video so every take is clean,
repeatable and true.

- Inputs: the rights record and the agreed environment from `video-core`, the
  timing sheet from `video-scripting`, the running project.
- Outputs: the capture environment, the capture scripts, the raw takes, the
  capture log, the zoom map.
- Depends on: video-core.

The capture is the evidence that the project works, so it comes from the
running project, in the environment the owner agreed to, with seeded demo data
and a fresh browser profile so no secret or personal data reaches a frame.
Journeys are scripted with Playwright, one function per storyboard beat, at a
fixed resolution and scale, with readable pacing, a visible cursor and human
typing. Zooms are recorded as coordinates for motion design, not baked into the
take. Terminal and code captures are sized for the smallest target screen.
Every take is logged with the build it ran against and reviewed frame by frame
before it is kept.
