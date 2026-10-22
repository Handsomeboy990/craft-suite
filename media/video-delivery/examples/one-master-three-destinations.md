# Example: one demo, three destinations

The volunteer scheduling demo is delivered to three places the association
chose: its own site, a video platform and a social feed.

## Exports

| Destination | What its specification asked, read that week | Export |
|---|---|---|
| association site | a self-hosted MP4 under a size limit set by the web host | H.264 and AAC in MP4, 1920x1080, 30 fps, quality setting tuned to the limit, WebVTT captions beside it |
| video platform | its published upload recommendations for 1080p | the same master encoded to those recommendations, SubRip captions uploaded separately by the owner |
| social feed | vertical video, a maximum length, captions advised | a 32 second short, rebuilt at 1080x1920 with its own script |

## The short was not a crop

The first attempt cropped the 16:9 master to 9:16. In beat 3, the ranked list
the narration talks about fell outside the vertical frame. The short was
rebuilt instead: its own script stating the point in the first second ("Fill
a week of shifts in two minutes"), the capture reframed on the zoom map's
rectangles, the captions burned in above the platform's lower overlay.

## What probing caught

```
site export     duration 88.1 s, 1920x1080, 30 fps: matches
platform export audio at 44.1 kHz where the master is 48 kHz: re-encoded
                at 48 kHz from the master
short           integrated loudness -16.3 LUFS after encoding, against -14:
                normalised and measured again at -14.0
captions        the last cue of the site's WebVTT ended 0.4 s after the video:
                trimmed to end with the last word
```

## The gate and the handover

All twelve lines passed with evidence. Line 12 was a volunteer who had never
used the app; they found the end card's link too small to read on a phone, and
it was enlarged before delivery.

The association received the three exports, the caption files, the titles and
descriptions with the authors' credits, the thumbnail, the records, the
verification report and the render command. It uploaded them itself.
