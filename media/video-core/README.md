# video-core

Constitution of the media tree, for videos that present a project, often one
other people built: a product demo, a project presentation, a short vertical
cut or a step-by-step tutorial, with a voice-over and animation.

- Inputs: the project and its owner, the format and the destination, the
  audience, the configuration's `media` section.
- Outputs: the video brief, the rights record, the format target, the render
  command, the video gate result.
- Depends on: nothing.

A video about a project is a claim about it, so the owner's written permission
and the agreed scope come before the first capture, and every asset is
licensed. What is shown runs, or is labelled as staged; every figure is
confirmed by the owner; no frame carries a secret or personal data. Every
artefact is source, so one command re-renders the video, under a reference
pipeline of Remotion, Playwright and ffmpeg. Every video has captions, safe
motion and a measured mix. The language and the voice source come from the
configuration, with a local voice by default. A twelve-line gate runs before
delivery, and the video is handed over, never published by an agent.

Configuration: `media.video_language`, `media.voice_provider`,
`media.voice_model`, described in `config/README.md`.
