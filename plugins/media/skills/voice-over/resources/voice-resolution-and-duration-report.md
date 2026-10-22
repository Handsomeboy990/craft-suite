# Voice resolution and duration report

Filled before the first clip and after the last.

## Resolution

```
provider        local | cloud | recorded, read from media.voice_provider
engine          name and version, verified installed on (date) by (command)
voice           identifier, language, licence and its source
service         for cloud: the service, its terms read on (date), the key read
                from the environment variable (name only)
reader          for recorded: name, consent dated, guide sent on (date)
imitation       confirmed: the voice imitates no real person
settings        rate, pitch or style settings, identical for every clip
```

## Lexicon applied

| Written | Said as | Mechanism | Checked in context |
|---|---|---|---|
| | | phoneme, substitution, respelling | yes |

## Durations

Tolerance for any time stretch: stated here, for example 3 percent.

| Beat | Planned (s) | Rendered (s) | Difference | Action |
|---|---|---|---|---|
| 1 | | | | none, script trimmed, beat lengthened, rate corrected |

```
measured rate   words per minute, from the rendered clips
planned rate    from the script
timing sheet    updated: yes | no
```

## Delivery

- [ ] One master per beat, lossless, 48 kHz, named after the beat.
- [ ] Narration track assembled and measured.
- [ ] Transcript matches every clip word for word.
