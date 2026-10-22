# voice-over

Produces the narration of a project video from its script, in the voice source
the configuration names: a local open speech synthesis engine by default, a
hosted voice service under its terms, or a person reading.

- Inputs: the script, timing sheet and lexicon from `video-scripting`, the
  configuration's `media.voice_provider` and `media.voice_model`, the video's
  language.
- Outputs: the voice resolution, one clip per beat, the duration report, the
  narration track, the transcript.
- Depends on: video-core.

The engine and voice are verified installed, with their licence, before any
audio is promised; a hosted service is used only when the configuration says
so, with its key from the environment. No voice imitates a real person, and a
human reader records only with written consent and a recording guide. The
lexicon makes every name and number come out right. One clip per beat means a
changed sentence re-renders one line, and each clip's real duration is measured
against the timing sheet, which is corrected instead of stretching the audio.
The masters are clean and levelled, with an exact transcript for the captions.
