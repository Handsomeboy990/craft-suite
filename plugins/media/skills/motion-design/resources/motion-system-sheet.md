# Motion system sheet

Filled once per video, before the first composition, and read by every one of
them.

## Identity

```
source          the project's tokens or identity, agreed by the owner on
                (date); or "neutral system", stated, with the reason
colours         background, surface, text, accent, and the plate behind text
                over footage, each with its value
display face    name, licence, source
text face       name, licence, source
logo            file, licence or the owner's permission, clear space
```

## Type scale, per frame

| Role | 16:9 1920x1080 | 9:16 1080x1920 |
|---|---|---|
| title | | |
| lower third | | |
| callout label | | |
| caption (burned in) | | |

Sizes checked legible on the smallest target screen.

## Motion

| Name | Curve | Used for |
|---|---|---|
| enter | | elements appearing |
| exit | | elements leaving |
| emphasis | | zooms, highlights |

```
durations       short, medium, long, in ms, and nothing else
holds           minimum time a text element stays, in seconds
safe area       margins in px per frame, and the platform overlay zones for 9:16
```

## Checks per cut

- [ ] Every element reads its timing from the timing sheet.
- [ ] No more than three flashes in any one second.
- [ ] Every text element held long enough to read twice.
- [ ] Contrast kept for text over footage.
- [ ] Diagrams confirmed against the project as built.
- [ ] Render command and tool versions recorded.
