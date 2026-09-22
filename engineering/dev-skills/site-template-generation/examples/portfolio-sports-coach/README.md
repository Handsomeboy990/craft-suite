# portfolio-sports-coach

Reference implementation of the `portfolio` kind: one page, personal voice,
energetic token profile, and the back office the client runs it from. The
instance is an invented independent sports coach, Camille Vasseur, in a town
called Ville-Exemple. Every name, address, telephone number, price and
testimonial in `data/content.json` is fictional, and no photograph ships with
it.

## Running it

```bash
npm install
npm run seed-media                              # placeholder images, clearly artificial
npm run set-password -- 'at least 12 characters'
npm run dev                                     # http://localhost:3000
```

For a production run:

```bash
npm run build
npm start
```

The back office is at `/admin`. A content change is live on reload: no rebuild,
no developer.

Optional, for notifications:

```bash
npm run push-keys        # prints a VAPID pair to put in the environment
```

## What it demonstrates

| Rule of the skill | Where to look |
|---|---|
| Template, content and tokens kept apart | `components/`, `data/content.json`, `lib/tokens.ts` |
| Content read at runtime, written by the back office | `lib/content.ts`, `app/api/admin/content/route.ts` |
| Required fields refused by name, on read and on write | `lib/content.ts`, `validate` |
| Alt text is content, and required | `lib/content.ts`, `lib/schema.ts` |
| Both palettes authored, neither derived | `data/content.json`, `theme.palettes` |
| Theme choice before first paint | `lib/tokens.ts`, `themeScript` |
| Motion driven by one intensity scalar | `lib/tokens.ts`, `components/site/Reveal.tsx`, `app/globals.css` |
| The page uses its width | `.page` at 1600px, `.prose` the only narrow measure |
| The back office is generated from the contract | `lib/schema.ts`, `components/admin/ContentEditor.tsx` |
| A path outside the schema cannot be written | `lib/schema.ts`, `applyPatch` |
| Sessions server side, CSRF on every write | `lib/auth.ts` |
| Login and public form rate limited | `lib/rate-limit.ts` |
| Uploads checked by type and by content, no SVG | `lib/uploads.ts` |
| Path traversal refused on media | `lib/uploads.ts`, `resolveUpload` |
| The contact form reaches an inbox | `app/api/contact/route.ts`, `app/admin/messages` |
| Legal pages from facts, gaps marked | `lib/legal.ts` |
| The site's own 404 and offline pages | `app/not-found.tsx`, `app/offline/page.tsx` |
| Manifest generated, worker that never caches the admin | `app/manifest.webmanifest/route.ts`, `public/sw.js` |

## The data directory

Everything the instance owns is in `data/`, and nothing else has to be backed
up:

```
data/content.json        the site itself, written by the back office
data/admin.json          the password hash, its salt and its parameters
data/sessions.json       server side sessions
data/messages.json       the contact inbox
data/subscriptions.json  push subscriptions
data/rate-limits.json    the counters
data/audit.log           one line per privileged action, appended
data/uploads/            the images, served by /media
```

```bash
npm run backup           # one archive of the whole directory
```

`DATA_DIR` moves it elsewhere, which is what a container mount does.

## Secrets the instance needs

| Name | Held where | Absent means |
|---|---|---|
| the password hash | `data/admin.json`, written by `set-password` | the login refuses everything and says so |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | the server environment | no push notifications; the inbox is unchanged |

None of them is in the repository, in the content file or in the bundle.

## Behind a proxy

The rate limits key on the caller's address, read from `x-forwarded-for` and
then `x-real-ip`. A deployment that terminates TLS in front of the site must set
those headers, and must set `x-forwarded-proto`, which is what decides whether
the session cookie carries `Secure`.

## Contrast, measured

Computed from both palettes in the content file, not judged by eye.

