# Worked examples

Two reference implementations, one per kind, built by running the protocol of
`SKILL.md` from end to end. Both are Next.js applications with a server, a back
office, an inbox and an installable shell, both are driven entirely by one
content file that the back office writes, and both carry clearly fictional data.

| | `portfolio-sports-coach` | `showcase-electrician` |
|---|---|---|
| Kind | portfolio | showcase |
| Owner | an invented independent coach | an invented electrical company |
| Public routes | one page, plus two legal pages | four pages, plus four legal pages |
| Profile | energetic | technical |
| Motion intensity | 0.9 | 0.25 |
| Form | a message | a quotation request |
| Back office | the same surface, generated from its own contract | the same |

## Why there is a server

The back office, the uploads, the inbox, the rate limits and the push
subscriptions all need one. A statically exported site can show a page and can
do none of those, so the deliverable decides the runtime rather than the other
way round. What remains generated rather than hand written is unchanged: the
legal pages, the manifest, and every string on the site.

## The protocol, applied

1. **Kind, trade, identity.** A person trading under their own name is a
   portfolio. A company with a legal form, a capital and a registration number
   is a showcase, and it owes four legal pages rather than two.
2. **Facts collected, gaps recorded.** Both instances are deliberately
   incomplete: no registration number, no host, no supervisory authority, and in
   the showcase no binding clause. Those gaps render as markers instead of being
   filled with plausible text.
3. **Contract fixed, loader written.** `lib/content.ts` refuses a missing
   required field by name, an image without alt text, a palette missing a token
   in either theme, and in the showcase a missing legal page.
4. **Both palettes authored and measured.** The same token keys twice. The
   accent differs between themes where the measurement demanded it.
5. **Public template built.** Full width where the content is not prose, both
   themes with no flash on load, the motion system, the 404 and the offline
   page.
6. **Back office built.** Generated from `lib/schema.ts`, which is also the
   server's allow list.
7. **The way in secured.** scrypt password hash out of band, server side
   sessions, CSRF on every write, rate limits on the login and on the public
   form, upload validation by type and by content.
8. **Form wired to the inbox**, with the push path and the failure path.
9. **Legal pages generated** from the fact sheet, markers visible.
10. **Manifest, worker and subscription added**, each degrading to nothing.
11. **Example content written**, fictional throughout, no photograph shipped.
12. **Gate run**, whole.
13. **Handover written**: the field map, the data directory, the backup command,
    the secrets, in each project README.

## What was observed, not assumed

Run against both servers before they were committed.

```
build and start        both build; the portfolio serves 6 kinds of route, the
                       showcase 12, and every one answered
required field         hero.title removed: the load stops naming the field
required legal page    terms removed: the showcase refuses to start, naming it
image without alt      refused on write, naming the field
optional sections      the four optional blocks and their navigation entries
                       removed from the portfolio: the page renders with only
                       the about and contact sections, no empty frame
one token changed      theme.palettes.light.accent changed: the new value is in
                       the served page
both themes            both palettes are in the served stylesheet, the dark one
                       under prefers-color-scheme and under data-theme
motion                 intensity 0.9 produced a 414ms duration, 0.25 produced
                       80ms, in the served tokens
404                    status 404, with the words from the content file
admin, no session      the page redirects, every admin endpoint answers 401
csrf                   a write without the token is refused, 403
allow list             a path outside the schema is refused: champ inconnu
required emptied       site.name emptied is refused, naming the field, and the
                       file on disk is unchanged
valid write            hero.title written from the back office appeared on the
                       public page on the next request, with no rebuild
uploads                a text file renamed .png refused on its leading bytes,
                       an SVG refused by type, a real PNG accepted
path traversal         /media/..%2f..%2fcontent.json and a nested path both 404
sign out               the server record is deleted; the old cookie answers 401
login rate limit       five attempts, then 429 for the lockout window, and the
                       correct password is refused during it too
contact rate limit     five per hour, then 429 carrying the direct address
contact to inbox       a valid submission is stored unread and listed in the
                       back office; the showcase stores it as a devis
legal clause edited    a clause provided in the back office removes its marker
                       and renders the company text
legal markers          the showcase terms page renders six clause markers and
                       one fact marker, the legal notice six fact markers, and
                       the cookie page states that the site sets none
contrast               every required pair passes, in both themes, on both
                       palettes of both instances
```

## What was not verified here, and why

Three parts of the gate need a real browser, which this repository has no way to
drive: they were built to the rule and are stated as unverified rather than
claimed.

```
service worker    the file is served and its logic is written; that it
                  registers, caches the shell and serves the offline page on a
                  dead network was not observed
install prompt    the event is captured and the button rendered from it; no
                  browser fired the event here
push delivery     the subscription, the storage and the send path exist; no
                  notification was delivered, which needs a browser and a push
                  service
keyboard and      the markup carries labels, landmarks, a skip link and visible
screen reader     focus, and no assistive technology was run against it
```

Each belongs to `playwright-automation` and `accessibility-testing` on a
deployed instance, which is where the gate's items 7, 14 and 15 are meant to be
checked.

## Two things running them changed

- **The contact rate limit answers visibly.** It first returned a success shaped
  response so that a crawler would learn nothing. Running it showed the cost: a
  real customer would believe a dropped message had been sent. The refusal is
  now explicit and carries the direct address.
- **The session cookie follows the protocol, not the build mode.** `Secure` tied
  to `NODE_ENV=production` made a production build unusable over http on the
  operator's own machine. It now follows `x-forwarded-proto`, which is what a
  proxy states, so a real deployment always gets `Secure` and a local run still
  signs in.

## What these examples are not

They are not a design to copy onto a client. They are the smallest complete
proof that the contract in `SKILL.md` holds: content, tokens and template stay
apart, the back office writes what it shows and is protected on the server, the
form reaches an inbox, and the legal pages say only what the company declared.
