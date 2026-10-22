# media

Videos that present a project, often one other people built: product demos,
project presentations, short vertical cuts and step-by-step tutorials, with a
voice-over and animation.

| Skill | Responsibility |
|---|---|
| `video-core` | the constitution: permission, truthfulness, formats, source-built video, captions, measured audio, the gate |
| `video-scripting` | the takeaway, a structure per format, narration timed for the ear, the storyboard and timing sheet |
| `screen-capture` | the real product filmed cleanly: agreed environment, seeded data, scripted takes, a frame review |
| `motion-design` | titles, diagrams, zooms and transitions as Remotion compositions, safe and intended |

Every skill of this tree loads `video-core` first. Its gate runs before any
video is handed over, and no video is published by an agent.

## Reference pipeline

Remotion for composition and motion, Playwright for captures of the product,
ffmpeg for assembly, loudness and encoding. Each skill states what it needs
from these tools and verifies they are installed before promising a render.
A project that already has another pipeline keeps it, with the same artefacts.

## Language

Skills are written in English. The video's language is
`media.video_language`, or `language.document_output` when it is empty.

## Configuration

`media.video_language`, `media.voice_provider` (`local` by default, `cloud` or
`recorded`) and `media.voice_model`, described in `config/README.md`.
