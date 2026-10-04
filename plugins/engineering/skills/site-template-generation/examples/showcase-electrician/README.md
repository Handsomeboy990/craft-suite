# showcase-electrician

Reference implementation of the `showcase` kind: four public pages, a
professional voice, a technical token profile, a quotation form that reaches an
inbox, the four legal pages a company publishes, and the back office the company
runs it from. The instance is an invented electrical company, Roussel
Électricité, in a town called Ville-Exemple. Every name, address, telephone
number, policy number and figure in `data/content.json` is fictional, and no
photograph ships with it.

## Running it

```bash
npm install
npm run seed-media                              # placeholder images, clearly artificial
npm run set-password -- 'at least 12 characters'
npm run dev                                     # http://localhost:3000
```

For a production run: `npm run build` then `npm start`. The back office is at
`/admin`, and a content change is live on reload.

## The shared code, and copying this example out

Everything this example has in common with the other site example lives once,
in `../_shared`: the site shell, the back office pages and components, the
route handlers, the request proxy with its content security policy, the
service worker, the Next configuration, the operator scripts and the library
behind them, sessions and CSRF included. It is installed as the local package
`site-template-shared` (`"file:../_shared"` in `package.json`), copied into
`node_modules` rather than linked, because `.npmrc` sets `install-links=true`,
and compiled with the app through `transpilePackages` in `next.config.mjs`.

What stays here is what belongs to this instance, and what Next requires to
live in the app:

```
lib/types.ts lib/schema.ts lib/legal.ts lib/content.ts
                  the content model, this instance's own
lib/instance.ts   the instance as the shared code receives it: the loader,
                  the writer, the allow list, the legal pages and the form
app/              the public pages, and a thin file per shared route: Next
                  finds a route only by a file under app/ and reads its
                  segment config there, so each one re-exports a shared
                  handler or passes lib/instance.ts to a shared factory
proxy.ts          re-exports the shared proxy; the matcher is written here
                  because Next reads it statically from this file
next.config.mjs   spreads the shared configuration and adds transpilePackages
```

`../app-local-files.txt` lists every file still identical in both examples,
with the reason it stays in each app.

To take this example out of the repository, copy two directories: this one and
`../_shared`, nothing else. Either keep them side by side as they are here,
or put `_shared` anywhere and change the one path in `package.json`. Keep the
`.npmrc`: without it npm links the package instead of copying it, and the
build fails on every shared import. To fold the shared code into the project
for good, copy the directories of `_shared` (`admin`, `components`, `config`,
`lib`, `routes`, `scripts`) into this directory, replace
`site-template-shared/` with `@/` in the imports under `app/`, `lib/` and
`proxy.ts`, import `./config/next-config.mjs` by relative path in
`next.config.mjs` (the alias does not apply there), point the npm scripts at
`scripts/`, and drop the dependency, the `.npmrc` and the `transpilePackages`
line.

After a change in `../_shared`, refresh the installed copy, since npm does not
notice it: `rm -rf node_modules/site-template-shared && npm install`.
`npm run typecheck` checks the shared code together with this app.

## Routes

```
/                 accueil        hero, engagements, prestations, chiffres
/services         prestations    the same services, in full
/about            entreprise     text, team, insurances
/quote            devis          the quotation form
/legal/<slug>     four pages, one per legal.pages entry
/admin            the back office
/media/<name>     uploaded media, streamed from the data directory
```

Route directories are English, by the repository convention that paths and
identifiers are English. What the visitor reads, including the labels of these
routes in the menu, comes from the content file. The legal slugs are data:
`mentions-legales`, `conditions-generales-de-vente`,
`politique-de-confidentialite`, `cookies`.

## What it demonstrates, beyond the portfolio

