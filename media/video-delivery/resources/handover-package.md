# Handover package

What the owner receives, per video. Nothing in it is uploaded by the agent.

## Files

| File | Destination | Frame | Duration | Probed | Loudness | Played |
|---|---|---|---|---|---|---|
| | | | | codec, size, rate | LUFS, dBTP | yes |

Caption and chapter files, and the thumbnail, listed with the same columns
where they apply.

## Text, per destination

```
title           
description     takeaway, project and owner, the owner's link, chapters,
                attribution and licence
specification   the destination's published specification, read on (date)
```

## Records

- [ ] Rights record, with the owner's permission and scope.
- [ ] Claim list, each claim confirmed by the owner.
- [ ] Asset licences: music, fonts, icons, images, clips.
- [ ] Voice resolution: provider, engine, voice, licence or reader's consent.

## Gate

The twelve lines of `video-core` section 9, each with its evidence. Line 12:
the name of the person who watched end to end at real speed with sound, and
their notes.

## Rebuild

```
command         the one command that re-renders the master and every export
sources         the commit of the sources
tools           the versions of the render, encode and voice tools
```

## Publishing

Uploading, scheduling and posting are the owner's. If the owner asked, the
upload steps per destination follow, written from each destination's current
help page with the date.
