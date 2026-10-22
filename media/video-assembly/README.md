# video-assembly

Assembles a project video from its sources into a cut that plays right: the
edit, the music, the measured mix, the captions, the chapters and the master.

- Inputs: the timing sheet, the capture takes and log, the zoom map, the motion
  renders, the voice clips and transcript, the licensed music.
- Outputs: the edit decision list, the mix and its stems, the caption files,
  the chapter list, the master cut.
- Depends on: video-core.

The edit is a text decision list built from the timing sheet and the measured
voice durations, so the edit is source and a changed beat changes its own
lines. Cuts land on action and breath, and a cut that changes what a viewer
would conclude is labelled. Music is licensed and ducked under speech. The mix
is measured, normalised to the destination's loudness target and measured
again, with the stems kept. Captions come from the exact transcript, timed to
the real audio and burned in for shorts. The master renders with one command
once the tools are verified installed.
