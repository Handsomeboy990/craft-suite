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
