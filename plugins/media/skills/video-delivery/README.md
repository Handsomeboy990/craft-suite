# video-delivery

Turns a finished master into what each destination needs, verifies every file,
runs the gate of `video-core`, and hands everything over without publishing.

- Inputs: the master, stems, captions and chapters from `video-assembly`, the
  rights record, each destination's current specification.
- Outputs: the export set, the short cuts, the metadata text, the verification
  report, the handover package.
- Depends on: video-core.

Exports follow each destination's current published specification, read with
the date, and encode from the master. A vertical short is rebuilt from the
sources at 9:16 with its own script, never a 16:9 master cropped blind. The
title, description and thumbnail state only what the video shows, and carry the
attribution. Every file is probed for its real duration, frame, codec and
loudness, and played. The twelve line gate runs with evidence, including a
viewer who did not make the video. The owner receives the files, the text, the
records and the render command, and publishes them.
