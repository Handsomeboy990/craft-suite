# Example: a demo video of a project three students built

A school asks for a two-minute demo video of a project made by three students,
a shared shopping list app, to show at its open day. The person making the
video did not build the app.

## Before any capture

The first request, "just film the app from its public repository", is
declined: a public repository is not the students' agreement to be presented.
The record is filled instead.

```
owner           the three students; one of them, the team lead, agrees for
                the team in a reply to the school's email, kept
for             this demo, 16:9, shown on the open day screen and on the
                school's page
may appear      the list, sharing a list, the offline mode
must not appear the admin page, which shows real classmates' emails
credits         the three names and the project's MIT licence, end card
review          the team lead watches the cut before delivery
```

The app's own claim, "used by 200 students", is on the draft script. The team
lead says the number counts sign-ups during a class exercise. The line becomes
"tried by a class of 200 during a workshop", which the team confirms.

## What the gate caught

| Line | Finding | Fixed |
|---|---|---|
| 3 | the offline mode was shown with the network still on, by mistake | recaptured with the network cut, the badge visible |
| 5 | a zoomed frame showed a browser tab with a classmate's name in its title | the capture runs in a fresh profile with no other tab |
| 7 | the captions said "list" where the voice said "lists" | captions regenerated from the final script and checked against the audio |
| 9 | the mix measured -19 LUFS, quiet next to the other videos of the day | normalised to the event's target, true peak below -1 dBTP |
| 12 | a teacher who had not seen the app could not tell what the share button did | the narration now names the action before it happens |

## Handed over

The cut, its caption file, the end card text, the rights record and the render
command went to the school. The school uploaded it. Nothing was posted by the
person who made the video.
