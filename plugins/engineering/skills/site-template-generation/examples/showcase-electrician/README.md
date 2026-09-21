# showcase-electrician

Reference implementation of the `showcase` kind: several pages, professional
voice, technical token profile, quotation form, and the four legal pages a
company site publishes. The instance is an invented electrical company, Roussel
Électricité, in a town called Ville-Exemple. Every name, address, telephone
number, policy number and figure in `content/content.json` is fictional.

## What it demonstrates

| Rule of the skill | Where to look |
|---|---|
| Template, content and tokens kept apart | `components/`, `content/content.json`, `lib/tokens.ts` |
| Required fields refused by name at build | `lib/content.ts`, `REQUIRED` and `validate` |
| The four legal pages are required of a showcase | `lib/content.ts`, the `declared` check |
| A clause that binds is never drafted by the template | `lib/legal.ts`, the `clause` helper |
| Facts not provided become visible markers | `lib/legal.ts`, `components/LegalDocument.tsx` |
| The privacy page names the forms that exist | `lib/legal.ts`, `privacy()` reads `quote.fields` |
| The cookie page states what the site actually sets | `lib/legal.ts`, `cookies()` with an empty list |
| Tokens carry every visual value | `lib/tokens.ts` and `app/globals.css` |
| A technical trade keeps motion low | `theme.motion.intensity`, 0.25 against 0.9 for the coach |
| Static export has no server | `next.config.mjs`, `components/QuoteForm.tsx` |

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export into out/
```

Removing a legal page from `legal.pages` stops the build with
`content/content.json: legal page missing for a showcase site: terms`. That is
deliberate: a company site without its terms is not a delivery.

## Routes and their slugs

Route directories are English, by the repository convention that identifiers and
paths are English. What the visitor reads comes from the content file.

```
/                 app/page.tsx          label from pages[0].label
/services/        app/services/page.tsx
/about/           app/about/page.tsx
/quote/           app/quote/page.tsx
/legal/<slug>/    app/legal/[slug]/page.tsx, one route per legal.pages entry
```

The legal slugs are data: `mentions-legales`,
`conditions-generales-de-vente`, `politique-de-confidentialite`, `cookies`. To
localise the other four addresses for an instance, rename the route directory
and change `href` in `pages`, which is the only place they appear.

## Images are not shipped

`public/images/` is empty on purpose. The content file names the files the
client provides, and the alt text next to each one is already written. No
photograph of a real person belongs in a template repository.

## Contrast, measured

Computed from the palette in the content file, not judged by eye. Every pair the
skill requires, with the ratio it actually reaches:

| Pair | Ratio | Minimum |
|---|---|---|
| `foreground` on `surface` | 17.79 | 4.5 |
| `muted` on `surface` | 6.46 | 4.5 |
| `muted` on `surfaceAlt` | 5.87 | 4.5 |
| `accentForeground` on `accent` | 8.86 | 4.5 |
| `accent` on `surface` | 8.86 | 3 |
| `borderStrong` on `surface` | 3.41 | 3 |
| `borderStrong` on `surfaceAlt` | 3.09 | 3 |
| `danger` on `surfaceAlt` | 5.93 | 4.5 |
| `success` on `surfaceAlt` | 4.85 | 4.5 |

`border` carries no minimum: it separates cards and is decorative.
`borderStrong` draws the boundary of an input and of a bordered button, which is
what identifies the control, so it is measured. Splitting the two is what lets a
restrained page stay restrained without failing an interactive control.

## The no-code field map

| Field | Type | Changes |
|---|---|---|
| `site.*` | string | header, footer, titles |
| `theme.palette.*` | colour | every surface, text and accent |
| `theme.motion.intensity` | 0 to 1 | how much the page moves; 0.25 here |
| `company.*` | string, list | the activity sentence and the service area |
| `pages[]` | list | the navigation and its labels |
| `ui.*` | string | interface labels, hints and notices |
| `home.hero.*` | string, image | the first screen |
| `home.highlights.*` | string, list | the three promises |
| `home.proof.*` | string, list | the figures band |
| `services.items[]` | list | the prestations, on the home page and the services page |
| `about.body[]`, `about.team[]`, `about.credentials[]` | lists | the company page |
| `quote.fields[]` | list of field definitions | the quotation form itself |
| `contact.*` | string, list | address, telephone, hours |
| `forms.endpoint` | https URL or empty | where the form posts; empty falls back to mailto |
| `legal.identity.*`, `legal.privacy.*`, `legal.cookies[]` | facts | the legal pages |
| `legal.clauses.*` | the company's own text | the binding clauses of the terms |

A content change requires a rebuild.

## Legal facts and clauses still missing in this instance

Deliberately incomplete, so the marker behaviour is visible rather than only
described:

- registration number and VAT identifier
- host name, address and telephone
- supervisory authority
- the clauses on execution, withdrawal, warranty, liability, governing law and
  mediation, which the company's counsel provides and the template never writes

The terms page therefore renders six clause markers under a notice. An instance
carrying markers may be reviewed and staged; it may not be announced as
delivered.
