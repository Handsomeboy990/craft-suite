# portfolio-sports-coach

Reference implementation of the `portfolio` kind: one page, anchored sections,
personal voice, energetic token profile. The instance is an invented
independent sports coach, Camille Vasseur, in a town called Ville-Exemple. Every
name, address, telephone number, price and testimonial in `content/content.json`
is fictional.

## What it demonstrates

| Rule of the skill | Where to look |
|---|---|
| Template, content and tokens kept apart | `components/`, `content/content.json`, `lib/tokens.ts` |
| Required fields refused by name at build | `lib/content.ts`, `REQUIRED` and `validate` |
| Alt text is content, never a constant | `lib/content.ts`, the `images` walker |
| Headings and interface strings are content | `content.ui`, and every `Section<T>.heading` |
| Tokens carry every visual value | `lib/tokens.ts` and `app/globals.css`, which contains no literal |
| Motion intensity as a business decision | `theme.motion.intensity`, currently 0.9 |
| Optional section absent removes the section | `app/page.tsx` |
| Legal pages built from facts, gaps marked | `lib/legal.ts`, `components/LegalDocument.tsx` |
| Static export has no server | `next.config.mjs`, `components/ContactForm.tsx` |

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export into out/
```

The build fails, on purpose and by name, if a required field is removed from
the content file. Try it: delete `hero.title` and the build stops with
`content/content.json: required field missing: hero.title`.

## Images are not shipped

`public/images/` is empty on purpose: this repository ships no photograph of a
real person, and a stock portrait passed off as the client is exactly the
demonstration data the skill forbids. The paths in the content file name the
files the client provides, and the alt text next to each one is already written.

## Contrast, measured

Computed from the palette in the content file, not judged by eye. Every pair the
skill requires, with the ratio it actually reaches:

| Pair | Ratio | Minimum |
|---|---|---|
| `foreground` on `surface` | 17.61 | 4.5 |
| `muted` on `surface` | 8.85 | 4.5 |
| `muted` on `surfaceAlt` | 8.16 | 4.5 |
| `accentForeground` on `accent` | 5.81 | 4.5 |
| `accent` on `surface` | 6.06 | 3 |
| `borderStrong` on `surface` | 3.52 | 3 |
| `borderStrong` on `surfaceAlt` | 3.24 | 3 |
| `danger` on `surfaceAlt` | 6.27 | 4.5 |
| `success` on `surfaceAlt` | 9.85 | 4.5 |

`border` carries no minimum: it separates cards and is decorative.
`borderStrong` draws the boundary of an input and of a bordered button, which is
what identifies the control, so it is measured. Splitting the two is what lets a
restrained page stay restrained without failing an interactive control.

## The no-code field map

The client changes these without a developer, in `content/content.json`.

| Field | Type | Changes |
|---|---|---|
| `site.name`, `site.tagline` | string | header, footer, page titles |
| `theme.palette.*` | colour | every surface, text and accent on the site |
| `theme.motion.intensity` | 0 to 1 | how much the page moves; 0 stops it entirely |
| `nav[]` | list of `{ label, href }` | the header navigation |
| `ui.*` | string | interface labels, hints and notices |
| `hero.title`, `hero.subtitle`, `hero.image` | string, image | the first screen |
| `hero.actions[]` | list | the buttons under the title |
| `about.body[]` | list of strings | the paragraphs of the profile |
| `about.facts[]` | list of `{ label, value }` | the credential row |
| `offers.heading`, `offers.items[]` | string, list | the accompaniment cards, in order |
| `results.heading`, `results.items[]` | string, list | the figures block |
| `gallery.heading`, `gallery.items[]` | string, list | the gallery, in order |
| `testimonials.heading`, `testimonials.items[]` | string, list | the quotes |
| `contactSection.fields[]` | list of field definitions | the form fields themselves |
| `contact.*` | string, list | address, hours, telephone, social links |
| `forms.endpoint` | https URL or empty | where the form posts; empty falls back to mailto |
| `legal.*` | facts | the legal pages |

Removing an optional section from the file removes it from the page and from
the navigation. A content change requires a rebuild.

## Legal facts still missing in this instance

Deliberately incomplete, so the marker behaviour is visible in the rendered
page rather than only described:

- registration number
- VAT identifier
- host name, address and telephone
- supervisory authority

Each appears in the page as `[ à compléter : ... ]`, in the danger colour, under
a notice at the top of the document. An instance carrying markers may be
reviewed and staged; it may not be announced as delivered.
