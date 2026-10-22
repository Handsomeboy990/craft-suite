# Example: a scripted capture that had to be thrown away twice

The capture of beats 2 to 4 of a volunteer scheduling demo, a web app the owners
run on a staging server they agreed to have filmed.

## Take 1, discarded

Recorded by hand in the maker's everyday browser. The frame review found three
things in 40 seconds of footage:

```
00:07   the bookmarks bar showed a folder named after the maker's employer
00:19   an autofill suggestion opened under the email field with a real
        address
00:31   a chat notification slid in at the top right
```

None of it could be cut without changing the beat's timing. The take was
discarded.

## Take 2, discarded

Scripted with Playwright in a fresh profile, at 1920x1080. The frame review was
clean, but the staging server held a copy of last month's real roster: the
"Suggest" list showed real volunteers' first names. The owners had agreed to
staging, not to their volunteers appearing. The take was discarded and the data
question went back to the owners.

## Take 3, kept

```
data        a seed script creates 24 fictional volunteers on example.org
            addresses and the same eight open shifts every run
profile     a new Playwright context per take, no storage state, no
            extension, notifications denied
viewport    1920x1080 at device scale 2, downscaled at assembly, because beat
            3 zooms 1.8x into the ranked list
beats       one function per beat: showWeek, suggest, assignThree, each
            waiting for the narration length from the timing sheet after its
            last visible change
cursor      an injected cursor overlay moving on an eased path, pausing 300 ms
            before each click, with a ring on press
typing      the search for "Sat" typed at 8 characters a second
zoom map    beat 3, 00:04.2 to 00:09.0, the rectangle of the suggestion list,
            taken from the list element's bounding box
log         take 3, commit of the app and of the capture script, kept
```

The re-capture after a script change to beat 4 took one command and matched
the previous takes to the pixel, so the motion layer did not have to be
redone.