| Pair | Light | Dark | Minimum |
|---|---|---|---|
| `foreground` on `surface` | 18.25 | 17.61 | 4.5 |
| `muted` on `surface` | 6.98 | 8.85 | 4.5 |
| `muted` on `surfaceAlt` | 6.35 | 8.16 | 4.5 |
| `accentForeground` on `accent` | 4.59 | 6.34 | 4.5 |
| `accent` on `surface` | 4.48 | 6.61 | 3 |
| `borderStrong` on `surface` | 3.60 | 3.52 | 3 |
| `borderStrong` on `surfaceAlt` | 3.27 | 3.24 | 3 |
| `danger` on `surfaceAlt` | 5.81 | 6.27 | 4.5 |
| `success` on `surfaceAlt` | 4.63 | 9.85 | 4.5 |

`border` carries no minimum: it separates cards and is decorative.
`borderStrong` draws the boundary of an input and of a bordered button, which is
what identifies the control, so it is measured in both themes.

## Security, caching and operations

Checked on a running instance, not asserted:

```
headers          Content-Security-Policy with a per request nonce, nosniff,
                 strict-origin-when-cross-origin, X-Frame-Options DENY, a
                 permissions policy, HSTS. The back office and every endpoint
                 are no-store
injection        a value typed into a style field is refused by name; written
                 straight into the file it is escaped and inert; and the policy
                 would stop a script anyway. All three were tested
body size        a request over 1 MB is refused before it is parsed
audit log        data/audit.log, one line per privileged action, with no
                 password, token or message body
retention        the months the privacy page states are enforced: an older
                 message is dropped the next time the inbox is read
dependencies     npm audit: 0 vulnerabilities at the pinned versions, checked
                 on 2026-09-22. Next.js is pinned to a release past the
                 advisories that affected 15.5.4, one of which was a cross-site
                 scripting hole in App Router applications using CSP nonces
backup           npm run backup, then the data directory removed, then the
                 archive restored: the site came back identical. A backup is
                 untested until that has been done
caching          uploaded media and static assets are cached for a year and
                 never reused under the same name; the HTML is rendered per
                 request because the policy nonce differs per response, which
                 is the right trade at this scale and is stated so nobody has
                 to guess
```

## The no-code field map

The back office generates this table from `lib/schema.ts`, which is also the
server's allow list: a path that is not in it cannot be written, whatever a
request contains.

| Section of the back office | Fields | Changes |
|---|---|---|
| Contenu, Identité | name, short name, tagline, search title and description | header, footer, titles, search results |
| Contenu, Première section | title, subtitle, image, buttons | the first screen |
| Contenu, Profil | heading, paragraphs, portrait, key figures | the profile section |
| Contenu, Accompagnements | heading, offers with price, duration, highlight | the cards, in order |
| Contenu, Chiffres | heading, figures | the figures band |
| Contenu, Galerie | heading, images with alt text and captions | the gallery, in order |
| Contenu, Témoignages | heading, quotes | the quotes |
| Contenu, Formulaire | heading, intro, the form fields themselves, success and failure messages | what the visitor fills in and sees |
| Contenu, Coordonnées | email, telephone, address, opening hours, social links | the contact block and the footer |
| Contenu, Interface | 404 and offline pages, form labels, notices | the pages nobody designs |
| Contenu, Légal | identity, host, controller, supervisory authority | the legal pages |
| Contenu, Application | installable on or off, icons | the manifest |
| Couleurs | both palettes, motion intensity, density, page and prose widths | every colour, every movement, every spacing |
| Images | upload, replace, delete | the media the content points at |
| Messages | read, unread, archive, delete | the inbox |

Not editable here, by design: the structure of a page, the components, the
routing, the validation rules, the breakpoints, what a form does with a
submission, and the legal clauses that bind.

## Legal facts still missing in this instance

Deliberately incomplete, so the marker behaviour is visible in the rendered page
rather than only described: registration number, VAT identifier, host name,
address and telephone, supervisory authority. Each appears as
`[ à compléter : ... ]` in the danger colour, under a notice at the top of the
page. An instance carrying markers may be reviewed and staged; it may not be
announced as delivered.

## Where the file store stops being enough

Messages, sessions, subscriptions and counters are JSON files written whole,
atomically. That is right for one site on one process, which is what this is.
Two thresholds change it: more than one server process, because the rate limit
counters and the sessions must then be visible to both, and a message volume
where rewriting the file on each write becomes noticeable, in the thousands
rather than the hundreds. At either point the store moves to a database and
`lib/store.ts` is the only module that changes.
