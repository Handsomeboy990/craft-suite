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
| Motion signature | energetic | technical |
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

## What a browser proved, and what it found

The first version of this file claimed the browser items of the gate could not
be checked here. They could: Playwright and its Chromium are available, and
`verification/` now holds five scripts. Fifty three checks on the portfolio and
thirty nine on the showcase, all passing:

```
theme            dark under the system preference, the toggle switching, the
                 choice surviving a reload, the attribute already set on the
                 first evaluation, which is what "no flash" means
motion, present  the hero entrance running once on load; each staggered item
                 carrying its own delay (0s, 0.063s, 0.126s); items hidden
                 before they enter and visible after; a counter reaching 24;
                 parallax writing 100px into its property
motion, absent   on the technical trade: no entrance, no stagger, no parallax,
                 no counter, with the reveal and the lift still there
reduced motion   no motion class anywhere, nothing hidden
navigation       the menu button at 360px naming what it controls and whether
                 it is open, 48px targets, Escape closing it, focus returning,
                 and the button gone above the breakpoint
keyboard         the first Tab reaching the skip link, a 3px focus outline, the
                 order walking into links, buttons and fields
layout           no horizontal scroll at 360px or 1920px, on every route
service worker   registering and activating; a never visited page falling back
                 to the offline page with the network cut; the cached home page
                 still served; the back office never served from cache
back office      an unauthenticated visit landing on the login, signing in
                 landing on the page that was asked for, the cookie httpOnly
                 and SameSite=Lax, a field edited there appearing on the public
                 page, and put back through the same surface
identity         the favicon coming from the content file and being served
account          the password changed from the back office: the wrong current
                 one refused, a short one refused, every session ended, the new
                 one working
public form      the visitor seeing the success state and the form clearing
404              the site's own page, with status 404
quotation form   filled as a visitor would, then found unread in the inbox with
                 its count in the navigation
```

Four defects came out of it, none of which a request library could have seen:

```
the form lied    the API answered 200 and stored the message, and the visitor
                 was shown "L'envoi a échoué". `event.currentTarget.reset()`
                 ran after an await, React had already cleared the event, and
                 the throw landed in the catch that shows the failure. Every
                 visitor would have been told their message failed after it
                 arrived. The element is now captured before the await
nothing moved    the stagger delay sat on the container instead of on each
                 item, so the whole system produced one slow fade per section
                 and the page looked static at any intensity. The delay is on
                 each item now, with its index, and the trade chooses which
                 effects exist at all rather than only how fast they run
32px of overflow a one word section title at display size cannot break, and a
                 flex item does not shrink below its min-content width. A
                 `body { overflow-x: hidden }` was hiding it from every
                 measurement that looked at the document
push said nothing a subscription that fails left the client clicking a button
                 that appeared to do nothing. Every step is now caught and the
                 reason shown, with the inbox still working
```

## The gate, run field by field

Before anything is built on these templates, the gate of `SKILL.md` was run
against both. `verification/gate.mjs` changes every field the back office
offers, through the endpoint the back office uses, reads the public pages to see
the change arrive, puts the value back, and ends by comparing the content file
with what it was.

```
portfolio   92 fields, 92 wired and observed, 0 refused, file restored byte for byte
showcase   107 fields, 107 wired and observed, 0 refused, file restored byte for byte
mobile      30/30 and 48/48 at 360px, both themes, every route, with screenshots
hardcoded   69 and 70 files read: no client fact, no address, no visual literal
```

Six defects came out of it, and the three in the middle are the same defect
wearing different clothes: a field offered in the back office and rendered
nowhere is a promise that lies.

```
a field could      setting an optional text back to nothing was refused, so a
not be emptied     legal fact entered by mistake could not be taken back from
                   the back office. Every entry was one way. Empty and absent
                   are the same value now, and a required field emptied that way
                   is refused by name
two fields, one    company.legalName and company.tradeName were required,
fact               editable, labelled as changing the legal pages, and read by
                   nothing: the legal pages state legal.identity.legalName. The
                   duplicate is gone. It would have drifted the first time a
                   client renamed themselves
the country        editable, rendered nowhere. Now rendered
the social links   editable on the showcase, rendered nowhere. Now rendered
the business name  gone from the header at 360px, squeezed out by the telephone
                   and the menu, then truncated to an ellipsis when given room.
                   Overflow was zero, targets were fine, nothing was clipped,
                   and the name was absent: only a screenshot showed it. The
                   header now gives the name its own row and turns the number
                   into a call button
eleven targets     under 44px: the skip link, the header telephone, the brand,
                   the footer email and telephone, the contact links
```

Two smaller ones: the VAPID subject defaulted to an invented address, and a save
wrote the content file without its final newline, so every edit showed up as a
diff.

## What a browser could not prove here

```
push delivery   a subscription needs a browser push service, and headless
                Chromium here closes on the permission request. The path is
                exercised server side instead, and that part was observed: the
                public key served only to a signed in session, a malformed
                subscription refused, a well formed one stored, a send against
                an unreachable endpoint logged rather than swallowed with the
                message surviving it, and an unsubscribe deleting the record
screen reader   no assistive technology is available here. Labels, landmarks, a
                skip link and visible focus are in the markup, which is a
                different claim from having been heard
```

## What running them changed, in the end

Eleven defects across the browser pass and the gate, none of which a reading
caught. The ones already listed, and these two decisions:

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