| Rule of the skill | Where to look |
|---|---|
| The four legal pages are required of a showcase | `lib/content.ts`, the `declared` check |
| A clause that binds is never drafted by the template | `lib/legal.ts`, the `clause` helper |
| The privacy page names the form that exists | `lib/legal.ts`, `privacy()` reads `quote.fields` |
| The cookie page states what the site actually sets | `lib/legal.ts`, `cookies()` with an empty list |
| A technical trade keeps motion low | `theme.motion.intensity`, 0.25 against 0.9 for the coach |
| A trade palette in both themes | `data/content.json`, `theme.palettes` |
| A service is a collection the client edits | `lib/schema.ts`, `services.items` |
| Unique slugs enforced | `lib/content.ts` |

Everything else, the back office, the sessions, the rate limits, the uploads,
the inbox, the manifest and the worker, is the same surface over a different
contract. That is the point of fixing the contract per kind.

## Contrast, measured

Computed from both palettes in the content file, not judged by eye.

| Pair | Light | Dark | Minimum |
|---|---|---|---|
| `foreground` on `surface` | 17.79 | 16.73 | 4.5 |
| `muted` on `surface` | 6.46 | 8.23 | 4.5 |
| `muted` on `surfaceAlt` | 5.87 | 7.58 | 4.5 |
| `accentForeground` on `accent` | 8.86 | 7.50 | 4.5 |
| `accent` on `surface` | 8.86 | 7.39 | 3 |
| `borderStrong` on `surface` | 3.41 | 3.95 | 3 |
| `borderStrong` on `surfaceAlt` | 3.09 | 3.64 | 3 |
| `danger` on `surfaceAlt` | 5.93 | 6.87 | 4.5 |
| `success` on `surfaceAlt` | 4.85 | 9.94 | 4.5 |

The accent differs between themes on purpose: the deep blue that reaches 8.86:1
on white would not survive on near black, so the dark theme carries a lighter
one that reaches 7.39:1. That is what "dark is authored, not derived" means.

## The data directory, secrets, and the proxy

Identical to the portfolio: everything the instance owns is in `data/`,
`npm run backup` archives it, `DATA_DIR` moves it, the password hash lives in
`data/admin.json`, the VAPID keys live in the environment, and a proxy must
forward `x-forwarded-for` and `x-forwarded-proto`.

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

| Section of the back office | Fields | Changes |
|---|---|---|
| Contenu, Entreprise | name, short name, tagline, legal name, trade name, activity, service area, search title and description | header, footer, page headers, search results |
| Contenu, Navigation | the menu entries and their order | the main menu |
| Contenu, Accueil | hero title, subtitle, image, buttons, engagements, figures | the home page |
| Contenu, Prestations | heading, intro, and each service with its summary, body, image and bullets | the home page and the services page |
| Contenu, L'entreprise | heading, paragraphs, image, team, insurances | the company page |
| Contenu, Devis | heading, intro, the form fields themselves, success and failure messages | the quotation page |
| Contenu, Coordonnées | email, telephone, address, opening hours, social links | the header, the footer, the quotation page |
| Contenu, Interface | 404 and offline pages, form labels, notices | the pages nobody designs |
| Contenu, Légal | identity, host, controller, and the nine clauses of the terms | the four legal pages |
| Contenu, Application | installable on or off, icons | the manifest |
| Couleurs | both palettes, motion intensity, density, page and prose widths | every colour, every movement, every spacing |
| Images | upload, replace, delete | the media the content points at |
| Messages | read, unread, archive, delete | the quotation inbox |

The nine clause fields are the company's own text. Left empty, the terms page
shows a marker naming the clause: the template never drafts an obligation.

## Legal facts and clauses still missing in this instance

Deliberately incomplete: registration number, VAT identifier, host name, address
and telephone, supervisory authority, and the clauses on execution, withdrawal,
warranty, liability, governing law and mediation. The terms page renders six
clause markers and one fact marker, the legal notice six fact markers, under a
notice at the top. An instance carrying markers may be reviewed and staged; it
may not be announced as delivered.
